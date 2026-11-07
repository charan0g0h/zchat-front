import { Stomp } from "@stomp/stompjs";
import Peer from "peerjs";
import { useEffect, useMemo, useRef, useState } from "react";
import SockJS from "sockjs-client";

/* ---------------- icons ---------------- */

const Icon = ({ d, className = "size-5", evenodd = false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path fillRule={evenodd ? "evenodd" : undefined} clipRule={evenodd ? "evenodd" : undefined} d={d} />
    </svg>
);

const PATHS = {
    video: "M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z",
    phone: "M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z",
    decline: "M15.22 3.22a.75.75 0 0 1 1.06 0L18 4.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L19.06 6l1.72 1.72a.75.75 0 0 1-1.06 1.06L18 7.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L16.94 6l-1.72-1.72a.75.75 0 0 1 0-1.06ZM1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z",
    mic: "M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5ZM6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z",
    clock: "M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z",
    users: "M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z",
};

const VideoIcon = (p) => <Icon d={PATHS.video} {...p} />;
const PhoneIcon = (p) => <Icon d={PATHS.phone} evenodd {...p} />;
const DeclineIcon = (p) => <Icon d={PATHS.decline} evenodd {...p} />;
const MicIcon = (p) => <Icon d={PATHS.mic} {...p} />;
const ClockIcon = (p) => <Icon d={PATHS.clock} {...p} />;
const UsersIcon = (p) => <Icon d={PATHS.users} {...p} />;

/* ---------------- config / helpers ---------------- */

// PeerJS replaces its default ICE servers when you pass `config`, so list STUN yourself.
// For users on different networks / mobile data you NEED a TURN server (Metered, Twilio, coturn...).
const ICE_SERVERS = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    // {
    //     urls: import.meta.env.VITE_TURN_URL,
    //     username: import.meta.env.VITE_TURN_USER,
    //     credential: import.meta.env.VITE_TURN_PASS,
    // },
];

function mediaErrorMessage(err) {
    switch (err?.name) {
        case "NotAllowedError":
            return "Camera or microphone permission was blocked. Allow access in the browser address bar and try again.";
        case "NotFoundError":
            return "No camera or microphone was found on this device.";
        case "NotReadableError":
            return "The camera is being used by another app, tab or browser. Close it and try again.";
        default:
            return err?.message || "Could not access camera or microphone.";
    }
}

/*
 * ADJUST THESE TWO if your API returns different field names.
 * They accept either plain strings or objects.
 */
function normalizeFriend(f) {
    if (typeof f === "string") return { username: f, fullname: "" };
    return {
        username: f.username ?? f.friendUsername ?? f.friend ?? f.name ?? "",
        fullname: f.fullname ?? f.fullName ?? "",
    };
}

function normalizeHistory(h, i) {
    const date = h.callDate ?? h.date ?? h.createdAt ?? h.time ?? null;
    return {
        id: h.id ?? i,
        with: h.with ?? h.toUsername ?? h.fromUsername ?? h.username ?? h.callee ?? h.caller ?? "Unknown",
        direction: h.direction ?? null, // optional: "OUTGOING" | "INCOMING"
        status: h.status ?? h.mode ?? null,
        duration: h.duration ?? h.durationSeconds ?? null,
        date: date ? new Date(date) : null,
    };
}

function formatDuration(totalSeconds) {
    const n = Number(totalSeconds);
    if (!Number.isFinite(n)) return null;
    return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
}

function formatDate(d) {
    if (!d || Number.isNaN(d.getTime())) return "";
    return d.toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

const AVATAR_COLORS = ["bg-orange-100 text-orange-700", "bg-sky-100 text-sky-700", "bg-emerald-100 text-emerald-700", "bg-violet-100 text-violet-700", "bg-rose-100 text-rose-700", "bg-amber-100 text-amber-700"];

function Avatar({ name, size = "size-12" }) {
    const text = (name || "?").trim();
    const color = AVATAR_COLORS[[...text].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
    return (
        <span className={`${size} shrink-0 grid place-items-center rounded-2xl font-extrabold uppercase ${color}`}>
            {text.charAt(0)}
        </span>
    );
}

function authHeaders() {
    return { Authorization: "Bearer " + localStorage.getItem("jwt") };
}

/* ---------------- component ---------------- */

function Videochat() {
    const peerref = useRef(null);
    const clientref = useRef(null);
    const myvideo = useRef(null);
    const recivedvideo = useRef(null);
    const streamRef = useRef(null);
    const mediaCallRef = useRef(null);
    const ongoingRef = useRef(null); // readable inside long-lived callbacks (no stale state)
    const pendingRef = useRef(null); // name of the friend we have rung but who hasn't answered yet
    const calleeRef = useRef("");
    const noticeTimerRef = useRef(null);
    const secondsRef = useRef(0);

    const [tab, setTab] = useState("friends"); // friends | call | history
    const [peerid, setPeerid] = useState(null);
    const [signalReady, setSignalReady] = useState(false);
    const [mystream, setMystream] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [remote, setRemote] = useState(false);
    const [request, setRequest] = useState(null); // incoming call request
    const [outgoing, setOutgoing] = useState(null); // name we're ringing
    const [ongoingcall, setOngoingcall] = useState(null);
    const [seconds, setSeconds] = useState(0);
    const [notice, setNotice] = useState("");
    const [callError, setCallError] = useState("");
    const [callStatus, setCallStatus] = useState("Initializing...");

    const [friends, setFriends] = useState([]);
    const [friendsLoading, setFriendsLoading] = useState(true);
    const [friendsError, setFriendsError] = useState("");
    const [friendQuery, setFriendQuery] = useState("");

    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");

    const url = import.meta.env.VITE_API_BASE_URL;
    const busy = Boolean(ongoingcall) || Boolean(outgoing);
    const ready = signalReady && Boolean(peerid);

    useEffect(() => {
        secondsRef.current = seconds;
    }, [seconds]);

    // Timer runs only while video is actually flowing
    useEffect(() => {
        if (!remote) return;
        const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [remote]);
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const remainingSeconds = String(seconds % 60).padStart(2, "0");

    function showNotice(text, ms = 6000) {
        clearTimeout(noticeTimerRef.current);
        setNotice(text);
        if (text) noticeTimerRef.current = setTimeout(() => setNotice(""), ms);
    }

    /* ---------- REST: friends + history ---------- */

    async function loadFriends() {
        setFriendsLoading(true);
        setFriendsError("");
        try {
            const res = await fetch(url + "/getallfriends", { headers: authHeaders() });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const data = await res.json();
            console.log(data )
            
            setFriends(data);
        } catch (err) {
            console.error("getallfriends failed:", err);
            setFriendsError("Could not load your friends. Check your connection and try again.");
        } finally {
            setFriendsLoading(false);
        }
    }

    async function loadHistory() {
        setHistoryLoading(true);
        setHistoryError("");
        try {
            const res = await fetch(url + "/gethistory", { headers: authHeaders() });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const data = await res.json();
            const list = (Array.isArray(data) ? data : []).map(normalizeHistory);
            list.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
            setHistory(list);
        } catch (err) {
            console.error("gethistory failed:", err);
            setHistoryError("Could not load call history. Check your connection and try again.");
        } finally {
            setHistoryLoading(false);
        }
    }

    useEffect(() => {
        loadFriends();
    }, []);

    useEffect(() => {
        if (tab === "history") loadHistory();
    }, [tab]);

    const filteredFriends = useMemo(() => {
        const q = friendQuery.trim().toLowerCase();
        if (!q) return friends;
        return friends.filter((f) => f.username.toLowerCase().includes(q) || f.fullname.toLowerCase().includes(q));
    }, [friends, friendQuery]);

    /* ---------- media helpers ---------- */

    async function startMedia() {
        if (streamRef.current) return streamRef.current;
        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error("Camera access needs HTTPS (or localhost). Open the app over https://.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (myvideo.current) myvideo.current.srcObject = stream;
        setMystream(true);
        setMicOn(true);
        setCamOn(true);
        return stream;
    }

    function stopMedia() {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (myvideo.current) myvideo.current.srcObject = null;
        setMystream(false);
    }

    function toggleTrack(kind) {
        const tracks = kind === "audio" ? streamRef.current?.getAudioTracks() : streamRef.current?.getVideoTracks();
        if (!tracks?.length) return;
        const next = !tracks[0].enabled;
        tracks.forEach((t) => (t.enabled = next));
        kind === "audio" ? setMicOn(next) : setCamOn(next);
    }

    // The self-view <video> only exists while the Call tab is open, so re-attach the stream when it mounts
    useEffect(() => {
        if (tab === "call") {
            if (myvideo.current && streamRef.current) myvideo.current.srcObject = streamRef.current;
        }
    }, [tab, mystream, ongoingcall, outgoing]);

    /* ---------- call lifecycle ---------- */

    function hangUp(status = "Ready") {
        const call = mediaCallRef.current;
        mediaCallRef.current = null; // clear first so the "close" handler ignores this call
        call?.close();
        const wasConnected = Boolean(ongoingRef.current);
        ongoingRef.current = null;
        pendingRef.current = null;
        setOngoingcall(null);
        setOutgoing(null);
        setRemote(false);
        setSeconds(0);
        if (recivedvideo.current) recivedvideo.current.srcObject = null;
        stopMedia();
        setCallStatus(status);
        setTab("friends");
        if (wasConnected) loadHistory();
    }

    function attachCall(call) {
        mediaCallRef.current = call;

        call.on("stream", (remoteStream) => {
            const el = recivedvideo.current;
            if (el && el.srcObject !== remoteStream) {
                el.srcObject = remoteStream;
                // autoPlay already handles playback; this is only a fallback.
                // Never await it: a second "stream" event would abort it and throw.
                el.play().catch(() => {});
            }
            setRemote(true);
            setCallStatus("Connected");
        });

        call.on("error", (err) => {
            console.error("Media call error:", err);
            setCallError(err.message || "Media call failed");
        });

        call.on("close", () => {
            if (mediaCallRef.current !== call) return; // already cleaned up locally
            hangUp("Call ended");
        });
    }

    // Caller side: runs after the other person accepted and sent us their PeerJS id
    async function callid(id) {
        try {
            if (!id) throw new Error("The other user's PeerJS ID is missing.");
            if (!peerref.current || peerref.current.destroyed) throw new Error("PeerJS is not initialized.");

            setCallStatus("Starting camera...");
            setCallError("");
            const stream = await startMedia();

            setCallStatus("Connecting...");
            const call = peerref.current.call(id, stream);
            if (!call) throw new Error("PeerJS could not create the call.");
            attachCall(call);
        } catch (err) {
            console.error("Failed to start call:", err);
            setCallError(mediaErrorMessage(err));
            hangUp("Call failed");
        }
    }

    /* ---------- signaling (STOMP) ---------- */

    useEffect(() => {
        const socket = new SockJS(url + "/chat");
        const client = Stomp.over(socket);
        client.debug = () => {}; // silence the very noisy STOMP frame logs
        clientref.current = client;

        client.connect(
            authHeaders(),
            () => {
                setSignalReady(true);
                client.subscribe("/user/queue/videocall", (frame) => {
                    const data = JSON.parse(frame.body);

                    if (data.mode === "IdRequest") {
                        // already in a call or ringing someone -> tell the caller we're busy
                        if (ongoingRef.current || pendingRef.current) {
                            client.send(
                                "/app/video-call",
                                {},
                                JSON.stringify({ ...data, mode: "RequestReject", toUsername: data.fromUsername, fromUsername: null })
                            );
                            return;
                        }
                        setRequest(data);
                    }

                    if (data.mode === "IdSent") {
                        if (!pendingRef.current) return; // we cancelled before they accepted
                        clearTimeout(noticeTimerRef.current);
                        setNotice("");
                        const call = { ...data, with: pendingRef.current };
                        pendingRef.current = null;
                        ongoingRef.current = call;
                        setOutgoing(null);
                        setOngoingcall(call);
                        callid(data.callerId);
                    }

                    if (data.mode === "RequestReject") {
                        const who = calleeRef.current || "The other person";
                        if (pendingRef.current) {
                            pendingRef.current = null;
                            setOutgoing(null);
                            setCallStatus("Ready");
                            setTab("friends");
                            showNotice(`${who} declined the call.`);
                        }
                    }
                });
            },
            (error) => {
                console.error("STOMP connection error:", error);
                setSignalReady(false);
                setCallError("Lost connection to the server. Refresh the page to reconnect.");
            }
        );

        return () => {
            clearTimeout(noticeTimerRef.current);
            if (client.connected) client.disconnect();
        };
    }, []);

    // Click "Call" on a friend: switch to the Call tab and ring them
    function startCall(name) {
        if (!name || busy || request) return;
        if (!clientref.current?.connected) {
            setCallError("Not connected to the server yet. Try again in a moment.");
            return;
        }
        setCallError("");
        calleeRef.current = name;
        pendingRef.current = name;
        setOutgoing(name);
        setCallStatus("Calling...");
        setTab("call");
        clientref.current.send(
            "/app/video-call",
            {},
            JSON.stringify({ toUsername: name, callDate: new Date(), mode: "IdRequest" })
        );
    }

    // Caller gives up while still ringing (local only; a late "IdSent" is ignored)
    function cancelCall() {
        pendingRef.current = null;
        setOutgoing(null);
        setCallStatus("Ready");
        setTab("friends");
        showNotice("Call cancelled.");
    }

    async function acceptCall() {
        if (!request) return;
        if (!peerid || !clientref.current?.connected) {
            setCallError("Video connection is not ready yet. Try again in a moment.");
            return;
        }
        try {
            setCallError("");
            setCallStatus("Starting camera...");
            // Get camera/mic BEFORE telling the caller to dial us, so we can answer instantly.
            await startMedia();

            const call = { ...request, with: request.fromUsername };
            ongoingRef.current = call; // set before replying so peer.on("call") accepts the incoming call

            clientref.current.send(
                "/app/video-call",
                {},
                JSON.stringify({
                    ...request,
                    mode: "IdSent",
                    callerId: peerid,
                    toUsername: request.fromUsername,
                    fromUsername: null,
                })
            );

            setOngoingcall(call);
            setRequest(null);
            setCallStatus("Connecting...");
            setTab("call");
        } catch (err) {
            console.error("Failed to accept call:", err);
            setCallError(mediaErrorMessage(err));
            ongoingRef.current = null;
            declineCall();
            setCallStatus("Ready");
        }
    }

    function declineCall() {
        if (!request) return;
        if (clientref.current?.connected) {
            clientref.current.send(
                "/app/video-call",
                {},
                JSON.stringify({ ...request, mode: "RequestReject", toUsername: request.fromUsername, fromUsername: null })
            );
        }
        setRequest(null);
    }

    /* ---------- PeerJS (media) ---------- */

    useEffect(() => {
        const peer = new Peer({ debug: 2, config: { iceServers: ICE_SERVERS } });
        peerref.current = peer;

        peer.on("open", (id) => {
            console.log("PeerJS connected. My ID:", id);
            setPeerid(id);
            setCallStatus("Ready");
        });

        peer.on("call", async (call) => {
            // Only answer calls we asked for (we set ongoingRef when accepting)
            if (!ongoingRef.current) {
                call.close();
                return;
            }
            try {
                const stream = await startMedia();
                attachCall(call);
                call.answer(stream);
            } catch (err) {
                console.error("Failed to answer call:", err);
                setCallError(mediaErrorMessage(err));
                call.close();
                hangUp("Call failed");
            }
        });

        peer.on("error", (err) => {
            console.error("PeerJS error:", err.type, err.message);
            setCallError(`${err.type}: ${err.message}`);
            setCallStatus("Connection error");
        });

        peer.on("disconnected", () => {
            console.warn("PeerJS disconnected, reconnecting...");
            setCallStatus("Reconnecting...");
            if (!peer.destroyed) peer.reconnect();
        });

        return () => {
            const call = mediaCallRef.current;
            mediaCallRef.current = null;
            call?.close();
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null; // otherwise a stopped stream gets reused after remount
            peer.destroy();
        };
    }, []);

    /* ---------- UI ---------- */

    const tabs = [
        { id: "friends", label: "Friends", icon: <UsersIcon className="size-5" /> },
        { id: "call", label: "Call", icon: <VideoIcon className="size-5" />, dot: busy },
        { id: "history", label: "History", icon: <ClockIcon className="size-5" /> },
    ];

    const statusDot = ready ? "bg-green-500" : "bg-amber-400";

    return (
        <div className="relative w-full h-full overflow-auto bg-stone-100 p-4 md:p-6 flex flex-col gap-4">
            {/* Header: tabs + connection status */}
            <header className="flex flex-wrap items-center justify-between gap-3">
                <nav aria-label="Video chat sections" className="flex gap-1 rounded-2xl bg-white border border-stone-200 p-1">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            aria-current={tab === t.id ? "page" : undefined}
                            className={`relative h-10 px-4 flex items-center gap-2 rounded-xl text-sm font-bold transition cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/30 ${
                                tab === t.id ? "bg-orange-600 text-white shadow" : "text-stone-600 hover:bg-stone-100"
                            }`}
                        >
                            {t.icon}
                            {t.label}
                            {t.dot && tab !== t.id && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500 motion-safe:animate-pulse" />}
                        </button>
                    ))}
                </nav>

                <p className="flex items-center gap-2 text-sm text-stone-500">
                    <span className={`size-2.5 rounded-full ${statusDot}`} />
                    <span className="font-semibold text-stone-700">{callStatus}</span>
                    {!signalReady && <span>· connecting to server...</span>}
                </p>
            </header>

            {/* Global messages */}
            {callError && (
                <div role="alert" className="rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 flex items-start justify-between gap-3">
                    <span>{callError}</span>
                    <button type="button" onClick={() => setCallError("")} aria-label="Dismiss error" className="font-bold cursor-pointer">
                        ×
                    </button>
                </div>
            )}
            {notice && (
                <p role="status" className="rounded-2xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3">
                    {notice}
                </p>
            )}

            {/* ---------- FRIENDS TAB ---------- */}
            {tab === "friends" && (
                <section aria-label="Friends" className="rounded-3xl bg-white border border-stone-200 p-5 md:p-6 w-full max-w-3xl mx-auto">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight">Call a friend</h1>
                            <p className="mt-1 text-sm text-stone-500">Pick a friend and start a video call.</p>
                        </div>
                        <span className="text-sm font-semibold text-stone-400">{friends.length} {friends.length === 1 ? "friend" : "friends"}</span>
                    </div>

                    <label htmlFor="friend-search" className="sr-only">Search friends</label>
                    <input
                        id="friend-search"
                        value={friendQuery}
                        onChange={(e) => setFriendQuery(e.target.value)}
                        placeholder="Search friends"
                        autoComplete="off"
                        className="mt-5 w-full h-12 px-4 rounded-2xl bg-stone-50 border border-stone-200 text-base placeholder:text-stone-400 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                    />

                    <ul className="mt-4 divide-y divide-stone-100">
                        {friendsLoading &&
                            [0, 1, 2].map((i) => (
                                <li key={i} className="py-3 flex items-center gap-4">
                                    <span className="size-12 rounded-2xl bg-stone-100 motion-safe:animate-pulse" />
                                    <span className="h-4 w-40 rounded bg-stone-100 motion-safe:animate-pulse" />
                                </li>
                            ))}

                        {!friendsLoading &&
                            filteredFriends.map((friends) => (
                                <li key={friends.friend_username} className="py-3 flex items-center gap-4">
                                    <Avatar name={friends.friend_username} />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold truncate">{friends.friend_username}</p>
                                        {<p className="text-sm text-stone-500 truncate">@{friends.friend_username}</p>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => startCall(friends.friend_username)}
                                        disabled={!ready || busy || Boolean(request)}
                                        aria-label={`Video call ${friends.friend_username}`}
                                        className="h-11 px-5 flex items-center gap-2 rounded-2xl bg-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-600/25 transition hover:bg-orange-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <PhoneIcon />
                                        Call
                                    </button>
                                </li>
                            ))}
                    </ul>

                    {!friendsLoading && friendsError && (
                        <div className="py-8 text-center">
                            <p className="text-sm text-red-600 font-medium">{friendsError}</p>
                            <button type="button" onClick={loadFriends} className="mt-3 h-10 px-5 rounded-xl bg-stone-900 text-white text-sm font-bold cursor-pointer">
                                Try again
                            </button>
                        </div>
                    )}

                    {!friendsLoading && !friendsError && friends.length === 0 && (
                        <p className="py-8 text-center text-sm text-stone-500">No friends yet. Send a friend request from your profile to start calling.</p>
                    )}

                    {!friendsLoading && !friendsError && friends.length > 0 && filteredFriends.length === 0 && (
                        <p className="py-8 text-center text-sm text-stone-500">No friends match “{friendQuery}”.</p>
                    )}
                </section>
            )}

            {/* ---------- CALL TAB ---------- */}
            {tab === "call" && (
                <section
                    aria-label="Video call"
                    className="relative flex-1 min-h-96 rounded-3xl bg-stone-900 overflow-hidden shadow-xl"
                >
                    <video ref={recivedvideo} autoPlay playsInline className="absolute inset-0 size-full object-cover" />

                    {!remote && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6">
                            {outgoing || ongoingcall ? (
                                <span className="relative">
                                    <Avatar name={outgoing || ongoingcall?.with} size="size-24 text-4xl" />
                                    <span className="absolute inset-0 rounded-2xl ring-4 ring-orange-500/50 motion-safe:animate-ping" />
                                </span>
                            ) : (
                                <div className="size-20 p-4 rounded-3xl bg-stone-800 text-stone-500">
                                    <VideoIcon className="size-full" />
                                </div>
                            )}
                            <p className="text-lg font-semibold text-white">
                                {outgoing
                                    ? `Calling ${outgoing}...`
                                    : ongoingcall
                                      ? `Connecting to ${ongoingcall.with}...`
                                      : "No active call"}
                            </p>
                            <p className="text-sm text-stone-400 max-w-xs">
                                {outgoing
                                    ? "Waiting for them to accept."
                                    : ongoingcall
                                      ? "Allow camera and microphone access if your browser asks."
                                      : "Pick a friend from the Friends tab to start a call."}
                            </p>
                            {!outgoing && !ongoingcall && (
                                <button
                                    type="button"
                                    onClick={() => setTab("friends")}
                                    className="h-11 px-5 rounded-2xl bg-white text-stone-900 text-sm font-bold cursor-pointer"
                                >
                                    Choose a friend
                                </button>
                            )}
                        </div>
                    )}

                    {remote && (
                        <div className="absolute top-4 left-4 flex items-center gap-3 rounded-full bg-black/50 backdrop-blur px-4 py-2 text-sm font-semibold text-white">
                            <span className="size-2 rounded-full bg-red-500 motion-safe:animate-pulse" />
                            {ongoingcall?.with}
                            <span className="text-white/70 tabular-nums">{minutes}:{remainingSeconds}</span>
                        </div>
                    )}

                    {/* Controls */}
                    {(outgoing || ongoingcall) && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                            {ongoingcall && mystream && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => toggleTrack("audio")}
                                        aria-pressed={!micOn}
                                        aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
                                        className={`size-12 grid place-items-center rounded-full font-bold shadow-lg transition cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 ${micOn ? "bg-white/90 text-stone-900 hover:bg-white" : "bg-stone-700 text-white"}`}
                                    >
                                        <span className="relative">
                                            <MicIcon />
                                            {!micOn && <span className="absolute left-1/2 top-1/2 h-0.5 w-7 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-red-500" />}
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleTrack("video")}
                                        aria-pressed={!camOn}
                                        aria-label={camOn ? "Turn camera off" : "Turn camera on"}
                                        className={`size-12 grid place-items-center rounded-full font-bold shadow-lg transition cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 ${camOn ? "bg-white/90 text-stone-900 hover:bg-white" : "bg-stone-700 text-white"}`}
                                    >
                                        <span className="relative">
                                            <VideoIcon />
                                            {!camOn && <span className="absolute left-1/2 top-1/2 h-0.5 w-7 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-red-500" />}
                                        </span>
                                    </button>
                                </>
                            )}
                            <button
                                type="button"
                                onClick={() => (ongoingcall ? hangUp() : cancelCall())}
                                className="h-12 px-6 flex items-center justify-center gap-2 rounded-full bg-red-600 text-white font-bold shadow-lg transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/40 cursor-pointer"
                            >
                                <DeclineIcon />
                                {ongoingcall ? "End call" : "Cancel"}
                            </button>
                        </div>
                    )}
                    {/* Self view */}
                    <div className="absolute top-4 right-4 w-24 sm:w-44 aspect[3/4] sm:aspect-video rounded-2xl overflow-hidden bg-stone-800 border-2 border-white/25 shadow-lg">
                        <video
                            ref={myvideo}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 size-full object-cover -scale-x-100"
                        />
                        {!mystream && (
                            <div className="absolute inset-0 grid place-items-center text-stone-500">
                                <VideoIcon className="size-8" />
                            </div>
                        )}
                        <span className="absolute bottom-1.5 left-2 text-xs font-semibold text-white drop-shadow">
                            You
                        </span>
                    </div>
                </section>
            )}

            {/* ---------- HISTORY TAB ---------- */}
            {tab === "history" && (
                <section aria-label="Call history" className="rounded-3xl bg-white border border-stone-200 p-5 md:p-6 w-full max-w-3xl mx-auto">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight">Call history</h1>
                            <p className="mt-1 text-sm text-stone-500">Your recent video calls.</p>
                        </div>
                        <button type="button" onClick={loadHistory} className="h-10 px-4 rounded-xl border border-stone-200 text-sm font-bold text-stone-700 hover:bg-stone-50 cursor-pointer">
                            Refresh
                        </button>
                    </div>

                    <ul className="mt-4 divide-y divide-stone-100">
                        {historyLoading &&
                            [0, 1, 2].map((i) => (
                                <li key={i} className="py-3 flex items-center gap-4">
                                    <span className="size-12 rounded-2xl bg-stone-100 motion-safe:animate-pulse" />
                                    <span className="h-4 w-48 rounded bg-stone-100 motion-safe:animate-pulse" />
                                </li>
                            ))}

                        {!historyLoading &&
                            history.map((h) => (
                                <li key={h.id} className="py-3 flex items-center gap-4">
                                    <Avatar name={h.with} />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold truncate">{h.with}</p>
                                        <p className="text-sm text-stone-500 truncate">
                                            {[h.direction && h.direction.toString().toLowerCase(), h.status && h.status.toString().toLowerCase(), formatDate(h.date)]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </p>
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={() => startCall(h.with)}
                                        disabled={!ready || busy || Boolean(request) || h.with === "Unknown"}
                                        aria-label={`Call ${h.with} again`}
                                        className="size-11 grid place-items-center rounded-2xl bg-orange-50 text-orange-700 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <PhoneIcon />
                                    </button>
                                </li>
                            ))}
                    </ul>

                    {!historyLoading && historyError && <p className="py-8 text-center text-sm text-red-600 font-medium">{historyError}</p>}
                    {!historyLoading && !historyError && history.length === 0 && (
                        <p className="py-8 text-center text-sm text-stone-500">No calls yet. Your video calls will show up here.</p>
                    )}
                </section>
            )}

            {/* ---------- INCOMING CALL (receiver sees this on any tab) ---------- */}
            {request && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-stone-900/60 backdrop-blur-sm p-4">
                    <div role="alertdialog" aria-modal="true" aria-label="Incoming video call" className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
                        <span className="relative inline-block">
                            <Avatar name={request.fromUsername} size="size-24 text-4xl" />
                            <span className="absolute inset-0 rounded-2xl ring-4 ring-green-500/40 motion-safe:animate-ping" />
                        </span>
                        <p className="mt-5 text-sm text-stone-500">Incoming video call</p>
                        <p className="text-2xl font-extrabold tracking-tight truncate">{request.fromUsername}</p>
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={declineCall}
                                className="flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl bg-red-600 text-white font-bold transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/30 cursor-pointer"
                            >
                                <DeclineIcon />
                                Decline
                            </button>
                            <button
                                type="button"
                                autoFocus
                                onClick={acceptCall}
                                className="flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl bg-green-600 text-white font-bold transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30 cursor-pointer"
                            >
                                <PhoneIcon />
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Videochat;
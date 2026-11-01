import { Stomp } from "@stomp/stompjs";
import Peer from "peerjs";
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

const videoIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-full" aria-hidden="true">
        <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
    </svg>
);

const phoneIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
        <path
            fillRule="evenodd"
            d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
            clipRule="evenodd"
        />
    </svg>
);

const declineIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
        <path
            fillRule="evenodd"
            d="M15.22 3.22a.75.75 0 0 1 1.06 0L18 4.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L19.06 6l1.72 1.72a.75.75 0 0 1-1.06 1.06L18 7.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L16.94 6l-1.72-1.72a.75.75 0 0 1 0-1.06ZM1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
            clipRule="evenodd"
        />
    </svg>
);

// PeerJS replaces its default ICE servers when you pass `config`, so list STUN yourself.
// STUN alone only works when both users are on friendly networks. For users on different
// networks / mobile data you NEED a TURN server (Metered, Twilio, coturn...). Add it here.
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

function DetailRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4 py-3 border-b border-stone-100 last:border-b-0">
            <span className="text-sm text-stone-500">{label}</span>
            <span className="font-semibold truncate">{value}</span>
        </div>
    );
}

function Videochat() {
    const peerref = useRef(null);
    const clientref = useRef(null);
    const myvideo = useRef(null);
    const recivedvideo = useRef(null);
    const streamRef = useRef(null);
    const mediaCallRef = useRef(null);
    const ongoingRef = useRef(null); // readable inside long-lived callbacks (no stale state)
    const calleeRef = useRef("");
    const noticeTimerRef = useRef(null);

    const [peerid, setPeerid] = useState(null);
    const [signalReady, setSignalReady] = useState(false);
    const [mystream, setMystream] = useState(false);
    const [remote, setRemote] = useState(false);
    const [toUsername, setToUsername] = useState("");
    const [request, setRequest] = useState(null);
    const [ongoingcall, setOngoingcall] = useState(null);
    const [seconds, setSeconds] = useState(0);
    const [notice, setNotice] = useState("");
    const [callError, setCallError] = useState("");
    const [callStatus, setCallStatus] = useState("Initializing...");

    const url = import.meta.env.VITE_API_BASE_URL;

    // Timer runs only while video is actually flowing
    useEffect(() => {
        if (!remote) return;
        const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [remote]);
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const remainingSeconds = String(seconds % 60).padStart(2, "0");

    function showNotice(text, ms = 30000) {
        clearTimeout(noticeTimerRef.current);
        setNotice(text);
        if (text) noticeTimerRef.current = setTimeout(() => setNotice(""), ms);
    }

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
        return stream;
    }

    function stopMedia() {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (myvideo.current) myvideo.current.srcObject = null;
        setMystream(false);
    }

    /* ---------- call lifecycle ---------- */

    function hangUp(status = "Ready") {
        const call = mediaCallRef.current;
        mediaCallRef.current = null; // clear first so the "close" handler ignores this call
        call?.close();
        ongoingRef.current = null;
        setOngoingcall(null);
        setRemote(false);
        setSeconds(0);
        if (recivedvideo.current) recivedvideo.current.srcObject = null;
        stopMedia();
        setCallStatus(status);
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
    async function callid(id, name) {
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
            { Authorization: "Bearer " + localStorage.getItem("jwt") },
            () => {
                setSignalReady(true);
                client.subscribe("/user/queue/videocall", (frame) => {
                    const data = JSON.parse(frame.body);

                    if (data.mode === "IdRequest") {
                        // already in a call -> tell the caller we're busy
                        if (ongoingRef.current) {
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
                        clearTimeout(noticeTimerRef.current);
                        setNotice("");
                        const call = { ...data, with: calleeRef.current };
                        ongoingRef.current = call;
                        setOngoingcall(call);
                        callid(data.callerId, calleeRef.current);
                    }

                    if (data.mode === "RequestReject") {
                        showNotice(`${calleeRef.current || "The other person"} declined the call.`, 6000);
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

    function clientSend(e) {
        if (e) e.preventDefault();
        const name = toUsername.trim();
        if (!name) return;
        if (!clientref.current?.connected) {
            setCallError("Not connected to the server yet. Try again in a moment.");
            return;
        }
        if (ongoingRef.current) return;

        setCallError("");
        calleeRef.current = name;
        clientref.current.send(
            "/app/video-call",
            {},
            JSON.stringify({ toUsername: name, callDate: new Date(), mode: "IdRequest" })
        );
        showNotice(`Call request sent to ${name}. Waiting for them to accept...`);
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
        } catch (err) {
            console.error("Failed to accept call:", err);
            setCallError(mediaErrorMessage(err));
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
            streamRef.current = null; // important: otherwise a stopped stream gets reused after remount
            peer.destroy();
        };
    }, []);

    const busy = Boolean(ongoingcall);

    return (
        <div className="w-full h-full overflow-auto bg-stone-100 p-4 md:p-6 flex flex-col lg:flex-row gap-4 md:gap-6">
            {/* Stage: remote video with self-view inset */}
            <section
                aria-label="Video call"
                className="relative flex-1 min-w-0 min-h-80 aspect-video lg:aspect-auto rounded-3xl bg-stone-900 overflow-hidden shadow-xl"
            >
                <video ref={recivedvideo} autoPlay playsInline className="absolute inset-0 size-full object-cover" />

                {!remote && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6">
                        <div className="size-20 p-4 rounded-3xl bg-stone-800 text-stone-500">{videoIcon}</div>
                        <p className="text-lg font-semibold text-white">
                            {ongoingcall ? "Connecting to the other person..." : "No active call"}
                        </p>
                        <p className="text-sm text-stone-400 max-w-xs">
                            {ongoingcall
                                ? "Allow camera and microphone access if your browser asks."
                                : "Start a call or accept a request and the video will show up here."}
                        </p>
                    </div>
                )}

                {remote && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/50 backdrop-blur px-3 py-1.5 text-sm font-semibold text-white">
                        <span className="size-2 rounded-full bg-red-500 motion-safe:animate-pulse" />
                        {minutes}:{remainingSeconds}
                    </div>
                )}

                {ongoingcall && (
                    <button
                        type="button"
                        onClick={() => hangUp()}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 h-12 px-6 flex items-center justify-center gap-2 rounded-full bg-red-600 text-white font-bold shadow-lg transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/40 cursor-pointer"
                    >
                        {declineIcon}
                        End call
                    </button>
                )}

                <div className="absolute bottom-4 right-4 w-32 sm:w-44 aspect-video rounded-2xl overflow-hidden bg-stone-800 border-2 border-white/25 shadow-lg">
                    <video
                        ref={myvideo}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 size-full object-cover -scale-x-100"
                    />
                    {!mystream && (
                        <div className="absolute inset-0 grid place-items-center text-stone-500">
                            <div className="size-8">{videoIcon}</div>
                        </div>
                    )}
                    <span className="absolute bottom-1.5 left-2 text-xs font-semibold text-white drop-shadow">You</span>
                </div>
            </section>

            {/* Side panel */}
            <aside className="w-full lg:w-96 shrink-0 flex flex-col gap-4">
                {callError && (
                    <div role="alert" className="rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 flex items-start justify-between gap-3">
                        <span>{callError}</span>
                        <button
                            type="button"
                            onClick={() => setCallError("")}
                            aria-label="Dismiss error"
                            className="font-bold cursor-pointer"
                        >
                            ×
                        </button>
                    </div>
                )}

                <form onSubmit={clientSend} className="rounded-3xl bg-white border border-stone-200 p-6">
                    <h1 className="text-2xl font-extrabold tracking-tight">Start a call</h1>
                    <p className="mt-1 text-sm text-stone-500">Enter a username to ask them to join a video call.</p>

                    <label htmlFor="callee" className="mt-5 block text-sm font-semibold text-stone-700">
                        Username
                    </label>
                    <input
                        id="callee"
                        value={toUsername}
                        onChange={(e) => setToUsername(e.target.value)}
                        placeholder="Who do you want to call?"
                        autoComplete="off"
                        className="mt-2 w-full h-12 px-4 rounded-2xl bg-white border border-stone-200 text-base placeholder:text-stone-400 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                    />

                    <button
                        type="submit"
                        disabled={!toUsername.trim() || !signalReady || !peerid || busy}
                        className="mt-4 w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-orange-600 text-white font-bold shadow-lg shadow-orange-600/25 transition hover:bg-orange-700 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {phoneIcon}
                        Start video call
                    </button>

                    <p className="mt-3 text-xs text-stone-500">
                        Status: <span className="font-semibold">{callStatus}</span>
                        {!signalReady && " · connecting to server..."}
                    </p>

                    {notice && (
                        <p role="status" className="mt-3 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3">
                            {notice}
                        </p>
                    )}
                </form>

                <div className="rounded-3xl bg-white border border-stone-200 p-6">
                    <h2 className="text-xl font-extrabold tracking-tight">Incoming request</h2>
                    {request ? (
                        <div role="alert" className="mt-4 rounded-2xl bg-orange-50 border border-orange-200 p-4">
                            <p className="text-sm text-stone-600">Video call from</p>
                            <p className="text-xl font-bold truncate">{request.fromUsername}</p>
                            <div className="mt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={acceptCall}
                                    className="flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl bg-green-600 text-white font-bold transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30 cursor-pointer"
                                >
                                    {phoneIcon}
                                    Accept
                                </button>
                                <button
                                    type="button"
                                    onClick={declineCall}
                                    className="flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl bg-red-600 text-white font-bold transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/30 cursor-pointer"
                                >
                                    {declineIcon}
                                    Decline
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-stone-500">No one is calling you right now.</p>
                    )}
                </div>

                <div className="rounded-3xl bg-white border border-stone-200 p-6">
                    <h2 className="text-xl font-extrabold tracking-tight">Call details</h2>
                    {ongoingcall ? (
                        <div className="mt-2">
                            <DetailRow label="With" value={ongoingcall.with || "Unknown"} />
                            <DetailRow label="Type" value="Video call" />
                            <DetailRow label="Duration" value={`${minutes}:${remainingSeconds}`} />
                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-stone-500">Details appear here once a call starts.</p>
                    )}
                </div>
            </aside>
        </div>
    );
}

export default Videochat;
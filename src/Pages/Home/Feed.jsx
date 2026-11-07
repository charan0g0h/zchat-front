import { Stomp } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

const url = import.meta.env.VITE_API_BASE_URL;

// Backend endpoints (change these to match your server)
const FEED_PATH = "/getAllZaps"; // GET  -> Zap[]  (global: everyone's zaps)
const FRIENDS_FEED_PATH = "/getFriendsZaps"; // GET  -> Zap[]  (zaps from the logged-in user's friends)
const SEARCH_PATH = "/search/"; // GET  /search/{username} -> { username, email, fullname }
const PROFILE_PATH = "/searchProfile/"; // GET  /searchProfile/{username} -> PublicProfile
const LIKE_PATH = "/likeZap/"; // POST /likeZap/{zapId}
const DISLIKE_PATH = "/dislikeZap/"; // POST /dislikeZap/{zapId}
// Comments go over the socket:
//   send      -> /app/createComment   { zapId, content }
//   subscribe -> /topic/comments      { id, zapId, username, content, date }

const inputClass =
    "w-full px-4 rounded-2xl bg-white border border-stone-200 text-base placeholder:text-stone-400 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15";

const authHeaders = () => ({ Authorization: "Bearer " + localStorage.getItem("jwt") });

function formatDate(value) {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDay(value) {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

const byNewest = (a, b) => new Date(b.date || 0) - new Date(a.date || 0);

function Avatar({ name, size = "size-11", text = "text-lg" }) {
    return (
        <div
            className={`${size} ${text} shrink-0 rounded-full bg-orange-100 text-orange-700 font-bold grid place-items-center`}
            aria-hidden="true"
        >
            {(name || "?").trim().charAt(0).toUpperCase()}
        </div>
    );
}

const chevronUp = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-4" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
);

const chevronDown = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-4" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const commentIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
        <path
            fillRule="evenodd"
            d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z"
            clipRule="evenodd"
        />
    </svg>
);

const searchIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
        <path
            fillRule="evenodd"
            d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
            clipRule="evenodd"
        />
    </svg>
);

function Counter({ icon, value, label, tone = "text-stone-500", onClick }) {
    const cls = `flex items-center gap-1.5 text-sm font-semibold ${tone}`;
    const inner = (
        <>
            {icon}
            <span>{value}</span>
            <span className="sr-only">{label}</span>
        </>
    );
    if (!onClick) {
        return (
            <span className={cls} title={label}>
                {inner}
            </span>
        );
    }
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className={`${cls} rounded-lg px-2 py-1 -mx-2 hover:bg-stone-100 active:scale-95 transition cursor-pointer`}
        >
            {inner}
        </button>
    );
}

function ZapCard({ zap, onOpenProfile, onLike, onDislike, onComment }) {
    const [showComments, setShowComments] = useState(false);
    const [text, setText] = useState("");
    const comments = Array.isArray(zap.commentsList) ? zap.commentsList : [];

    function submitComment(e) {
        e.preventDefault();
        const content = text.trim();
        if (!content) return;
        if (onComment(zap.id, content)) setText("");
    }

    return (
        <article className="rounded-3xl bg-white p-5 md:p-6 shadow-sm shadow-stone-900/5">
            <header className="flex items-center gap-3">
                <Avatar name={zap.username} />
                <div className="min-w-0 flex-1">
                    <button
                        type="button"
                        onClick={() => onOpenProfile(zap.username)}
                        className="block max-w-full truncate font-bold hover:text-orange-700 hover:underline cursor-pointer"
                    >
                        @{zap.username}
                    </button>
                    <p className="text-xs text-stone-400">{formatDate(zap.date)}</p>
                </div>
            </header>

            {zap.head && <h3 className="mt-4 text-xl font-extrabold tracking-tight">{zap.head}</h3>}
            {zap.content && (
                <p className="mt-2 whitespace-pre-wrap wrap-break-word text-stone-700 leading-relaxed">{zap.content}</p>
            )}

            <footer className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-5">
                <Counter icon={chevronUp} value={zap.likes ?? 0} label="Like" tone="text-green-600" onClick={() => onLike(zap)} />
                <Counter icon={chevronDown} value={zap.dislikes ?? 0} label="Dislike" tone="text-red-500" onClick={() => onDislike(zap)} />
                <Counter icon={commentIcon} value={comments.length} label="Comments" onClick={() => setShowComments((s) => !s)} />
                
            </footer>

            {showComments && (
                <div className="mt-4 flex flex-col gap-3">
                    {comments.length === 0 && <p className="text-sm text-stone-400">No comments yet. Be the first.</p>}
                    {comments.map((c, i) => (
                        <div key={c.id ?? i} className="flex gap-3">
                            <Avatar name={c.commenter} size="size-8" text="text-sm" />
                            <div className="min-w-0 flex-1 rounded-2xl bg-stone-50 px-4 py-2">
                                <div className="flex items-baseline gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onOpenProfile(c.commenter)}
                                        className="text-sm font-bold hover:text-orange-700 cursor-pointer"
                                    >
                                        @{c.commenter}
                                    </button>
                                    <span className="text-xs text-stone-400">{formatDate(c.date)}</span>
                                </div>
                                <p className="text-sm text-stone-700 whitespace-pre-wrap wrap-break-word">{c.comment}</p>
                            </div>
                        </div>
                    ))}

                    <form onSubmit={submitComment} className="flex gap-2">
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Write a comment..."
                            aria-label="Write a comment"
                            className={inputClass + " h-11 text-sm"}
                        />
                        <button
                            type="submit"
                            disabled={!text.trim()}
                            className="h-11 px-5 rounded-xl bg-orange-600 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}
        </article>
    );
}

function Skeleton() {
    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm motion-safe:animate-pulse">
            <div className="flex items-center gap-3">
                <div className="size-11 rounded-full bg-stone-200" />
                <div className="flex-1 flex flex-col gap-2">
                    <div className="h-3 w-32 rounded bg-stone-200" />
                    <div className="h-3 w-20 rounded bg-stone-100" />
                </div>
            </div>
            <div className="mt-5 h-5 w-2/3 rounded bg-stone-200" />
            <div className="mt-3 h-3 w-full rounded bg-stone-100" />
            <div className="mt-2 h-3 w-5/6 rounded bg-stone-100" />
        </div>
    );
}

function Stat({ value, label }) {
    return (
        <div className="px-4 py-5 text-center">
            <p className="text-3xl font-extrabold tracking-tight">{value}</p>
            <p className="mt-1 text-sm text-stone-500">{label}</p>
        </div>
    );
}

const TABS = [
    { id: "global", label: "Global" },
    { id: "friends", label: "Friends" },
];

export default function Feed() {
    const scrollRef = useRef(null);

    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [result, setResult] = useState(null);

    const [feed, setFeed] = useState([]);
    const [feedLoading, setFeedLoading] = useState(true);
    const [feedError, setFeedError] = useState("");

    // Tabs: "global" = everyone's zaps, "friends" = zaps from friends only
    const [tab, setTab] = useState("global");
    const tabRef = useRef("global"); // lets the socket callback see the current tab
    const [friendsFeed, setFriendsFeed] = useState([]);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [friendsError, setFriendsError] = useState("");

    const [selected, setSelected] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState("");

    const [composing, setComposing] = useState(false);
    const [zapHead, setZapHead] = useState("");
    const [zapContent, setZapContent] = useState("");
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState("");

    const [isfriend, setIsfriend] = useState(false);
    const [requestPending, setRequestpending] = useState(false);

    const chatref = useRef();

    // Updates one zap everywhere it's shown: both feeds and the open profile's zap list
    function patchZap(zapId, fn) {
        setFeed((prev) => prev.map((z) => (z.id === zapId ? fn(z) : z)));
        setFriendsFeed((prev) => prev.map((z) => (z.id === zapId ? fn(z) : z)));
        setSelected((prev) =>
            prev && Array.isArray(prev.zapList)
                ? { ...prev, zapList: prev.zapList.map((z) => (z.id === zapId ? fn(z) : z)) }
                : prev
        );
    }

    async function loadFeed() {
        setFeedError("");
        try {
            const response = await fetch(url + FEED_PATH, { headers: authHeaders() });
            const data = await response.json();
            setFeed(Array.isArray(data) ? data : []);
        } catch (err) {
            setFeedError("Couldn't load the feed. Check your connection and refresh.");
        } finally {
            setFeedLoading(false);
        }
    }

    async function loadFriendsFeed(showSpinner = true) {
        if (showSpinner) setFriendsLoading(true);
        setFriendsError("");
        try {
            const response = await fetch(url + FRIENDS_FEED_PATH, { headers: authHeaders() });
            if (!response.ok) throw new Error("HTTP " + response.status);
            const data = await response.json();
            setFriendsFeed(Array.isArray(data) ? data : []);
        } catch (err) {
            setFriendsError("Couldn't load your friends' zaps. Check your connection and try again.");
        } finally {
            setFriendsLoading(false);
        }
    }

    function switchTab(next) {
        setTab(next);
        tabRef.current = next;
        if (next === "friends") loadFriendsFeed();
    }

    useEffect(() => {
        loadFeed();
    }, []);

    useEffect(() => {
        const socket = new SockJS(url + "/chat");
        const client = Stomp.over(socket);
        chatref.current = client;

        client.connect(
            { Authorization: "Bearer " + localStorage.getItem("jwt") },
            () => {
                client.subscribe("/topic/zaps", (msg) => {
                    const newZap = JSON.parse(msg.body);
                    setFeed((prev) => [newZap, ...prev]);
                    // The client doesn't know who your friends are, so on the
                    // Friends tab we ask the server for the up-to-date list.
                    if (tabRef.current === "friends") loadFriendsFeed(false);
                });

                client.subscribe("/topic/comments", (msg) => {
                    const c = JSON.parse(msg.body);
                    patchZap(c.zapId, (z) => {
                        const list = Array.isArray(z.commentsList) ? z.commentsList : [];
                        if (c.id != null && list.some((x) => x.id === c.id)) return z; // no duplicates
                        return { ...z, commentsList: [...list, c] };
                    });
                });
            }
        );

        return () => {
            if (client.connected) client.disconnect();
        };
    }, []);

    function createZap(e) {
        e.preventDefault();
        const head = zapHead.trim();
        const content = zapContent.trim();
        if (!head || !content) return;
        if (!chatref.current || !chatref.current.connected) {
            setPostError("Connection unavailable. Please try again.");
            return;
        }
        setPosting(true);
        setPostError("");
        try {
            chatref.current.send(
                "/app/createZap",
                {},
                JSON.stringify({
                    head: head,
                    content: content,
                })
            );
            setZapHead("");
            setZapContent("");
            setComposing(false);
        } catch (err) {
            setPostError("Couldn't post your zap. Try again.");
        } finally {
            setPosting(false);
        }
    }

    function cancelCompose() {
        setComposing(false);
        setPostError("");
    }

    async function react(zap, kind) {
        const path = kind === "like" ? LIKE_PATH : DISLIKE_PATH;
        try {
            const response = await fetch(
                url + path + zap.id,
                {
                    method: "POST",
                    headers: authHeaders()
                }
            );
            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }
            const data = await response.json();
            patchZap(zap.id, (z) => ({
                ...z,
                likes: data.likes,
                dislikes: data.dislikes
            }));
        } catch (err) {
            console.error("Reaction failed:", err);
        }
    }

    const likeZap = (zap) => react(zap, "like");
    const dislikeZap = (zap) => react(zap, "dislike");

    function sendComment(zapId, content) {
        if (!chatref.current || !chatref.current.connected) return false;
        chatref.current.send("/app/createComment", {}, JSON.stringify({ zapId, content }));
        return true; // the comment appears when the server broadcasts it back
    }

    function scrollToTop() {
        if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function search(e) {
        e.preventDefault();
        const name = query.trim();
        if (!name) return;
        setSearching(true);
        setSearchError("");
        setResult(null);
        try {
            const response = await fetch(url + SEARCH_PATH + encodeURIComponent(name), { headers: authHeaders() });
            const data = await response.json();
            if (data && data.username) {
                setResult(data);
            } else {
                setSearchError(`No user found with the username "${name}".`);
            }
        } catch (err) {
            setSearchError("Search failed. Check your connection and try again.");
        } finally {
            setSearching(false);
        }
    }

    async function openProfile(username) {
        setProfileLoading(true);
        setProfileError("");
        setResult(null);
        setSearchError("");
        scrollToTop();
        try {
            const response = await fetch(url + PROFILE_PATH + encodeURIComponent(username), { headers: authHeaders() });
            const data = await response.json();
            if (data && data.username) {
                setSelected(data);
            } else {
                setProfileError("Couldn't load that profile.");
            }
        } catch (err) {
            setProfileError("Couldn't load that profile. Check your connection and try again.");
        } finally {
            setProfileLoading(false);
        }
    }

    // Friend status check. Depends on the username only, so likes/comments
    // (which replace the `selected` object) don't re-trigger it.
    useEffect(() => {
        if (!selected) return;
        (async () => {
            try {
                const response = await fetch(url + "/isfriend/" + selected.username, { headers: authHeaders() });
                const data = await response.json();
                if (data.code === 0) {
                    setIsfriend(true);
                    setRequestpending(false);
                } else if (data.code === 1) {
                    setIsfriend(false);
                    setRequestpending(true);
                } else {
                    setIsfriend(false);
                    setRequestpending(false);
                }
            } catch (err) {
                console.error(err);
            }
        })();
    }, [selected?.username]);

    function backToFeed() {
        setSelected(null);
        setProfileError("");
        scrollToTop();
    }

    const profileZaps = selected && Array.isArray(selected.zapList) ? [...selected.zapList].sort(byNewest) : [];
    const totalLikes = profileZaps.reduce((sum, z) => sum + (z.likes || 0), 0);

    const onFriendsTab = tab === "friends";
    const activeFeed = onFriendsTab ? friendsFeed : feed;
    const activeLoading = onFriendsTab ? friendsLoading : feedLoading;
    const activeError = onFriendsTab ? friendsError : feedError;
    const sortedFeed = [...activeFeed].sort(byNewest);

    async function sendFriendRequest() {
        try {
            const response = await fetch(`${url}/send_friendRequest/${encodeURIComponent(selected.username)}`, {
                method: "POST",
                headers: authHeaders(),
            });
            console.log(response);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();

            if (data.code === 4) {
                console.log("Friend request sent successfully");
                setIsfriend(true);
                setRequestpending(true);
            } else if (data.code === 2) {
                console.log("Friend request already sent");
            } else {
                console.log(data.discription);
            }

            return data;
        } catch (error) {
            console.error("Error sending friend request:", error);
            return null;
        }
    }

    return (
        <div ref={scrollRef} className="w-full h-full overflow-y-auto bg-stone-100">
            {/* Search bar */}
            <div className="sticky top-0 z-10 bg-stone-100/90 backdrop-blur border-b border-stone-200">
                <form onSubmit={search} className="mx-auto max-w-3xl px-4 md:px-8 py-4">
                    <div className="relative">
                        <input
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSearchError("");
                            }}
                            placeholder="Search people by username"
                            aria-label="Search people by username"
                            className="w-full h-13 pl-5 pr-28 rounded-2xl bg-white border border-stone-200 text-base placeholder:text-stone-400 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                        />
                        <button
                            type="submit"
                            disabled={searching || !query.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-4 rounded-xl bg-orange-600 text-sm font-bold text-white flex items-center gap-2 transition hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {searchIcon}
                            {searching ? "..." : "Search"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mx-auto max-w-3xl p-4 md:p-8 flex flex-col gap-5">
                {/* Search result */}
                {searchError && (
                    <div role="alert" className="rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3">
                        {searchError}
                    </div>
                )}
                {result && (
                    <button
                        type="button"
                        onClick={() => openProfile(result.username)}
                        className="w-full flex items-center gap-4 rounded-3xl bg-orange-50 border border-orange-200 p-4 text-left transition hover:bg-orange-100 cursor-pointer"
                    >
                        <Avatar name={result.fullname || result.username} size="size-14" text="text-xl" />
                        <div className="min-w-0 flex-1">
                            <p className="text-lg font-bold truncate">{result.fullname || result.username}</p>
                            <p className="text-sm text-stone-500 truncate">
                                @{result.username}
                                {result.email ? ` · ${result.email}` : ""}
                            </p>
                        </div>
                        <span className="shrink-0 text-sm font-bold text-orange-700">View profile</span>
                    </button>
                )}

                {profileError && (
                    <div role="alert" className="rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3">
                        {profileError}
                    </div>
                )}

                {/* Another user's profile */}
                {profileLoading && <Skeleton />}

                {selected && !profileLoading && (
                    <>
                        <button
                            type="button"
                            onClick={backToFeed}
                            className="self-start flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-200 transition cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                            </svg>
                            Back to feed
                        </button>

                        <section className="rounded-3xl bg-white overflow-hidden shadow-xl shadow-stone-900/5">
                            <div className="relative h-32 md:h-40 bg-orange-600 overflow-hidden">
                                <div className="absolute -top-24 -right-16 size-72 rounded-full bg-orange-500/60" />
                                <div className="absolute -bottom-32 left-1/4 size-80 rounded-full bg-orange-700/45" />
                            </div>
                            <div className="px-6 md:px-8 p-7">
                                <div className="-mt-12 md:-mt-14 flex flex-col md:flex-row md:items-end gap-4">
                                    <div className="size-24 md:size-28 rounded-4xl bg-white p-1.5 shadow-lg shrink-0">
                                        <div className="size-full rounded-[1.65rem] bg-orange-100 text-orange-700 grid place-items-center text-4xl md:text-5xl font-black">
                                            {(selected.fullname || selected.username).trim().charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="min-w-0 md:pb-1">
                                        <h1 className="mt-3 text-3xl font-extrabold tracking-tight truncate">
                                            {selected.fullname || selected.username}
                                        </h1>
                                        <p className="mt-1 text-lg font-semibold text-orange-700 truncate">@{selected.username}</p>
                                    </div>
                                </div>

                                <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="min-w-0">
                                        <dt className="text-sm text-stone-500">Email</dt>
                                        <dd className="mt-1 font-semibold truncate">{selected.email || "Not shared"}</dd>
                                    </div>
                                    <div className="min-w-0">
                                        <dt className="text-sm text-stone-500">Member since</dt>
                                        <dd className="mt-1 font-semibold">{formatDay(selected.date) || "Unknown"}</dd>
                                    </div>
                                </dl>
                                {!isfriend && (
                                    <div>
                                        <button
                                            onClick={sendFriendRequest}
                                            className="p-2 border-2 hover:cursor-pointer bg-orange-500 rounded-3xl font-extrabold text-white "
                                        >
                                            add to friend
                                        </button>
                                    </div>
                                )}
                                {requestPending && (
                                    <div>
                                        <h1>request is in pending</h1>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-3 divide-x divide-stone-100 border-t border-stone-100 bg-stone-50">
                                <Stat value={profileZaps.length} label="Zaps" />
                                <Stat value={selected.friendsCount ?? 0} label="Friends" />
                                <Stat value={totalLikes} label="Likes" />
                            </div>
                        </section>

                        <h2 className="px-2 text-2xl font-extrabold tracking-tight">Zaps by @{selected.username}</h2>
                        {profileZaps.length === 0 ? (
                            <div className="rounded-3xl bg-white border border-dashed border-stone-300 px-6 py-12 text-center">
                                <p className="text-lg font-bold">No zaps yet</p>
                                <p className="mt-1 text-stone-500">When they post, it will show up here.</p>
                            </div>
                        ) : (
                            profileZaps.map((zap) => (
                                <ZapCard
                                    key={zap.id}
                                    zap={zap}
                                    onOpenProfile={openProfile}
                                    onLike={likeZap}
                                    onDislike={dislikeZap}
                                    onComment={sendComment}
                                />
                            ))
                        )}
                    </>
                )}

                {/* Feed */}
                {!selected && !profileLoading && (
                    <>
                        {/* Create a zap */}
                        {composing ? (
                            <form
                                onSubmit={createZap}
                                className="rounded-3xl bg-white p-5 md:p-6 shadow-sm shadow-stone-900/5 flex flex-col gap-4"
                            >
                                <h2 className="text-xl font-extrabold tracking-tight">New zap</h2>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="zap-head" className="text-sm font-semibold text-stone-700">
                                        Title
                                    </label>
                                    <input
                                        id="zap-head"
                                        value={zapHead}
                                        onChange={(e) => {
                                            setZapHead(e.target.value);
                                            setPostError("");
                                        }}
                                        maxLength={120}
                                        placeholder="Give your zap a headline"
                                        autoFocus
                                        className={inputClass + " h-13"}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="zap-content" className="text-sm font-semibold text-stone-700">
                                        What do you want to say?
                                    </label>
                                    <textarea
                                        id="zap-content"
                                        rows={5}
                                        value={zapContent}
                                        onChange={(e) => {
                                            setZapContent(e.target.value);
                                            setPostError("");
                                        }}
                                        placeholder="Write your zap..."
                                        className={inputClass + " py-3 resize-y"}
                                    />
                                </div>

                                {postError && (
                                    <div
                                        role="alert"
                                        className="rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3"
                                    >
                                        {postError}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={cancelCompose}
                                        disabled={posting}
                                        className="h-11 px-5 rounded-xl bg-stone-100 text-sm font-bold text-stone-700 transition hover:bg-stone-200 disabled:opacity-50 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={posting || !zapHead.trim() || !zapContent.trim()}
                                        className="h-11 px-6 rounded-xl bg-orange-600 text-sm font-bold text-white shadow-md shadow-orange-600/25 transition hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {posting ? "Posting..." : "Post zap"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setComposing(true)}
                                className="w-full flex items-center gap-4 rounded-3xl bg-white p-4 md:p-5 text-left shadow-sm shadow-stone-900/5 transition hover:shadow-md cursor-pointer"
                            >
                                <div className="size-11 shrink-0 rounded-full bg-orange-600 text-white grid place-items-center text-xl font-black">
                                    Z
                                </div>
                                <span className="flex-1 text-stone-400">Share a zap...</span>
                                <span className="h-10 px-4 rounded-xl bg-orange-600 text-sm font-bold text-white grid place-items-center">
                                    New zap
                                </span>
                            </button>
                        )}

                        {/* Feed tabs */}
                        <div role="tablist" aria-label="Zap feed" className="flex gap-1 rounded-2xl bg-stone-200/70 p-1 self-start">
                            {TABS.map((t) => {
                                const active = tab === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => switchTab(t.id)}
                                        className={`h-10 px-5 rounded-xl text-sm font-bold transition cursor-pointer ${
                                            active
                                                ? "bg-white text-orange-700 shadow-sm"
                                                : "text-stone-600 hover:text-stone-900"
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-baseline justify-between px-2">
                            <h2 className="text-2xl font-extrabold tracking-tight">Feed</h2>
                            {sortedFeed.length > 0 && <span className="text-sm text-stone-500">{sortedFeed.length} zaps</span>}
                        </div>

                        {activeError && (
                            <div role="alert" className="rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3">
                                {activeError}
                            </div>
                        )}

                        {activeLoading && (
                            <>
                                <Skeleton />
                                <Skeleton />
                                <Skeleton />
                            </>
                        )}

                        {!activeLoading && !activeError && sortedFeed.length === 0 && (
                            <div className="rounded-3xl bg-white border border-dashed border-stone-300 px-6 py-14 text-center">
                                {onFriendsTab ? (
                                    <>
                                        <p className="text-xl font-bold">No zaps from friends yet</p>
                                        <p className="mt-1 text-stone-500">Add friends, or check back when they post.</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xl font-bold">Nothing here yet</p>
                                        <p className="mt-1 text-stone-500">New zaps from people will appear in your feed.</p>
                                    </>
                                )}
                            </div>
                        )}

                        {!activeLoading &&
                            sortedFeed.map((zap) => (
                                <ZapCard
                                    key={zap.id}
                                    zap={zap}
                                    onOpenProfile={openProfile}
                                    onLike={likeZap}
                                    onDislike={dislikeZap}
                                    onComment={sendComment}
                                />
                            ))}
                    </>
                )}
            </div>
        </div>
    );
}
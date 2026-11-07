import { useEffect, useRef, useState } from "react";

const url = import.meta.env.VITE_API_BASE_URL;

const outgoingIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
        <path
            fillRule="evenodd"
            d="M15 3.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V5.56l-4.72 4.72a.75.75 0 1 1-1.06-1.06l4.72-4.72h-2.69a.75.75 0 0 1-.75-.75Z"
            clipRule="evenodd"
        />
        <path
            fillRule="evenodd"
            d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
            clipRule="evenodd"
        />
    </svg>
);

const incomingIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
        <path
            fillRule="evenodd"
            d="M19.5 9.75a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v2.69l4.72-4.72a.75.75 0 1 1 1.06 1.06L16.06 9h2.69a.75.75 0 0 1 .75.75Z"
            clipRule="evenodd"
        />
        <path
            fillRule="evenodd"
            d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
            clipRule="evenodd"
        />
    </svg>
);

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

function Stat({ value, label }) {
    return (
        <div className="px-4 py-5 text-center">
            <p className="text-3xl font-extrabold tracking-tight">{value}</p>
            <p className="mt-1 text-sm text-stone-500">{label}</p>
        </div>
    );
}

function PersonRow({ name, subtitle, children }) {
    return (
        <li className="flex items-center gap-4 rounded-2xl bg-stone-50 p-3 md:p-4">
            <div
                className="size-12 shrink-0 rounded-full bg-orange-100 text-orange-700 grid place-items-center text-lg font-bold"
                aria-hidden="true"
            >
                {(name || "?").trim().charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
                <p className="font-bold truncate">{name}</p>
                <p className="text-sm text-stone-500 truncate">{subtitle}</p>
            </div>
            <div className="shrink-0 flex items-center gap-2">{children}</div>
        </li>
    );
}

function Pill({ tone, children }) {
    const tones = {
        green: "bg-green-100 text-green-700",
        amber: "bg-amber-100 text-amber-700",
        red: "bg-red-100 text-red-700",
    };
    return <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${tones[tone]}`}>{children}</span>;
}

const statusOf = (r) => String(r.status || "").toUpperCase();

function Profile() {
    const [recent, setRecent] = useState([]);
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Friend requests: one list of every request involving the logged-in user
    const [requests, setRequests] = useState([]);
    const [friendTab, setFriendTab] = useState("friends");
    const [busy, setBusy] = useState("");
    const [friendError, setFriendError] = useState("");
    const autoTabDone = useRef(false);

    useEffect(() => {
        async function fetchRecent() {
            const response = await fetch(url + "/gethistory", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("jwt"),
                },
            });
            const data = await response.json();
            setRecent(Array.isArray(data) ? data.reverse() : []);
        }
        async function fetchProfile() {
            const response = await fetch(url + "/profile", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("jwt"),
                },
            });
            const data = await response.json();
            setProfile(data);
        }
        
        Promise.all([fetchProfile(), fetchRecent()])
            .catch(() => setError("Couldn't load your profile. Check your connection and refresh."))
            .finally(() => setLoading(false));
    }, []);

    const [incoming, setIncoming] = useState([]);
    const [sent, setSent] = useState([]);
    const [friendRows, setFriendRows] = useState([]);

    async function fetchFriendData() {
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL;

            const [incomingRes, sentRes, friendsRes] = await Promise.all([
                fetch(`${baseUrl}/getallrequest`, {
                    headers : {
                        Authorization : "Bearer " + localStorage.getItem("jwt")
                    }
                }),
                fetch(`${baseUrl}/getallrequested`, {
                    headers : {
                        Authorization : "Bearer " + localStorage.getItem("jwt")
                    }
                }),
                fetch(`${baseUrl}/getallfriends`, {
                    headers : {
                        Authorization : "Bearer " + localStorage.getItem("jwt")
                    }
                })
            ]);

            if (!incomingRes.ok || !sentRes.ok || !friendsRes.ok) {
                throw new Error("Failed to fetch friend data");
            }

            const [incomingData, sentData, friendsData] = await Promise.all([
                incomingRes.json(),
                sentRes.json(),
                friendsRes.json()
            ]);

            console.log(sentData)
            console.log(incomingData)
            console.log(friendsData)
            setIncoming(incomingData);
            setSent(sentData);
            setFriendRows(friendsData);
        } catch (error) {
            console.error("Error fetching friend data:", error);
        }
    }

    useEffect(() => {
        fetchFriendData()
    },[])

    // Open the Requests tab on first load if someone is waiting for an answer
    useEffect(() => {
        if (autoTabDone.current || requests.length === 0) return;
        autoTabDone.current = true;
        if (incoming.length > 0) setFriendTab("requests");
    }, [ requests, incoming.length]);

    async function respond(username, accept) {
        setFriendError("");
        setBusy(username);
        try {
            const response = await fetch(
                url + (accept ? "/accept_friendRequest/" : "/reject_friendRequest/") + encodeURIComponent(username),
                {
                    method: "PUT",
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("jwt"),
                    },
                }
            );
            if (!response.ok) throw new Error("request failed");
            setRequests((prev) =>
                prev.map((r) =>
                    r.fromUsername === username && r.toUsername === me && statusOf(r) === "PENDING"
                        ? { ...r, status: accept ? "ACCEPTED" : "REJECTED" }
                        : r
                )
            );
        } catch (err) {
            setFriendError("Couldn't update that request. Try again.");
        } finally {
            setBusy("");
        }
    }

    const displayName = profile.fullname || profile.username || "Your profile";
    const initial = (profile.fullname || profile.username || "?").trim().charAt(0).toUpperCase();
    const answered = recent.filter((c) => c.status === "Answered").length;
    const notAnswered = recent.length - answered;

    const tabs = [
        { key: "requests", label: "Requests", count: incoming.length, highlight: incoming.length > 0 },
        { key: "sent", label: "Sent", count: sent.length },
        { key: "friends", label: "Friends", count: friendRows.length },
    ];

    return (
        <div className="w-full h-full overflow-y-auto bg-stone-100">
            <div className="mx-auto max-w-4xl p-4 md:p-8 flex flex-col gap-6">
                {error && (
                    <div role="alert" className="rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3">
                        {error}
                    </div>
                )}

                {/* Hero */}
                <section className="rounded-3xl bg-white overflow-hidden shadow-xl shadow-stone-900/5">
                    <div className="relative h-40 md:h-48 bg-orange-600 overflow-hidden">
                        <div className="absolute -top-24 -right-16 size-72 rounded-full bg-orange-500/60" />
                        <div className="absolute -bottom-32 left-1/4 size-80 rounded-full bg-orange-700/45" />
                    </div>

                    <div className="px-6 md:px-10 pb-8">
                        <div className="-mt-14 md:-mt-16 flex flex-col md:flex-row md:items-end gap-5">
                            <div className="relative size-28 md:size-32 rounded-4xl bg-white p-1.5 shadow-lg shrink-0">
                                <div className="size-full rounded-[1.65rem] bg-orange-100 text-orange-700 grid place-items-center text-5xl md:text-6xl font-black">
                                    {initial}
                                </div>
                                <span
                                    className="absolute -bottom-1 -right-1 size-6 rounded-full bg-green-500 border-4 border-white"
                                    title="Online"
                                />
                            </div>
                            <div className="min-w-0 md:pb-2">
                                <h1 className="text-3xl md:text-4xl mt-4 font-extrabold tracking-tight truncate">
                                    {loading ? "Loading..." : displayName}
                                </h1>
                                <p className="mt-1 text-lg text-orange-700 font-semibold truncate">
                                    {profile.username ? "@" + profile.username : ""}
                                </p>
                            </div>
                        </div>

                        <dl className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="min-w-0">
                                <dt className="text-sm text-stone-500">Full name</dt>
                                <dd className="mt-1 font-semibold truncate">{profile.fullname || "Not set"}</dd>
                            </div>
                            <div className="min-w-0">
                                <dt className="text-sm text-stone-500">Email</dt>
                                <dd className="mt-1 font-semibold truncate">{profile.email || "Not set"}</dd>
                            </div>
                            <div className="min-w-0">
                                <dt className="text-sm text-stone-500">Member since</dt>
                                <dd className="mt-1 font-semibold">{formatDay(profile.creationDate) || "Unknown"}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="grid grid-cols-3 divide-x divide-stone-100 border-t border-stone-100 bg-stone-50">
                        <Stat value={recent.length} label="Total calls" />
                        <Stat value={answered} label="Answered" />
                        <Stat value={notAnswered} label="Not answered" />
                    </div>
                </section>

                {/* Friends and requests */}
                <section className="rounded-3xl bg-white p-5 md:p-7 shadow-sm shadow-stone-900/5">
                    <h2 className="text-2xl font-extrabold tracking-tight">Friends</h2>

                    <div role="tablist" className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-stone-100 p-1">
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                type="button"
                                role="tab"
                                aria-selected={friendTab === t.key}
                                onClick={() => {
                                    setFriendTab(t.key);
                                    setFriendError("");
                                }}
                                className={`h-11 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
                                    friendTab === t.key
                                        ? "bg-white text-orange-700 shadow-sm"
                                        : "text-stone-500 hover:text-stone-800"
                                }`}
                            >
                                {t.label}
                                <span
                                    className={`min-w-6 px-1.5 rounded-full text-xs font-bold leading-6 ${
                                        t.highlight ? "bg-orange-600 text-white" : "bg-stone-200 text-stone-600"
                                    }`}
                                >
                                    {t.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {friendError && (
                        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
                            {friendError}
                        </p>
                    )}

                    <ul className="mt-4 flex flex-col gap-2">
                        {/* Requests waiting for you to answer */}
                        {friendTab === "requests" &&
                            incoming.map((r) => (
                                <PersonRow
                                    key={r.username}
                                    name={r.username}
                                    subtitle={r.date ? "Sent " + formatDate(r.date) : "Wants to be your friend"}
                                >
                                    <button
                                        type="button"
                                        disabled={busy === r.username}
                                        onClick={() => respond(r.username, true)}
                                        className="h-10 px-4 rounded-xl bg-orange-600 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        type="button"
                                        disabled={busy === r.username}
                                        onClick={() => respond(r.username, false)}
                                        className="h-10 px-4 rounded-xl bg-stone-200 text-sm font-bold text-stone-700 transition hover:bg-stone-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Decline
                                    </button>
                                </PersonRow>
                            ))}

                        {/* Requests you sent */}
                        {friendTab === "sent" &&
                            sent.map((r) => (
                                <PersonRow
                                    key={r.friend_username}
                                    name={r.friend_username}
                                    subtitle={r.date ? "Sent " + formatDate(r.date) : "Request sent"}
                                >
                                    {statusOf(r) === "ACCEPTED" ? (
                                        <Pill tone="green">Accepted</Pill>
                                    ) : (
                                        <Pill tone="amber">Pending</Pill>
                                    )}
                                </PersonRow>
                            ))}

                        {/* Accepted friends, from either direction */}
                        {friendTab === "friends" &&
                            friendRows.map((r) => {
                                
                                return (
                                    <PersonRow
                                        key={(r.friend_username)}
                                        name={ (r.friend_username) }
                                        subtitle={ "Accepted your request" }
                                    >
                                        <Pill tone="green">Friends</Pill>
                                    </PersonRow>
                                );
                            })}
                    </ul>

                    {friendTab === "requests" && incoming.length === 0 && (
                        <p className="mt-6 mb-2 text-center text-stone-500">No pending requests right now.</p>
                    )}
                    {friendTab === "sent" && sent.length === 0 && (
                        <p className="mt-6 mb-2 text-center text-stone-500">
                            You haven't sent any requests. Search a username in Messages to add someone.
                        </p>
                    )}
                    {friendTab === "friends" && friendRows.length === 0 && (
                        <p className="mt-6 mb-2 text-center text-stone-500">
                            No friends yet. Accept a request or send one from Messages.
                        </p>
                    )}
                </section>

                {/* Call history */}
                <section>
                    <div className="flex items-baseline justify-between px-2">
                        <h2 className="text-2xl font-extrabold tracking-tight">Recent calls</h2>
                        {recent.length > 0 && <span className="text-sm text-stone-500">{recent.length} in total</span>}
                    </div>

                    {recent.length === 0 ? (
                        <div className="mt-4 rounded-3xl bg-white border border-dashed border-stone-300 px-6 py-14 flex flex-col items-center text-center">
                            <div className="size-16 rounded-3xl bg-orange-100 text-orange-600 grid place-items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8" aria-hidden="true">
                                    <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
                                </svg>
                            </div>
                            <p className="mt-5 text-xl font-bold">No calls yet</p>
                            <p className="mt-1 max-w-xs text-stone-500">
                                Start a video call from the Video chat tab and it will show up here.
                            </p>
                        </div>
                    ) : (
                        <ul className="mt-4 flex flex-col gap-3">
                            {recent.map((call, i) => {
                                const outgoing = call.fromUsername == profile.username;
                                const ok = call.status === "Answered";
                                return (
                                    <li
                                        key={i}
                                        className="flex items-center gap-4 rounded-3xl bg-white p-4 md:p-5 shadow-sm shadow-stone-900/5"
                                    >
                                        <div
                                            className={`size-12 shrink-0 rounded-2xl grid place-items-center ${
                                                ok ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                            }`}
                                            title={outgoing ? "Outgoing call" : "Incoming call"}
                                        >
                                            {outgoing ? outgoingIcon : incomingIcon}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-lg font-bold truncate">
                                                {outgoing ? call.toUsername : call.fromUsername}
                                            </p>
                                            <p className="text-sm text-stone-500 truncate">
                                                {outgoing ? "Outgoing" : "Incoming"}
                                                {outgoing && call.toEmail ? ` · ${call.toEmail}` : ""}
                                            </p>
                                        </div>

                                        <div className="shrink-0 text-right">
                                            <span
                                                className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                                                    ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {call.status}
                                            </span>
                                            <p className="mt-1 text-xs text-stone-400">{formatDate(call.date)}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}

export default Profile;
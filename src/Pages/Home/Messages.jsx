import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const url = "http://localhost:8081";

function Avatar({ name, size = "size-12", text = "text-lg" }) {
    const letter = (name || "?").trim().charAt(0).toUpperCase();
    return (
        <div
            className={`${size} ${text} shrink-0 rounded-full bg-orange-100 text-orange-700 font-bold grid place-items-center`}
            aria-hidden="true"
        >
            {letter}
        </div>
    );
}

function formatTime(date) {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Messages() {
    const clientref = useRef();
    const chatref = useRef();
    const [allChats, setAllChats] = useState(new Map());
    const [usernames, setUsernames] = useState([]);
    const [profiles, setprofiles] = useState([]);
    const [selectedUser, setSelectedUser] = useState({ username: null, email: null, fullname: null });
    const [text, setText] = useState("");
    const [search, setSearch] = useState("");
    const [searchprofile, setsearchprofile] = useState(null);
    const [searchError, setSearchError] = useState("");
    const [friends, setFriends] = useState([]);
    const [tab, setTab] = useState("chats");

    useEffect(() => {
        const sortedUsers = Array.from(allChats.entries())
            .sort((a, b) => {
                const lastMsgA = a[1][a[1].length - 1];
                const lastMsgB = b[1][b[1].length - 1];
                return new Date(lastMsgB?.sentDate || 0) - new Date(lastMsgA?.sentDate || 0);
            })
            .map(([username]) => username);
        setUsernames(sortedUsers);
    }, [allChats]);

    useEffect(() => {
        async function getprofiles() {
            const response = await fetch(url + "/getallprofiles", {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("jwt"),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(usernames),
            });
            const data = await response.json();
            setprofiles(data);
        }
        if (usernames.length > 0) {
            getprofiles();
        }
    }, [usernames]);

    useEffect(() => {
        if (chatref.current) {
            chatref.current.scrollTop = chatref.current.scrollHeight;
        }
    }, [allChats, selectedUser]);

    useEffect(() => {
        async function fetchChats() {
            const response = await fetch(url + "/getallchats", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("jwt"),
                },
            });
            const data = await response.json();
            setAllChats(new Map(Object.entries(data)));
        }
        fetchChats();
    }, []);

    useEffect(() => {
        async function fetchFriends() {
            try {
                const response = await fetch(url + "/getallfriends", {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("jwt"),
                    },
                });
                const data = await response.json();
                setFriends(Array.isArray(data) ? data : []);
            } catch (err) {
                setFriends([]);
            }
        }
        fetchFriends();
    }, []);

    useEffect(() => {
        const socket = new SockJS(url + "/chat");
        const client = Stomp.over(socket);
        clientref.current = client;
        client.connect(
            {
                Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
            () => {
                client.subscribe("/user/queue/messages", (msg) => {
                    const newMessage = JSON.parse(msg.body);
                    setAllChats((prev) => {
                        const updated = new Map(prev);
                        const otherUser = newMessage.fromUsername;
                        const oldMessages = updated.get(otherUser) || [];
                        updated.set(otherUser, [...oldMessages, newMessage]);
                        return updated;
                    });
                });
            }
        );

        return () => {
            client.disconnect();
        };
    }, []);

    function send(e) {
        if (e) e.preventDefault();
        if (!text.trim() || !selectedUser.username) return;
        const msg = {
            toUsername: selectedUser.username,
            message: text,
            sentDate: new Date(),
        };
        clientref.current.send("/app/private-message", {}, JSON.stringify(msg));
        setAllChats((prev) => {
            const updated = new Map(prev);
            const oldMessages = updated.get(selectedUser.username) || [];
            updated.set(selectedUser.username, [...oldMessages, msg]);
            return updated;
        });
        setText("");
    }

    function selectSearchProfile() {
        setSelectedUser({
            username: searchprofile.username,
            email: searchprofile.email,
            fullname: searchprofile.fullname,
        });
        setsearchprofile(null);
    }

    async function searchop(e) {
        if (e) e.preventDefault();
        const username = search.trim();
        if (!username) return;
        setSearchError("");
        try {
            const response = await fetch(url + "/search/" + username, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("jwt"),
                },
            });
            const data = await response.json();
            console.log(data)
            if (data && data.username) {
                setsearchprofile(data);
            } else {
                setsearchprofile(null);
                setSearchError("No user found with that username.");
            }
        } catch (err) {
            setsearchprofile(null);
            setSearchError("Search failed. Check your connection and try again.");
        }
        setSearch("");
    }

    
    const hasSelection = selectedUser.username != null;
    const currentMessages = allChats.get(selectedUser.username) || [];

    return (
        <div className="flex w-full h-full overflow-hidden bg-stone-100">
            {/* Conversation list */}
            <section
                className={`${
                    hasSelection ? "hidden md:flex" : "flex"
                } w-full md:w-80 lg:w-96 shrink-0 flex-col bg-white border-r border-stone-200`}
            >
                <div className="px-6 pt-6 pb-4">
                    <h1 className="text-3xl font-extrabold tracking-tight">Chats</h1>

                    <form onSubmit={searchop} className="relative mt-4">
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setSearchError("");
                            }}
                            placeholder="Find someone by username"
                            aria-label="Search by username"
                            className="w-full h-12 pl-4 pr-12 rounded-2xl bg-stone-100 border border-transparent text-base placeholder:text-stone-400 outline-none transition focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                        />
                        <button
                            type="submit"
                            aria-label="Search"
                            className="absolute right-2 top-1/2 -translate-y-1/2 size-9 grid place-items-center rounded-xl text-stone-500 hover:bg-stone-200 hover:text-orange-600 cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                                <path
                                    fillRule="evenodd"
                                    d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </form>
                    {searchError && <p className="mt-2 text-sm font-medium text-red-600">{searchError}</p>}

                    <div role="tablist" className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-stone-100 p-1">
                        {[
                            ["chats", "Chats"],
                            ["friends", friends.length ? `Friends (${friends.length})` : "Friends"],
                        ].map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={tab === key}
                                onClick={() => setTab(key)}
                                className={`h-10 rounded-xl text-sm font-semibold transition cursor-pointer ${
                                    tab === key
                                        ? "bg-white text-orange-700 shadow-sm"
                                        : "text-stone-500 hover:text-stone-800"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-1">
                    {searchprofile != null && (
                        <div className="w-full flex items-center gap-3 p-3 rounded-2xl bg-orange-50 border border-orange-200">
                            <button
                                type="button"
                                onClick={selectSearchProfile}
                                className="flex flex-1 min-w-0 items-center gap-3 text-left cursor-pointer"
                            >
                                <Avatar name={searchprofile.fullname || searchprofile.username} />
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold truncate">{searchprofile.fullname || searchprofile.username}</p>
                                    <p className="text-sm text-stone-500 truncate">@{searchprofile.username}</p>
                                </div>
                            </button>
                            
                        </div>
                    )}

                    {tab === "chats" && profiles.length === 0 && searchprofile == null && (
                        <div className="mt-10 px-6 text-center text-stone-500">
                            <p className="font-semibold text-stone-700">No conversations yet</p>
                            <p className="mt-1 text-sm">Search for a username above to send your first message.</p>
                        </div>
                    )}

                    {tab === "chats" && profiles.map((profile) => {
                        const chat = allChats.get(profile.username) || [];
                        const last = chat[chat.length - 1];
                        const active = selectedUser.username === profile.username;
                        return (
                            <button
                                type="button"
                                key={profile.username}
                                onClick={() =>
                                    setSelectedUser({
                                        username: profile.username,
                                        fullname: profile.fullname,
                                        email: profile.email,
                                    })
                                }
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left cursor-pointer transition ${
                                    active ? "bg-orange-50" : "hover:bg-stone-100"
                                }`}
                            >
                                <Avatar name={profile.fullname || profile.username} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <p className="font-bold truncate">{profile.fullname || profile.username}</p>
                                        <span className="text-xs text-stone-400 shrink-0">{formatTime(last?.sentDate)}</span>
                                    </div>
                                    <p className="text-sm text-stone-500 truncate">
                                        {last ? last.message : profile.email}
                                    </p>
                                </div>
                            </button>
                        );
                    })}

                    {tab === "friends" && friends.length === 0 && searchprofile == null && (
                        <div className="mt-10 px-6 text-center text-stone-500">
                            <p className="font-semibold text-stone-700">No friends yet</p>
                            <p className="mt-1 text-sm">Search a username above and tap "Add friend" to build your list.</p>
                        </div>
                    )}

                    {tab === "friends" &&
                        friends.map((friend) => {
                            const active = selectedUser.username === friend.username;
                            return (
                                <div
                                    key={friend.username}
                                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition ${
                                        active ? "bg-orange-50" : "hover:bg-stone-100"
                                    }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedUser({
                                                username: friend.username,
                                                fullname: friend.fullname,
                                                email: friend.email,
                                            })
                                        }
                                        aria-label={`Message ${friend.fullname || friend.username}`}
                                        className="flex flex-1 min-w-0 items-center gap-3 text-left cursor-pointer"
                                    >
                                        <Avatar name={friend.fullname || friend.username} />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold truncate">{friend.fullname || friend.username}</p>
                                            <p className="text-sm text-stone-500 truncate">@{friend.username}</p>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeFriend(friend.username)}
                                        className="text-xs font-semibold text-stone-400 hover:text-red-600 cursor-pointer"
                                    >
                                        Remove
                                    </button>
                                </div>
                            );
                        })}
                </div>
            </section>

            {/* Conversation */}
            <section className={`${hasSelection ? "flex" : "hidden md:flex"} flex-1 min-w-0 flex-col`}>
                {!hasSelection && (
                    <div className="w-full h-full flex flex-col justify-center items-center text-center px-6">
                        <div className="size-24 rounded-3xl bg-orange-600 text-white grid place-items-center shadow-xl shadow-orange-600/25">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-12" aria-hidden="true">
                                <path
                                    fillRule="evenodd"
                                    d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <h2 className="mt-6 text-2xl font-extrabold tracking-tight">Pick a chat to start talking</h2>
                        <p className="mt-2 max-w-xs text-stone-500">
                            Choose a conversation from the list, or search a username to start a new one.
                        </p>
                    </div>
                )}

                {hasSelection && (
                    <>
                        <header className="flex items-center gap-3 px-4 md:px-6 h-20 shrink-0 bg-white border-b border-stone-200">
                            <button
                                type="button"
                                onClick={() => setSelectedUser({ username: null, email: null, fullname: null })}
                                aria-label="Back to chats"
                                className="md:hidden size-10 grid place-items-center rounded-xl text-stone-600 hover:bg-stone-100 cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                            <Avatar name={selectedUser.fullname || selectedUser.username} size="size-12" />
                            <div className="min-w-0">
                                <h2 className="text-lg font-bold truncate">
                                    {selectedUser.fullname || selectedUser.username}
                                </h2>
                                <p className="text-sm text-stone-500 truncate">
                                    @{selectedUser.username}
                                    {selectedUser.email ? ` · ${selectedUser.email}` : ""}
                                </p>
                            </div>
                        </header>

                        <div ref={chatref} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex flex-col gap-2">
                            {currentMessages.length === 0 && (
                                <p className="m-auto text-stone-500 text-center">
                                    No messages yet. Say hi to {selectedUser.fullname || selectedUser.username}.
                                </p>
                            )}
                            {currentMessages.map((message, i) => {
                                const theirs =
                                    message.fromUsername === selectedUser.username &&
                                    message.fromUsername !== message.toUsername;
                                return (
                                    <div key={i} className={`flex ${theirs ? "justify-start" : "justify-end"}`}>
                                        <div
                                            className={`max-w-[80%] md:max-w-[65%] px-4 py-2.5 shadow-sm ${
                                                theirs
                                                    ? "bg-white text-stone-900 rounded-2xl rounded-bl-md"
                                                    : "bg-orange-600 text-white rounded-2xl rounded-br-md"
                                            }`}
                                        >
                                            <p className="whitespace-pre-wrap wrap-break-word">{message.message}</p>
                                            <p className={`mt-1 text-[11px] ${theirs ? "text-stone-400" : "text-orange-100"}`}>
                                                {formatTime(message.sentDate)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <form onSubmit={send} className="shrink-0 p-4 md:px-8 md:pb-6 bg-stone-100">
                            <div className="flex items-center gap-2 p-2 pl-5 rounded-3xl bg-white border border-stone-200 shadow-sm transition focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/15">
                                <input
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Write a message"
                                    aria-label="Message"
                                    className="flex-1 min-w-0 h-10 bg-transparent text-base placeholder:text-stone-400 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!text.trim()}
                                    aria-label="Send message"
                                    className="size-11 grid place-items-center rounded-2xl bg-orange-600 text-white shadow-md shadow-orange-600/25 transition hover:bg-orange-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </section>
        </div>
    );
}

export default Messages;
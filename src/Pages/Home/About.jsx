import { Link } from "react-router-dom";

/* ---------- icons ---------- */

const boltIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
        <path
            fillRule="evenodd"
            d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
            clipRule="evenodd"
        />
    </svg>
);

const chatIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
        <path
            fillRule="evenodd"
            d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z"
            clipRule="evenodd"
        />
    </svg>
);

const videoIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
        <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
    </svg>
);

const friendsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
        <path
            fillRule="evenodd"
            d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z"
            clipRule="evenodd"
        />
    </svg>
);

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

/* ---------- small preview pieces (decorative, not interactive) ---------- */

function MiniAvatar({ letter, tone = "bg-orange-100 text-orange-700", size = "size-9 text-sm" }) {
    return (
        <div className={`${size} ${tone} shrink-0 rounded-full font-bold grid place-items-center`} aria-hidden="true">
            {letter}
        </div>
    );
}

function ZapPreview({ className = "" }) {
    return (
        <div className={`rounded-3xl bg-white p-5 text-stone-900 shadow-xl shadow-stone-900/10 ${className}`} aria-hidden="true">
            <div className="flex items-center gap-3">
                <MiniAvatar letter="A" />
                <div className="min-w-0">
                    <p className="text-sm font-bold">@aarav</p>
                    <p className="text-xs text-stone-400">Just now</p>
                </div>
            </div>
            <p className="mt-3 text-lg font-extrabold tracking-tight">Sunrise from the terrace</p>
            <p className="mt-1 text-sm text-stone-600">Woke up at 5 for this. Worth every minute of lost sleep.</p>

            <div className="mt-4 flex items-center gap-4 border-t border-stone-100 pt-3 text-sm font-semibold">
                <span className="flex items-center gap-1 text-green-600">{chevronUp} 24</span>
                <span className="flex items-center gap-1 text-red-500">{chevronDown} 2</span>
                <span className="flex items-center gap-1.5 text-stone-500">{commentIcon} 6</span>
            </div>

            <div className="mt-3 flex gap-2.5">
                <MiniAvatar letter="M" tone="bg-stone-100 text-stone-600" size="size-7 text-xs" />
                <p className="rounded-2xl bg-stone-50 px-3 py-2 text-sm text-stone-700">
                    <span className="font-bold">@meera </span>
                    Okay, that colour is unreal.
                </p>
            </div>
        </div>
    );
}

function ChatPreview({ className = "" }) {
    return (
        <div className={`flex flex-col gap-2 ${className}`} aria-hidden="true">
            <p className="max-w-[80%] self-start rounded-2xl rounded-bl-md bg-stone-100 px-4 py-2 text-sm text-stone-700">
                Are you free tonight?
            </p>
            <p className="max-w-[80%] self-end rounded-2xl rounded-br-md bg-orange-600 px-4 py-2 text-sm text-white">
                After 8. Call you?
            </p>
        </div>
    );
}

function CallPreview({ className = "" }) {
    return (
        <div className={`flex items-center gap-3 rounded-2xl bg-white/10 p-3 ${className}`} aria-hidden="true">
            <MiniAvatar letter="R" tone="bg-orange-500 text-white" size="size-10 text-base" />
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">@riya</p>
                <p className="text-xs text-stone-300">Incoming video call</p>
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-green-500 text-white">{videoIcon}</span>
        </div>
    );
}

/* ---------- content ---------- */

const steps = [
    { title: "Find your people", text: "Search a username and send a friend request." },
    { title: "Answer requests", text: "Open your profile to accept or decline requests that come in." },
    { title: "Post a zap or say hi", text: "Share something on the feed, or message a friend directly." },
    { title: "Go face to face", text: "Start a video call whenever typing isn't enough." },
];

const tech = ["React", "Tailwind CSS", "WebSockets (STOMP)", "WebRTC (PeerJS)", "Spring Boot", "JWT auth"];

const shortcuts = [
    { to: "/home/feed", label: "Open the feed", primary: true },
    { to: "/home/messages", label: "Open messages" },
    { to: "/home/videochat", label: "Start a video call" },
    { to: "/home/profile", label: "View your profile" },
];

const cardBase = "rounded-3xl p-6 md:p-8 shadow-sm shadow-stone-900/5";

/* ---------- page ---------- */

export default function About() {
    return (
        <div className="h-full w-full overflow-y-auto bg-stone-100">
            <div className="mx-auto flex max-w-5xl flex-col gap-5 p-4 md:p-8">
                {/* Hero */}
                <section className="relative overflow-hidden rounded-[2rem] bg-orange-600 px-6 py-10 text-white shadow-xl shadow-stone-900/5 md:px-12 md:py-14">
                    <div className="absolute -right-24 -top-32 size-96 rounded-full bg-orange-500/60" />
                    <div className="absolute -bottom-48 left-1/4 size-[28rem] rounded-full bg-orange-700/40" />

                    <div className="relative grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr]">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="grid size-11 place-items-center rounded-2xl bg-white text-2xl font-black text-orange-600 shadow-lg">
                                    Z
                                </div>
                                <span className="text-xl font-extrabold tracking-tight">ZChat</span>
                            </div>

                            <h1 className="mt-7 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
                                Say it. Share it. Show up.
                            </h1>
                            <p className="mt-5 max-w-md text-lg text-orange-50/90">
                                Message your friends, post zaps for everyone to react to, and jump on a video call when
                                you want to see each other. All in one place.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    to="/home/feed"
                                    className="grid h-12 place-items-center rounded-2xl bg-white px-6 font-bold text-orange-700 shadow-lg shadow-stone-900/10 transition hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                >
                                    Open the feed
                                </Link>
                                <Link
                                    to="/home/messages"
                                    className="grid h-12 place-items-center rounded-2xl bg-orange-700/50 px-6 font-bold text-white transition hover:bg-orange-700/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                >
                                    Start chatting
                                </Link>
                            </div>
                        </div>

                        {/* Product preview */}
                        <div className="relative mx-auto w-full max-w-sm md:max-w-none">
                            <ZapPreview className="md:-rotate-2" />
                            <div className="relative -mt-3 ml-auto w-[88%] rounded-3xl bg-white p-4 shadow-xl shadow-stone-900/10 md:rotate-1">
                                <ChatPreview />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature grid */}
                <section className="grid gap-5 md:grid-cols-6">
                    {/* Zaps */}
                    <article className={`${cardBase} bg-white md:col-span-4`}>
                        <div className="flex items-center gap-3">
                            <div className="grid size-12 place-items-center rounded-2xl bg-orange-600 text-white">{boltIcon}</div>
                            <h2 className="text-2xl font-extrabold tracking-tight">Zaps</h2>
                        </div>
                        <p className="mt-4 max-w-lg text-stone-600">
                            A zap is a post with a headline and a story behind it. It lands in everyone's feed the moment
                            you publish it, with no refresh needed.
                        </p>
                        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                            <li className="rounded-2xl bg-green-50 p-4">
                                <span className="flex items-center gap-1 font-bold text-green-700">{chevronUp} Like</span>
                                <p className="mt-1 text-sm text-stone-600">Back the zaps you enjoy.</p>
                            </li>
                            <li className="rounded-2xl bg-red-50 p-4">
                                <span className="flex items-center gap-1 font-bold text-red-600">{chevronDown} Dislike</span>
                                <p className="mt-1 text-sm text-stone-600">Not feeling it? Say so with one tap.</p>
                            </li>
                            <li className="rounded-2xl bg-stone-100 p-4">
                                <span className="flex items-center gap-1.5 font-bold text-stone-700">{commentIcon} Comment</span>
                                <p className="mt-1 text-sm text-stone-600">Reply on the zap and watch comments appear live.</p>
                            </li>
                        </ul>
                    </article>

                    {/* Messages */}
                    <article className={`${cardBase} bg-white md:col-span-2`}>
                        <div className="flex items-center gap-3">
                            <div className="grid size-12 place-items-center rounded-2xl bg-orange-100 text-orange-600">{chatIcon}</div>
                            <h2 className="text-2xl font-extrabold tracking-tight">Messages</h2>
                        </div>
                        <p className="mt-4 text-stone-600">Real-time chat. The newest conversations stay at the top.</p>
                        <ChatPreview className="mt-5" />
                    </article>

                    {/* Video */}
                    <article className={`${cardBase} bg-stone-900 text-white md:col-span-2`}>
                        <div className="flex items-center gap-3">
                            <div className="grid size-12 place-items-center rounded-2xl bg-orange-600 text-white">{videoIcon}</div>
                            <h2 className="text-2xl font-extrabold tracking-tight">Video calls</h2>
                        </div>
                        <p className="mt-4 text-stone-300">Ask a friend to join. They accept or decline with one tap.</p>
                        <CallPreview className="mt-5" />
                    </article>

                    {/* Friends */}
                    <article className={`${cardBase} bg-orange-100 md:col-span-4`}>
                        <div className="flex items-center gap-3">
                            <div className="grid size-12 place-items-center rounded-2xl bg-white text-orange-600">{friendsIcon}</div>
                            <h2 className="text-2xl font-extrabold tracking-tight">Friends and profile</h2>
                        </div>
                        <p className="mt-4 max-w-lg text-stone-700">
                            Search by username, open anyone's profile to see their zaps and stats, then send a friend
                            request. Your own profile keeps your details, incoming requests and call history together.
                        </p>
                    </article>
                </section>

                {/* Getting started */}
                <section className={`${cardBase} bg-white`}>
                    <h2 className="text-2xl font-extrabold tracking-tight">Getting started</h2>
                    <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((s, i) => (
                            <li key={s.title} className="flex gap-4 lg:flex-col lg:gap-3">
                                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-orange-600 font-extrabold text-white">
                                    {i + 1}
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold">{s.title}</h3>
                                    <p className="mt-1 text-stone-600">{s.text}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* Built with */}
                <section className={`${cardBase} bg-white`}>
                    <h2 className="text-2xl font-extrabold tracking-tight">Built with</h2>
                    <ul className="mt-5 flex flex-wrap gap-2.5">
                        {tech.map((t) => (
                            <li key={t} className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">
                                {t}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Shortcuts */}
                <section className="relative overflow-hidden rounded-[2rem] bg-stone-900 p-8 text-white md:p-10">
                    <div className="absolute -right-10 -top-24 size-72 rounded-full bg-orange-600/30" />
                    <div className="relative">
                        <h2 className="text-2xl font-extrabold tracking-tight">Pick up where you left off</h2>
                        <div className="mt-6 flex flex-wrap gap-3">
                            {shortcuts.map((s) => (
                                <Link
                                    key={s.to}
                                    to={s.to}
                                    className={`grid h-12 place-items-center rounded-2xl px-6 font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                                        s.primary
                                            ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700"
                                            : "bg-white/10 text-white hover:bg-white/20"
                                    }`}
                                >
                                    {s.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <p className="pb-2 text-center text-sm text-stone-400">
                    © {new Date().getFullYear()} ZChat. All rights reserved.
                </p>
            </div>
        </div>
    );
}
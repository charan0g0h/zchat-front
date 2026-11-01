import { Link } from "react-router-dom";

const chatIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-7" aria-hidden="true">
        <path
            fillRule="evenodd"
            d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z"
            clipRule="evenodd"
        />
    </svg>
);

const videoIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-7" aria-hidden="true">
        <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
    </svg>
);

const friendsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-7" aria-hidden="true">
        <path
            fillRule="evenodd"
            d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z"
            clipRule="evenodd"
        />
    </svg>
);

const profileIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-7" aria-hidden="true">
        <path
            fillRule="evenodd"
            d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
            clipRule="evenodd"
        />
    </svg>
);

const features = [
    {
        icon: chatIcon,
        title: "Real-time messaging",
        text: "Send a message and it lands instantly. Your conversations stay in one place, with the latest chats always at the top.",
    },
    {
        icon: videoIcon,
        title: "Video calls",
        text: "Ask a friend to join a video call straight from the app. Accept or decline incoming requests with one tap.",
    },
    {
        icon: friendsIcon,
        title: "Friends and requests",
        text: "Find people by username, send a friend request, and keep everyone you've accepted a tap away.",
    },
    {
        icon: profileIcon,
        title: "Your profile and call history",
        text: "See your details, your friend requests and every call you've made or received in one place.",
    },
];

const steps = [
    { title: "Find your people", text: "Search a username in Messages and send a friend request." },
    { title: "Answer requests", text: "Open your Profile to accept or decline requests that come in." },
    { title: "Start talking", text: "Message a friend, or jump on a video call whenever you want to see each other." },
];

const tech = ["React", "Tailwind CSS", "WebSockets (STOMP)", "WebRTC (PeerJS)"];

const shortcuts = [
    { to: "/home/messages", label: "Open Messages", primary: true },
    { to: "/home/videochat", label: "Start a video call" },
    { to: "/home/profile", label: "View your profile" },
];

export default function About() {
    return (
        <div className="w-full h-full overflow-y-auto bg-stone-100">
            <div className="mx-auto max-w-4xl p-4 md:p-8 flex flex-col gap-6">
                {/* Hero */}
                <section className="relative overflow-hidden rounded-3xl bg-orange-600 text-white px-8 py-12 md:px-12 md:py-14 shadow-xl shadow-stone-900/5">
                    <div className="absolute -top-28 -right-16 size-80 rounded-full bg-orange-500/60" />
                    <div className="absolute -bottom-40 left-1/3 size-96 rounded-full bg-orange-700/45" />

                    <div className="relative max-w-xl">
                        <div className="flex items-center gap-3">
                            <div className="size-11 rounded-2xl bg-white text-orange-600 grid place-items-center text-2xl font-black shadow-lg">
                                Z
                            </div>
                            <span className="text-xl font-extrabold tracking-tight">About ZChat</span>
                        </div>
                        <h1 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">
                            Create your own worlds.
                        </h1>
                        <p className="mt-4 text-lg text-orange-50/90">
                            ZChat is a messenger for talking to the people who matter. Chat in real time, hop on a
                            video call, and keep your circle of friends in one simple, friendly place.
                        </p>
                    </div>
                </section>

                {/* Features */}
                <section className="rounded-3xl bg-white p-6 md:p-8 shadow-sm shadow-stone-900/5">
                    <h2 className="text-2xl font-extrabold tracking-tight">What you can do here</h2>
                    <ul className="mt-6 flex flex-col divide-y divide-stone-100">
                        {features.map((f) => (
                            <li key={f.title} className="flex gap-5 py-5 first:pt-0 last:pb-0">
                                <div className="size-14 shrink-0 rounded-2xl bg-orange-100 text-orange-600 grid place-items-center">
                                    {f.icon}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-bold">{f.title}</h3>
                                    <p className="mt-1 text-stone-500">{f.text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* How it works */}
                <section className="rounded-3xl bg-white p-6 md:p-8 shadow-sm shadow-stone-900/5">
                    <h2 className="text-2xl font-extrabold tracking-tight">Getting started</h2>
                    <ol className="mt-6 grid md:grid-cols-3 gap-8">
                        {steps.map((s, i) => (
                            <li key={s.title}>
                                <span className="text-6xl font-black text-orange-100 leading-none">{i + 1}</span>
                                <h3 className="-mt-2 text-lg font-bold">{s.title}</h3>
                                <p className="mt-1 text-stone-500">{s.text}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* Built with */}
                <section className="rounded-3xl bg-white p-6 md:p-8 shadow-sm shadow-stone-900/5">
                    <h2 className="text-2xl font-extrabold tracking-tight">Built with</h2>
                    <ul className="mt-5 flex flex-wrap gap-3">
                        {tech.map((t) => (
                            <li
                                key={t}
                                className="rounded-full bg-stone-100 px-5 py-2.5 font-semibold text-stone-700"
                            >
                                {t}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Shortcuts */}
                <section className="relative overflow-hidden rounded-3xl bg-stone-900 text-white p-8 md:p-10">
                    <div className="absolute -top-24 -right-10 size-72 rounded-full bg-orange-600/30" />
                    <div className="relative">
                        <h2 className="text-2xl font-extrabold tracking-tight">Ready to jump in?</h2>
                        <p className="mt-2 text-stone-300">Pick up where you left off.</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            {shortcuts.map((s) => (
                                <Link
                                    key={s.to}
                                    to={s.to}
                                    className={`h-12 px-6 grid place-items-center rounded-2xl font-bold transition ${
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
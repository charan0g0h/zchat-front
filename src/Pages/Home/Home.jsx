import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

const navItems = [
    {
        to: "/home/messages",
        label: "Messages",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
                <path
                    fillRule="evenodd"
                    d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z"
                    clipRule="evenodd"
                />
            </svg>
        ),
    },
    {
        to: "/home/videochat",
        label: "Video chat",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
                <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
            </svg>
        ),
    },
    {
        to: "/home/feed",
        label: "feed",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
                aria-hidden="true"
            >
                <path
                    fillRule="evenodd"
                    d="M4.5 3.75A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V6a2.25 2.25 0 0 0-2.25-2.25h-15Zm0 1.5h15A.75.75 0 0 1 20.25 6v12a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75V6a.75.75 0 0 1 .75-.75Zm3 2.25a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5h-9Zm0 3.75a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5h-9Zm0 3.75a.75.75 0 0 0 0 1.5h5.25a.75.75 0 0 0 0-1.5H7.5Z"
                    clipRule="evenodd"
                />
            </svg>
        ),
    },

    {
        to: "/home/profile",
        label: "Profile",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
                <path
                    fillRule="evenodd"
                    d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                    clipRule="evenodd"
                />
            </svg>
        ),
    },
];

const logoutIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
        <path
            fillRule="evenodd"
            d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06l-1.72-1.72H15a.75.75 0 0 0 0-1.5H4.06l1.72-1.72a.75.75 0 0 0 0-1.06Z"
            clipRule="evenodd"
        />
    </svg>
);

function Home() {
    const nav = useNavigate();

    function logout() {
        localStorage.removeItem("jwt");
        nav("/");
    }

    const itemBase =
        "group relative flex items-center justify-center rounded-2xl transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40";

    return (
        <div className="flex flex-col-reverse md:flex-row h-dvh w-full bg-stone-100 text-stone-900">
            {/* Navigation: bottom bar on mobile, left rail on desktop */}
            <nav
                aria-label="Main"
                className="flex md:flex-col items-center justify-between bg-orange-600 text-white px-4 py-2 md:px-0 md:py-5 md:w-20 shrink-0 shadow-xl z-10"
            >
                <NavLink to={"/home/about"}>
                    <div className="hidden md:grid size-12 place-items-center rounded-2xl bg-white text-orange-600 text-2xl font-black shadow-md">
                        Z
                    </div>
                </NavLink>
                <ul className="flex md:flex-col gap-2 md:gap-3 flex-1 md:flex-none justify-around md:justify-start">
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                aria-label={item.label}
                                className={({ isActive }) =>
                                    `${itemBase} size-12 ${
                                        isActive
                                            ? "bg-white text-orange-600 shadow-md"
                                            : "text-orange-50 hover:bg-orange-500"
                                    }`
                                }
                            >
                                {item.icon}
                                <span className="pointer-events-none absolute left-full ml-3 hidden md:block whitespace-nowrap rounded-lg bg-stone-900 px-2.5 py-1 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                                    {item.label}
                                </span>
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <button
                    type="button"
                    onClick={logout}
                    aria-label="Log out"
                    className={`${itemBase} size-12 text-orange-50 hover:bg-orange-700 cursor-pointer`}
                >
                    {logoutIcon}
                    <span className="pointer-events-none absolute left-full ml-3 hidden md:block whitespace-nowrap rounded-lg bg-stone-900 px-2.5 py-1 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                        Log out
                    </span>
                </button>
            </nav>

            {/* Page content */}
            <main className="flex-1 min-w-0 min-h-0 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}

export default Home;
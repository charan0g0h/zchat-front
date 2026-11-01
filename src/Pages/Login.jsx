import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const url = import.meta.env.VITE_API_BASE_URL;

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [failed, setFailed] = useState("");
    const [loading, setLoading] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const nav = useNavigate();

    async function login(e) {
        e.preventDefault();
        setFailed("");
        setLoading(true);
        try {
            const response = await fetch(url + "/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (Number(data.code) === 0) {
                localStorage.setItem("jwt", data.description);
                setRedirecting(true);
                nav("/home/messages");
            } else {
                setFailed(data.description);
            }
        } catch (err) {
            setFailed("Can't reach the server. Check your connection and try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex bg-stone-50 text-stone-900">
            {/* Left: brand panel with chat preview */}
            <aside className="hidden lg:flex w-1/2 relative overflow-hidden bg-orange-600 text-white flex-col justify-between p-12">
                <div className="absolute -top-32 -right-32 size-96 rounded-full bg-orange-500/60" />
                <div className="absolute -bottom-40 -left-24 size-112 rounded-full bg-orange-700/50" />

                <div className="relative flex items-center gap-3">
                    <div className="size-11 rounded-2xl bg-white text-orange-600 grid place-items-center text-2xl font-black shadow-lg">
                        Z
                    </div>
                    <span className="text-2xl font-extrabold tracking-tight">ZChat</span>
                </div>

                <div className="relative max-w-md">
                    <div className="flex flex-col gap-3 mb-12">
                        <div className="self-start max-w-[75%] rounded-3xl rounded-bl-md bg-white text-stone-800 px-5 py-3 shadow-xl">
                            Did you see the new server?
                        </div>
                        <div className="self-end max-w-[75%] rounded-3xl rounded-br-md bg-stone-900 text-white px-5 py-3 shadow-xl">
                            Just joined. Love the setup!
                        </div>
                        <div className="self-start rounded-3xl rounded-bl-md bg-white px-5 py-4 shadow-xl flex gap-1.5">
                            <span className="size-2 rounded-full bg-stone-400 motion-safe:animate-bounce" />
                            <span className="size-2 rounded-full bg-stone-400 motion-safe:animate-bounce [animation-delay:150ms]" />
                            <span className="size-2 rounded-full bg-stone-400 motion-safe:animate-bounce [animation-delay:300ms]" />
                        </div>
                    </div>

                    <h2 className="text-5xl font-extrabold tracking-tight leading-[1.05]">
                        Create your own worlds.
                    </h2>
                    <p className="mt-4 text-lg text-orange-50/90">
                        Chat with friends, build communities, and keep every conversation in one place.
                    </p>
                </div>

                <p className="relative text-sm text-orange-100/80">© {new Date().getFullYear()} ZChat</p>
            </aside>

            {/* Right: form */}
            <main className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    {/* Mobile brand */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="size-10 rounded-2xl bg-orange-600 text-white grid place-items-center text-xl font-black shadow-md">
                            Z
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight">ZChat</span>
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight">Welcome back</h1>
                    <p className="mt-2 text-stone-500">Log in to pick up your conversations.</p>

                    <form onSubmit={login} className="mt-10 flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="username" className="text-sm font-semibold text-stone-700">
                                Username
                            </label>
                            <div className="relative">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="size-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <input
                                    id="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    className="w-full h-13 pl-12 pr-4 rounded-2xl bg-white border border-stone-200 text-base placeholder:text-stone-400 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-semibold text-stone-700">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    className="text-sm font-semibold text-orange-700 hover:underline cursor-pointer"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                                    />
                                </svg>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full h-13 pl-12 pr-20 rounded-2xl bg-white border border-stone-200 text-base placeholder:text-stone-400 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone-500 hover:text-stone-800 cursor-pointer"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {failed && (
                            <div
                                role="alert"
                                className="rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3"
                            >
                                {failed}
                            </div>
                        )}
                        {redirecting && (
                            <div
                                role="status"
                                className="rounded-2xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3"
                            >
                                Logged in. Taking you to your messages...
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="h-13 rounded-2xl bg-orange-600 text-white text-base font-bold shadow-lg shadow-orange-600/25 transition hover:bg-orange-700 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? "Logging in..." : "Log in"}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-stone-500">
                        New to ZChat?{" "}
                        <Link to="/signup" className="font-semibold text-orange-700 hover:underline">
                            Create an account
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}

export default Login;
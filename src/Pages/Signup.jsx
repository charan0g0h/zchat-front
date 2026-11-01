import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OtpInput from "./OtpInput";

const url = import.meta.env.VITE_API_BASE_URL;

// Backend endpoints used for email verification (change these to match your server)
const SEND_OTP_PATH = "/auth/send-otp";
const VERIFY_OTP_PATH = "/auth/verify-otp";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const inputClass =
    "w-full h-13 px-4 rounded-2xl bg-white border border-stone-200 text-base placeholder:text-stone-400 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15";

function Field({ id, label, children }) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-sm font-semibold text-stone-700">
                {label}
            </label>
            {children}
        </div>
    );
}

async function postJson(path, body) {
    const response = await fetch(url + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return response.json();
}

function Signup() {
    const [profile, setProfile] = useState({
        username: "",
        fullname: "",
        email: "",
        password: "",
        confirmpassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Email verification state
    const [showCode, setShowCode] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [sendingCode, setSendingCode] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [resendIn, setResendIn] = useState(0);
    const nav = useNavigate();

    // Resend countdown
    useEffect(() => {
        if (resendIn <= 0) return;
        const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [resendIn]);

    function update(field) {
        return (e) => {
            setProfile({ ...profile, [field]: e.target.value });
            setError("");
        };
    }

    // Changing the email invalidates any code or verification for the old one
    function updateEmail(e) {
        setProfile({ ...profile, email: e.target.value });
        setError("");
        setOtpError("");
        setOtp("");
        setShowCode(false);
        setEmailVerified(false);
        setResendIn(0);
    }

    const mismatch =
        profile.confirmpassword.length > 0 && profile.confirmpassword !== profile.password;

    async function sendCode() {
        if (!/^\S+@\S+\.\S+$/.test(profile.email.trim())) {
            setError("Enter a valid email address first.");
            return;
        }
        setError("");
        setOtpError("");
        setSendingCode(true);
        try {
            const data = await postJson(SEND_OTP_PATH, { email: profile.email.trim() });
            if (Number(data.code) === 0) {
                setShowCode(true);
                setOtp("");
                setResendIn(RESEND_SECONDS);
            } else {
                setError(data.description);
            }
        } catch (err) {
            setError("Can't reach the server. Check your connection and try again.");
        } finally {
            setSendingCode(false);
        }
    }

    async function verifyCode(code) {
        if (!code || code.length !== OTP_LENGTH || verifying) return;
        setOtpError("");
        setVerifying(true);
        try {
            const data = await postJson(VERIFY_OTP_PATH, { email: profile.email.trim(), otp: code });
            if (Number(data.code) === 0) {
                setEmailVerified(true);
                setShowCode(false);
                setOtp("");
            } else {
                setOtpError(data.description || "That code is incorrect. Try again.");
                setOtp("");
            }
        } catch (err) {
            setOtpError("Can't reach the server. Check your connection and try again.");
        } finally {
            setVerifying(false);
        }
    }

    async function createAccount(e) {
        e.preventDefault();
        if (!emailVerified) {
            setError("Please verify your email before creating your account.");
            return;
        }
        if (profile.confirmpassword !== profile.password) {
            setError("Passwords don't match. Re-enter them and try again.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const data = await postJson("/auth/register", {
                username: profile.username,
                password: profile.password,
                fullname: profile.fullname,
                email: profile.email.trim(),
            });
            if (Number(data.code) === 0) {
                setSuccess(true);
                nav("/");
            } else {
                setError(data.description);
            }
        } catch (err) {
            setError("Can't reach the server. Check your connection and try again.");
        } finally {
            setLoading(false);
        }
    }

    // Label and state of the button inside the email field
    let emailButtonLabel = showCode ? "Resend code" : "Send code";
    if (sendingCode) emailButtonLabel = "Sending...";
    else if (resendIn > 0) emailButtonLabel = `Resend in ${resendIn}s`;
    const emailButtonDisabled = sendingCode || resendIn > 0;

    return (
        <div className="min-h-screen w-full flex bg-stone-50 text-stone-900">
            {/* Left: brand panel */}
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
                            Welcome to the team!
                        </div>
                        <div className="self-end max-w-[75%] rounded-3xl rounded-br-md bg-stone-900 text-white px-5 py-3 shadow-xl">
                            Thanks, glad to be here.
                        </div>
                        <div className="self-start max-w-[75%] rounded-3xl rounded-bl-md bg-white text-stone-800 px-5 py-3 shadow-xl">
                            Pick a name and jump in.
                        </div>
                    </div>

                    <h2 className="text-5xl font-extrabold tracking-tight leading-[1.05]">
                        Your world starts here.
                    </h2>
                    <p className="mt-4 text-lg text-orange-50/90">
                        Make an account in a minute and start chatting with friends and communities.
                    </p>
                </div>

                <p className="relative text-sm text-orange-100/80">© {new Date().getFullYear()} ZChat</p>
            </aside>

            {/* Right: form */}
            <main className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="size-10 rounded-2xl bg-orange-600 text-white grid place-items-center text-xl font-black shadow-md">
                            Z
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight">ZChat</span>
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight">Create your account</h1>
                    <p className="mt-2 text-stone-500">It only takes a minute.</p>

                    <form onSubmit={createAccount} className="mt-8 flex flex-col gap-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Field id="fullname" label="Full name">
                                <input
                                    id="fullname"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={profile.fullname}
                                    onChange={update("fullname")}
                                    placeholder="Your name"
                                    className={inputClass}
                                />
                            </Field>
                            <Field id="username" label="Username">
                                <input
                                    id="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={profile.username}
                                    onChange={update("username")}
                                    placeholder="Pick a username"
                                    className={inputClass}
                                />
                            </Field>
                        </div>

                        <Field id="email" label="Email">
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={profile.email}
                                    onChange={updateEmail}
                                    placeholder="you@example.com"
                                    className={
                                        inputClass +
                                        " pr-36" +
                                        (emailVerified ? " border-green-400" : "")
                                    }
                                />
                                {emailVerified ? (
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm font-semibold text-green-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                                        </svg>
                                        Verified
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={sendCode}
                                        disabled={emailButtonDisabled}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-3 rounded-xl bg-orange-50 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {emailButtonLabel}
                                    </button>
                                )}
                            </div>
                        </Field>

                        {showCode && !emailVerified && (
                            <div className="rounded-3xl bg-orange-50 border border-orange-200 p-5">
                                <p className="text-sm font-semibold text-stone-700 text-center">
                                    Enter the {OTP_LENGTH}-digit code sent to
                                </p>
                                <p className="text-sm font-bold text-orange-700 text-center truncate mb-4">
                                    {profile.email}
                                </p>
                                <OtpInput
                                    length={OTP_LENGTH}
                                    value={otp}
                                    onChange={(v) => {
                                        setOtp(v);
                                        setOtpError("");
                                    }}
                                    onComplete={verifyCode}
                                    disabled={verifying}
                                    invalid={!!otpError}
                                />
                                {otpError && (
                                    <p role="alert" className="mt-3 text-sm text-center font-medium text-red-600">
                                        {otpError}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={() => verifyCode(otp)}
                                    disabled={otp.length !== OTP_LENGTH || verifying}
                                    className="mt-4 w-full h-12 rounded-2xl bg-orange-600 text-white font-bold transition hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {verifying ? "Verifying..." : "Verify code"}
                                </button>
                            </div>
                        )}

                        <Field id="password" label="Password">
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={profile.password}
                                    onChange={update("password")}
                                    placeholder="Create a password"
                                    className={inputClass + " pr-20"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone-500 hover:text-stone-800 cursor-pointer"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </Field>

                        <Field id="confirmpassword" label="Confirm password">
                            <input
                                id="confirmpassword"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                value={profile.confirmpassword}
                                onChange={update("confirmpassword")}
                                placeholder="Re-enter your password"
                                aria-invalid={mismatch}
                                className={
                                    inputClass +
                                    (mismatch
                                        ? " border-red-400 focus:border-red-500 focus:ring-red-500/15"
                                        : "")
                                }
                            />
                            {mismatch && (
                                <p className="text-sm text-red-600 font-medium">Passwords don't match yet.</p>
                            )}
                        </Field>

                        {error && (
                            <div
                                role="alert"
                                className="rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3"
                            >
                                {error}
                            </div>
                        )}
                        {success && (
                            <div
                                role="status"
                                className="rounded-2xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3"
                            >
                                Account created. Taking you to log in...
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="h-13 rounded-2xl bg-orange-600 text-white text-base font-bold shadow-lg shadow-orange-600/25 transition hover:bg-orange-700 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-stone-500">
                        Already have an account?{" "}
                        <Link to="/" className="font-semibold text-orange-700 hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}

export default Signup;
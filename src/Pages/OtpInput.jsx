import { useRef } from "react";

/**
 * OTP input: one box per digit.
 * - value: string of digits entered so far (controlled)
 * - onChange(value): called with the new digit string
 * - onComplete(value): called once all boxes are filled (optional)
 */
function OtpInput({ length = 6, value = "", onChange, onComplete, disabled = false, invalid = false }) {
    const refs = useRef([]);
    const digits = Array.from({ length }, (_, i) => value[i] || "");

    function focusBox(i) {
        const box = refs.current[Math.max(0, Math.min(i, length - 1))];
        if (box) box.focus();
    }

    function commit(next, focusIndex) {
        const clean = next.replace(/\D/g, "").slice(0, length);
        onChange(clean);
        if (clean.length === length && onComplete) onComplete(clean);
        focusBox(focusIndex ?? clean.length);
    }

    function handleChange(i, e) {
        const typed = e.target.value.replace(/\D/g, "");
        if (!typed) return;
        // Also covers autofill / SMS suggestions that drop several digits into one box
        commit(value.slice(0, i) + typed);
    }

    function handleKeyDown(i, e) {
        if (e.key === "Backspace") {
            e.preventDefault();
            const target = digits[i] ? i : i - 1;
            if (target < 0) return;
            commit(value.slice(0, target) + value.slice(target + 1), target);
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            focusBox(i - 1);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            focusBox(i + 1);
        }
    }

    function handlePaste(i, e) {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
        if (!pasted) return;
        commit(value.slice(0, i) + pasted);
    }

    return (
        <div role="group" aria-label="One-time code" className="flex justify-center gap-2 sm:gap-3">
            {digits.map((digit, i) => (
                <input
                    key={i}
                    ref={(el) => (refs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    aria-label={`Digit ${i + 1} of ${length}`}
                    aria-invalid={invalid}
                    disabled={disabled}
                    value={digit}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={(e) => handlePaste(i, e)}
                    onFocus={(e) => e.target.select()}
                    className={`size-12 sm:size-14 rounded-2xl bg-white border text-center text-2xl font-bold outline-none transition disabled:opacity-50 disabled:cursor-not-allowed ${
                        invalid
                            ? "border-red-400 text-red-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/15"
                            : digit
                            ? "border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                            : "border-stone-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                    }`}
                />
            ))}
        </div>
    );
}

export default OtpInput;
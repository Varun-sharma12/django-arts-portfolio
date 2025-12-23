"use client";
import { useState, useEffect, useRef } from "react";
export default function ForgotPasswordPage() {
    const [form, setForm] = useState({ email: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [touched, setTouched] = useState(false);
    //Handle Email Change
    function handleChange(e) {
        setTouched(true)
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function validateForm(values, shouldValidate) {
        const newErrors = {};
        if (!shouldValidate)
            return newErrors;

        if (!values.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
            newErrors.email = "Enter a valid email";
        }


        return newErrors;
    }


    useEffect(() => {

        setErrors(validateForm(form, touched));
    }, [form, touched]);

    async function submit(e) {

        e.preventDefault();
        setTouched(true);
        // setTouched(true)
        // console.log(form)
        // console.log("touched",touched)
        const validationErrors = validateForm(form, true);
        console.log(validationErrors);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            return;
        }
        // console.log(newErrors);
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("http://127.0.0.1:8000/api/auth/forgot-password/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email }),
            });
            const data = await res.json();
            // ✅ ALWAYS show same message (security)
            setMessage(
                "If the email is registered and verified, a reset link has been sent."
            );

        } catch {
            setMessage("Something went wrong. Please try again.");
        }
        // console.log("hlo")
    }
    return (
        <div className="min-h-screen flex items-center text-black justify-center bg-gray-100">
            <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl font-semibold text-center mb-6">Forgot Password</h1>
                <form onSubmit={submit} className="space-y-4">
                    {/* EMAIL */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Email<span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.email ? "border-red-500" : "border-gray-300"
                                }`}
                            placeholder="you@example.com"
                        />
                        {touched && errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>


                    {/* SUBMIT */}
                    <button
                        disabled={loading || Object.keys(errors).length > 0}
                        className={`w-full py-2 rounded text-white font-medium ${loading || Object.keys(errors).length > 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            }`}
                    > Submit
                        {/* {countdown > 0
              ? `Verify Email (${formatTime(countdown)})`
              : loading
                ? (!canResend ? "Logging in..." : "Login")
                : "Login"} */}

                    </button>
                </form>
            </div>
        </div>

    )
}
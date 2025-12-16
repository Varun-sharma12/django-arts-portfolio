"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";

export default function Register() {
  const router = useRouter();
  const intervalRef = useRef(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  /* ------------------ AUTH REDIRECT ------------------ */
  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
  function handleStorageChange(event) {
    if (event.key === "pendingVerification" && event.newValue === null) {
      // ✅ Email verified
      setCountdown(0);
      setSubmitting(false);
      setMessage("");

      // Clean UI + redirect
      router.replace("/login");
    }
  }

  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, [router]);


  /* ------------------ GOOGLE LOGIN ------------------ */
  async function handleGoogleSuccess(response) {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/google-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.replace("/dashboard");
    } catch {
      alert("Google signup failed");
    }
  }

  /* ------------------ REAL-TIME VALIDATION ------------------ */
  function validateField(name, value, currentForm) {
    switch (name) {
      case "username":
        if (value.trim().length < 3)
          return "Username must be at least 3 characters";
        break;

      case "email":
        if (!/^\S+@\S+\.\S+$/.test(value))
          return "Enter a valid email address";
        break;

      case "password":
        if (value.length < 8)
          return "Password must be at least 8 characters";
        break;

      case "confirm_password":
        if (value !== currentForm.password)
          return "Passwords do not match";
        break;
    }
    return "";
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: validateField(name, value, updated),
        ...(name === "password" && {
          confirm_password: validateField(
            "confirm_password",
            updated.confirm_password,
            updated
          ),
        }),
      }));

      return updated;
    });
  }

  const hasErrors = Object.values(errors).some(Boolean);

  /* ------------------ COUNTDOWN ------------------ */
  const startCountdown = (seconds = 60) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCountdown(seconds);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  function formatTime(sec) {
    return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(
      sec % 60
    ).padStart(2, "0")}`;
  }

  /* ------------------ SUBMIT ------------------ */
  async function submit(e) {
    e.preventDefault();
    if (submitting || countdown > 0 || hasErrors) return;

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

    setMessage("Check your email for verification link.");
setSubmitting(false);              // ✅ IMPORTANT
startCountdown(60);

localStorage.setItem("pendingVerification", "true");
localStorage.setItem(
  "verificationExpiry",
  (Date.now() + 60 * 1000).toString()
);

    } catch {
      setMessage("Registration failed. Try again.");
      setSubmitting(false);
    }
  }

  // useEffect(() => {
  //   if (countdown === 0) setSubmitting(false);
  // }, [countdown]);

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen flex text-black items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Create Account
        </h1>

        <form onSubmit={submit} className="space-y-4 text-black">
          {[
            { name: "username", label: "Username", type: "text" },
            { name: "email", label: "Email", type: "email" },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium mb-1">
                {f.label}
              </label>
              <input
                name={f.name}
                type={f.type}
                value={form[f.name]}
                onChange={handleChange}
                className={`w-full p-2 border text-black rounded focus:outline-none ${
                  errors[f.name]
                    ? "border-red-500"
                    : "focus:border-blue-500"
                }`}
              />
              {errors[f.name] && (
                <p className="text-xs text-red-600 mt-1">
                  {errors[f.name]}
                </p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className="w-full p-2 border rounded text-black"
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Confirm Password
            </label>
            <input
              name="confirm_password"
              type={showPassword ? "text" : "password"}
              value={form.confirm_password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            {errors.confirm_password && (
              <p className="text-xs text-red-600 mt-1">
                {errors.confirm_password}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              onChange={() => setShowPassword((p) => !p)}
            />
            Show password
          </div>

          <button
            disabled={submitting || countdown > 0 || hasErrors}
            className={`w-full py-2 rounded text-white font-medium transition ${
              submitting || countdown > 0 || hasErrors
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            }`}
          >
            {countdown > 0
              ? `Verify Email (${formatTime(countdown)})`
              : submitting
              ? "Submitting..."
              : "Register"}
          </button>
        </form>

        {message && (
          <div className="mt-4 text-center text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="my-4 text-center text-gray-400">OR</div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Google signup failed")}
          />
        </div>
      </div>
    </div>
  );
}

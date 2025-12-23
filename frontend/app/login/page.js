"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [message, setMessage] = useState("");
  const intervalRef = useRef(null);

  /* ---------------- REAL-TIME VALIDATION ---------------- */

  useEffect(() => {
    const newErrors = {};

    if (!form.email) {
      // newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Enter a valid email";
    }

    //    // Password validation
    // if (!form.password) {
    //   // newErrors.password = "Password is required";
    // } else if (
    //   !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/.test(
    //     form.password
    //   )
    // ) {
    //   newErrors.password =
    //     "Min 12 chars, 1 uppercase, 1 lowercase, 1 number & 1 special character";
    // }


    setErrors(newErrors);
  }, [form]);


  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  /* ---------------- INPUT HANDLER ---------------- */


  function handleChange(e) {
    console.log("hii changing");
    console.log("Can Resend", canResend, "Loading", loading);
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* ---------------- SUBMIT ---------------- */

  async function submit(e) {
    e.preventDefault();
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        //  setErrors(data.errors || { form: "Login failed" });
        throw data;
      }
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.dispatchEvent(new Event("auth-change"));
      router.replace("/dashboard");
    } catch (error) {
      // setErrors({ form: "Network error" });
      handleBackendError(error)
    }
  }


  function handleBackendError(error) {
    setLoading(true);
    console.log(error);
    if (typeof error === "object" && error.code !== "email_not_verified") {
      const fieldErrors = {};
      Object.entries(error['errors']).forEach(([field, messages]) => {
        fieldErrors[field] = messages;

      })
      setErrors(fieldErrors);
      setMessage("");
      setLoading(false);
    }
    else if (error.code === "email_not_verified") {
      setMessage("For login you have to be verified.Check your email for verification link.");
      setLoading(true);              // IMPORTANT
      startCountdown(60);
    }

    else {
      setMessage("Something went wrong");
      setLoading(false);
    }

    return;
  }

  /* ---------------- GOOGLE LOGIN ---------------- */

  async function handleGoogleSuccess(response) {
    const res = await fetch("http://127.0.0.1:8000/api/auth/google-login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: response.credential }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Google login failed");
      return;
    }

    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.dispatchEvent(new Event("auth-change"));
    router.replace("/dashboard");
  }

  function startCountdown(seconds = 60) {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setCountdown(seconds);
    setCanResend(false);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  /*-------------------------For Resend Verification--------------------*/
  async function resendVerification(params) {
    if (!canResend) return;
    try {
      // setSubmitting(true);
      // setMessage("");
      const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw data;
      }
      setMessage("Verification email resent.");
      // setSubmitting(false);
      startCountdown(60);
    } catch (error) {
      handleBackendError(error);
    }


  }

  function formatTime(sec) {
    return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(
      sec % 60
    ).padStart(2, "0")}`;
  }



  function handleForgotPassword() {

    router.push("/forgot-password"); // 👈 target route
    // Later this will call backend API
    // alert(
    //   "If your email is verified, a reset link will be sent. Otherwise, verification email will be resent."
    // );
  }


  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex items-center text-black justify-center bg-gray-100">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>

        {/* FORM ERROR */}
        {errors.form && (
          <p className="text-red-600 text-sm mb-4">{errors.form}</p>
        )}

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
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-1">Password<span className="text-red-500">*</span></label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.password ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline cursor-pointer"
              onClick={() => handleForgotPassword()}
            >
              Forgot password?
            </button>
          </div>


          {/* SUBMIT */}
          <button
            disabled={loading || Object.keys(errors).length > 0 || canResend}
            className={`w-full py-2 rounded text-white font-medium ${loading || Object.keys(errors).length > 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              }`}
          >
            {countdown > 0
              ? `Verify Email (${formatTime(countdown)})`
              : loading
                ? (!canResend ? "Logging in..." : "Login")
                : "Login"}

          </button>
        </form>
        {message && countdown > 0 && (
          <div className="mt-4 text-center text-sm text-green-700">
            {message}
          </div>
        )}
        {canResend && (
          <div className="mt-4 text-center text-sm">
            <button
              onClick={resendVerification}
              className="text-blue-600 hover:underline font-medium cursor-pointer"
            // disabled={loading}
            >
              Resend Verification Email
            </button>
          </div>
        )}
        {/* DIVIDER */}
        <div className="my-6 flex items-center">
          <div className="flex-grow border-t"></div>
          <span className="mx-4 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t"></div>
        </div>

        {/* GOOGLE LOGIN */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Google Login Failed")}
          />
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </div>

      </div>
    </div>
  );
}

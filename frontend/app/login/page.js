"use client";

import { useState, useEffect } from "react";
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
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* ---------------- SUBMIT ---------------- */

  async function submit(e) {
    e.preventDefault();
    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ form: data.error || "Login failed" });
        setLoading(false);
        return;
      }

      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.dispatchEvent(new Event("auth-change"));
      router.replace("/dashboard");
    } catch {
      setErrors({ form: "Network error" });
    } finally {
      setLoading(false);
    }
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


function handleForgotPassword() {
  if (!form.email || errors.email) {
    setErrors((prev) => ({
      ...prev,
      email: "Enter a valid email to reset password",
    }));
    return;
  }

  // Later this will call backend API
  alert(
    "If your email is verified, a reset link will be sent. Otherwise, verification email will be resent."
  );
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
              className={`w-full p-2 border rounded ${
                errors.email ? "border-red-500" : "border-gray-300"
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
              className={`w-full p-2 border rounded ${
                errors.password ? "border-red-500" : "border-gray-300"
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
            disabled={loading || Object.keys(errors).length > 0}
            className={`w-full py-2 rounded text-white font-medium ${
              loading || Object.keys(errors).length > 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

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

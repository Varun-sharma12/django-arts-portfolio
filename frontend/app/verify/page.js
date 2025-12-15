"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    // clear registration countdown state once verification page loads
localStorage.removeItem("pendingVerification");
localStorage.removeItem("verificationExpiry");
    if (!token) return;

    async function verify() {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/auth/verify-email/?token=${encodeURIComponent(
            token
          )}&json=true`
        );
        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Verification failed");
          return;
        }

        setStatus("success");
        setMessage(data.detail || "Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage("Network error");
      }
    }

    verify();
  }, [token]);

  async function handleResend() {
    const email = prompt("Enter your email to resend verification:");
    if (!email) return;

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/auth/resend-verification/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      alert(data.detail || data.error);
    } catch (err) {
      alert("Network error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Email Verification</h1>

        {status === "loading" && <p>Verifying...</p>}

        {status === "success" && (
          <>
            <p className="text-green-700 mb-4">{message}</p>
            <a href="/login" className="text-blue-600">
              Go to login
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-red-600 mb-4">{message}</p>
            <button
              onClick={handleResend}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Resend verification email
            </button>
          </>
        )}
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Reset Password
        </h1>

        {error && (
          <p className="mb-4 text-sm text-red-600 text-center">{error}</p>
        )}

        {success && (
          <p className="mb-4 text-sm text-green-600 text-center">
            Password reset successful. Redirecting to login…
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full h-12 rounded-md border border-gray-300 px-4 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"

              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full h-12 rounded-md border border-gray-300 px-4 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"

              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              onChange={() => setShowPassword((p) => !p)}
            />
            Show password
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

      </div>
    </div>
  );

}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  function syncAuthState() {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }

  useEffect(() => {
    // Initial load
    syncAuthState();

    // Listen for storage changes (other tabs)
    window.addEventListener("storage", syncAuthState);

    // Listen for custom auth event (same tab)
    window.addEventListener("auth-change", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("auth-change", syncAuthState);
    };
  }, []);

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Notify navbar
    window.dispatchEvent(new Event("auth-change"));

    router.replace("/login");
  }

  return (
    <nav className="w-full px-6 py-4 bg-gray-900 text-white flex justify-between items-center">
      <Link href="/" className="text-lg font-semibold">
        MyApp
      </Link>

      <div className="space-x-4">
        {!user ? (
          <>
            <Link href="/login" className="hover:underline">
              Login
            </Link>
            <Link href="/register" className="hover:underline">
              Register
            </Link>
          </>
        ) : (
          <>
            <span className="text-gray-300">
              Hi, <strong>{user.username}</strong>
            </span>

            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>

            <button
              onClick={logout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useRouter } from "next/navigation";
import PlanCards from "../components/PlanCards";

export default function Dashboard() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  function handlePlanSelected(planName) {
    // update local user state
    const updatedUser = { ...user, plan: planName };
    setUser(updatedUser);

    // sync with localStorage
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }


  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiFetch("/api/auth/protected/");
        const data = await res.json();

        // ✅ KEEP existing logic
        setMessage(data.detail);

        // ✅ NEW: store user info
        setUser(data.user);
      } catch {
        router.replace("/login");
      }
    }

    loadData();
  }, [router]);

  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Dashboard
      </h1>

      {/* existing message */}
      {/* <p className="text-gray-600 mb-4">{message}</p> */}

      {/* NO PLAN SELECTED */}
      {user.plan === null && (
        <>
          <div className="bg-yellow-100 border border-yellow-300 p-4 rounded mb-6">
            <p className="font-medium text-yellow-800">
              You have not selected a plan yet.
            </p>
            <p className="text-sm text-yellow-700">
              Please choose a plan to unlock features.
            </p>
          </div>

          <PlanCards onPlanSelected={handlePlanSelected} />

        </>
      )}

      {/* PLAN SELECTED */}
      {user.plan && (
        <div className="bg-white p-6 rounded shadow">
          <p className="font-medium">
            Current Plan:{" "}
            <span className="text-blue-600">{user.plan}</span>
          </p>

          {user.plan === "Free" && (
            <p className="text-sm text-gray-600 mt-2">
              You are on Free plan. Some features are locked.
            </p>
          )}

          {user.plan === "Pro" && (
            <p className="text-sm text-green-600 mt-2">
              You have full access 🎉
            </p>
          )}
        </div>
      )}
    </div>
  );
}

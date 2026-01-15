"use client";
import { apiFetch } from "../lib/api";
import PayPalButton from "./PayPalButton";
export default function PlanCards({ onPlanSelected }) {
  const planId = "2"; // PayPal sandbox plan ID
  const token = localStorage.getItem("accessToken");

  async function selectFreePlan() {
    try {
      const res = await apiFetch("/api/plans/select/", {
        method: "POST",
        body: JSON.stringify({ plan: "Free" }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to select plan");
        return;
      }

      onPlanSelected(data.plan);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  }

  async function purchasePlan(params) {
    try {
      const res = await apiFetch("/api/plans/create-checkout-session/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "Pro" }),
      });
      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        alert(data.error || "Failed to select plan");
        return;
      }
      console.log(data);
      window.location.href = data.checkout_url;
    }
    catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  }
  return (
    <div className="grid grid-cols-1 text-black md:grid-cols-2 gap-6">
      {/* FREE PLAN */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Free Plan</h2>
        <p className="text-gray-600 mb-4">
          Basic portfolio access
        </p>
        <p className="text-2xl font-bold mb-4">₹0</p>

        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 cursor-pointer"
          onClick={selectFreePlan}
        >
          Choose Free
        </button>
      </div>

      {/* PAID PLAN */}
      <div className="bg-white p-6 rounded shadow border-2 border-blue-600">
        <h2 className="text-xl font-semibold mb-2">Pro Plan</h2>
        <p className="text-gray-600 mb-4">
          Full portfolio access
        </p>
        <p className="text-2xl font-bold mb-4">₹499</p>

        <button
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 cursor-pointer"
          onClick={purchasePlan}
        >
          Upgrade to Pro
        </button>
        <PayPalButton planId={planId} token={token} />
      </div>
    </div>
  );
}

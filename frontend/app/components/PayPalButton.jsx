"use client";

import { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import PaymentOverlay from "./PaymentOverlay";

export default function PayPalButton({ planId, token }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);   // post-approval loader
  const [success, setSuccess] = useState(false);

  const [paymentStatus, setPaymentStatus] = useState("idle");

  const handleApprove = async (data) => {
    // 🔵 START loader ONLY AFTER approval
    setLoading(true);
    setError(null);
    setSuccess(false);
    // setPaymentStatus("processing");


    try {
      const res = await fetch(
        "http://localhost:8000/api/payment/capture/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderID: data.orderID }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result?.error || result?.message || "Payment failed"
        );
      }
      setPaymentStatus("success");
      setSuccess(true);

      // Wait 2 seconds to show success message before redirect
      setTimeout(() => {
        window.location.href = "/"; // Change to your target
      }, 2000);

    } catch (err) {
      console.error("Payment capture failed:", err);
      setError("Payment failed please try again");
      // setError(err.message);
      setPaymentStatus("error");
      // 🔹 Auto-dismiss error overlay after 3 seconds
      setTimeout(() => {
        setPaymentStatus("idle");
        setError(null);
      }, 3000);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 🔵 POST-APPROVAL LOADER */}
      {/* {loading && (
        <div style={{ marginTop: "10px" }}>
          <p>Payment in progress…</p>
          <p>Please don’t close this window.</p>
        </div>
      )} */}

      {/* 🟢 PAYPAL BUTTON (only when NOT loading or success) */}

      <PayPalButtons
        createOrder={async () => {
          const res = await fetch(
            "http://localhost:8000/api/payment/create-order/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ plan_id: planId }),
            }
          );

          const data = await res.json();
          return data.order_id;
        }}
        onApprove={handleApprove}
        onError={(err) => {
          console.error("PayPal SDK error:", err);
          setError("PayPal error occurred. Please try again.");
          setPaymentStatus("error");
        }}
      // disabled={paymentStatus === "processing"}
      />

      {/* Overlay */}

      <PaymentOverlay
        status={paymentStatus} message={error} onClose={() => {
          setPaymentStatus("idle");
          setError(null);
        }} />
      {/* ✅ SUCCESS MESSAGE */}
      {/* {success && (
        <p style={{ color: "green", marginTop: "10px" }}>
          ✅ Payment Successful!
        </p>
      )} */}

      {/* ❌ ERROR MESSAGE */}
      {/* {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
          ❌ {error}
        </p>
      )} */}
    </div>
  );
}

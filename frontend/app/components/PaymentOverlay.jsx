"use client";

export default function PaymentOverlay({ status, message, onClose }) {
  if (!status || status === "idle") return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl w-80 text-center animate-scale-fade">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-lg font-bold"
        >
          ×
        </button>
        {status === "processing" && (
          <>
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-1">Working on your payment…</h3>
            <p className="text-gray-600 text-sm">Please don’t close this window.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h3 className="text-lg font-semibold mb-1">Payment successful</h3>
            <p className="text-gray-600 text-sm">Redirecting you shortly…</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-500 text-5xl mb-4">✕</div>
            <h3 className="text-lg font-semibold mb-1">Payment failed</h3>
            <p className="text-gray-600 text-sm">{message || "Please try again."}</p>
          </>
        )}
      </div>
    </div>
  );
}

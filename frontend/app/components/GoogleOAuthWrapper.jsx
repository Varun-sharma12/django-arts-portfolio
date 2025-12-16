// app/components/GoogleOAuthWrapper.jsx
"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
export default function GoogleOAuthWrapper({ children }) {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}

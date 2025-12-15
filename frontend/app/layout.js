"use client";
import "./globals.css";
import Navbar from "./components/Navbar";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GoogleOAuthProvider clientId="655440522588-ndc0vvofgtd67rnu616a43lbi8gp9dks.apps.googleusercontent.com">
            <Navbar />
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

// app/layout.js
import "./globals.css";
import Navbar from "./components/Navbar";
import GoogleOAuthWrapper from "./components/GoogleOAuthWrapper";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <GoogleOAuthWrapper>
          {children}
        </GoogleOAuthWrapper>
      </body>
    </html>
  );
}

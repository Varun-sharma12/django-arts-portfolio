// app/layout.js
import "./globals.css";
import Navbar from "./components/Navbar";
import GoogleOAuthWrapper from "./components/GoogleOAuthWrapper";
import PayPalProvider from "./providers/PayPalProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PayPalProvider>
          <GoogleOAuthWrapper>
            <Navbar />
            {children}
          </GoogleOAuthWrapper>
        </PayPalProvider>
      </body>
    </html>
  );
}

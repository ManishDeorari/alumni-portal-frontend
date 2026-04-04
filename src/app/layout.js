import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "react-hot-toast"; // ✅ Import Toaster
import { ThemeProvider } from "@/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Alumni Portal",
  description: "Connect with your alumni network",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Alumni Portal",
  },
};

export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: 0,
};

import ClientRouteProtection from "./components/ClientRouteProtection";
import { NotificationProvider } from "@/context/NotificationContext";
import GlobalNavigationLoader from "./components/ui/GlobalNavigationLoader";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ✅ Stylish Toast */}
        <Toaster
          position="top-center"
          containerStyle={{
            top: 100,
          }}
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1f2937", // Tailwind gray-800
              color: "#facc15",       // Tailwind yellow-400
              borderRadius: "12px",
              padding: "12px 20px",
              fontSize: "16px",
              zIndex: 99999, // Ensure toast is above everything
            },
          }}
        />
        <ThemeProvider>
          <Suspense fallback={null}>
            <GlobalNavigationLoader />
          </Suspense>
          <NotificationProvider>
            <ClientRouteProtection>
              {children}
            </ClientRouteProtection>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

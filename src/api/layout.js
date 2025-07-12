"use client";

import Sidebar from "../components/Sidebar";
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-600 to-purple-700 text-white">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-blue-700 to-purple-700 shadow-md">
        <Sidebar />
      </div>

      {/* Page Content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Toaster position="top-center" reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}

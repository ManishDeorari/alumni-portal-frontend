"use client";

import AuthGuard from "../components/AuthGuard";
import { NotificationProvider } from "@/context/NotificationContext";

export default function DashboardLayout({ children }) {
    return (
        <AuthGuard>
            <NotificationProvider>
                {children}
            </NotificationProvider>
        </AuthGuard>
    );
}

"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { X, User, Lock, LogIn, ArrowLeft, UserPlus } from "lucide-react";

const LoginPopup = () => {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "", enrollmentNumber: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(form),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Invalid credentials");
            }

            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);
                localStorage.setItem("userId", data.userId);

                toast.success("✅ Login Successful!");

                // Stay on current page but trigger reload to clear protection
                window.location.reload();
            } else {
                throw new Error("Token not received");
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.message || "Something went wrong");
            toast.error(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSignupRedirect = () => {
        router.push("/auth/signup");
    };

    const handleClose = () => {
        // Since this is a restricted access pop-up, closing it usually means going back to home
        router.push("/");
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-600/80 to-purple-700/80 backdrop-blur-xl px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full flex flex-col animate-fadeIn"
            >
                {/* Header - Compact */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3.5 flex justify-between items-center text-white flex-shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <LogIn className="w-5 h-5" /> Access Restricted
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 md:p-6 space-y-4 bg-gray-50/50 flex-grow">
                    <div className="text-center">
                        <p className="text-gray-600 font-medium text-sm">
                            Please login with your university credentials to continue.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] p-2.5 rounded-xl flex items-center gap-2 animate-shake">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-blue-500" /> Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-purple-500" /> ID
                            </label>
                            <input
                                type="text"
                                name="enrollmentNumber"
                                placeholder="Enter your ID"
                                value={form.enrollmentNumber}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <Lock className="w-3.5 h-3.5 text-red-500" /> Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" /> Login Now
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-3 text-gray-400 text-[10px] font-bold uppercase tracking-wider">or</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <button
                            onClick={handleSignupRedirect}
                            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <UserPlus className="w-4 h-4 text-blue-500" /> Create New Account
                        </button>
                    </div>
                </div>

                {/* Footer - Compact */}
                <div className="bg-gray-100 p-3 border-t flex justify-between items-center text-[11px] text-gray-500 font-medium">
                    <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                        <ArrowLeft className="w-3 h-3" /> Back to Home
                    </Link>
                    <Link href="/auth/login" className="hover:text-blue-600 transition-colors uppercase tracking-tight">
                        Full Login Page
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPopup;

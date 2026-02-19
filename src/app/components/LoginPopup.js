"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { X, User, Lock, LogIn, ArrowLeft, UserPlus } from "lucide-react";

const LoginPopup = () => {
    const router = useRouter();
    const [form, setForm] = useState({ identifier: "", password: "" });
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
                    body: JSON.stringify({
                        identifier: form.identifier,
                        password: form.password
                    }),
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

    const [darkMode, setDarkMode] = useState(false);

    const handleSignupRedirect = () => {
        router.push("/auth/signup");
    };

    const handleClose = () => {
        router.push("/");
    };

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-start pt-8 md:pt-12 bg-gradient-to-br from-blue-600/80 to-purple-700/80 backdrop-blur-xl px-4 transition-colors duration-500`}>
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-[400px] z-10 mx-auto"
            >
                {/* Header outside card */}
                <div className="text-center mb-6 pt-0">
                    <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">
                        Alumni Portal
                    </h1>
                    <p className="text-white/70 mt-2 font-medium text-sm">Reconnect. Network. Grow.</p>
                </div>

                <div className={`${darkMode ? "bg-[#0f172a]/90 text-white" : "bg-white text-gray-900"} backdrop-blur-2xl border ${darkMode ? "border-white/10" : "border-gray-200"} rounded-[2.5rem] py-4 px-6 md:py-6 md:px-8 shadow-2xl space-y-4 relative overflow-hidden transition-all duration-500`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>

                    {/* Popup Status Header */}
                    <div className="flex justify-between items-center text-white flex-shrink-0">
                        <div className="space-y-0.5">
                            <h2 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? "text-white" : "text-black"}`}>
                                Access Restricted
                            </h2>
                            <p className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-gray-500" : "text-gray-600"} font-black`}>Login to continue</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className={`${darkMode ? "text-white/40 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"} p-2 rounded-full transition-all`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`${darkMode ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-100 text-red-600"} border text-[10px] py-2 px-4 rounded-xl text-center font-bold`}
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-gray-500" : "text-black"} ml-4 font-black flex items-center gap-1`}>
                                <User className="w-3 h-3" /> Email or ID
                            </label>
                            <input
                                type="text"
                                name="identifier"
                                placeholder="example@univ.edu"
                                value={form.identifier}
                                onChange={handleChange}
                                className={`w-full px-5 py-3 ${darkMode ? "bg-white/5 border-white/10 text-white placeholder-white/20" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"} border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm`}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-gray-500" : "text-black"} ml-4 font-black flex items-center gap-1`}>
                                <Lock className="w-3 h-3" /> Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                className={`w-full px-5 py-3 ${darkMode ? "bg-white/5 border-white/10 text-white placeholder-white/20" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"} border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm`}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Authenticating...
                                </span>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" /> Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="flex flex-col space-y-3 pt-2">
                        <button
                            onClick={handleSignupRedirect}
                            className={`w-full ${darkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-black"} font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest`}
                        >
                            <UserPlus className="w-4 h-4 text-blue-400" /> Create New Account
                        </button>
                    </div>

                    {/* Footer Inside the Div */}
                    <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                        <Link href="/" className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-gray-500 hover:text-white" : "text-black hover:text-gray-600"} font-black transition-colors flex items-center gap-1`}>
                            <ArrowLeft className="w-3 h-3" /> Home
                        </Link>
                        <Link href="/auth/login" className="text-[10px] uppercase tracking-widest text-blue-500 font-black hover:underline transition-all">
                            Full Login Page
                        </Link>
                    </div>
                </div>

                {/* Theme Toggle Button Fixed at bottom right of page */}
                <div className="fixed bottom-6 right-6 z-[100]">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-4 rounded-full backdrop-blur-md shadow-2xl border-2 transition-all duration-500 ${darkMode ? "bg-white/10 border-white/20 text-yellow-400 hover:bg-white/20" : "bg-[#0f172a]/10 border-[#0f172a]/20 text-[#0f172a] hover:bg-[#0f172a]/20"} hover:scale-110 active:scale-90`}
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {darkMode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPopup;

"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

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

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-xl px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl backdrop-blur-lg max-w-md w-full text-center"
            >
                <h2 className="text-3xl font-bold text-white mb-2">Login Required</h2>
                <p className="text-gray-300 mb-6 text-sm">
                    You need to be logged in to access this page.
                </p>

                {error && <p className="text-red-400 text-sm mb-4 bg-red-900/20 py-2 rounded-lg">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/20 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-500"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            name="enrollmentNumber"
                            placeholder="ID"
                            value={form.enrollmentNumber}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/20 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-500"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/20 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging In...
                            </span>
                        ) : "Login"}
                    </button>
                </form>

                <div className="relative flex py-6 items-center">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">or</span>
                    <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div className="flex flex-col space-y-4">
                    <button
                        onClick={handleSignupRedirect}
                        className="w-full bg-transparent border border-white/20 hover:bg-white/5 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                    >
                        Create New Account
                    </button>
                </div>

                <div className="mt-8 flex justify-between items-center text-xs text-gray-500">
                    <Link href="/" className="hover:text-blue-400 transition-colors">
                        ← Back to Home
                    </Link>
                    <Link href="/auth/login" className="hover:text-blue-400 transition-colors">
                        Full Login Page
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPopup;

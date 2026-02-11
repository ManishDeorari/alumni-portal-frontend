"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const LoginPopup = () => {
    const router = useRouter();

    const handleLoginRedirect = () => {
        router.push("/auth/login");
    };

    const handleSignupRedirect = () => {
        router.push("/auth/signup");
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl backdrop-blur-lg max-w-md w-full text-center"
            >
                <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
                <p className="text-gray-200 mb-8">
                    You need to be logged in to access this page. Please login or sign up to continue.
                </p>

                <div className="flex flex-col space-y-4">
                    <button
                        onClick={handleLoginRedirect}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                    >
                        Login
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-white/20"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-300">or</span>
                        <div className="flex-grow border-t border-white/20"></div>
                    </div>

                    <button
                        onClick={handleSignupRedirect}
                        className="w-full bg-transparent border-2 border-white/30 hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
                    >
                        Sign Up
                    </button>
                </div>

                <div className="mt-6 text-sm text-gray-400">
                    <Link href="/" className="hover:text-blue-400 underline">
                        Back to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPopup;

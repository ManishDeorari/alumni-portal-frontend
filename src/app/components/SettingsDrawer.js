"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaKey, FaSignOutAlt, FaCog, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";

const SettingsDrawer = ({ isOpen, onClose, onResetPassword, onSignout }) => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer Container with Gradient Border */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-80 z-[101] p-[2px] bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 shadow-2xl"
                    >
                        {/* Main Drawer Body */}
                        <div className={`h-full w-full flex flex-col p-6 shadow-inner ${darkMode ? "bg-black/95 text-white" : "bg-white text-gray-900"}`}>

                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${darkMode ? "bg-blue-500/20" : "bg-blue-50"}`}>
                                        <FaCog className="text-blue-500 text-xl" />
                                    </div>
                                    <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Settings</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className={`p-2 rounded-full transition-colors ${darkMode ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            {/* Options List */}
                            <div className="flex-1 space-y-4">
                                {/* Theme Section Label */}
                                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                    Appearance
                                </p>

                                {/* Theme Toggle */}
                                <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-blue-400 to-purple-500 shadow-md group hover:shadow-lg transition-all">
                                    <button
                                        onClick={toggleDarkMode}
                                        className={`w-full flex items-center justify-between px-4 py-4 rounded-[15px] transition-all ${darkMode ? "bg-gray-900 hover:bg-gray-800" : "bg-white hover:bg-gray-50"}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg transition-colors ${darkMode ? "bg-yellow-500/20" : "bg-blue-500/10"}`}>
                                                {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-blue-500" />}
                                            </div>
                                            <span className="font-semibold">Mode: {darkMode ? "Dark" : "Light"}</span>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${darkMode ? "bg-blue-600" : "bg-gray-200"}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${darkMode ? "left-7" : "left-1"}`}></div>
                                        </div>
                                    </button>
                                </div>

                                <p className={`text-xs font-bold uppercase tracking-wider mb-2 mt-6 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                    Account Security
                                </p>

                                {/* Reset Password */}
                                <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-purple-400 to-pink-500 shadow-md group hover:shadow-lg transition-all">
                                    <button
                                        onClick={() => {
                                            onResetPassword();
                                            onClose();
                                        }}
                                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-[15px] transition-all ${darkMode ? "bg-gray-900 hover:bg-gray-800" : "bg-white hover:bg-gray-50 text-gray-800"}`}
                                    >
                                        <div className={`p-2 rounded-lg transition-colors ${darkMode ? "bg-purple-500/20" : "bg-purple-50"}`}>
                                            <FaKey className="text-purple-500" />
                                        </div>
                                        <span className="font-semibold">Reset Password</span>
                                    </button>
                                </div>

                                <div className="pt-6 mt-6 border-t border-gray-100 dark:border-white/10">
                                    {/* Sign Out */}
                                    <button
                                        onClick={onSignout}
                                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all shadow-md hover:shadow-lg border ${darkMode ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" : "bg-red-50 border-red-100 text-red-600 hover:bg-red-100"}`}
                                    >
                                        <div className={`p-2 rounded-lg transition-colors ${darkMode ? "bg-red-500/20" : "bg-red-100"}`}>
                                            <FaSignOutAlt />
                                        </div>
                                        <span className="font-bold">Sign Out</span>
                                    </button>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-auto pt-6 text-center">
                                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${darkMode ? "bg-white/5 text-gray-500" : "bg-gray-100 text-gray-400"}`}>
                                    Alumni Portal v0.1.0
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SettingsDrawer;

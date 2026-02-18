"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaKey, FaSignOutAlt, FaCog } from "react-icons/fa";

export default function SettingsDrawer({ isOpen, onClose, onResetPassword, onSignout }) {
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-80 bg-black/90 backdrop-blur-2xl border-l border-white/10 z-[101] shadow-2xl p-6 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <FaCog className="text-blue-400 text-xl" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Settings</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Options List */}
                        <div className="flex-1 space-y-3">
                            <button
                                onClick={() => {
                                    onResetPassword();
                                    onClose();
                                }}
                                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-gray-200 group"
                            >
                                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/40 transition-colors">
                                    <FaKey className="text-blue-400" />
                                </div>
                                <span className="font-medium">Reset Password</span>
                            </button>

                            <div className="pt-4 mt-4 border-t border-white/10">
                                <button
                                    onClick={onSignout}
                                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all text-red-400 group"
                                >
                                    <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/40 transition-colors">
                                        <FaSignOutAlt />
                                    </div>
                                    <span className="font-medium">Sign Out</span>
                                </button>
                            </div>
                        </div>

                        {/* Footer / Info */}
                        <div className="mt-auto pt-6 text-center">
                            <p className="text-xs text-gray-500 font-medium">Alumni Portal v0.1.0</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

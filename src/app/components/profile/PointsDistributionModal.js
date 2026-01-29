"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, Info } from "lucide-react";

const CATEGORY_LABELS = {
    profileCompletion: "Profile Completion",
    studentEngagement: "Student Engagement",
    referrals: "Referrals",
    contentContribution: "Content Contribution",
    campusEngagement: "Campus Engagement",
    innovationSupport: "Innovation Support",
    alumniParticipation: "Alumni Participation",
};

export default function PointsDistributionModal({ isOpen, onClose, user }) {
    if (!user || user.role !== "alumni") return null;

    const points = user.points || {};
    const categories = Object.keys(CATEGORY_LABELS);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-3">
                                <Award className="w-8 h-8 text-yellow-300" />
                                <div>
                                    <h2 className="text-xl font-bold">{user.name}&apos;s Points</h2>
                                    <p className="text-white/80 text-sm">Detailed Breakdown</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <span className="font-semibold text-blue-900">Total Points</span>
                                <span className="text-2xl font-bold text-blue-600">{points.total || 0}</span>
                            </div>

                            <div className="space-y-3 pt-2">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <Info className="w-4 h-4" />
                                    Categories
                                </h3>
                                {categories.map((key) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                    >
                                        <span className="text-gray-700">{CATEGORY_LABELS[key]}</span>
                                        <span className="font-bold text-gray-900">{points[key] || 0}</span>
                                    </div>
                                ))}
                            </div>

                            {user.lastYearPoints && (
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Past Performance
                                    </h3>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-700">Last Year ({user.lastYearPoints.year})</span>
                                        <span className="font-bold text-gray-900">{user.lastYearPoints.total || 0}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

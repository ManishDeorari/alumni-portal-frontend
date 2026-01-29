"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, Info, ChevronDown, ChevronRight } from "lucide-react";

const CATEGORY_GROUPS = [
    {
        id: "profileCompletion",
        label: "Profile Completion",
        icon: "👤",
    },
    {
        id: "studentEngagement",
        label: "Student Engagement",
        icon: "🤝",
        children: [
            { id: "connections", label: "Networking" },
            { id: "likes", label: "Reactions" },
        ]
    },
    {
        id: "contentContribution",
        label: "Content Contribution",
        icon: "📝",
        children: [
            { id: "posts", label: "Posts" },
            { id: "comments", label: "Comments" },
        ]
    },
    {
        id: "referrals",
        label: "Referrals",
        icon: "📢",
    },
    {
        id: "campusEngagement",
        label: "Campus Engagement",
        icon: "🏫",
    },
    {
        id: "innovationSupport",
        label: "Innovation Support",
        icon: "💡",
    },
    {
        id: "alumniParticipation",
        label: "Alumni Participation",
        icon: "🎓",
    },
    {
        id: "other",
        label: "Other Activities",
        icon: "⚙️",
    }
];

export default function PointsDistributionModal({ isOpen, onClose, user }) {
    const [expanded, setExpanded] = React.useState({});

    if (!user || user.role !== "alumni") return null;

    const points = user.points || {};

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

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
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100 mb-2">
                                <span className="font-semibold text-blue-900">Total Balance</span>
                                <span className="text-2xl font-bold text-blue-600">{points.total || 0}</span>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 mb-3">
                                    Activity Breakdown
                                </h3>
                                {CATEGORY_GROUPS.map((group) => (
                                    <div key={group.id} className="group/item">
                                        <div
                                            onClick={() => group.children && toggleExpand(group.id)}
                                            className={`flex items-center justify-between p-3 rounded-xl transition-all border ${group.children ? 'cursor-pointer hover:bg-gray-50' : 'bg-white'
                                                } ${expanded[group.id] ? 'bg-gray-50 border-gray-200' : 'border-transparent'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{group.icon}</span>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-800">{group.label}</span>
                                                    {group.children && (
                                                        <span className="text-[10px] text-blue-500 font-medium uppercase tracking-tighter">
                                                            {expanded[group.id] ? 'Click to hide details' : 'Click to expand details'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold text-lg ${points[group.id] > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {points[group.id] || 0}
                                                </span>
                                                {group.children && (
                                                    expanded[group.id] ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Children */}
                                        <AnimatePresence>
                                            {group.children && expanded[group.id] && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-gray-50/50 rounded-b-xl -mt-2 pb-2"
                                                >
                                                    {group.children.map(child => (
                                                        <div key={child.id} className="flex items-center justify-between py-2 px-12 border-l-2 border-gray-200 ml-6 mr-3">
                                                            <span className="text-sm text-gray-600">{child.label}</span>
                                                            <span className="text-sm font-bold text-gray-700">{points[child.id] || 0}</span>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>

                            {user.lastYearPoints && (
                                <div className="mt-8 pt-4 border-t border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">
                                        Past Performance
                                    </h3>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">📅</span>
                                            <span className="font-medium text-gray-700">Year {user.lastYearPoints.year}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{user.lastYearPoints.total || 0}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                            <button
                                onClick={onClose}
                                className="px-10 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-semibold shadow-lg shadow-gray-200 active:scale-95"
                            >
                                Done
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

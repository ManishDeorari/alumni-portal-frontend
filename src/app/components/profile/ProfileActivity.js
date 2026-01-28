"use client";

import React, { useState } from "react";
import Link from "next/link";
import SectionCard from "./SectionCard";
import PostCard from "@/app/components/Post/PostCard";
import { MessageSquare, Heart, CornerUpRight, Activity, Paperclip } from "lucide-react";

export default function ProfileActivity({ profile, setProfile, isPublicView }) {
    const [activeTab, setActiveTab] = useState("all");

    // Combine posts and interactions for "All"
    const myPosts = (profile.posts || [])
        .filter(p => p && p._id)
        .map(p => ({ ...p, activityType: "post" }));

    const interactions = (Array.isArray(profile.activity) ? profile.activity : [])
        .filter(a => a && a.post)
        .map(a => ({ ...a.post, activityType: a.type, actionDate: a.createdAt, interactionText: a.text, reaction: a.reaction }));

    const allActivity = [...myPosts, ...interactions].sort((a, b) =>
        new Date(b.actionDate || b.createdAt) - new Date(a.actionDate || a.createdAt)
    );

    const likedPosts = interactions.filter(i => i.activityType === "reaction");

    const renderContent = () => {
        const list = activeTab === "all" ? allActivity : activeTab === "posts" ? myPosts : likedPosts;

        if (list.length === 0) {
            return (
                <div className="py-10 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No activity to show in this category.</p>
                </div>
            );
        }

        return (
            <div className="space-y-6 mt-4">
                {list.slice(0, 3).map((item, idx) => (
                    <div key={`${item._id}-${idx}`} className="relative">
                        {/* Activity Indicator */}
                        <div className="flex items-center gap-2 mb-2 text-[11px] font-bold uppercase tracking-widest">
                            {item.activityType === "post" && (
                                <>
                                    <div className="p-1 bg-blue-100 rounded text-blue-600"><Paperclip className="w-3 h-3" /></div>
                                    <span className="text-blue-600">You posted this</span>
                                </>
                            )}
                            {item.activityType === "reaction" && (
                                <>
                                    <div className="p-1 bg-red-100 rounded text-red-600"><Heart className="w-3 h-3" /></div>
                                    <span className="text-red-500 font-extrabold flex items-center gap-1">
                                        You liked this <span className="text-base leading-none">{item.reaction}</span>
                                    </span>
                                </>
                            )}
                            {item.activityType === "comment" && (
                                <>
                                    <div className="p-1 bg-green-100 rounded text-green-600"><MessageSquare className="w-3 h-3" /></div>
                                    <span className="text-green-600">You commented on this</span>
                                </>
                            )}
                            {item.activityType === "reply" && (
                                <>
                                    <div className="p-1 bg-purple-100 rounded text-purple-600"><CornerUpRight className="w-3 h-3" /></div>
                                    <span className="text-purple-600">You replied to a comment</span>
                                </>
                            )}
                        </div>

                        <PostCard
                            post={item}
                            currentUser={profile}
                            setPosts={(updateFn) =>
                                setProfile((prev) => ({
                                    ...prev,
                                    posts: typeof updateFn === "function" ? updateFn(prev.posts || []) : updateFn,
                                }))
                            }
                            isProfileActivity
                        />
                    </div>
                ))}

                {(list.length > 3) && (
                    <div className="pt-2 text-center">
                        <Link
                            href={activeTab === "posts" ? "/dashboard/myposts" : "/dashboard/myactivity"}
                            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition bg-blue-50 px-4 py-2 rounded-full border border-blue-100"
                        >
                            Show all {activeTab} activity
                        </Link>
                    </div>
                )}
            </div>
        );
    };

    return (
        <SectionCard title="Activity" hasData={allActivity.length > 0} isPublicView={isPublicView}>
            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-2">
                {["all", "posts", "likes"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition relative ${activeTab === tab
                            ? "text-blue-600"
                            : "text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 animate-slideIn" />
                        )}
                    </button>
                ))}
            </div>

            {renderContent()}
        </SectionCard>
    );
}

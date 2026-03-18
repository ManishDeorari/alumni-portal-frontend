"use client";
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import GroupSidebar from "../../components/groups/GroupSidebar";
import GroupChatWindow from "../../components/groups/GroupChatWindow";
import socket from "@/utils/socket";
import { useTheme } from "@/context/ThemeContext";
import CreateGroupModal from "../../components/groups/modals/CreateGroupModal";
import EditGroupModal from "../../components/groups/modals/EditGroupModal";
import InviteMembersModal from "../../components/groups/modals/InviteMembersModal";
import { toast } from "react-hot-toast";

export default function MessagesPage() {
    const { darkMode } = useTheme();
    const [groups, setGroups] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const selectedGroupRef = useRef(selectedGroup);

    useEffect(() => {
        selectedGroupRef.current = selectedGroup;
    }, [selectedGroup]);

    // 1. Fetch current user and groups on load
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const role = localStorage.getItem("role");
                
                // Initial check from localStorage
                let user = JSON.parse(localStorage.getItem("user"));
                
                // If user object is missing, fetch it
                if (!user && token) {
                    const userRes = await fetch(`${API_URL}/api/user/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (userRes.ok) {
                        user = await userRes.json();
                        localStorage.setItem("user", JSON.stringify(user));
                    }
                }

                setCurrentUser(user);
                setIsAdmin(user?.isAdmin || user?.role === "admin" || role === "admin");

                // Fetch groups
                const res = await fetch(`${API_URL}/api/groups`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    setGroups(data);
                    setFilteredGroups(data);
                }
            } catch (err) {
                console.error("Error fetching initial data:", err);
            }
        };

        fetchData();
    }, [API_URL]);

    // 2. Fetch messages when a group is selected
    useEffect(() => {
        if (!selectedGroup) return;

        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_URL}/api/groups/${selectedGroup._id}/messages`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (err) {
                console.error("Error fetching messages:", err);
            }
        };

        fetchMessages();
        setNewMessage(""); 

        // Join socket room
        socket.emit("joinGroup", selectedGroup._id);

        return () => {
            socket.emit("leaveGroup", selectedGroup._id);
        };
    }, [selectedGroup, API_URL]);

    // 3. Socket.io listeners
    useEffect(() => {
        const handleReceiveMessage = (msg) => {
            const currentSelected = selectedGroupRef.current;
            if (currentSelected && String(msg.groupId) === String(currentSelected._id)) {
                setMessages((prev) => {
                    if (prev.find(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
            }
        };

        const handleReactionUpdate = ({ messageId, reactions }) => {
            setMessages((prev) => prev.map(m => 
                m._id === messageId ? { ...m, reactions } : m
            ));
        };

        socket.on("receiveGroupMessage", handleReceiveMessage);
        socket.on("messageReactionUpdate", handleReactionUpdate);

        return () => {
            socket.off("receiveGroupMessage", handleReceiveMessage);
            socket.off("messageReactionUpdate", handleReactionUpdate);
        };
    }, []);

    // 4. Send Message Logic
    const handleSendMessage = async (text) => {
        if (!selectedGroup || !text.trim()) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/groups/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    groupId: selectedGroup._id,
                    content: text,
                }),
            });

            if (res.ok) {
                setNewMessage("");
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to send message");
            }
        } catch (err) {
            console.error("Error sending message:", err);
            toast.error("Error sending message");
        }
    };

    const handleSearch = (term) => {
        if (!term.trim()) {
            setFilteredGroups(groups);
        } else {
            const filtered = groups.filter(g =>
                g.name.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredGroups(filtered);
        }
    };

    const handleCreateGroup = async (groupData) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/groups`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(groupData),
            });

            if (res.ok) {
                const newGroup = await res.json();
                setGroups(prev => [newGroup, ...prev]);
                setFilteredGroups(prev => [newGroup, ...prev]);
                setShowCreateModal(false);
                toast.success("Group created successfully!");
            }
        } catch (err) {
            console.error("Error creating group:", err);
            toast.error("Failed to create group");
        }
    };

    const handleUpdateGroup = async (groupId, updateData) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/groups/${groupId}/settings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            if (res.ok) {
                const updatedGroup = await res.json();
                setGroups(prev => prev.map(g => g._id === groupId ? updatedGroup : g));
                setFilteredGroups(prev => prev.map(g => g._id === groupId ? updatedGroup : g));
                setSelectedGroup(updatedGroup);
                setShowEditModal(false);
                toast.success("Group updated!");
            }
        } catch (err) {
            console.error("Error updating group:", err);
            toast.error("Failed to update group");
        }
    };

    const handleInviteMembers = async (groupId, inviteData) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/groups/${groupId}/invite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(inviteData),
            });

            if (res.ok) {
                setShowInviteModal(false);
                toast.success("Members invited successfully!");
            }
        } catch (err) {
            console.error("Error inviting members:", err);
            toast.error("Failed to invite members");
        }
    };

    const handleReact = async (messageId, emoji) => {
        if (!selectedGroup) return;
        try {
            const token = localStorage.getItem("token");
            await fetch(`${API_URL}/api/groups/${selectedGroup._id}/react`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ messageId, emoji }),
            });
        } catch (err) {
            console.error("Error reacting:", err);
        }
    };

    const SidebarComponent = isAdmin ? AdminSidebar : Sidebar;

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 relative text-white">
            <SidebarComponent />

            <main className="p-4 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col justify-center">
                <div className="relative p-[2px] rounded-3xl shadow-2xl overflow-hidden h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500" />

                    <div className={`relative flex gap-6 p-6 rounded-[22px] transition-colors duration-300 h-full ${darkMode ? "bg-gray-950/90" : "bg-white/90"
                        }`}>
                        <GroupSidebar
                            groups={filteredGroups}
                            selectedGroup={selectedGroup}
                            onSelectGroup={setSelectedGroup}
                            onSearch={handleSearch}
                            isAdmin={isAdmin}
                            onCreateGroup={() => setShowCreateModal(true)}
                        />

                        <GroupChatWindow
                            selectedGroup={selectedGroup}
                            messages={messages}
                            currentUser={currentUser}
                            onSendMessage={handleSendMessage}
                            newMessage={newMessage}
                            setNewMessage={setNewMessage}
                            isAdmin={isAdmin}
                            onEditGroup={() => setShowEditModal(true)}
                            onInviteMembers={() => setShowInviteModal(true)}
                            onReact={handleReact}
                        />
                    </div>
                </div>
            </main>

            {/* Modals */}
            <CreateGroupModal 
                isOpen={showCreateModal} 
                onClose={() => setShowCreateModal(false)} 
                onCreate={handleCreateGroup} 
            />
            
            {showEditModal && (
                <EditGroupModal 
                    isOpen={showEditModal} 
                    onClose={() => setShowEditModal(false)} 
                    onUpdate={handleUpdateGroup} 
                    group={selectedGroup}
                />
            )}

            {showInviteModal && (
                <InviteMembersModal 
                    isOpen={showInviteModal} 
                    onClose={() => setShowInviteModal(false)} 
                    onInvite={handleInviteMembers} 
                    groupId={selectedGroup?._id}
                />
            )}
        </div>
    );
}

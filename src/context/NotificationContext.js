"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import socket from "@/utils/socket";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadGroupMessagesCount, setUnreadGroupMessagesCount] = useState(0);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [adminSignupRequestsCount, setAdminSignupRequestsCount] = useState(0);
  const [shakeNotification, setShakeNotification] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const userRef = useRef(null);

  const fetchNotifications = useCallback(async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized = data.map(n => ({
          ...n,
          isRead: n.isRead === true || n.isRead === "true" || n.isRead === 1 || n.isRead === "1"
        }));
        setNotifications(normalized);
        const unread = normalized.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [API_URL]);

  const fetchCounts = useCallback(async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/counts/unread`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNewPostsCount(data.unreadPostsCount || 0);
        setPendingRequestsCount(data.pendingRequestsCount || 0);
        setUnreadGroupMessagesCount(data.unreadGroupMessagesCount || 0);
        setUnreadCount(data.unreadNotificationsCount || 0);
        setAdminSignupRequestsCount(data.adminSignupRequestsCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch counts:", err);
    }
  }, [API_URL]);

  const markSectionAsSeen = useCallback(async (section) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(`${API_URL}/api/counts/mark-seen/${section}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state immediately
      if (section === "posts" || section === "home") setNewPostsCount(0);
      if (section === "network") setPendingRequestsCount(0);
      if (section === "groups") setUnreadGroupMessagesCount(0);
      if (section === "admin-requests") setAdminSignupRequestsCount(0);
    } catch (err) {
      console.error(`Failed to mark ${section} as seen:`, err);
    }
  }, [API_URL]);

  const markAsRead = useCallback(async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, [API_URL]);

  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, [API_URL]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      const user = JSON.parse(storedUser);
      userRef.current = user;
      
      fetchNotifications(token);
      fetchCounts(token);
      
      if (socket.connected) {
        socket.emit("join", user._id);
      }
      
      const handleSocketConnect = () => {
        socket.emit("join", user._id);
      };
      socket.on("connect", handleSocketConnect);
      
      const handleNewNotification = (notification) => {
        setNotifications(prev => {
          // Prevent duplicates
          if (prev.some(n => n._id === notification._id)) return prev;
          return [{ ...notification, isRead: false }, ...prev];
        });
        setUnreadCount(prev => prev + 1);
        setShakeNotification(true);
        setTimeout(() => setShakeNotification(false), 1000);
        
        if (notification.type === "connect_request") {
          setPendingRequestsCount(prev => prev + 1);
        }
      };

      const handleNewPost = () => setNewPostsCount(prev => prev + 1);
      const handleNewGroupMessage = () => setUnreadGroupMessagesCount(prev => prev + 1);
      const handleNewSignupRequest = () => setAdminSignupRequestsCount(prev => prev + 1);

      const handlePointsUpdated = (data) => {
        const { awardedPoints, reason } = data;
        toast.success(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <span className="font-black text-yellow-400">Points Awarded!</span>
            </div>
            <div className="text-xs font-bold text-gray-300">
              You earned <span className="text-blue-400">+{awardedPoints}</span> points
            </div>
            <div className="text-[10px] uppercase tracking-widest opacity-50 font-black">
              {reason || "Activity Reward"}
            </div>
          </div>,
          {
            duration: 5000,
            icon: null,
            style: {
              background: "#1e293b",
              border: "1px solid #334155",
              padding: "16px",
              color: "#fff",
              borderRadius: "20px"
            }
          }
        );
        // Refresh counts to update the unread count if points_earned was also sent
        fetchCounts(token);
      };

      socket.on("newNotification", handleNewNotification);
      socket.on("newPost", handleNewPost);
      socket.on("receiveGroupMessage", handleNewGroupMessage);
      socket.on("newSignupRequest", handleNewSignupRequest);
      socket.on("pointsUpdated", handlePointsUpdated);

      return () => {
        socket.off("connect", handleSocketConnect);
        socket.off("newNotification", handleNewNotification);
        socket.off("newPost", handleNewPost);
        socket.off("receiveGroupMessage", handleNewGroupMessage);
        socket.off("newSignupRequest", handleNewSignupRequest);
        socket.off("pointsUpdated", handlePointsUpdated);
      };
    }
  }, [fetchNotifications, fetchCounts]);

  const value = {
    notifications,
    unreadCount,
    pendingRequestsCount,
    unreadGroupMessagesCount,
    newPostsCount,
    adminSignupRequestsCount,
    shakeNotification,
    markSectionAsSeen,
    markAsRead,
    markAllAsRead,
    refreshNotifications: () => {
        const token = localStorage.getItem("token");
        if (token) fetchNotifications(token);
    },
    refreshCounts: () => {
        const token = localStorage.getItem("token");
        if (token) fetchCounts(token);
    }
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

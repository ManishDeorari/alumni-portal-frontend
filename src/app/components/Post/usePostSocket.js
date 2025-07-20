// components/Post/usePostSocket.js
import { useEffect } from "react";
import socket from "../../../utils/socket";

export default function usePostSocket(postId, currentUser, setSomeoneTyping, setPosts) {
  useEffect(() => {
    if (!socket) return;

    socket.on("typing", ({ postId: incomingId, user }) => {
      if (incomingId === postId && user !== currentUser._id) {
        setSomeoneTyping(true);
        setTimeout(() => setSomeoneTyping(false), 3000);
      }
    });

    socket.on("postUpdated", (updatedPost) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      );
    });

    return () => {
      socket.off("typing");
      socket.off("postUpdated");
    };
  }, [postId, currentUser._id, setSomeoneTyping, setPosts]);
}

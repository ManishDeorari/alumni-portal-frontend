import { io } from "socket.io-client";
import socket from "@/lib/socket";

const [isTyping, setIsTyping] = useState(false);

useEffect(() => {
  socket.on("typing", ({ postId: typingPostId, userId }) => {
    if (typingPostId === post._id && userId !== currentUser._id) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  });

  return () => socket.off("typing");
}, [post._id]);

const URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://your-render-backend.onrender.com";

const socket = io(URL, {
  withCredentials: true,
  transports: ['websocket'],
});

export default socket;

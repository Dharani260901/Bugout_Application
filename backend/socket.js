import { Server } from "socket.io";
import Message from "./models/Message.js";
import RoomMember from "./models/RoomMember.js";
import Room from "./models/Room.js";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

const onlineUsers = {}; // socketId -> { roomCode, roomId, user }

export default function socketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  /* ================= SOCKET AUTH (NEW 🔥) ================= */
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("No token"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded.id; // ✅ NEW: secure user identity
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🔌 Connected:", socket.id);

    /* ================= JOIN ROOM ================= */
    socket.on("join-room", async ({ roomId }) => {
      try {
        const userId = socket.userId;

        const user = await User.findById(userId);
        const room = await Room.findOne({ roomCode: roomId });

        if (!room || !user) return;

        const member = await RoomMember.findOne({
          roomId: room._id,
          userId: userId,
        });

        /* ================= JOIN SOCKET ROOM (NEW 🔥) ================= */
        socket.join(roomId); // ✅ NEW: ensures proper broadcasting

        /* Remove previous socket if same user reconnects */
        for (const [sockId, data] of Object.entries(onlineUsers)) {
          if (
            data.user.id === user._id.toString() &&
            data.roomId.toString() === room._id.toString()
          ) {
            delete onlineUsers[sockId];
          }
        }

        /* ================= SAFE USER OBJECT (UPDATED 🔥) ================= */
        onlineUsers[socket.id] = {
          roomCode: roomId,
          roomId: room._id,
          user: {
            id: user._id.toString(), // ✅ NEW: safe id
            name: user.name,         // ✅ NEW: only needed fields
            role: member?.role || "member",
          },
        };

        const members = Object.values(onlineUsers)
          .filter((u) => u.roomCode === roomId)
          .map((u) => ({
            id: u.user.id,
            name: u.user.name,
            role: u.user.role,
            status: "online",
          }));

        io.to(roomId).emit("members-update", members);
      } catch (err) {
        console.error("join-room error:", err);
      }
    });

    /* ================= CALL ================= */

    /* ❌ REMOVED frontend user trust */
    socket.on("call-start", ({ roomId }) => {
      const user = onlineUsers[socket.id]?.user; // ✅ NEW: trusted user

      if (!user) return;

      socket.to(roomId).emit("incoming-call", { from: user });
    });

    socket.on("webrtc-offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("webrtc-offer", { offer });
    });

    socket.on("webrtc-answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("webrtc-answer", { answer });
    });

    socket.on("webrtc-ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("webrtc-ice-candidate", { candidate });
    });

    socket.on("video-toggle", ({ roomId, enabled }) => {
      socket.to(roomId).emit("remote-video-change", { enabled });
    });

    socket.on("mic-toggle", ({ roomId, enabled }) => {
      socket.to(roomId).emit("remote-mic-change", { enabled });
    });

    socket.on("end-call", ({ roomId }) => {
      socket.to(roomId).emit("call-ended");
    });

    socket.on("speaking", ({ roomId, speaking }) => {
      socket.to(roomId).emit("remote-speaking", { speaking });
    });

    /* ================= CHAT ================= */

    /* ❌ REMOVED frontend id/name trust */
    socket.on("send-message", async ({ roomId, message }) => {
      try {
        const user = onlineUsers[socket.id]?.user; // ✅ NEW: trusted user

        if (!user) return;

        const savedMessage = await Message.create({
          roomId,
          senderId: user.id,        // ✅ NEW
          senderName: user.name,    // ✅ NEW
          message,
          readBy: [user.id],
        });

        io.to(roomId).emit("receive-message", savedMessage);
      } catch (error) {
        console.error("Message save error:", error);
      }
    });

    /* ================= DISCONNECT ================= */

    socket.on("disconnect", () => {
      const data = onlineUsers[socket.id];

      if (data) {
        delete onlineUsers[socket.id];

        const members = Object.values(onlineUsers)
          .filter((u) =>
            u.roomId.toString() === data.roomId.toString()
          )
          .map((u) => ({
            id: u.user.id,
            name: u.user.name,
            role: u.user.role,
            status: "online",
          }));

        io.to(data.roomCode).emit("members-update", members);
      }

      console.log("❌ Disconnected:", socket.id);
    });
  });
}

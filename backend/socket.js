import { Server } from "socket.io"; 
import Message from "./models/Message.js"; 
import RoomMember from "./models/RoomMember.js";
import Room from "./models/Room.js";

const onlineUsers = {}; // socketId -> { roomCode, roomId, user }

export default function socketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Connected:", socket.id);

    /* ================= JOIN ROOM ================= */
    socket.on("join-room", async ({ roomId, user }) => {
      try {
        const room = await Room.findOne({ roomCode: roomId });
        if (!room) return;

        const member = await RoomMember.findOne({
          roomId: room._id,
          userId: user.id,
        });

        /* ===== CHECK IF ADMIN IS ONLINE ===== */
        const adminOnline = Object.values(onlineUsers).some(
          (u) => u.roomCode === roomId && u.user.role === "admin"
        );

        /* Allow admin to join even if nobody is online */
        if (!adminOnline && member?.role !== "admin") {
          socket.emit("room-inactive");
          return;
        }

        socket.join(roomId);

        room.lastActiveAt = new Date();
        await room.save();

        /* Remove previous socket if same user reconnects */
        for (const [sockId, data] of Object.entries(onlineUsers)) {
          if (
            data.user.id === user.id &&
            data.roomId.toString() === room._id.toString()
          ) {
            delete onlineUsers[sockId];
          }
        }

        onlineUsers[socket.id] = {
          roomCode: roomId,
          roomId: room._id,
          user: {
            ...user,
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

    /* ================= CALL + CHAT ================= */

    socket.on("call-start", ({ roomId, user }) => {
      socket.to(roomId).emit("incoming-call", { from: user });
    });

    socket.on("webrtc-offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("webrtc-offer", { offer });
    });

    socket.on("webrtc-answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("webrtc-answer", { answer });
    });

    socket.on("webrtc-ice-candidate", ({ roomId, candidate }) => {
      console.log("ICE candidate received");
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

    socket.on("send-message", async ({ roomId, id, name, message }) => {
      try {
        const savedMessage = await Message.create({
          roomId,
          senderId: id,
          senderName: name,
          message,
          readBy: [id],
        });

        io.to(roomId).emit("receive-message", savedMessage);
      } catch (error) {
        console.error("Message save error:", error);
      }
    });

    /* ================= ADMIN KICK USER ================= */

    socket.on("kick-user", ({ roomId, userId }) => {
      const admin = onlineUsers[socket.id];

      if (!admin || admin.user.role !== "admin") return;

      const target = Object.entries(onlineUsers).find(
        ([, data]) =>
          data.user.id === userId && data.roomCode === roomId
      );

      if (!target) return;

      const [targetSocketId] = target;

      io.to(targetSocketId).emit("kicked");
      io.sockets.sockets.get(targetSocketId)?.leave(roomId);

      delete onlineUsers[targetSocketId];

      const members = Object.values(onlineUsers)
        .filter((u) => u.roomCode === roomId)
        .map((u) => ({
          id: u.user.id,
          name: u.user.name,
          role: u.user.role,
          status: "online",
        }));

      io.to(roomId).emit("members-update", members);
    });

    /* ================= DISCONNECT ================= */

    socket.on("disconnect", async () => {
      const data = onlineUsers[socket.id];
      if (!data) return;

      /* ===== ADMIN LEFT → CLOSE ROOM ===== */
      if (data.user.role === "admin") {
        try {
          await RoomMember.deleteMany({ roomId: data.roomId });
          await Message.deleteMany({ roomId: data.roomCode });

          io.to(data.roomCode).emit("room-closed");

          delete onlineUsers[socket.id];

          console.log("🚨 Admin left. Room closed:", data.roomCode);
          return;
        } catch (err) {
          console.error("Room cleanup error:", err);
        }
      }

      delete onlineUsers[socket.id];

      const members = Object.values(onlineUsers)
        .filter((u) => u.roomCode === data.roomCode)
        .map((u) => ({
          id: u.user.id,
          name: u.user.name,
          role: u.user.role,
          status: "online",
        }));

      io.to(data.roomCode).emit("members-update", members);

      console.log("❌ Disconnected:", socket.id);
    });
  });
}

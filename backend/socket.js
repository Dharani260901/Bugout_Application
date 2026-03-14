import { Server } from "socket.io";
import Message from "./models/Message.js";
import RoomMember from "./models/RoomMember.js";
import Room from "./models/Room.js";

const onlineUsers = {}; // socketId -> { roomCode, roomId, user }

export default function socketServer(server) {
 const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  },
});

  io.on("connection", (socket) => {
    console.log("🔌 Connected:", socket.id);

    /* ================= JOIN ROOM ================= */
    socket.on("join-room", async ({ roomId, user }) => {
      // roomId here is roomCode
      const room = await Room.findOne({ roomCode: roomId });
      if (!room) return;

      socket.join(roomId); // ALWAYS use roomCode for socket room

      room.lastActiveAt = new Date();
      await room.save();

      const member = await RoomMember.findOne({
        roomId: room._id,
        userId: user.id,
      });

      // Remove previous socket if same user reconnects
      for (const [sockId, data] of Object.entries(onlineUsers)) {
        if (
          data.user.id === user.id &&
          data.roomId.toString() === room._id.toString()
        ) {
          delete onlineUsers[sockId];
        }
      }

      onlineUsers[socket.id] = {
        roomCode: roomId,          // ✅ IMPORTANT
        roomId: room._id,          // for DB filtering
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

      // 🔥 EMIT USING roomCode (NOT ObjectId)
      io.to(roomId).emit("members-update", members);
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
    // 🔥 Save to database
    const savedMessage = await Message.create({
      roomId,
      senderId: id,
      senderName: name,
      message,
      readBy: [id],
    });

    // 🔥 Emit full saved message
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

        // 🔥 Use roomCode here
        io.to(data.roomCode).emit("members-update", members);
      }

      console.log("❌ Disconnected:", socket.id);
    });
  });
}
import api from "./axios";

/* -------- CREATE ROOM -------- */
export const createRoomApi = async ({ roomName, password }) => {
  const { data } = await api.post("/api/rooms/create", {
    roomName,
    password,
  });

  return data;
};

/* -------- JOIN ROOM -------- */
export const joinRoomApi = async ({ roomCode, password }) => {
  const { data } = await api.post("/api/rooms/join", {
    roomCode,
    password,
  });

  return data;
};

/* -------- GET ROOM DETAILS -------- */
export const getRoomApi = async (roomId) => {
  const { data } = await api.get(`/api/rooms/${roomId}`);
  return data;
};

export const deleteRoomApi = (roomCode) =>
  api.delete(`/api/rooms/${roomCode}`);

export const getMyRoomsApi = () => api.get("/api/rooms");

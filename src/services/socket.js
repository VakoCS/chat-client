import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

export const connectSocket = (token) => {
  if (socket.connected) {
    socket.disconnect();
  }

  socket.auth = { token };
  socket.connect();

  socket.on("connect", () => {
    console.log("Socket conectado:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("Error de conexión:", error);
  });

  socket.on("disconnect", () => {
    console.log("Socket desconectado");
  });
};

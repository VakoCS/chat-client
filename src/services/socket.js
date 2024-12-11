import { io } from "socket.io-client";

// Detecta automáticamente la URL del servidor
const SOCKET_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : `http://${window.location.hostname}:3000`;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ["websocket", "polling"], // Añade soporte para polling como fallback
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
    console.error("Error de conexión socket:", error);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket desconectado, razón:", reason);
  });
};

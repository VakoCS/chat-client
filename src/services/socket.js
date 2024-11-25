import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
    autoConnect: false,
});

// Función para conectar el socket
export const connectSocket = (token) => {
    socket.auth = { token };
    socket.connect();

    socket.on('connect', () => {
        console.log('Socket conectado:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('Socket desconectado:', socket.id);
    });
};

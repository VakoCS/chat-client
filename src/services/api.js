import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const api = axios.create({
    baseURL: API_URL,
});

// Token de autenticación
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// Funciones API
export const login = (username, password) => api.post('/auth/login', { username, password });
export const register = (username, password) => api.post('/auth/register', { username, password });
export const getChats = () => api.get('/chats');
export const getMessages = (chatId) => api.get(`/messages/${chatId}`);
export const sendMessage = (chatId, content) =>
    api.post('/messages', { chatId, content });

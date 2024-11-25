import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMessages, sendMessage } from '../services/api';
import { socket } from '../services/socket';

const ChatWindow = () => {
    const { id: chatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        // Obtener los mensajes del chat actual
        const fetchMessages = async () => {
            try {
                const { data } = await getMessages(chatId);
                setMessages(data);
            } catch (error) {
                console.error('Error al cargar los mensajes:', error);
            }
        };
        fetchMessages();

        // Escuchar nuevos mensajes desde el socket
        const handleNewMessage = (message) => {
            if (message.chatId === parseInt(chatId, 10)) {
                setMessages((prev) => [...prev, message]);
            }
        };

        socket.on('new-message', handleNewMessage);

        // Limpiar eventos al desmontar
        return () => {
            socket.off('new-message', handleNewMessage);
        };
    }, [chatId]);

    const handleSendMessage = async () => {
        try {
            // Crear el objeto mensaje para enviar
            const messageData = {
                chatId,
                content: newMessage,
                senderId: localStorage.getItem('userId'),
            };

            // Enviar el mensaje al backend vía API
            const { data: savedMessage } = await sendMessage(chatId, newMessage);

            // Añadir el username del usuario actual al mensaje
            savedMessage.sender = { username: localStorage.getItem('username') };

            // Emitir el mensaje a través de Socket.io
            socket.emit('send-message', savedMessage);

            // Actualizar la interfaz inmediatamente
            setMessages((prev) => [...prev, savedMessage]);

            // Limpiar el input
            setNewMessage('');
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg flex flex-col h-[80vh]">
                <div className="flex-grow overflow-y-auto p-4">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`mb-4 p-3 rounded-lg ${
                                msg.sender?.username === localStorage.getItem('username')
                                    ? 'bg-indigo-100 text-right'
                                    : 'bg-gray-100 text-left'
                            }`}
                        >
                            <p className="text-sm font-medium text-gray-600">
                                {msg.sender?.username || 'Usuario desconocido'}
                            </p>
                            <p className="text-base text-gray-800">{msg.content || 'Mensaje vacío'}</p>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t">
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe un mensaje"
                            className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring focus:ring-indigo-300"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300"
                        >
                            Enviar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;

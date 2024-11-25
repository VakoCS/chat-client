import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChats } from '../services/api';

const ChatList = () => {
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const { data } = await getChats();
                setChats(data);
            } catch (error) {
                console.error('Error al cargar los chats:', error);
            }
        };
        fetchChats();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                    Tus Chats
                </h2>
                <ul className="space-y-4">
                    {chats.map((chat) => (
                        <li key={chat.id}>
                            <Link
                                to={`/chat/${chat.id}`}
                                className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg shadow transition-all duration-200"
                            >
                                <h3 className="text-lg font-medium text-gray-700">
                                    {chat.members.map((m) => m.username).join(', ')}
                                </h3>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ChatList;

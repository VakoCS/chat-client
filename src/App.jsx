import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import { setAuthToken } from './services/api';

const App = () => {
    const [user, setUser] = useState(null);

    // Persistencia de sesión
    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        if (token && username) {
            setAuthToken(token);
            setUser({ username, token });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setAuthToken(null);
        setUser(null);
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/login"
                    element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />}
                />
                <Route
                    path="/"
                    element={
                        user ? (
                            <div>
                                <button onClick={handleLogout}>Cerrar sesión</button>
                                <ChatList />
                            </div>
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/chat/:id"
                    element={
                        user ? <ChatWindow /> : <Navigate to="/login" />
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;

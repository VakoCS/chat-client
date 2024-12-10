import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import ChatLayout from "./components/ChatLayout";
import ChatWindow from "./components/ChatWindow";
import { setAuthToken } from "./services/api";
import Register from "./components/Register";
import { connectSocket, socket } from "./services/socket";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");

    if (token && username && userId) {
      setAuthToken(token);
      connectSocket(token);
      setUser({ username, token, id: userId }); // Establecer el estado del usuario
    }

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={user ? <ChatLayout /> : <Navigate to="/login" />}
        >
          <Route path="chat/:id" element={<ChatWindow />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

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

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (token && username) {
      setAuthToken(token);
      setUser({ username, token });
    }
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

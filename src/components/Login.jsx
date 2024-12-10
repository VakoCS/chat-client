import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";
import { setAuthToken } from "../services/api";
import { connectSocket } from "../services/socket";

const Login = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(username, password);

      // Guardar token y usuario en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      localStorage.setItem("userId", data.userId); // Asegúrate de enviar userId desde el backend

      // Conectar el socket con el token
      connectSocket(data.token);

      // Establecer token en las cabeceras
      setAuthToken(data.token);
      setUser({ username, token: data.token });

      // Redirigir a la lista de chats
      navigate("/");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Iniciar Sesión
        </h2>
        <form onSubmit={handleLogin} className="mt-6">
          {error && (
            <p className="mb-4 text-sm text-red-500 text-center">{error}</p>
          )}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:ring focus:ring-indigo-300 focus:outline-none"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:ring focus:ring-indigo-300 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300"
          >
            Iniciar Sesión
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          ¿No tienes una cuenta?{" "}
          <a href="/register" className="text-indigo-600 hover:underline">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;

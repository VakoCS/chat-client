import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { login } from "../services/api";
import { setAuthToken } from "../services/api";
import { connectSocket } from "../services/socket";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

// Esquema de validación
const loginSchema = z.object({
  username: z
    .string()
    .min(1, "El usuario es requerido")
    .min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [backendError, setBackendError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setBackendError("");
      const response = await login(data.username, data.password);

      // Guardar datos en localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("userId", response.data.userId);

      // Conectar socket y establecer token
      connectSocket(response.data.token);
      setAuthToken(response.data.token);

      // Actualizar estado de usuario
      setUser({
        username: data.username,
        token: response.data.token,
        id: response.data.userId,
      });

      navigate("/");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setBackendError(
        error.response?.data?.error ||
          "Error al iniciar sesión. Por favor, intenta de nuevo."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Iniciar Sesión
        </h2>

        {location.state?.message && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-md">
            {location.state.message}
          </div>
        )}

        {backendError && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-md">
            {backendError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Usuario
            </label>
            <input
              type="text"
              {...register("username")}
              className={`mt-1 block w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500
                ${errors.username ? "border-red-300" : "border-gray-300"}`}
              placeholder="Ingresa tu usuario"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`mt-1 block w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500
                  ${errors.password ? "border-red-300" : "border-gray-300"}`}
                placeholder="Ingresa tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200"
          >
            {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

// Register.jsx
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as registerUser } from "../services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

// Esquema de validación
const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "El usuario debe tener al menos 3 caracteres")
      .max(20, "El usuario no puede tener más de 20 caracteres"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

const Register = () => {
  const navigate = useNavigate();
  const [backendError, setBackendError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      setBackendError("");
      await registerUser(data.username, data.password);
      navigate("/login", {
        state: { message: "Registro exitoso. Por favor inicia sesión." },
      });
    } catch (error) {
      setBackendError(
        error.response?.data?.error || "Error al registrar usuario"
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Crear cuenta
        </h2>

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
              className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Confirma tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

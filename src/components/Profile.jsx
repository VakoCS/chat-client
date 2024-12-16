import { useState, useEffect } from "react";
import { getUserProfile, updateProfile } from "../services/api";
import {
  User,
  MessageSquare,
  Users,
  Clock,
  Activity,
  Edit,
  X,
  Camera,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { uploadFile } from "../services/storage";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    avatarUrl: "",
  });
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await getUserProfile();
        setProfile(data);
        setEditForm({
          username: data.profile.username,
          avatarUrl: data.profile.avatarUrl || "",
        });
      } catch (err) {
        setError("Error al cargar el perfil");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await updateProfile(editForm);
      const { data } = await getUserProfile();
      setProfile(data);
      setShowEditModal(false);
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      setError("Error al actualizar el perfil");
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploadingAvatar(true);
        const url = await uploadFile(file, "avatars");
        setEditForm((prev) => ({
          ...prev,
          avatarUrl: url,
        }));
      } catch (error) {
        console.error("Error al subir avatar:", error);
        alert("Error al subir la imagen");
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const getTimeString = (hour) => {
    return new Date(2024, 0, 1, hour).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );

  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Volver a chats
          </button>
        </div>
        {/* Header/Info básica */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {profile.profile.avatarUrl ? (
                  <img
                    src={profile.profile.avatarUrl}
                    alt={profile.profile.username}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-medium text-indigo-600">
                      {profile.profile.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.profile.username}
                </h1>
                <p className="text-sm text-gray-500">
                  Miembro desde{" "}
                  {new Date(profile.profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar perfil
            </button>
          </div>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold">Actividad</h2>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Total de mensajes:{" "}
                <span className="font-semibold">
                  {profile.stats.totalMessages}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Promedio por chat:{" "}
                <span className="font-semibold">
                  {profile.stats.avgMessagesPerChat}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Últimos 7 días:{" "}
                <span className="font-semibold">
                  {profile.messageStats.messagesLastWeek}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold">Conexiones</h2>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Chats activos:{" "}
                <span className="font-semibold">
                  {profile.stats.totalChats}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Contactos únicos:{" "}
                <span className="font-semibold">
                  {profile.stats.uniqueContacts}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Racha actual:{" "}
                <span className="font-semibold">
                  {profile.recentActivity.activeDaysStreak} días
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold">Patrones</h2>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Hora más activa:{" "}
                <span className="font-semibold">
                  {getTimeString(profile.messageStats.mostActiveHour)}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Longitud promedio:{" "}
                <span className="font-semibold">
                  {profile.messageStats.averageLength} caracteres
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Mensaje más largo:{" "}
                <span className="font-semibold">
                  {profile.messageStats.longestMessage} caracteres
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Gráfico de actividad por hora */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">Actividad por hora</h2>
          </div>
          <div className="h-40">
            <div className="flex h-full items-end space-x-1">
              {profile.messageStats.hourlyActivity.map((count, hour) => {
                const maxCount = Math.max(
                  ...profile.messageStats.hourlyActivity
                );
                const height = count ? (count / maxCount) * 100 : 0;
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-indigo-100 hover:bg-indigo-200 transition-all cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`${count} mensajes a las ${hour}:00`}
                    />
                    <span className="text-xs text-gray-500 mt-1">{hour}h</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal de edición */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Editar perfil</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foto de perfil
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {editForm.avatarUrl ? (
                        <img
                          src={editForm.avatarUrl}
                          alt="Preview"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <label
                        className={`absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 cursor-pointer
                          ${
                            uploadingAvatar
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-indigo-700"
                          }`}
                      >
                        {uploadingAvatar ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4 text-white" />
                        )}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                        />
                      </label>
                    </div>
                  </div>
                  {uploadingAvatar && (
                    <p className="mt-2 text-sm text-gray-500">
                      Subiendo imagen...
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {updating ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

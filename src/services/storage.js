import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import app from "../services/firebase/config.js";

export const storage = getStorage(app);

export async function uploadFile(file, type = "misc") {
  const folder =
    type === "avatars"
      ? "avatars"
      : type === "audio"
      ? "audios"
      : type === "image"
      ? "images"
      : "misc";

  // Usar v4() para generar un nombre único
  const fileName = `${v4()}.${file.name.split(".").pop()}`;

  const storageRef = ref(storage, `${folder}/${fileName}`);

  const metadata = {
    contentType: file.type,
  };

  try {
    // Subir el archivo
    const snapshot = await uploadBytes(storageRef, file, metadata);
    console.log(snapshot);
    // Obtener la URL de descarga
    const url = await getDownloadURL(snapshot.ref);

    return url;
  } catch (error) {
    console.error(`Error al subir ${type}:`, error);
    throw error;
  }
}

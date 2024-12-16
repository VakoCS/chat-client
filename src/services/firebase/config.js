import {
  VITE_API_KEY_PHOTOS as apiKey,
  appId,
  authDomain,
  messagingSenderId,
  projectId,
  storageBucket,
} from "../../utils/config";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;

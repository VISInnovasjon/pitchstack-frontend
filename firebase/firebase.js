
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDmITtXtM-RlaeC8F_pjEab21DRIbaYTIA",
  authDomain: "vispitchdeck.firebaseapp.com",
  projectId: "vispitchdeck",
  storageBucket: "vispitchdeck.appspot.com",
  messagingSenderId: "621123914404",
  appId: "1:621123914404:web:cee5ff98004b6936c3b431"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth }

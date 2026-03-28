import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCfdD3EZMC-ULUrMElw5BmTvJXV2KSvYiE",
  authDomain: "data-centre-598dd.firebaseapp.com",
  projectId: "data-centre-598dd",
  storageBucket: "data-centre-598dd.firebasestorage.app",
  messagingSenderId: "505360302690",
  appId: "1:505360302690:web:a8c0646f406a4cbcd6473b",
  databaseURL: "https://data-centre-598dd-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

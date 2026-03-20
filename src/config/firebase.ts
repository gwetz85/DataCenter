import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace this object with your actual Firebase config!
const firebaseConfig = {
  apiKey: "AIzaSyCfdD3EZMC-ULUrMElw5BmTvJXV2KSvYiE",
  authDomain: "data-centre-598dd.firebaseapp.com",
  projectId: "data-centre-598dd",
  storageBucket: "data-centre-598dd.firebasestorage.app",
  messagingSenderId: "505360302690",
  appId: "1:505360302690:web:a8c0646f406a4cbcd6473b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

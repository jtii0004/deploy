import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyBkQNEyRcMLYQ6tgUni9hh9JN1evZpo0iM",
authDomain: "weshowagile.firebaseapp.com",
projectId: "weshowagile",
storageBucket: "weshowagile.firebasestorage.app",
messagingSenderId: "324942220550",
appId: "1:324942220550:web:779f62ae8323962e4fe287",
measurementId: "G-9B5LVZ9MST"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
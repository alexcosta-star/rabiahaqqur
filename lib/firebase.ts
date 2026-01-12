import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBYp16xLwE-VdrAzvA7EzBAh9W7HDeY3oo",
    authDomain: "rabia-5d87a.firebaseapp.com",
    projectId: "rabia-5d87a",
    storageBucket: "rabia-5d87a.firebasestorage.app",
    messagingSenderId: "669588656292",
    appId: "1:669588656292:web:d536f2b93b151cb6f81631"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };

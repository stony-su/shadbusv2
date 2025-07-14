import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAaaegVFfBJyG8Td5YsVmrABN-QDErdV68",
  authDomain: "shadbus.firebaseapp.com",
  projectId: "shadbus",
  storageBucket: "shadbus.firebasestorage.app",
  messagingSenderId: "503088960661",
  appId: "1:503088960661:web:0582e42f3183087335779c",
  measurementId: "G-TL5EDGBXSJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db }; 
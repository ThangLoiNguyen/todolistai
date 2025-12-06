// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD4gO0ofsxhKflgW89xHzBO_SIQAafEYuM",
  authDomain: "todolistproject-12d90.firebaseapp.com",
  projectId: "todolistproject-12d90",
  storageBucket: "todolistproject-12d90.appspot.com",
  messagingSenderId: "660159921804",
  appId: "1:660159921804:web:c2529000951b366ba385a9",
  measurementId: "G-9QEWPBB0PM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Optional: Analytics (chỉ chạy trên client)
export const analytics = (async () =>
  (await isSupported()) ? getAnalytics(app) : null
)();

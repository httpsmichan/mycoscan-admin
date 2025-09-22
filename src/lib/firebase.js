import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBfGeFzAxLyi41M1zI7p3x1rxPbVtxoVJ0",
  authDomain: "mycoscan-88afd.firebaseapp.com",
  projectId: "mycoscan-88afd",
  storageBucket: "mycoscan-88afd.firebasestorage.app",
  messagingSenderId: "820271155530",
  appId: "1:820271155530:web:d5cfaa0fde98d9b58119b3",
  measurementId: "G-LDVRXY1MYZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);
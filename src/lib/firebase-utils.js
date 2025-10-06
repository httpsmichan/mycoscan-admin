import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase"; // make sure path points to your firebase.js

export const getFirestoreUsersEmails = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  const emails = snapshot.docs.map(doc => doc.data().email);
  return emails;
};
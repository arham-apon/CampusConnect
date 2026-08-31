import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCRWFZyYMZ2VWSs1Brv6jduyXon2xQgWAQ",
  authDomain: "campusconnect-b3d99.firebaseapp.com",
  projectId: "campusconnect-b3d99",
  storageBucket: "campusconnect-b3d99.firebasestorage.app",
  messagingSenderId: "777923911362",
  appId: "1:777923911362:web:9a1328e712deabace3655b",
  measurementId: "G-NX8WER797Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Optional: Pass the required domain as a hint, though backend enforcement is required.
// googleProvider.setCustomParameters({
//   hd: 'iut-dhaka.edu'
// });

// Function to handle login
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
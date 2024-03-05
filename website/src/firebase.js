// Import the functions you need from the SDKs needed
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that are to be used
// https://firebase.google.com/docs/web/setup#available-libraries

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7U5BGazjmJ-JhKcXawyQ7pYDvIKfR3lA",
  authDomain: "rttm-authentication.firebaseapp.com",
  projectId: "rttm-authentication",
  storageBucket: "rttm-authentication.appspot.com",
  messagingSenderId: "422990141948",
  appId: "1:422990141948:web:6eefba0160d2159daf3a79"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app


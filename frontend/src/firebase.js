// Import the functions you need from the SDKs needed
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that are to be used
// https://firebase.google.com/docs/web/setup#available-libraries

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCrCLYyv-_FhUDl1qGanWrfc3UVmyzvuqQ",
  authDomain: "rttm-6b3f8.firebaseapp.com",
  projectId: "rttm-6b3f8",
  storageBucket: "rttm-6b3f8.appspot.com",
  messagingSenderId: "781554793736",
  appId: "1:781554793736:web:63302dc147073b1dd080bd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app


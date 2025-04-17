// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
//@ts-ignore
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2yvq7ujKdDCQR2J79_iiRPhk71mYVGIg",
  authDomain: "expense-tracker-app-80fd7.firebaseapp.com",
  projectId: "expense-tracker-app-80fd7",
  storageBucket: "expense-tracker-app-80fd7.firebasestorage.app",
  messagingSenderId: "848896156433",
  appId: "1:848896156433:web:54787487f5dae1b386e2b0"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// AUTH
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// DATABASE
export const firestore = getFirestore(app);

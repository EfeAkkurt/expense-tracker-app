// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTlxx-HivYqpduyuIQoyV3VLW5UB5xFQo",
  authDomain: "expense-tracker-4102a.firebaseapp.com",
  projectId: "expense-tracker-4102a",
  storageBucket: "expense-tracker-4102a.firebasestorage.app",
  messagingSenderId: "170110679425",
  appId: "1:170110679425:web:76763137695168d332d080",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// AUTH
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// DATA BASE
export const firestore = getFirestore(app);

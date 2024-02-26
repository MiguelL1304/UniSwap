import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "@firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";



const firebaseConfig = {
  apiKey: "AIzaSyDjDYjhPytestaOEYxirnQsvVUL4jcWrQ8",
  authDomain: "uniswap-e14c1.firebaseapp.com",
  databaseURL: "https://uniswap-e14c1-default-rtdb.firebaseio.com",
  projectId: "uniswap-e14c1",
  storageBucket: "uniswap-e14c1.appspot.com",
  messagingSenderId: "515683420215",
  appId: "1:515683420215:web:39189f0a17497775b197b2",
  measurementId: "G-L1XZP18FBF",
};

// Initialize Firebase and Auth
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});


//Initialize Firestore DB
const firestoreDB = getFirestore();


export { app, auth, firestoreDB };
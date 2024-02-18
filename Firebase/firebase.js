import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDjDYjhPytestaOEYxirnQsvVUL4jcWrQ8",
  authDomain: "uniswap-e14c1.firebaseapp.com",
  databaseURL: "https://uniswap-e14c1-default-rtdb.firebaseio.com",
  projectId: "uniswap-e14c1",
  storageBucket: "uniswap-e14c1.appspot.com",
  messagingSenderId: "515683420215",
  appId: "1:515683420215:web:39189f0a17497775b197b2",
  measurementId: "G-L1XZP18FBF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestoreDB = getFirestore(app);

export { app, auth, firestoreDB };
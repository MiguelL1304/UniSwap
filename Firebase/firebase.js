import * as firebase from 'firebase';
const firebaseConfig = {
    apiKey: "AIzaSyDjDYjhPytestaOEYxirnQsvVUL4jcWrQ8",
    authDomain: "uniswap-e14c1.firebaseapp.com",
    projectId: "uniswap-e14c1",
    storageBucket: "uniswap-e14c1.appspot.com",
    messagingSenderId: "515683420215",
    appId: "1:515683420215:web:07f4343885c11646b197b2",
    measurementId: "G-XZZWB8894W"
}
if(!firebase.apps.lenght) {
    firebase.initializeApp(firebaseConfig);
}
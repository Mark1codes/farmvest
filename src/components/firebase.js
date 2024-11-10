// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDVO9sWCVv8J5G_zh_F-df704Bnd5sP2S8",
    authDomain: "testapp-d2a6a.firebaseapp.com",
    databaseURL: "https://testapp-d2a6a-default-rtdb.firebaseio.com",
    projectId: "testapp-d2a6a",
    storageBucket: "testapp-d2a6a.appspot.com",
    messagingSenderId: "690113866900",
    appId: "1:690113866900:web:aa25a6b3eb055f5f6fd881"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const db=getFirestore(app);
export default app;
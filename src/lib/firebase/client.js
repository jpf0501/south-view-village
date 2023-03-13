// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore'
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCB5npYpUEaL-BT09wyRLA2oLrFJVhLtVs",
  authDomain: "svh3-web.firebaseapp.com",
  projectId: "svh3-web",
  storageBucket: "svh3-web.appspot.com",
  messagingSenderId: "786381408399",
  appId: "1:786381408399:web:8d952acc082fdf81b188fa"
};
// const firebaseConfig = {
//   apiKey: "AIzaSyDIB6mqjKQU2DOFye4Rdtv-Gm0wj692JD0",
//   authDomain: "svh3-web2.firebaseapp.com",
//   projectId: "svh3-web2",
//   storageBucket: "svh3-web2.appspot.com",
//   messagingSenderId: "940973422693",
//   appId: "1:940973422693:web:fd7c96fb5aeeab03696e8c"
// };

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
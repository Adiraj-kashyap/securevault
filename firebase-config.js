// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkl7lrIkhfW3DW2mfq8_VvczpczY0_kUc",
  authDomain: "s3curevau1t.firebaseapp.com",
  projectId: "s3curevau1t",
  storageBucket: "s3curevau1t.firebasestorage.app",
  messagingSenderId: "635634325549",
  appId: "1:635634325549:web:120edbddc22ce0698d40a4",
  measurementId: "G-XS2B3Q8330"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
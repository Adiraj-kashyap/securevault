// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkl7lrIkhfW3DW2mfq8_VvczpczY0_kUc",
  authDomain: "s3curevau1t.firebaseapp.com",
  projectId: "s3curevau1t",
  storageBucket: "s3curevau1t.appspot.com",
  messagingSenderId: "635634325549",
  appId: "1:635634325549:web:120edbddc22ce0698d40a4",
  measurementId: "G-XS2B3Q8330",
  databaseURL: "https://s3curevau1t-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

/*
Firebase Realtime Database Security Rules:

{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "messages": {
      "$chatId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "chats": {
      "$chatId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}

These rules allow:
1. Users to read and write only their own user data
2. Any authenticated user to read and write to messages and chats
3. No unauthenticated access to any data
*/

// Store Firebase Auth in `window` to use globally
window.firebaseAuth = firebase.auth();

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyDub9gSTypmqEyd1AbipXwRvfswsq-x_hg",
    authDomain: "s3curevault-01.firebaseapp.com",
    projectId: "s3curevault-01",
    storageBucket: "s3curevault-01.firebasestorage.app",
    messagingSenderId: "890403856763",
    appId: "1:890403856763:web:166d338716aabf74bb9dde"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testBackendSync() {
    try {
        console.log("Authenticating with Firebase...");
        // Use the test credentials previously established or create a new one manually if this fails
        const userCredential = await signInWithEmailAndPassword(auth, "test@securevault.com", "TestPassword123!");
        const token = await userCredential.user.getIdToken();
        
        console.log("Got Firebase Token. Sending to MongoDB Express Backend...");
        
        const response = await fetch('http://localhost:5000/api/auth/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                passwordHash: 'test-hash',
                publicKey: 'test-pub-key',
                encryptedPrivateKey: 'test-enc-priv-key',
                salt: 'test-salt'
            })
        });
        
        const data = await response.json();
        console.log("Backend Response:", response.status, data);
        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error.message || error);
        process.exit(1);
    }
}

testBackendSync();

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const axios = require('axios');

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

const BASE_URL = 'http://localhost:5000/api';
let TOKEN = null;
let USER_EMAIL = "test@securevault.com";
let USER_TAGLINE = null;
let FOLDER_ID = null;

async function runTests() {
    try {
        console.log("=== SECUREVAULT BACKEND TESTS ===");
        console.log("\n[1] AUTHENTICATING...");
        let userCredential;
        try {
            userCredential = await signInWithEmailAndPassword(auth, USER_EMAIL, "TestPassword123!");
        } catch (e) {
            if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found') {
                console.log("    -> User not found. Registering...");
                const { createUserWithEmailAndPassword } = require('firebase/auth');
                userCredential = await createUserWithEmailAndPassword(auth, USER_EMAIL, "TestPassword123!");
            } else {
                throw e;
            }
        }
        TOKEN = await userCredential.user.getIdToken();
        console.log("✅ Authenticated successfully.");

        console.log("\n[2] AUTH ENDPOINTS TEST...");
        const syncRes = await fetch(`${BASE_URL}/auth/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                passwordHash: 'test-hash',
                publicKey: 'test-pub-key',
                encryptedPrivateKey: 'test-enc-priv-key',
                salt: 'test-salt'
            })
        });
        if (!syncRes.ok) throw new Error(`Sync Failed: ${await syncRes.text()}`);
        const syncData = await syncRes.json();
        USER_TAGLINE = syncData.tagline;
        console.log(`✅ Auth Sync successful. Tagline: ${USER_TAGLINE}`);

        const prefRes = await fetch(`${BASE_URL}/auth/preferences`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        if (!prefRes.ok) throw new Error(`Preferences Fetch Failed: ${await prefRes.text()}`);
        console.log("✅ Preferences Fetch successful.");


        console.log("\n[3] STORAGE ENDPOINTS TEST...");
        const statsRes = await fetch(`${BASE_URL}/storage/stats`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        if (!statsRes.ok) throw new Error(`Stats Fetch Failed: ${await statsRes.text()}`);
        console.log("✅ Storage Stats successful.");

        const dirRes = await fetch(`${BASE_URL}/storage/directory`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        if (!dirRes.ok) throw new Error(`Directory Fetch Failed: ${await dirRes.text()}`);
        console.log("✅ Root Directory Fetch successful.");

        const folderRes = await fetch(`${BASE_URL}/storage/folder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
            body: JSON.stringify({ name: "Test_Folder_" + Date.now(), colorTheme: "sapphire" })
        });
        if (!folderRes.ok) throw new Error(`Create Folder Failed: ${await folderRes.text()}`);
        const folderData = await folderRes.json();
        FOLDER_ID = folderData._id;
        console.log(`✅ Create Folder successful. Folder ID: ${FOLDER_ID}`);

        const filePath = path.join(__dirname, 'test-upload.txt');
        fs.writeFileSync(filePath, "This is a test file to verify storage and compression functionalities.");
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        form.append('folderId', FOLDER_ID);
        form.append('originalName', "Encrypted_Test_File.txt");
        form.append('encryptedKey', "dummy_key");

        const uploadRes = await axios.post(`${BASE_URL}/storage/file`, form, {
            headers: { 'Authorization': `Bearer ${TOKEN}`, ...form.getHeaders() }
        });
        console.log("✅ File Upload successful.");
        fs.unlinkSync(filePath);


        console.log("\n[4] MAIL ENDPOINTS TEST...");
        const sendMailRes = await fetch(`${BASE_URL}/mail/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
            body: JSON.stringify({
                receiverTagline: USER_TAGLINE,
                encryptedSubject: "Test Subject",
                encryptedBody: "Test Body",
                attachments: []
            })
        });
        if (!sendMailRes.ok) throw new Error(`Send Mail Failed: ${await sendMailRes.text()}`);
        console.log("✅ Send Mail successful.");

        const sentRes = await fetch(`${BASE_URL}/mail/sent`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        if (!sentRes.ok) throw new Error(`Fetch Sent Mail Failed: ${await sentRes.text()}`);
        console.log("✅ Fetch Sent Mails successful.");

        const inboxRes = await fetch(`${BASE_URL}/mail/inbox`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        if (!inboxRes.ok) throw new Error(`Fetch Inbox Failed: ${await inboxRes.text()}`);
        const inboxData = await inboxRes.json();
        console.log(`✅ Fetch Inbox successful. Mails count: ${inboxData.length}`);

        if (inboxData.length > 0) {
            const mailId = inboxData[0]._id;
            const readRes = await fetch(`${BASE_URL}/mail/${mailId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            });
            if (!readRes.ok) throw new Error(`Mark Read Failed: ${await readRes.text()}`);
            console.log("✅ Mark Mail Read successful.");
        }

        console.log("\n✅ ALL TESTS PASSED SUCCESSFULLY!");
        process.exit(0);

    } catch (error) {
        console.error("\n❌ TESTS FAILED:", error.message || error);
        process.exit(1);
    }
}

runTests();

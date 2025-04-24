const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin"); // Firebase Admin SDK
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
// Configure CORS to allow requests from any origin when deployed
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.static(path.join(__dirname, "public")));

// Firebase initialization
try {
  const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString("utf-8"));
  //  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://s3curevau1t-default-rtdb.firebaseio.com",
  });
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  process.exit(1); // Exit if Firebase can't be initialized
}

const db = admin.database(); // Reference to the Firebase Realtime Database

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Redirect root URL to index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API Endpoints
// Passwords
app.get("/passwords/:email", async (req, res) => {
  try {
    const { email } = req.params;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: "Invalid email parameter" });
    }
    
    const searchTerm = req.query.searchTerm || "";
    
    const snapshot = await db
      .ref("passwords")
      .orderByChild("user_email")
      .equalTo(email)
      .once("value");
      
    let passwords = [];
    snapshot.forEach((childSnapshot) => {
      const password = childSnapshot.val();
      if (
        !searchTerm ||
        password.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        password.username.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        passwords.push({ ...password, id: childSnapshot.key });
      }
    });
    
    res.json(passwords);
  } catch (error) {
    console.error("Error fetching passwords:", error);
    res.status(500).json({ error: error.message || "Failed to fetch passwords" });
  }
});

app.post("/passwords", async (req, res) => {
  try {
    const { user_email, siteName, username, password } = req.body;
    
    // Validate required fields
    if (!user_email || !siteName || !username || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const newPasswordRef = await db
      .ref("passwords")
      .push({ user_email, siteName, username, password });
      
    res.status(201).json({ id: newPasswordRef.key });
  } catch (error) {
    console.error("Error creating password:", error);
    res.status(500).json({ error: error.message || "Failed to create password" });
  }
});

app.put("/passwords/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Invalid ID parameter" });
    }
    
    const { siteName, username, password } = req.body;
    
    // Validate required fields
    if (!siteName || !username || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Check if password exists
    const snapshot = await db.ref(`passwords/${id}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Password not found" });
    }
    
    await db.ref(`passwords/${id}`).update({ siteName, username, password });
    res.json({ success: true, id });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: error.message || "Failed to update password" });
  }
});

app.delete("/passwords/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Invalid ID parameter" });
    }
    
    // Check if password exists
    const snapshot = await db.ref(`passwords/${id}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Password not found" });
    }
    
    await db.ref(`passwords/${id}`).remove();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting password:", error);
    res.status(500).json({ error: error.message || "Failed to delete password" });
  }
});

// Messages part starts here
// Create Chat Endpoint
app.post("/chats", async (req, res) => {
  try {
    const { user_email } = req.body;
    
    // Validate required fields
    if (!user_email) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Generate a random 6-digit chat ID
    const chat_id = generateChatId();
    
    // Create chat data
    const chatData = {
      created_by: user_email,
      created_at: admin.database.ServerValue.TIMESTAMP,
      participants: [user_email]
    };
    
    // Save to database
    await db.ref(`chats/${chat_id}`).set(chatData);
    
    res.status(201).json({ chat_id });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: error.message || "Failed to create chat" });
  }
});

// Get Chat Endpoint
app.get("/chats/:chat_id", async (req, res) => {
  try {
    const { chat_id } = req.params;
    
    // Validate chat ID
    if (!chat_id || chat_id.length !== 6) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }
    
    // Check if chat exists
    const snapshot = await db.ref(`chats/${chat_id}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Chat not found" });
    }
    
    res.json({ chat_id, ...snapshot.val() });
  } catch (error) {
    console.error("Error getting chat:", error);
    res.status(500).json({ error: error.message || "Failed to get chat" });
  }
});

// Send Message Endpoint
app.post("/messages", async (req, res) => {
  try {
    const { chat_id, sender, content, encrypted, selfDestruct, destructAt } = req.body;
    
    // Validate required fields
    if (!chat_id || !sender || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Check if chat exists
    const chatSnapshot = await db.ref(`chats/${chat_id}`).once("value");
    if (!chatSnapshot.exists()) {
      return res.status(404).json({ error: "Chat not found" });
    }
    
    // Create message data
    const messageData = {
      sender,
      content,
      timestamp: admin.database.ServerValue.TIMESTAMP
    };
    
    // Add encryption flag if message is encrypted
    if (encrypted) {
      messageData.encrypted = true;
    }
    
    // Add self-destruct properties if enabled
    if (selfDestruct && destructAt) {
      messageData.selfDestruct = true;
      messageData.destructAt = destructAt;
    }
    
    const newMessageRef = await db.ref(`messages/${chat_id}`).push(messageData);
    
    res.status(201).json({ id: newMessageRef.key });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: error.message || "Failed to send message" });
  }
});

// Load Messages Endpoint (for initial load)
app.get("/messages/:chat_id", async (req, res) => {
  try {
    const { chat_id } = req.params;
    if (!chat_id) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }
    
    // Check if chat exists
    const chatSnapshot = await db.ref(`chats/${chat_id}`).once("value");
    if (!chatSnapshot.exists()) {
      return res.status(404).json({ error: "Chat not found" });
    }
    
    const snapshot = await db
      .ref(`messages/${chat_id}`)
      .orderByChild("timestamp")
      .limitToLast(50)
      .once("value");
      
    let messages = [];
    const currentTime = Date.now();
    
    snapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val();
      
      // Skip self-destructed messages
      if (message.selfDestruct && message.destructAt && message.destructAt < currentTime) {
        // Delete the message from the database
        db.ref(`messages/${chat_id}/${childSnapshot.key}`).remove()
          .catch(error => console.error("Error removing self-destructed message:", error));
        return;
      }
      
      messages.push({ id: childSnapshot.key, ...message });
    });
    
    res.json(messages);
  } catch (error) {
    console.error("Error loading messages:", error);
    res.status(500).json({ error: error.message || "Failed to load messages" });
  }
});

// Generate a random 6-digit code for chat IDs
function generateChatId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

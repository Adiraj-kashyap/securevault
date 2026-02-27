# SecureVault: The Ultimate Zero-Knowledge Platform

## 1. Project Vision
SecureVault transcends traditional cloud storage and messaging. It is a commercially viable, ultra-secure ecosystem designed for users who demand absolute privacy. Everything uploaded—files, folders, PDFs, Word documents, Excel sheets, pictures, videos, and real-time messages—is protected by **PGP-style Zero-Knowledge Architecture (AES-256 + RSA-2048)**. We never see the user's data; we only store encrypted blobs.

## 2. Core Architecture
The platform is built on a modern, high-performance stack utilizing a **Hybrid Database Approach** to infinitely scale without bottlenecking server load.

*   **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS v4, Framer Motion.
    *   *Why Next.js?* Provides robust routing, seamless API integrations, and optimal performance while ensuring all sensitive cryptographic operations explicitly happen client-side (`"use client"`).
*   **Backend API**: Node.js + Express.
*   **Database (Heavy Lifting)**: MongoDB (via Mongoose). Stores user metadata, encrypted Public/Private RSA keys, and handles chunked blob streaming for file storage.
*   **Database (Real-Time)**: Firebase Realtime Database. Dedicated *exclusively* to the secure messaging system to ensure instant, on-point delivery without querying the main MongoDB instance.

## 3. Cryptography Engine (Zero-Knowledge)
*   **No Server-Side Keys**: The server only stores the *Public Key* and an *AES-Encrypted Private Key*.
*   **Master Password Derivation**: The user's Master Password never leaves the browser. It is salted and hashed using `PBKDF2` (100,000 iterations) via `crypto-js` to locally derive the AES decryption key.
*   **The PGP Cycle**: 
    1.  When a user uploads a file, the browser generates a random, one-time AES-256 key.
    2.  The file is encrypted with this AES key.
    3.  The AES key is then encrypted with the recipient's Public RSA Key.
    4.  Only the recipient (using their locally decrypted Private RSA Key) can unwrap the AES key to decrypt the file.

## 4. The 3-Tier Storage System
To optimize server weight and user experience, files are managed via a 3-tier system:
*   **Level 1 (Hot Storage)**: Instantaneous access. Files are AES-encrypted but *not* compressed. Ideal for everyday use cases (passwords, small PDFs, images).
*   **Level 2 (Warm Storage)**: Standard archiving. Files undergo standard `zlib`/`gzip` compression streams *before* encryption. Takes slightly longer to fetch and decompress but saves significant database weight.
*   **Level 3 (Cold Ultimate Archive)**: Designed for massive folder structures or video archives. Files are packed and aggressively compressed using high-ratio algorithms (e.g., LZMA), then AES encrypted. Fetching requires dedicated processing time, mimicking AWS Glacier.

## 5. UI/UX Design Aesthetics
The visual identity of SecureVault is designed to look incredibly premium, sophisticated, and trustworthy.
*   **The 60-30-10 Golden Ratio**: The platform uses a dynamic 5-shade color palette across 5 user-selectable themes (Golden Vault, Emerald Cipher, Sapphire Shield, Amethyst Core, Ruby Protocol). 
*   **Glassmorphism**: Heavy use of backdrop blurring (`backdrop-blur-xl`), translucent borders, and deep layered lighting (`glow-text`, `.glass-card`) to create a futuristic, physical feel.
*   **Micro-Animations**: Every interaction (hovering a card, submitting a form, toggling auth states) is animated using Framer Motion to prevent a "headache-inducing" rigid UI and ensure a smooth, engaging flow.

---

## 6. Current Progress
*   [x] **Phase 1: Planning & Setup**
    *   Next.js scaffolded, MongoDB Compass connected, Firebase Admin initialized.
*   [x] **Phase 2: Cryptography Foundation**
    *   `crypto.ts` built utilizing `node-forge` and `crypto-js`. 
    *   RSA generation and AES derivation functional in-browser.
*   [x] **Phase 3: Frontend Modernization**
    *   Landing Page, Dashboard, and Auth routes built.
    *   Dynamic Theme Provider integrated securely.
    *   Auth frontend wired directly to the MongoDB backend to register encrypted keys.
*   [ ] **Phase 4: Backend File Routing & Compression (In Progress)**
    *   Setting up `multer` and `GridFS` in MongoDB to handle the Hot, Warm, and Cold streams.
*   [ ] **Phase 5: Messaging & Polish**
    *   Wiring the Firebase WebSockets to the Dashboard.

---

## 7. Future Expansions & Ideas to Develop
To truly make this the "Ultimate SecureVault", here are advanced features we can build upon the current foundation:

1.  **Steganography (Hidden Volumes)**: Allow users to hide an encrypted vault *inside* an innocuous image or media file. The vault only extracts if the correct Master Password targets that specific file.
2.  **Self-Destruct Mechanisms (Dead Man's Switch)**: If a user doesn't log in for X amount of time (e.g., 6 months), automatically purge their encrypted blobs from MongoDB, or automatically transfer the keys to a designated "Next of Kin" emergency contact.
3.  **Burn-After-Reading Messaging**: Secure messages that securely delete their encrypted Firebase node the second the decryption happens on the recipient's screen.
4.  **Hardware Key Support**: Integrate WebAuthn (Yubikey, Fingerprint) to require a physical hardware token *in addition* to the Master Password before the local browser will execute the RSA decryption sequence.
5.  **Browser Extension**: A companion Chrome extension that can autofill passwords decrypted directly from the Hot Storage API, ensuring SecureVault completely replaces LastPass/1Password.
6.  **Immutable Access Logs**: Cryptographically sign every read/write action and display it to the user so they mathematically know if anyone (even the server admin) attempted to fetch their blobs.

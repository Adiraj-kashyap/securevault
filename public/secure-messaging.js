document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    const securityCodeForm = document.getElementById("securityCodeForm");
    const chatWindow = document.getElementById("chatWindow");
    const enterChatBtn = document.getElementById("enterChatBtn");
    const messageForm = document.getElementById("messageForm");
    const messageInput = document.getElementById("messageInput");
    const messageList = document.getElementById("messageList");
    const logoutBtn = document.getElementById("logoutBtn");
    const generateChatBtn = document.getElementById("generateChatBtn");
    const chatCodeDisplay = document.getElementById("chatCodeDisplay");
    const goBackBtn = document.getElementById("GoBack");
    const statusMessage = document.getElementById("statusMessage");
    const selfDestructToggle = document.getElementById("selfDestructToggle");
    const selfDestructTime = document.getElementById("selfDestructTime");
    let currentChatId = null;
    let messagePollingInterval = null;
    let encryptionKey = null;
  
    if (!checkAuth()) {
        return;
    }
  
    const db = firebase.database();
    const auth = firebase.auth();
    const session = JSON.parse(localStorage.getItem("session"));
    if (!session || !session.email) {
        showStatus("Session expired. Please login again.", "error");
        setTimeout(() => {
            logout();
        }, 2000);
        return;
    }
    
    const currentUser = auth.currentUser || { email: session.email, uid: session.uid };
  
    // Check for existing chat session
    const savedChatId = localStorage.getItem('currentChatId');
    if (savedChatId) {
        currentChatId = savedChatId;
        const savedKey = localStorage.getItem(`encryptionKey_${savedChatId}`);
        if (savedKey) {
            encryptionKey = savedKey;
            displayChatCode(savedChatId);
            securityCodeForm.style.display = "none";
            chatWindow.style.display = "block";
            startMessagePolling();
        }
    }
  
    function displayChatCode(code) {
        chatCodeDisplay.textContent = `Chat Code: ${code}`;
        chatCodeDisplay.style.display = "block";
    }
  
    generateChatBtn.addEventListener("click", async () => {
        if (!session || !session.email) {
            showStatus("Session expired. Please login again.", "error");
            logout();
            return;
        }
  
        const email = session.email;
        
        generateChatBtn.disabled = true;
        generateChatBtn.textContent = "Creating chat...";
        
        try {
            showStatus("Creating new secure chat...", "info");
            
            encryptionKey = generateEncryptionKey();
            
            const response = await fetch("/chats", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_email: email }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            currentChatId = data.chat_id;
            
            // Store encryption key locally instead of in Firebase
            localStorage.setItem('currentChatId', currentChatId);
            localStorage.setItem(`encryptionKey_${currentChatId}`, encryptionKey);
            
            displayChatCode(currentChatId);
            securityCodeForm.style.display = "none";
            chatWindow.style.display = "block";
            
            showStatus("Chat created successfully! Share the code with others to join.", "success");
            startMessagePolling();
        } catch (error) {
            console.error("Failed to create chat:", error);
            showStatus("Failed to create chat. Please try again.", "error");
        } finally {
            generateChatBtn.disabled = false;
            generateChatBtn.textContent = "Generate New Chat";
        }
    });
  
    enterChatBtn.addEventListener("click", async () => {
        const securityCode = document.getElementById("securityCode").value.trim();
        if (securityCode.length !== 6) {
            showStatus("Please enter a valid 6-digit security code.", "error");
            return;
        }
        
        enterChatBtn.disabled = true;
        enterChatBtn.textContent = "Joining...";
        
        try {
            showStatus("Joining chat...", "info");
            const response = await fetch(
                `/chats/${securityCode}`
            );
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Chat not found. Please check the code and try again.");
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            currentChatId = data.chat_id;
            
            // Check if we already have the encryption key
            const storedKey = localStorage.getItem(`encryptionKey_${currentChatId}`);
            if (storedKey) {
                encryptionKey = storedKey;
            } else {
                // Ask user for encryption key
                const userKey = prompt("Please enter the encryption key shared by the chat creator:");
                if (!userKey) {
                    throw new Error("Encryption key is required to join the chat.");
                }
                encryptionKey = userKey;
                localStorage.setItem(`encryptionKey_${currentChatId}`, encryptionKey);
            }
            
            localStorage.setItem('currentChatId', currentChatId);
            displayChatCode(currentChatId);
            securityCodeForm.style.display = "none";
            chatWindow.style.display = "block";
            
            showStatus("Joined chat successfully!", "success");
            startMessagePolling();
        } catch (error) {
            console.error("Failed to join chat:", error);
            showStatus(error.message || "Failed to join chat. Please try again.", "error");
        } finally {
            enterChatBtn.disabled = false;
            enterChatBtn.textContent = "Enter Chat";
        }
    });
  
    messageForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (!message) return;
        
        const submitBtn = messageForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        
        try {
            const selfDestruct = selfDestructToggle && selfDestructToggle.checked;
            const destructTime = selfDestruct ? parseInt(selfDestructTime.value) * 60 * 1000 : null;
            const destructAt = selfDestruct ? Date.now() + destructTime : null;
            
            await sendMessage(message, selfDestruct, destructAt);
            messageInput.value = "";
            await loadMessages();
        } catch (error) {
            console.error("Failed to send message:", error);
            showStatus("Failed to send message: " + error.message, "error");
        } finally {
            submitBtn.disabled = false;
        }
    });
  
    logoutBtn.addEventListener("click", () => {
        stopMessagePolling();
        logout();
    });
  
    if (goBackBtn) {
        goBackBtn.addEventListener("click", () => {
            loadMessages();
        });
    }
  
    document.querySelector('#leaveChatBtn').addEventListener('click', function() {
        stopMessagePolling();
        localStorage.removeItem('currentChatId');
        localStorage.removeItem(`encryptionKey_${currentChatId}`);
        securityCodeForm.style.display = "block";
        chatWindow.style.display = "none";
        chatCodeDisplay.style.display = "none";
        currentChatId = null;
        showStatus("Left the chat successfully", "info");
    });
  
    async function sendMessage(content, selfDestruct = false, destructAt = null) {
        if (!session || !session.email) {
            throw new Error("Session expired. Please login again.");
        }
        
        if (!currentChatId) {
            throw new Error("No active chat. Please create or join a chat first.");
        }
        
        if (!encryptionKey) {
            throw new Error("Encryption key not found. Please rejoin the chat.");
        }
        
        try {
            const encryptedContent = encryptMessage(content, encryptionKey);
            
            const messageData = {
                chat_id: currentChatId,
                sender: session.email,
                content: encryptedContent,
                encrypted: true
            };
            
            if (selfDestruct && destructAt) {
                messageData.selfDestruct = true;
                messageData.destructAt = destructAt;
            }
            
            const response = await fetch("/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(messageData),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error("Failed to send message:", error);
            throw error;
        }
    }
  
    async function loadMessages() {
        if (!currentChatId) return;
        
        try {
            const response = await fetch(
                `/messages/${currentChatId}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            let messages = await response.json();
            
            const currentTime = Date.now();
            messages = messages.filter(message => {
                if (message.selfDestruct && message.destructAt && message.destructAt < currentTime) {
                    db.ref(`messages/${currentChatId}/${message.id}`).remove()
                      .catch(error => console.error("Error removing self-destructed message:", error));
                    return false;
                }
                return true;
            }).map(message => {
                if (message.encrypted && encryptionKey) {
                    try {
                        message.content = decryptMessage(message.content, encryptionKey);
                        message.decrypted = true;
                    } catch (error) {
                        console.error("Failed to decrypt message:", error);
                        message.content = "[Encrypted message - unable to decrypt]";
                        message.decryptionFailed = true;
                    }
                }
                return message;
            });
            
            renderMessages(messages);
        } catch (error) {
            console.error("Failed to load messages:", error);
            showStatus("Failed to load messages. Please try again.", "error");
        }
    }
  
    function renderMessages(messages) {
        // Store current scroll position
        const scrollPos = messageList.scrollTop;
        const wasAtBottom = (messageList.scrollHeight - messageList.clientHeight - scrollPos) < 20;
        
        // Instead of clearing the entire message list, we'll do a diff-based update
        const existingMessages = Array.from(messageList.querySelectorAll('.message')).map(el => {
            const id = el.getAttribute('data-message-id');
            return { id, element: el };
        });
        
        // If the message list is empty, handle it specially
        if (messages.length === 0) {
            messageList.innerHTML = "";
            const emptyMessage = document.createElement("div");
            emptyMessage.className = "empty-message";
            emptyMessage.innerHTML = `
                <p>No messages yet. Start the conversation!</p>
            `;
            messageList.appendChild(emptyMessage);
            return;
        }
        
        // Get user session for determining current user
        const session = JSON.parse(localStorage.getItem("session"));
        
        // Create a map of existing message elements by ID
        const existingMessageMap = new Map(existingMessages.map(m => [m.id, m.element]));
        
        // Create a document fragment to hold new messages
        const fragment = document.createDocumentFragment();
        let hasNewMessages = false;
        
        // Process each message
        messages.forEach((m) => {
            // Skip if this message already exists in the DOM
            if (existingMessageMap.has(m.id)) {
                // Update self-destruct timer if needed
                if (m.selfDestruct && m.destructAt) {
                    const timer = existingMessageMap.get(m.id).querySelector('.self-destruct-timer');
                    if (timer) {
                        timer.setAttribute('data-destruct-at', m.destructAt);
                    }
                }
                return;
            }
            
            hasNewMessages = true;
            
            // Create new message element
            const messageElement = document.createElement("div");
            const isCurrentUser = m.sender === session.email;
            messageElement.className = `message ${isCurrentUser ? "sent" : "received"}`;
            messageElement.setAttribute('data-message-id', m.id);
            
            // Generate avatar for the message sender
            const senderInitial = m.sender.charAt(0).toUpperCase();
            const avatarColors = [
                '#4f46e5', '#10b981', '#ef4444', '#f59e0b', '#3b82f6', 
                '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1'
            ];
            // Generate consistent color based on email
            const colorIndex = m.sender.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length;
            const avatarColor = avatarColors[colorIndex];
            
            const timestamp = new Date(m.timestamp);
            const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            let selfDestructInfo = "";
            if (m.selfDestruct && m.destructAt) {
                const timeLeft = Math.max(0, Math.floor((m.destructAt - Date.now()) / 1000));
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                selfDestructInfo = `<div class="self-destruct-timer" data-destruct-at="${m.destructAt}">
                    <i data-lucide="timer"></i> Self-destructs in ${minutes}:${seconds.toString().padStart(2, '0')}
                </div>`;
            }
            
            let securityInfo = "";
            if (m.decrypted) {
                securityInfo = `<i data-lucide="lock" class="encryption-icon" title="End-to-end encrypted"></i>`;
            } else if (m.decryptionFailed) {
                securityInfo = `<i data-lucide="lock-open" class="encryption-icon failed" title="Failed to decrypt"></i>`;
            }
            
            // Add avatar to the message
            const avatarHtml = `
                <div class="message-avatar" style="background-color: ${avatarColor};">
                    ${senderInitial}
                </div>
            `;
            
            messageElement.innerHTML = `
                ${!isCurrentUser ? avatarHtml : ''}
                <div class="message-content-wrapper">
                    <div class="message-content">${escapeHtml(m.content)}</div>
                    <div class="message-meta">
                        <span class="message-sender">${isCurrentUser ? 'You' : escapeHtml(m.sender.split('@')[0])}</span>
                        <span class="message-time">${timeString} ${securityInfo}</span>
                    </div>
                    ${selfDestructInfo}
                </div>
                ${isCurrentUser ? avatarHtml : ''}
            `;
            
            fragment.appendChild(messageElement);
        });
        
        // Only append new messages if there are any
        if (hasNewMessages) {
            messageList.appendChild(fragment);
        }
        
        // Update self-destruct timers
        updateSelfDestructTimers();
        
        // Restore scroll position or scroll to bottom if was at bottom
        if (wasAtBottom) {
            messageList.scrollTop = messageList.scrollHeight;
        } else {
            messageList.scrollTop = scrollPos;
        }
        
        // Create icons
        lucide.createIcons();
    }
  
    function updateSelfDestructTimers() {
        const timers = document.querySelectorAll('.self-destruct-timer');
        timers.forEach(timer => {
            const destructAt = parseInt(timer.getAttribute('data-destruct-at'));
            const updateTimer = () => {
                const timeLeft = Math.max(0, Math.floor((destructAt - Date.now()) / 1000));
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timer.innerHTML = `<i data-lucide="timer"></i> Self-destructs in ${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                lucide.createIcons({
                    icons: {
                        timer: true
                    },
                    root: timer
                });
                
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    loadMessages();
                }
            };
            
            updateTimer();
            const timerInterval = setInterval(updateTimer, 1000);
        });
    }
  
    function startMessagePolling() {
        stopMessagePolling();
        
        loadMessages();
        
        // Reduce polling frequency to reduce blinking effect
        messagePollingInterval = setInterval(() => {
            loadMessages();
        }, 5000); // Changed from 3000 to 5000 ms
    }
  
    function stopMessagePolling() {
        if (messagePollingInterval) {
            clearInterval(messagePollingInterval);
            messagePollingInterval = null;
        }
    }
  
    function showStatus(message, type = "info") {
        if (!statusMessage) return;
        
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = "block";
        
        setTimeout(() => {
            statusMessage.style.display = "none";
        }, 3000);
    }
  
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
  
    function generateEncryptionKey() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        let key = "";
        for (let i = 0; i < 32; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return key;
    }
  
    function encryptKey(key) {
        return btoa(key);
    }
  
    function encryptMessage(message, key) {
        try {
            const encrypted = CryptoJS.AES.encrypt(message, key).toString();
            return encrypted;
        } catch (error) {
            console.error("Encryption error:", error);
            return message;
        }
    }
  
    function decryptMessage(encryptedMessage, key) {
        try {
            const decrypted = CryptoJS.AES.decrypt(encryptedMessage, key).toString(CryptoJS.enc.Utf8);
            return decrypted;
        } catch (error) {
            console.error("Decryption error:", error);
            throw new Error("Failed to decrypt message");
        }
    }
  
    if (!selfDestructToggle) {
        const messageFormContainer = document.getElementById("messageForm");
        const selfDestructContainer = document.createElement("div");
        selfDestructContainer.className = "self-destruct-container";
        selfDestructContainer.innerHTML = `
            <label class="self-destruct-label">
                <input type="checkbox" id="selfDestructToggle">
                <span>Self-destruct</span>
            </label>
            <select id="selfDestructTime">
                <option value="1">1 min</option>
                <option value="5">5 min</option>
                <option value="10">10 min</option>
                <option value="30">30 min</option>
                <option value="60">1 hour</option>
            </select>
        `;
        
        const sendButton = messageFormContainer.querySelector("button[type='submit']");
        messageFormContainer.insertBefore(selfDestructContainer, sendButton);
    }
  });
  
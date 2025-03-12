document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

    // Check if user is authenticated
    if (!checkAuth()) {
        return; // checkAuth will redirect to auth.html if not authenticated
    }

    // Get user session
    const session = JSON.parse(localStorage.getItem("session"));
    if (!session || !session.uid) {
        showStatus("Session invalid. Please login again.", "error");
        setTimeout(() => {
            logout();
        }, 2000);
        return;
    }
    
    // Initialize Firebase references
    const db = firebase.database();
    const auth = firebase.auth();
    const currentUser = auth.currentUser || { 
        email: session.email,
        uid: session.uid
    };

    // Handle side navigation
    const navItems = document.querySelectorAll('.settings-nav-item');
    
    // Check if there's a hash in the URL and scroll to that section
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                
                // Update active nav item
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${targetId}`) {
                        item.classList.add('active');
                    }
                });
            }, 100);
        }
    }
    
    // Add click event listeners to nav items
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Update active state
            navItems.forEach(navItem => navItem.classList.remove('active'));
            item.classList.add('active');
            
            // Smooth scroll to section
            const targetId = item.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, `#${targetId}`);
            }
        });
    });

    // DOM Elements
    const statusMessage = document.getElementById("statusMessage");
    const changeMasterPasswordBtn = document.getElementById("changeMasterPasswordBtn");
    const setup2FABtn = document.getElementById("setup2FABtn");
    const setupRecoveryBtn = document.getElementById("setupRecoveryBtn");
    const toggleBackupBtn = document.getElementById("toggleBackupBtn");
    const toggleSelfDestructBtn = document.getElementById("toggleSelfDestructBtn");
    const saveTimeoutBtn = document.getElementById("saveTimeoutBtn");
    const logoutAllBtn = document.getElementById("logoutAllBtn");
    const viewAllActivityBtn = document.getElementById("viewAllActivityBtn");
    
    // Modals
    const passwordModal = document.getElementById("passwordModal");
    const twoFAModal = document.getElementById("twoFAModal");
    const recoveryModal = document.getElementById("recoveryModal");
    
    // Modal buttons
    const cancelPasswordBtn = document.getElementById("cancelPasswordBtn");
    const cancelRecoveryBtn = document.getElementById("cancelRecoveryBtn");
    
    // Forms
    const changePasswordForm = document.getElementById("changePasswordForm");
    const recoveryForm = document.getElementById("recoveryForm");

    // Load user settings
    loadUserSettings();

    // Event Listeners
    changeMasterPasswordBtn.addEventListener("click", () => {
        passwordModal.style.display = "block";
        setupPasswordStrengthMeter();
    });

    setup2FABtn.addEventListener("click", () => {
        twoFAModal.style.display = "block";
    });

    setupRecoveryBtn.addEventListener("click", () => {
        recoveryModal.style.display = "block";
    });

    toggleBackupBtn.addEventListener("click", toggleAutoBackup);
    toggleSelfDestructBtn.addEventListener("click", toggleSelfDestruct);
    saveTimeoutBtn.addEventListener("click", saveSessionTimeout);
    logoutAllBtn.addEventListener("click", logoutAllDevices);
    viewAllActivityBtn.addEventListener("click", viewAllActivity);

    // Modal close buttons
    cancelPasswordBtn.addEventListener("click", () => {
        passwordModal.style.display = "none";
    });

    cancelRecoveryBtn.addEventListener("click", () => {
        recoveryModal.style.display = "none";
    });

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target === passwordModal) {
            passwordModal.style.display = "none";
        }
        if (e.target === twoFAModal) {
            twoFAModal.style.display = "none";
        }
        if (e.target === recoveryModal) {
            recoveryModal.style.display = "none";
        }
    });

    // Password toggle buttons
    document.querySelectorAll(".toggle-password").forEach(btn => {
        btn.addEventListener("click", function() {
            const targetId = this.getAttribute("data-for");
            const passwordInput = document.getElementById(targetId);
            const showIcon = this.querySelector(".show-password");
            const hideIcon = this.querySelector(".hide-password");

            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                showIcon.style.display = "none";
                hideIcon.style.display = "block";
            } else {
                passwordInput.type = "password";
                showIcon.style.display = "block";
                hideIcon.style.display = "none";
            }
        });
    });

    // 2FA setup navigation
    document.querySelectorAll(".next-step").forEach(btn => {
        btn.addEventListener("click", function() {
            const nextStepId = this.getAttribute("data-next");
            document.querySelector(".twofa-step.active").classList.remove("active");
            document.getElementById(nextStepId).classList.add("active");
        });
    });

    document.querySelectorAll(".prev-step").forEach(btn => {
        btn.addEventListener("click", function() {
            const prevStepId = this.getAttribute("data-prev");
            document.querySelector(".twofa-step.active").classList.remove("active");
            document.getElementById(prevStepId).classList.add("active");
        });
    });

    // 2FA verification
    document.getElementById("verify2FABtn").addEventListener("click", verify2FA);
    document.getElementById("complete2FABtn").addEventListener("click", () => {
        twoFAModal.style.display = "none";
        showStatus("Two-factor authentication has been enabled for your account.", "success");
        document.getElementById("2faStatus").textContent = "Enabled";
        document.getElementById("2faStatus").className = "settings-badge secure";
        setup2FABtn.textContent = "Manage 2FA";
        
        // Reset the 2FA setup flow for next time
        document.querySelector(".twofa-step.active").classList.remove("active");
        document.getElementById("step1").classList.add("active");
    });

    // Form submissions
    changePasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmNewPassword = document.getElementById("confirmNewPassword").value;
        
        if (newPassword !== confirmNewPassword) {
            showStatus("New passwords don't match!", "error");
            return;
        }
        
        const strength = checkPasswordStrength(newPassword);
        if (strength.level === "weak") {
            if (!confirm("Your password is weak. Are you sure you want to continue?")) {
                return;
            }
        }
        
        try {
            // Show loading state
            const submitBtn = changePasswordForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = "Updating...";
            
            // Reauthenticate user
            const credential = firebase.auth.EmailAuthProvider.credential(
                currentUser.email,
                currentPassword
            );
            
            await currentUser.reauthenticateWithCredential(credential);
            
            // Update password
            await currentUser.updatePassword(newPassword);
            
            // Update successful
            passwordModal.style.display = "none";
            showStatus("Your password has been updated successfully.", "success");
            changePasswordForm.reset();
            
            // Log the activity
            logActivity("Password Changed", "security");
            
            // Update last password change date
            localStorage.setItem('lastPasswordChange', new Date().toISOString());
        } catch (error) {
            console.error("Error updating password:", error);
            let errorMessage = "Failed to update password. Please try again.";
            
            if (error.code === "auth/wrong-password") {
                errorMessage = "Current password is incorrect.";
            } else if (error.code === "auth/weak-password") {
                errorMessage = "New password is too weak.";
            }
            
            showStatus(errorMessage, "error");
        } finally {
            // Reset button state
            const submitBtn = changePasswordForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = "Update Password";
        }
    });

    recoveryForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const recoveryEmail = document.getElementById("recoveryEmail").value;
        const securityQuestion1 = document.getElementById("securityQuestion1").value;
        const securityAnswer1 = document.getElementById("securityAnswer1").value;
        const securityQuestion2 = document.getElementById("securityQuestion2").value;
        const securityAnswer2 = document.getElementById("securityAnswer2").value;
        
        try {
            // Show loading state
            const submitBtn = recoveryForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = "Saving...";
            
            // Save recovery options to localStorage
            const recoveryOptions = {
                email: recoveryEmail,
                questions: [
                    { question: securityQuestion1, answer: securityAnswer1 },
                    { question: securityQuestion2, answer: securityAnswer2 }
                ],
                updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem(`recovery_${session.uid}`, JSON.stringify(recoveryOptions));
            
            // Update successful
            recoveryModal.style.display = "none";
            showStatus("Recovery options saved successfully.", "success");
            document.getElementById("recoveryStatus").textContent = "Configured";
            document.getElementById("recoveryStatus").className = "settings-badge secure";
            
            // Log the activity
            logActivity("Recovery Options Updated", "security");
        } catch (error) {
            console.error("Error saving recovery options:", error);
            showStatus("Failed to save recovery options. Please try again.", "error");
        } finally {
            // Reset button state
            const submitBtn = recoveryForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = "Save Recovery Options";
        }
    });

    // Functions
    async function loadUserSettings() {
        try {
            // Get user settings from localStorage
            let userSettings = JSON.parse(localStorage.getItem(`settings_${session.uid}`)) || {
                sessionTimeout: 30,
                autoBackup: false,
                backupFrequency: "weekly",
                selfDestruct: false,
                failedAttempts: 10
            };
            
            // If no settings exist, create default settings
            if (!userSettings) {
                userSettings = {
                    sessionTimeout: 30,
                    autoBackup: false,
                    backupFrequency: "weekly",
                    selfDestruct: false,
                    failedAttempts: 10
                };
                localStorage.setItem(`settings_${session.uid}`, JSON.stringify(userSettings));
            }
            
            // Apply settings to UI
            document.getElementById("sessionTimeout").value = userSettings.sessionTimeout || 30;
            
            if (userSettings.autoBackup) {
                document.getElementById("backupStatus").textContent = "Enabled";
                document.getElementById("backupStatus").className = "settings-badge secure";
                document.getElementById("backupFrequency").value = userSettings.backupFrequency || "weekly";
                toggleBackupBtn.textContent = "Disable Auto Backup";
            }
            
            if (userSettings.selfDestruct) {
                document.getElementById("selfDestructStatus").textContent = "Enabled";
                document.getElementById("selfDestructStatus").className = "settings-badge secure";
                document.getElementById("failedAttempts").value = userSettings.failedAttempts || 10;
                toggleSelfDestructBtn.textContent = "Disable Self-Destruct";
            }
            
            // Load recovery status
            const recoveryOptions = JSON.parse(localStorage.getItem(`recovery_${session.uid}`));
            if (recoveryOptions) {
                document.getElementById("recoveryStatus").textContent = "Configured";
                document.getElementById("recoveryStatus").className = "settings-badge secure";
            }
            
            // Load 2FA status
            const twoFAStatus = localStorage.getItem(`twoFactor_${session.uid}`);
            if (twoFAStatus === "enabled") {
                document.getElementById("2faStatus").textContent = "Enabled";
                document.getElementById("2faStatus").className = "settings-badge secure";
                setup2FABtn.textContent = "Manage 2FA";
            }
            
            // Load sessions
            loadActiveSessions();
            
            // Load activity log
            loadActivityLog();
        } catch (error) {
            console.error("Error loading user settings:", error);
            showStatus("Failed to load settings. Please refresh the page.", "error");
        }
    }

    async function toggleAutoBackup() {
        try {
            const backupStatus = document.getElementById("backupStatus");
            const isCurrentlyEnabled = backupStatus.textContent === "Enabled";
            const backupFrequency = document.getElementById("backupFrequency").value;
            
            // Get current settings
            const userSettings = JSON.parse(localStorage.getItem(`settings_${session.uid}`)) || {};
            
            // Update settings
            userSettings.autoBackup = !isCurrentlyEnabled;
            userSettings.backupFrequency = backupFrequency;
            
            // Save to localStorage
            localStorage.setItem(`settings_${session.uid}`, JSON.stringify(userSettings));
            
            // Update UI
            if (isCurrentlyEnabled) {
                backupStatus.textContent = "Disabled";
                backupStatus.className = "settings-badge warning";
                toggleBackupBtn.textContent = "Enable Auto Backup";
                showStatus("Auto backup has been disabled.", "info");
            } else {
                backupStatus.textContent = "Enabled";
                backupStatus.className = "settings-badge secure";
                toggleBackupBtn.textContent = "Disable Auto Backup";
                showStatus("Auto backup has been enabled.", "success");
                
                // Trigger initial backup
                await backupUserData();
            }
            
            // Log the activity
            logActivity(`Auto Backup ${isCurrentlyEnabled ? "Disabled" : "Enabled"}`, "security");
        } catch (error) {
            console.error("Error toggling auto backup:", error);
            showStatus("Failed to update auto backup settings.", "error");
        }
    }

    async function toggleSelfDestruct() {
        try {
            const selfDestructStatus = document.getElementById("selfDestructStatus");
            const isCurrentlyEnabled = selfDestructStatus.textContent === "Enabled";
            const failedAttempts = document.getElementById("failedAttempts").value;
            
            // Get current settings
            const userSettings = JSON.parse(localStorage.getItem(`settings_${session.uid}`)) || {};
            
            // Update settings
            userSettings.selfDestruct = !isCurrentlyEnabled;
            userSettings.failedAttempts = parseInt(failedAttempts);
            
            // Save to localStorage
            localStorage.setItem(`settings_${session.uid}`, JSON.stringify(userSettings));
            
            // Update UI
            if (isCurrentlyEnabled) {
                selfDestructStatus.textContent = "Disabled";
                selfDestructStatus.className = "settings-badge warning";
                toggleSelfDestructBtn.textContent = "Enable Self-Destruct";
                showStatus("Data self-destruct has been disabled.", "info");
            } else {
                selfDestructStatus.textContent = "Enabled";
                selfDestructStatus.className = "settings-badge secure";
                toggleSelfDestructBtn.textContent = "Disable Self-Destruct";
                showStatus("Data self-destruct has been enabled.", "success");
            }
            
            // Log the activity
            logActivity(`Self-Destruct ${isCurrentlyEnabled ? "Disabled" : "Enabled"}`, "security");
        } catch (error) {
            console.error("Error toggling self-destruct:", error);
            showStatus("Failed to update self-destruct settings.", "error");
        }
    }

    async function saveSessionTimeout() {
        try {
            const sessionTimeout = document.getElementById("sessionTimeout").value;
            
            // Get current settings
            const userSettings = JSON.parse(localStorage.getItem(`settings_${session.uid}`)) || {};
            
            // Update settings
            userSettings.sessionTimeout = parseInt(sessionTimeout);
            
            // Save to localStorage
            localStorage.setItem(`settings_${session.uid}`, JSON.stringify(userSettings));
            
            // Update session timeout in localStorage
            session.timeout = parseInt(sessionTimeout);
            localStorage.setItem("session", JSON.stringify(session));
            
            showStatus("Session timeout settings saved successfully.", "success");
            
            // Log the activity
            logActivity("Session Timeout Updated", "security");
        } catch (error) {
            console.error("Error saving session timeout:", error);
            showStatus("Failed to save session timeout settings.", "error");
        }
    }

    async function logoutAllDevices() {
        if (!confirm("Are you sure you want to log out from all other devices?")) {
            return;
        }
        
        try {
            // Change password temporarily to invalidate tokens
            const tempPassword = generateRandomPassword();
            await currentUser.updatePassword(tempPassword);
            
            // Change it back to the original
            const credential = firebase.auth.EmailAuthProvider.credential(
                currentUser.email,
                tempPassword
            );
            await currentUser.reauthenticateWithCredential(credential);
            
            // Get current password from form if it's open, otherwise prompt
            let originalPassword;
            if (passwordModal.style.display === "block") {
                originalPassword = document.getElementById("currentPassword").value;
            } else {
                originalPassword = prompt("Please enter your current password to complete this action:");
                if (!originalPassword) return;
            }
            
            await currentUser.updatePassword(originalPassword);
            
            showStatus("You have been logged out from all other devices.", "success");
            
            // Update sessions list
            loadActiveSessions();
            
            // Log the activity
            logActivity("Logged Out All Devices", "security");
        } catch (error) {
            console.error("Error logging out all devices:", error);
            showStatus("Failed to log out from all devices. Please try again.", "error");
        }
    }

    function verify2FA() {
        const authCode = document.getElementById("authCode").value.trim();
        
        if (authCode.length !== 6 || !/^\d+$/.test(authCode)) {
            showStatus("Please enter a valid 6-digit code.", "error", twoFAModal);
            return;
        }
        
        // In a real app, you would verify this code with a server
        // For this demo, we'll simulate success
        
        // Save 2FA status to localStorage
        localStorage.setItem(`twoFactor_${session.uid}`, "enabled");
        
        // Move to success step
        document.querySelector(".twofa-step.active").classList.remove("active");
        document.getElementById("step4").classList.add("active");
        
        // Log the activity
        logActivity("Two-Factor Authentication Enabled", "security");
    }

    async function backupUserData() {
        try {
            // Get all user data
            const passwords = JSON.parse(localStorage.getItem('passwords')) || [];
            const userSettings = JSON.parse(localStorage.getItem(`settings_${session.uid}`)) || {};
            
            const backupData = {
                passwords: passwords.filter(p => p.user_email === session.email),
                settings: userSettings,
                timestamp: new Date().toISOString()
            };
            
            // In a real app, you would encrypt this data and send it to a secure storage
            // For this demo, we'll just save it to localStorage
            const backups = JSON.parse(localStorage.getItem(`backups_${session.uid}`)) || [];
            backups.push(backupData);
            
            // Keep only the last 5 backups
            const recentBackups = backups.slice(-5);
            localStorage.setItem(`backups_${session.uid}`, JSON.stringify(recentBackups));
            
            console.log("Backup completed successfully");
            return true;
        } catch (error) {
            console.error("Error backing up data:", error);
            return false;
        }
    }

    async function loadActiveSessions() {
        try {
            // In a real app, you would get this from a server
            // For this demo, we'll just show the current session
            const sessionsList = document.getElementById("sessionsList");
            sessionsList.innerHTML = `
                <div class="session-item current">
                    <div class="session-info">
                        <strong>Current Session</strong>
                        <span>Windows • Chrome • Started ${getRelativeTime(Date.now() - 10 * 60 * 1000)}</span>
                    </div>
                    <span class="session-badge">Current</span>
                </div>
            `;
            
            document.getElementById("activeSessions").textContent = "1 Active";
        } catch (error) {
            console.error("Error loading active sessions:", error);
        }
    }

    async function loadActivityLog(limit = 1) {
        try {
            // Get activity log from localStorage
            const activityLog = document.getElementById("activityLog");
            const activities = JSON.parse(localStorage.getItem(`activity_${session.uid}`)) || [];
            
            if (activities.length === 0) {
                // If no activity, add the login event
                const loginActivity = {
                    type: "login",
                    description: "Login Successful",
                    timestamp: Date.now(),
                    device: {
                        os: "Windows",
                        browser: "Chrome"
                    }
                };
                
                activities.push(loginActivity);
                localStorage.setItem(`activity_${session.uid}`, JSON.stringify(activities));
                
                activityLog.innerHTML = `
                    <div class="activity-item">
                        <div class="activity-info">
                            <strong>Login Successful</strong>
                            <span>Today, ${formatTime(loginActivity.timestamp)} • ${loginActivity.device.os} • ${loginActivity.device.browser}</span>
                        </div>
                        <span class="activity-type login">Login</span>
                    </div>
                `;
            } else {
                // Display activity log
                activityLog.innerHTML = "";
                
                // Get the most recent activities based on the limit
                const recentActivities = activities.slice(-limit);
                
                recentActivities.forEach(activity => {
                    activityLog.innerHTML += `
                        <div class="activity-item">
                            <div class="activity-info">
                                <strong>${activity.description}</strong>
                                <span>${formatDate(activity.timestamp)}, ${formatTime(activity.timestamp)} • ${activity.device?.os || "Unknown"} • ${activity.device?.browser || "Unknown"}</span>
                            </div>
                            <span class="activity-type ${activity.type}">${capitalizeFirstLetter(activity.type)}</span>
                        </div>
                    `;
                });
            }
        } catch (error) {
            console.error("Error loading activity log:", error);
        }
    }

    async function logActivity(description, type) {
        try {
            const activity = {
                type: type,
                description: description,
                timestamp: Date.now(),
                device: {
                    os: "Windows",
                    browser: "Chrome"
                }
            };
            
            // Get existing activities
            const activities = JSON.parse(localStorage.getItem(`activity_${session.uid}`)) || [];
            
            // Add new activity
            activities.push(activity);
            
            // Save to localStorage
            localStorage.setItem(`activity_${session.uid}`, JSON.stringify(activities));
            
            // Reload activity log
            loadActivityLog();
        } catch (error) {
            console.error("Error logging activity:", error);
        }
    }

    function viewAllActivity() {
        // Load more activities
        loadActivityLog(10);
    }

    // Helper Functions
    function setupPasswordStrengthMeter() {
        const passwordInput = document.getElementById("newPassword");
        const strengthBar = document.querySelector(".strength-bar");
        const strengthText = document.querySelector(".strength-text");
        
        passwordInput.addEventListener("input", () => {
            const password = passwordInput.value;
            const strength = checkPasswordStrength(password);
            
            strengthBar.style.width = `${strength.score * 25}%`;
            strengthBar.className = `strength-bar ${strength.level}`;
            strengthText.textContent = `Password Strength: ${capitalizeFirstLetter(strength.level)}`;
        });
    }

    function checkPasswordStrength(password) {
        let score = 0;
        let level = "weak";
        
        // Length check
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        
        // Complexity checks
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        // Determine level
        if (score >= 4) level = "strong";
        else if (score >= 3) level = "medium";
        else if (score >= 2) level = "fair";
        
        return { score, level };
    }

    function showStatus(message, type = "info", container = document) {
        const statusMessage = container.querySelector(".status-message");
        if (!statusMessage) return;
        
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = "block";
        
        // Hide after 3 seconds
        setTimeout(() => {
            statusMessage.style.display = "none";
        }, 3000);
    }

    function generateRandomPassword() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        let password = "";
        
        for (let i = 0; i < 16; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return password;
    }

    function getRelativeTime(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return "just now";
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
        
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? "s" : ""} ago`;
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString();
        }
    }

    function formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Handle logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            logout();
        });
    }
}); 
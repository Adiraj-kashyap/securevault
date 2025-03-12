document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyBxXvRKYoqUxEpxZ0RhV9UB8PdwLCnIk_M",
        authDomain: "securevault-d1f1f.firebaseapp.com",
        databaseURL: "https://securevault-d1f1f-default-rtdb.firebaseio.com",
        projectId: "securevault-d1f1f",
        storageBucket: "securevault-d1f1f.appspot.com",
        messagingSenderId: "1075651914548",
        appId: "1:1075651914548:web:a0b8c6e8c2b2b0a0c9b0c9"
    };

    // Initialize Firebase if not already initialized
    if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    } else {
        firebase.app(); // if already initialized, use that one
    }

    // Check if user is authenticated
    checkAuth();

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.toggle('dark', savedTheme === 'dark');
    } else {
        // Use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        body.classList.toggle('dark', prefersDark);
    }
    
    // Update theme toggle button appearance
    updateThemeToggleIcon();
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark');
            localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
            updateThemeToggleIcon();
        });
    }
    
    function updateThemeToggleIcon() {
        const isDark = body.classList.contains('dark');
        const sunIcon = document.querySelector('.icon-sun');
        const moonIcon = document.querySelector('.icon-moon');
        
        if (sunIcon && moonIcon) {
            sunIcon.style.display = isDark ? 'block' : 'none';
            moonIcon.style.display = isDark ? 'none' : 'block';
        }
    }

    // Update welcome message with user's name
    updateWelcomeMessage();

    // Logout button functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Check for security updates
    checkSecurityUpdates();
});

// Check if user is logged in
function checkAuth() {
    try {
        const session = JSON.parse(localStorage.getItem('session'));
        if (!session) {
            window.location.href = 'auth.html';
            return;
        }

        // Check session expiry (24 hours)
        if (new Date().getTime() - session.timestamp > 24 * 60 * 60 * 1000) {
            localStorage.removeItem('session');
            window.location.href = 'auth.html';
            return;
        }

        // Update profile info
        updateProfileInfo(session);
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'auth.html';
    }
}

// Update profile information
function updateProfileInfo(session) {
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileAvatar = document.querySelector('.profile-avatar');
    const profileAvatarLarge = document.querySelector('.profile-avatar-large');
    
    if (profileName && profileEmail) {
        // Get user info from session
        const userEmail = session.email || 'User';
        const displayName = session.displayName || userEmail.split('@')[0];
        
        profileName.textContent = displayName;
        profileEmail.textContent = userEmail;
        
        // Update avatar
        if (profileAvatar) {
            profileAvatar.innerHTML = '';
            
            if (session.photoURL) {
                // If user has a photo URL (from Google), use it
                const avatarImg = document.createElement('img');
                avatarImg.src = session.photoURL;
                avatarImg.alt = displayName;
                profileAvatar.appendChild(avatarImg);
                
                // Do the same for large avatar if it exists
                if (profileAvatarLarge) {
                    profileAvatarLarge.innerHTML = '';
                    const avatarLargeImg = document.createElement('img');
                    avatarLargeImg.src = session.photoURL;
                    avatarLargeImg.alt = displayName;
                    profileAvatarLarge.appendChild(avatarLargeImg);
                }
            } else {
                // If no photo URL, create an avatar with the first letter of the name
                const firstLetter = displayName.charAt(0).toUpperCase();
                
                // Create a div for the letter avatar
                const letterAvatar = document.createElement('div');
                letterAvatar.className = 'letter-avatar';
                letterAvatar.textContent = firstLetter;
                
                // Add some inline styles for the letter avatar
                letterAvatar.style.backgroundColor = getAvatarColor(displayName);
                letterAvatar.style.color = '#ffffff';
                letterAvatar.style.width = '100%';
                letterAvatar.style.height = '100%';
                letterAvatar.style.display = 'flex';
                letterAvatar.style.alignItems = 'center';
                letterAvatar.style.justifyContent = 'center';
                letterAvatar.style.fontWeight = 'bold';
                letterAvatar.style.fontSize = '1.2rem';
                letterAvatar.style.borderRadius = '50%';
                
                profileAvatar.appendChild(letterAvatar);
                
                // Do the same for large avatar if it exists
                if (profileAvatarLarge) {
                    profileAvatarLarge.innerHTML = '';
                    const letterAvatarLarge = document.createElement('div');
                    letterAvatarLarge.className = 'letter-avatar';
                    letterAvatarLarge.textContent = firstLetter;
                    
                    // Add some inline styles for the letter avatar
                    letterAvatarLarge.style.backgroundColor = getAvatarColor(displayName);
                    letterAvatarLarge.style.color = '#ffffff';
                    letterAvatarLarge.style.width = '100%';
                    letterAvatarLarge.style.height = '100%';
                    letterAvatarLarge.style.display = 'flex';
                    letterAvatarLarge.style.alignItems = 'center';
                    letterAvatarLarge.style.justifyContent = 'center';
                    letterAvatarLarge.style.fontWeight = 'bold';
                    letterAvatarLarge.style.fontSize = '1.5rem';
                    letterAvatarLarge.style.borderRadius = '50%';
                    
                    profileAvatarLarge.appendChild(letterAvatarLarge);
                }
            }
        }
    }
}

// Function to generate a consistent color based on the user's name
function getAvatarColor(name) {
    // Simple hash function to generate a color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert the hash to a color
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 50%)`;
}

// Update welcome message
function updateWelcomeMessage() {
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        try {
            const session = JSON.parse(localStorage.getItem('session'));
            if (session) {
                const displayName = session.displayName || session.email.split('@')[0];
                welcomeMessage.textContent = `Welcome to your Secure Vault, ${displayName}!`;
            }
        } catch (error) {
            console.error('Error updating welcome message:', error);
        }
    }
}

// Logout function
function logout() {
    try {
        localStorage.removeItem('session');
        firebase.auth().signOut().then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Logout failed:', error);
            window.location.href = 'index.html'; // Redirect anyway
        });
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = 'index.html';
    }
}

// Function to check for security updates
function checkSecurityUpdates() {
    // This would typically connect to a server to check for security updates
    // For now, we'll simulate this with a timeout
    setTimeout(() => {
        // Check if the user has set up 2FA
        const hasTwoFactor = localStorage.getItem('hasTwoFactor') === 'true';
        
        if (!hasTwoFactor) {
            showSecurityNotification('Enhance your account security by setting up two-factor authentication.', 'setup2FA');
        }
        
        // Check when the user last changed their password
        const lastPasswordChange = localStorage.getItem('lastPasswordChange');
        if (!lastPasswordChange || isPasswordChangeNeeded(lastPasswordChange)) {
            showSecurityNotification('It\'s time to update your master password for better security.', 'updatePassword');
        }
    }, 2000);
}

// Function to determine if password change is needed
function isPasswordChangeNeeded(lastChangeDate) {
    if (!lastChangeDate) return true;
    
    const lastChange = new Date(lastChangeDate);
    const now = new Date();
    const daysSinceChange = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
    
    // Recommend password change every 90 days
    return daysSinceChange > 90;
}

// Function to show security notification
function showSecurityNotification(message, action) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'security-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-shield-alt"></i>
            <p>${message}</p>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add styles
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'var(--background)';
    notification.style.borderLeft = '4px solid var(--primary)';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    notification.style.padding = '16px';
    notification.style.zIndex = '1000';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.justifyContent = 'space-between';
    notification.style.maxWidth = '400px';
    notification.style.transform = 'translateY(100px)';
    notification.style.opacity = '0';
    notification.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    notification.style.cursor = 'pointer';
    
    // Notification content styles
    const notificationContent = notification.querySelector('.notification-content');
    notificationContent.style.display = 'flex';
    notificationContent.style.alignItems = 'center';
    notificationContent.style.gap = '12px';
    
    // Icon styles
    const icon = notification.querySelector('.notification-content i');
    icon.style.color = 'var(--primary)';
    icon.style.fontSize = '24px';
    
    // Text styles
    const text = notification.querySelector('.notification-content p');
    text.style.margin = '0';
    text.style.color = 'var(--foreground)';
    
    // Close button styles
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = 'var(--foreground-muted)';
    closeBtn.style.padding = '4px';
    closeBtn.style.marginLeft = '8px';
    
    // Show notification with animation
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    }, 100);
    
    // Add click handler for the notification content
    notificationContent.addEventListener('click', () => {
        if (action === 'setup2FA') {
            setup2FA();
        } else if (action === 'updatePassword') {
            promptPasswordUpdate();
        }
        
        // Close the notification
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Add close button functionality
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering the notification click
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
        
        // Remove from DOM after animation
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-dismiss after 8 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.transform = 'translateY(100px)';
            notification.style.opacity = '0';
            
            // Remove from DOM after animation
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.remove();
                }
            }, 300);
        }
    }, 8000);
}

// Function to set up 2FA
function setup2FA() {
    // Create modal for 2FA setup
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Set Up Two-Factor Authentication</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>Two-factor authentication adds an extra layer of security to your account. After entering your password, you'll need to provide a verification code from your phone.</p>
                
                <div class="setup-steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h3>Download an authenticator app</h3>
                            <p>We recommend Google Authenticator or Authy.</p>
                            <div class="app-links">
                                <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" class="btn btn-outline">
                                    <i class="fab fa-google-play"></i> Google Play
                                </a>
                                <a href="https://apps.apple.com/us/app/google-authenticator/id388497605" target="_blank" class="btn btn-outline">
                                    <i class="fab fa-app-store"></i> App Store
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h3>Scan this QR code</h3>
                            <p>Open your authenticator app and scan this QR code.</p>
                            <div class="qr-code">
                                <!-- Placeholder for QR code -->
                                <div class="qr-placeholder">QR Code Placeholder</div>
                                <p class="backup-code">Or enter this code manually: <strong>SECVAULT2FA</strong></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h3>Enter verification code</h3>
                            <p>Enter the 6-digit code from your authenticator app.</p>
                            <div class="verification-input">
                                <input type="text" id="verificationCode" maxlength="6" placeholder="000000">
                                <button id="verify2FA" class="btn btn-primary">Verify</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.appendChild(modal);
    
    // Add styles for the modal
    const style = document.createElement('style');
    style.innerHTML = `
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1001;
        }
        
        .modal-content {
            background-color: var(--background);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            border-bottom: 1px solid var(--border);
        }
        
        .modal-header h2 {
            margin: 0;
            font-size: 1.5rem;
            color: var(--foreground);
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--foreground-muted);
        }
        
        .modal-body {
            padding: 24px;
        }
        
        .setup-steps {
            margin-top: 24px;
        }
        
        .step {
            display: flex;
            margin-bottom: 32px;
        }
        
        .step-number {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: var(--primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 16px;
            flex-shrink: 0;
        }
        
        .step-content {
            flex: 1;
        }
        
        .step-content h3 {
            margin-top: 0;
            margin-bottom: 8px;
            color: var(--foreground);
        }
        
        .app-links {
            display: flex;
            gap: 12px;
            margin-top: 16px;
        }
        
        .qr-code {
            margin-top: 16px;
            text-align: center;
        }
        
        .qr-placeholder {
            width: 180px;
            height: 180px;
            background-color: var(--secondary);
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--foreground-muted);
            border: 1px solid var(--border);
        }
        
        .backup-code {
            margin-top: 12px;
            font-size: 0.9rem;
            color: var(--foreground-muted);
        }
        
        .verification-input {
            display: flex;
            gap: 12px;
            margin-top: 16px;
        }
        
        .verification-input input {
            flex: 1;
            padding: 10px 12px;
            border: 1px solid var(--border);
            border-radius: 4px;
            font-size: 1.2rem;
            letter-spacing: 4px;
            text-align: center;
        }
    `;
    document.head.appendChild(style);
    
    // Handle close button
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.remove();
        style.remove();
    });
    
    // Handle verification
    const verifyBtn = modal.querySelector('#verify2FA');
    const verificationInput = modal.querySelector('#verificationCode');
    
    verifyBtn.addEventListener('click', () => {
        const code = verificationInput.value.trim();
        if (code.length === 6 && /^\d+$/.test(code)) {
            // In a real app, this would validate with a server
            // For demo purposes, we'll accept any 6-digit code
            localStorage.setItem('hasTwoFactor', 'true');
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.textContent = '2FA has been successfully set up!';
            successMsg.style.backgroundColor = 'rgba(46, 204, 113, 0.2)';
            successMsg.style.color = '#27ae60';
            successMsg.style.padding = '12px';
            successMsg.style.borderRadius = '4px';
            successMsg.style.marginTop = '16px';
            successMsg.style.textAlign = 'center';
            
            const modalBody = modal.querySelector('.modal-body');
            modalBody.appendChild(successMsg);
            
            // Close modal after delay
            setTimeout(() => {
                modal.remove();
                style.remove();
            }, 2000);
        } else {
            verificationInput.style.borderColor = '#e74c3c';
            verificationInput.focus();
        }
    });
}

// Function to prompt for password update
function promptPasswordUpdate() {
    // Create modal for password update
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Update Your Password</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>Regular password updates help keep your account secure. We recommend changing your password every 90 days.</p>
                
                <form id="passwordUpdateForm">
                    <div class="form-group">
                        <label for="currentPassword">Current Password</label>
                        <input type="password" id="currentPassword" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="newPassword">New Password</label>
                        <input type="password" id="newPassword" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="confirmPassword">Confirm New Password</label>
                        <input type="password" id="confirmPassword" required>
                    </div>
                    
                    <div id="passwordStrength">
                        <div class="strength-bar"></div>
                        <div class="strength-text">Password Strength: Weak</div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary modal-close-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update Password</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.appendChild(modal);
    
    // Add styles for the modal (reusing the same styles from setup2FA)
    
    // Handle close buttons
    const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.remove();
        });
    });
    
    // Handle password strength
    const newPasswordInput = modal.querySelector('#newPassword');
    const strengthBar = modal.querySelector('.strength-bar');
    const strengthText = modal.querySelector('.strength-text');
    
    newPasswordInput.addEventListener('input', () => {
        const password = newPasswordInput.value;
        const strength = checkPasswordStrength(password);
        
        strengthBar.style.width = `${strength.score * 25}%`;
        strengthBar.className = `strength-bar ${strength.level}`;
        strengthText.textContent = `Password Strength: ${strength.level}`;
    });
    
    // Handle form submission
    const form = modal.querySelector('#passwordUpdateForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const currentPassword = modal.querySelector('#currentPassword').value;
        const newPassword = modal.querySelector('#newPassword').value;
        const confirmPassword = modal.querySelector('#confirmPassword').value;
        
        // Validate passwords
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match.');
            return;
        }
        
        // In a real app, this would validate with a server
        // For demo purposes, we'll accept any password change
        localStorage.setItem('lastPasswordChange', new Date().toISOString());
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = 'Password has been successfully updated!';
        successMsg.style.backgroundColor = 'rgba(46, 204, 113, 0.2)';
        successMsg.style.color = '#27ae60';
        successMsg.style.padding = '12px';
        successMsg.style.borderRadius = '4px';
        successMsg.style.marginTop = '16px';
        successMsg.style.textAlign = 'center';
        
        form.innerHTML = '';
        form.appendChild(successMsg);
        
        // Close modal after delay
        setTimeout(() => {
            modal.remove();
        }, 2000);
    });
}

// Function to check password strength
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
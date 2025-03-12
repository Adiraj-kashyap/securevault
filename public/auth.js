document.addEventListener("DOMContentLoaded", () => {
    // Initialize Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyDkl7lrIkhfW3DW2mfq8_VvczpczY0_kUc",
        authDomain: "s3curevau1t.firebaseapp.com",
        projectId: "s3curevau1t",
        storageBucket: "s3curevau1t.appspot.com",
        messagingSenderId: "635634325549",
        appId: "1:635634325549:web:120edbddc22ce0698d40a4",
        measurementId: "G-XS2B3Q8330"
      };
      
      // Initialize Firebase (Make sure it's only initialized once)
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      } else {
        firebase.app(); // Use existing instance
      }

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

    // Handle password visibility toggle
    const togglePassword = document.querySelector(".toggle-password");

    if (togglePassword) {
        togglePassword.addEventListener("click", function () {
            const passwordInput = document.querySelector("#password");
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
    }

    // Handle login form submission
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const authStatus = document.getElementById("authStatus");
            
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = "Logging in...";
            
            try {
                const success = await login(email, password);
                if (success) {
                    authStatus.textContent = "Login successful! Redirecting...";
                    authStatus.className = "form-status success";
                    setTimeout(() => {
                        window.location.href = "dashboard.html";
                    }, 1000);
                }
            } catch (error) {
                console.error("Login error:", error);
                authStatus.textContent = error.message || "Login failed. Please check your credentials.";
                authStatus.className = "form-status error";
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // Handle forgot password
    const forgotPassword = document.getElementById("forgotPassword");
    if (forgotPassword) {
        forgotPassword.addEventListener("click", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const authStatus = document.getElementById("authStatus");
            
            if (!email) {
                authStatus.textContent = "Please enter your email address first.";
                authStatus.className = "form-status error";
                return;
            }
            
            try {
                await firebase.auth().sendPasswordResetEmail(email);
                authStatus.textContent = "Password reset email sent. Please check your inbox.";
                authStatus.className = "form-status success";
            } catch (error) {
                console.error("Password reset error:", error);
                authStatus.textContent = "Failed to send reset email. Please try again.";
                authStatus.className = "form-status error";
            }
        });
    }

    // Handle Google Sign In
    const googleSignIn = document.getElementById("googleSignIn");
    if (googleSignIn) {
        googleSignIn.addEventListener("click", async () => {
            const authStatus = document.getElementById("authStatus");
            
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                const result = await firebase.auth().signInWithPopup(provider);
                
                // Store user session
                const session = {
                    email: result.user.email,
                    uid: result.user.uid,
                    displayName: result.user.displayName,
                    photoURL: result.user.photoURL,
                    timestamp: new Date().getTime(),
                };
                
                localStorage.setItem("session", JSON.stringify(session));
                
                authStatus.textContent = "Login successful! Redirecting...";
                authStatus.className = "form-status success";
                
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);
            } catch (error) {
                console.error("Google sign-in error:", error);
                authStatus.textContent = "Google sign-in failed. Please try again.";
                authStatus.className = "form-status error";
            }
        });
    }
});

// User authentication functions - moved outside the DOMContentLoaded event
// to make them globally accessible
async function login(email, password) {
    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);

        // Store session
        const session = {
            email: userCredential.user.email,
            uid: userCredential.user.uid,
            displayName: userCredential.user.displayName,
            photoURL: userCredential.user.photoURL,
            timestamp: new Date().getTime(),
        };
        localStorage.setItem("session", JSON.stringify(session));
        return true;
    } catch (error) {
        console.error("Login failed:", error);
        let errorMessage = "Login failed. Please try again.";
        
        // Provide more specific error messages
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = "Invalid email or password. Please try again.";
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = "Too many failed login attempts. Please try again later.";
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = "Network error. Please check your internet connection.";
        } else if (error.code === 'auth/internal-error') {
            errorMessage = "Authentication service error. Please try again later.";
        } else if (error.code === 'auth/invalid-api-key') {
            errorMessage = "Authentication configuration error. Please contact support.";
        }
        
        throw new Error(errorMessage);
    }
}

// Check if user is logged in
function checkAuth() {
    const session = JSON.parse(localStorage.getItem("session"));
    if (!session) {
        window.location.href = "auth.html";
        return false;
    }

    // Check session expiry (24 hours)
    if (new Date().getTime() - session.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem("session");
        window.location.href = "auth.html";
        return false;
    }
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem("session");
    firebase.auth().signOut().then(() => {
        window.location.href = "auth.html";
    }).catch((error) => {
        console.error("Logout failed:", error);
        window.location.href = "auth.html"; // Redirect anyway
    });
}

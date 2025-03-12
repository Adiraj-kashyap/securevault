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

  const registerForm = document.getElementById("registerForm");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const passwordStrength = document.getElementById("passwordStrength");
  const strengthBar = passwordStrength.querySelector(".strength-bar");
  const strengthText = passwordStrength.querySelector(".strength-text");
  const registerStatus = document.getElementById("registerStatus");

  // Password strength checker
  passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;
    const strength = checkPasswordStrength(password);
    strengthBar.style.width = `${strength.score * 25}%`;
    strengthBar.className = `strength-bar ${strength.level}`;
    strengthText.textContent = `Password Strength: ${strength.level}`;
  });

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

  // Handle form submission
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
      registerStatus.textContent = "Passwords don't match!";
      registerStatus.className = "form-status error";
      return;
    }

    // Check password strength
    const strength = checkPasswordStrength(password);
    if (strength.level === "weak") {
      registerStatus.textContent = "Your password is weak. Consider using a stronger password.";
      registerStatus.className = "form-status error";
      if (!confirm("Your password is weak. Are you sure you want to continue?")) {
        return;
      }
    }

    // Show loading state
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";
    registerStatus.textContent = "Creating your account...";
    registerStatus.className = "form-status";

    try {
      await register(email, password);
      registerStatus.textContent = "Registration successful! Redirecting to login...";
      registerStatus.className = "form-status success";
      setTimeout(() => {
        window.location.href = "auth.html";
      }, 2000);
    } catch (error) {
      registerStatus.textContent = error.message || "Registration failed. Please try again.";
      registerStatus.className = "form-status error";
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  // Handle Google Sign Up
  const googleSignUp = document.getElementById("googleSignUp");
  if (googleSignUp) {
    googleSignUp.addEventListener("click", async () => {
      registerStatus.textContent = "Connecting to Google...";
      registerStatus.className = "form-status";
      
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
        
        registerStatus.textContent = "Account created successfully! Redirecting...";
        registerStatus.className = "form-status success";
        
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } catch (error) {
        console.error("Google sign-up error:", error);
        registerStatus.textContent = "Google sign-up failed. Please try again.";
        registerStatus.className = "form-status error";
      }
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
});

async function register(email, password) {
  try {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    console.log("Registration successful", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Registration failed:", error);
    let errorMessage = "Registration failed. Please try again.";
    
    // Provide more specific error messages
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "This email is already registered. Please use a different email or try logging in.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Invalid email format. Please enter a valid email address.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password is too weak. Please choose a stronger password.";
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
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase if needed
    try {
        if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
            const firebaseConfig = {
                apiKey: "AIzaSyBmT7KE_BH_ZxM3zVJQnLTVJFGwwQA_eSc",
                authDomain: "securevault-c8d1c.firebaseapp.com",
                projectId: "securevault-c8d1c",
                storageBucket: "securevault-c8d1c.appspot.com",
                messagingSenderId: "129551099547",
                appId: "1:129551099547:web:d3be1e3a5c5f5a8a7a0e0a"
            };
            firebase.initializeApp(firebaseConfig);
        }
    } catch (error) {
        console.error("Firebase initialization error:", error);
    }

    // Check if user is authenticated
    checkAuth();

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // FAQ accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.querySelector('.form-status');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            const privacyAgreed = document.getElementById('privacyAgreed').checked;
            
            // Validate form
            if (!name || !email || !subject || !message) {
                showFormStatus('error', 'Please fill in all required fields.');
                return;
            }
            
            if (!isValidEmail(email)) {
                showFormStatus('error', 'Please enter a valid email address.');
                return;
            }
            
            if (!privacyAgreed) {
                showFormStatus('error', 'You must agree to our Privacy Policy.');
                return;
            }
            
            // Show loading state
            showFormStatus('loading', 'Sending your message...');
            
            // Prepare data for submission
            const formData = {
                name: escapeHtml(name),
                email: escapeHtml(email),
                subject: escapeHtml(subject),
                message: escapeHtml(message),
                timestamp: new Date().toISOString()
            };
            
            // Store in localStorage for demo purposes
            // In a real application, you would send this to a server
            saveContactSubmission(formData);
            
            // Simulate server delay
            setTimeout(() => {
                showFormStatus('success', 'Your message has been sent successfully! We\'ll get back to you soon.');
                contactForm.reset();
                
                // Clear success message after 5 seconds
                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 5000);
            }, 1500);
        });
    }

    // Active link highlighting
    highlightActiveLink();
});

// Check if user is authenticated
function checkAuth() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const authLinks = document.querySelectorAll('.auth-link');
        
        if (user) {
            // User is logged in
            authLinks.forEach(link => {
                if (link.classList.contains('login-link')) {
                    link.style.display = 'none';
                } else if (link.classList.contains('dashboard-link')) {
                    link.style.display = 'block';
                }
            });
        } else {
            // User is not logged in
            authLinks.forEach(link => {
                if (link.classList.contains('login-link')) {
                    link.style.display = 'block';
                } else if (link.classList.contains('dashboard-link')) {
                    link.style.display = 'none';
                }
            });
        }
    } catch (error) {
        console.error("Auth check error:", error);
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show form status message
function showFormStatus(type, message) {
    const formStatus = document.querySelector('.form-status');
    
    formStatus.className = 'form-status';
    formStatus.textContent = message;
    
    if (type === 'success') {
        formStatus.classList.add('success');
    } else if (type === 'error') {
        formStatus.classList.add('error');
    } else if (type === 'loading') {
        formStatus.classList.add('loading');
    }
    
    formStatus.style.display = 'block';
}

// Save contact submission to localStorage
function saveContactSubmission(formData) {
    try {
        // Get existing submissions or initialize empty array
        const existingSubmissions = JSON.parse(localStorage.getItem('contactSubmissions')) || [];
        
        // Add new submission
        existingSubmissions.push(formData);
        
        // Save back to localStorage
        localStorage.setItem('contactSubmissions', JSON.stringify(existingSubmissions));
        
        // Log activity if user is logged in
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            logUserActivity(user.uid, 'contact', 'Submitted contact form');
        }
    } catch (error) {
        console.error("Error saving contact submission:", error);
    }
}

// Log user activity
function logUserActivity(userId, type, description) {
    try {
        // Get existing logs or initialize empty array
        const activityLogs = JSON.parse(localStorage.getItem('activityLogs')) || [];
        
        // Add new log entry
        activityLogs.push({
            userId: userId,
            type: type,
            description: description,
            timestamp: new Date().toISOString()
        });
        
        // Save back to localStorage (limit to last 100 entries)
        localStorage.setItem('activityLogs', JSON.stringify(
            activityLogs.slice(-100)
        ));
    } catch (error) {
        console.error("Error logging activity:", error);
    }
}

// Highlight active navigation link
function highlightActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || 
            (currentPath.includes(href) && href !== '/' && href !== '#')) {
            link.classList.add('active');
        } else if (currentPath === '/' && href === '/index.html') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
} 
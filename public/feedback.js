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

    // Testimonial slider functionality
    initTestimonialSlider();

    // Star rating functionality
    initStarRating();

    // Feature request voting
    initFeatureVoting();

    // Feedback form submission
    const feedbackForm = document.getElementById('feedbackForm');
    const formStatus = document.querySelector('.form-status');
    
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const feedbackType = document.getElementById('feedbackType').value;
            const rating = document.querySelector('input[name="rating"]:checked')?.value;
            const feedback = document.getElementById('feedback').value.trim();
            const improvements = document.getElementById('improvements').value.trim();
            const contactConsent = document.getElementById('contactConsent').checked;
            const privacyAgreed = document.getElementById('privacyAgreed').checked;
            
            // Get selected features
            const selectedFeatures = [];
            document.querySelectorAll('input[name="features"]:checked').forEach(checkbox => {
                selectedFeatures.push(checkbox.value);
            });
            
            // Validate form
            if (!name || !email || !feedbackType || !rating || !feedback) {
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
            showFormStatus('loading', 'Submitting your feedback...');
            
            // Prepare data for submission
            const formData = {
                name: escapeHtml(name),
                email: escapeHtml(email),
                feedbackType: feedbackType,
                rating: parseInt(rating),
                feedback: escapeHtml(feedback),
                improvements: escapeHtml(improvements),
                features: selectedFeatures,
                contactConsent: contactConsent,
                timestamp: new Date().toISOString()
            };
            
            // Store in localStorage for demo purposes
            // In a real application, you would send this to a server
            saveFeedbackSubmission(formData);
            
            // Simulate server delay
            setTimeout(() => {
                showFormStatus('success', 'Thank you for your feedback! Your input helps us improve SecureVault.');
                feedbackForm.reset();
                
                // Reset star rating display
                document.querySelector('.rating-text').textContent = 'Select a rating';
                
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

// Initialize testimonial slider
function initTestimonialSlider() {
    const testimonialItems = document.querySelectorAll('.testimonial-item');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    let currentIndex = 0;
    
    if (testimonialItems.length === 0) return;
    
    // Function to show a specific testimonial
    function showTestimonial(index) {
        // Hide all testimonials
        testimonialItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Deactivate all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Show the selected testimonial and activate its dot
        testimonialItems[index].classList.add('active');
        dots[index].classList.add('active');
        
        currentIndex = index;
    }
    
    // Event listeners for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showTestimonial(index);
        });
    });
    
    // Event listeners for prev/next buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            let newIndex = currentIndex - 1;
            if (newIndex < 0) newIndex = testimonialItems.length - 1;
            showTestimonial(newIndex);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            let newIndex = currentIndex + 1;
            if (newIndex >= testimonialItems.length) newIndex = 0;
            showTestimonial(newIndex);
        });
    }
    
    // Auto-rotate testimonials every 5 seconds
    let autoRotate = setInterval(() => {
        let newIndex = currentIndex + 1;
        if (newIndex >= testimonialItems.length) newIndex = 0;
        showTestimonial(newIndex);
    }, 5000);
    
    // Pause auto-rotation when hovering over testimonials
    const testimonialSlider = document.querySelector('.testimonial-slider');
    if (testimonialSlider) {
        testimonialSlider.addEventListener('mouseenter', () => {
            clearInterval(autoRotate);
        });
        
        testimonialSlider.addEventListener('mouseleave', () => {
            autoRotate = setInterval(() => {
                let newIndex = currentIndex + 1;
                if (newIndex >= testimonialItems.length) newIndex = 0;
                showTestimonial(newIndex);
            }, 5000);
        });
    }
}

// Initialize star rating
function initStarRating() {
    const stars = document.querySelectorAll('.rating input');
    const ratingText = document.querySelector('.rating-text');
    
    if (!stars.length || !ratingText) return;
    
    stars.forEach(star => {
        star.addEventListener('change', function() {
            const value = this.value;
            let ratingDescription = '';
            
            switch (value) {
                case '1':
                    ratingDescription = 'Poor';
                    break;
                case '2':
                    ratingDescription = 'Fair';
                    break;
                case '3':
                    ratingDescription = 'Good';
                    break;
                case '4':
                    ratingDescription = 'Very Good';
                    break;
                case '5':
                    ratingDescription = 'Excellent';
                    break;
                default:
                    ratingDescription = 'Select a rating';
            }
            
            ratingText.textContent = ratingDescription;
        });
    });
}

// Initialize feature voting
function initFeatureVoting() {
    const voteButtons = document.querySelectorAll('.vote-btn');
    
    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const featureId = this.getAttribute('data-feature');
            const voteCountElement = this.nextElementSibling;
            
            // Check if user is logged in
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                // Show login prompt
                alert('Please log in to vote for features.');
                return;
            }
            
            // Check if already voted
            if (this.classList.contains('voted')) {
                // Remove vote
                this.classList.remove('voted');
                let currentVotes = parseInt(voteCountElement.textContent);
                voteCountElement.textContent = currentVotes - 1;
                
                // Remove from user's voted features
                removeVotedFeature(user.uid, featureId);
            } else {
                // Add vote
                this.classList.add('voted');
                let currentVotes = parseInt(voteCountElement.textContent);
                voteCountElement.textContent = currentVotes + 1;
                
                // Add to user's voted features
                addVotedFeature(user.uid, featureId);
            }
        });
    });
    
    // Load user's voted features
    loadUserVotes();
}

// Load user's voted features
function loadUserVotes() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    const votedFeatures = JSON.parse(localStorage.getItem(`votedFeatures_${user.uid}`)) || [];
    
    votedFeatures.forEach(featureId => {
        const voteButton = document.querySelector(`.vote-btn[data-feature="${featureId}"]`);
        if (voteButton) {
            voteButton.classList.add('voted');
        }
    });
}

// Add voted feature to user's list
function addVotedFeature(userId, featureId) {
    try {
        const votedFeatures = JSON.parse(localStorage.getItem(`votedFeatures_${userId}`)) || [];
        
        if (!votedFeatures.includes(featureId)) {
            votedFeatures.push(featureId);
            localStorage.setItem(`votedFeatures_${userId}`, JSON.stringify(votedFeatures));
            
            // Log activity
            logUserActivity(userId, 'feature_vote', `Voted for feature: ${featureId}`);
        }
    } catch (error) {
        console.error("Error adding voted feature:", error);
    }
}

// Remove voted feature from user's list
function removeVotedFeature(userId, featureId) {
    try {
        const votedFeatures = JSON.parse(localStorage.getItem(`votedFeatures_${userId}`)) || [];
        
        const index = votedFeatures.indexOf(featureId);
        if (index !== -1) {
            votedFeatures.splice(index, 1);
            localStorage.setItem(`votedFeatures_${userId}`, JSON.stringify(votedFeatures));
            
            // Log activity
            logUserActivity(userId, 'feature_unvote', `Removed vote for feature: ${featureId}`);
        }
    } catch (error) {
        console.error("Error removing voted feature:", error);
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

// Save feedback submission to localStorage
function saveFeedbackSubmission(formData) {
    try {
        // Get existing submissions or initialize empty array
        const existingSubmissions = JSON.parse(localStorage.getItem('feedbackSubmissions')) || [];
        
        // Add new submission
        existingSubmissions.push(formData);
        
        // Save back to localStorage
        localStorage.setItem('feedbackSubmissions', JSON.stringify(existingSubmissions));
        
        // Log activity if user is logged in
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            logUserActivity(user.uid, 'feedback', 'Submitted feedback');
        }
    } catch (error) {
        console.error("Error saving feedback submission:", error);
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
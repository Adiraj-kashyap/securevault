document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase if needed
    try {
        const firebaseConfig = {
            apiKey: "AIzaSyBxXvRKYoqUxEpxZ0RhV9UB8PdwLCnIk_M",
            authDomain: "securevault-d1f1f.firebaseapp.com",
            databaseURL: "https://securevault-d1f1f-default-rtdb.firebaseio.com",
            projectId: "securevault-d1f1f",
            storageBucket: "securevault-d1f1f.appspot.com",
            messagingSenderId: "1075651914548",
            appId: "1:1075651914548:web:a0b8c6e8c2b2b0a0c9b0c9"
        };

        if (!firebase.apps || !firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        } else {
            firebase.app(); // if already initialized, use that one
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
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Theme toggle functionality
    initThemeToggle();

    // Testimonial slider functionality
    initTestimonialSlider();

    // Smooth scrolling for anchor links
    initSmoothScrolling();

    // Active link highlighting
    highlightActiveLink();

    // Logout button functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

// Check if user is authenticated
function checkAuth() {
    try {
        const session = JSON.parse(localStorage.getItem('session'));
        const authLinks = document.querySelectorAll('.auth-link');
        const getStartedBtn = document.querySelector('.get-started-btn');
        const dashboardBtn = document.querySelector('.dashboard-btn');
        const ctaMainBtn = document.querySelector('.cta-main-btn');
        const ctaDashboardBtn = document.querySelector('.cta-dashboard-btn');
        const profileDropdown = document.querySelector('.profile-dropdown');
        
        if (session) {
            // User is logged in
            authLinks.forEach(link => {
                if (link.classList.contains('login-link')) {
                    link.style.display = 'none';
                } else if (link.classList.contains('dashboard-link')) {
                    link.style.display = 'block';
                }
            });
            
            // Update CTA buttons
            if (getStartedBtn) getStartedBtn.style.display = 'none';
            if (dashboardBtn) dashboardBtn.style.display = 'inline-flex';
            if (ctaMainBtn) ctaMainBtn.style.display = 'none';
            if (ctaDashboardBtn) ctaDashboardBtn.style.display = 'inline-flex';
            
            // Show profile dropdown
            if (profileDropdown) {
                profileDropdown.style.display = 'block';
                
                // Update profile info
                const profileName = document.getElementById('profile-name');
                const profileEmail = document.getElementById('profile-email');
                
                if (profileName && profileEmail) {
                    // Get user info from session
                    const userEmail = session.email || 'User';
                    const displayName = session.displayName || userEmail.split('@')[0];
                    
                    profileName.textContent = displayName;
                    profileEmail.textContent = userEmail;
                }
            }
        } else {
            // User is not logged in
            authLinks.forEach(link => {
                if (link.classList.contains('login-link')) {
                    link.style.display = 'block';
                } else if (link.classList.contains('dashboard-link')) {
                    link.style.display = 'none';
                }
            });
            
            // Update CTA buttons
            if (getStartedBtn) getStartedBtn.style.display = 'inline-flex';
            if (dashboardBtn) dashboardBtn.style.display = 'none';
            if (ctaMainBtn) ctaMainBtn.style.display = 'inline-flex';
            if (ctaDashboardBtn) ctaDashboardBtn.style.display = 'none';
            
            // Hide profile dropdown
            if (profileDropdown) {
                profileDropdown.style.display = 'none';
            }
        }
    } catch (error) {
        console.error("Auth check error:", error);
    }
}

// Initialize theme toggle
function initThemeToggle() {
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

// Initialize smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
                
                // Scroll to target
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for header height
                    behavior: 'smooth'
                });
                
                // Update URL hash
                history.pushState(null, null, targetId);
            }
        });
    });
}

// Highlight active navigation link
function highlightActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Check if we're on the home page with a hash
    const hash = window.location.hash;
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Handle hash links on home page
        if (hash && href === hash) {
            link.classList.add('active');
        }
        // Handle regular page links
        else if (href === currentPath || 
            (currentPath.includes(href) && href !== '/' && href !== '#')) {
            link.classList.add('active');
        } else if (currentPath === '/' && href === 'index.html') {
            link.classList.add('active');
        } else if (currentPath.endsWith('index.html') && href === 'index.html') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Add scroll event listener to update active state for hash links
    if (currentPath === '/' || currentPath.endsWith('index.html')) {
        window.addEventListener('scroll', updateActiveNavOnScroll);
    }
}

// Update active nav link based on scroll position
function updateActiveNavOnScroll() {
    const scrollPosition = window.scrollY;
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = '#' + section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Logout function
function logout() {
    try {
        localStorage.removeItem('session');
        firebase.auth().signOut().then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error("Logout failed:", error);
            window.location.href = 'index.html'; // Redirect anyway
        });
    } catch (error) {
        console.error("Logout error:", error);
        window.location.href = 'index.html';
    }
} 
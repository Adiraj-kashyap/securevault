document.addEventListener('DOMContentLoaded', () => {
    // Remove Lucide icons initialization
    
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    function setTheme(theme) {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }

    // Check for saved theme preference or use the system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(prefersDarkScheme.matches ? 'dark' : 'light');
    }

    // Theme toggle button click handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        setTheme(e.matches ? 'dark' : 'light');
    });

    // Handle logo click to redirect to dashboard if logged in
    const logoLinks = document.querySelectorAll('.logo');
    logoLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const session = JSON.parse(localStorage.getItem('session'));
            if (session && session.uid) {
                e.preventDefault();
                window.location.href = 'dashboard.html';
            }
        });
    });
});
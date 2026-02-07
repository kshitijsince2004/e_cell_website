/**
 * Premium Glassmorphism Navbar JavaScript
 * Handles scroll effects, mobile menu, and active states
 */

(function() {
    'use strict';
    
    // Wait for DOM to be fully loaded
    function initNavbar() {
        const navbar = document.getElementById('premiumNavbar');
        const mobileToggle = document.getElementById('mobileToggle');
        const navbarMenu = document.getElementById('navbarMenu');
        const menuLinks = document.querySelectorAll('.menu-link');
        
        if (!navbar) {
            console.warn('Premium navbar not found');
            return;
        }
        
        if (!mobileToggle) {
            console.warn('Mobile toggle button not found');
            return;
        }
        
        if (!navbarMenu) {
            console.warn('Navbar menu not found');
            return;
        }
        
        console.log('Premium navbar initialized');
        
        // Scroll effect
        let lastScrollY = window.scrollY;
        
        function handleScroll() {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            lastScrollY = currentScrollY;
        }
        
        // Mobile menu toggle
        function toggleMobileMenu(event) {
            console.log('Toggle function called');
            
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            const isActive = navbarMenu.classList.contains('active');
            
            if (isActive) {
                mobileToggle.classList.remove('active');
                navbarMenu.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                console.log('Menu closed');
            } else {
                mobileToggle.classList.add('active');
                navbarMenu.classList.add('active');
                mobileToggle.setAttribute('aria-expanded', 'true');
                console.log('Menu opened');
            }
            
            console.log('Menu classes:', navbarMenu.className);
            console.log('Menu display:', window.getComputedStyle(navbarMenu).display);
            console.log('Menu visibility:', window.getComputedStyle(navbarMenu).visibility);
        }
        
        // Set active menu item based on current page
        function setActiveMenuItem() {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            menuLinks.forEach(link => {
                link.classList.remove('active');
                const linkPage = link.getAttribute('href');
                
                if (linkPage === currentPage || 
                    (currentPage === '' && linkPage === 'index.html') ||
                    (currentPage === 'index.html' && linkPage === 'index.html')) {
                    link.classList.add('active');
                }
            });
        }
        
        // Close mobile menu when clicking outside
        function handleOutsideClick(event) {
            if (!navbar.contains(event.target) && navbarMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        }
        
        // Close mobile menu when clicking on a link
        function handleMenuLinkClick() {
            if (navbarMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        }
        
        // Event listeners
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Add click event to mobile toggle
        mobileToggle.addEventListener('click', toggleMobileMenu);
        
        // Add touch event for mobile devices (non-passive to allow preventDefault)
        mobileToggle.addEventListener('touchend', function(event) {
            event.preventDefault();
            toggleMobileMenu();
        }, { passive: false });
        
        document.addEventListener('click', handleOutsideClick);
        
        menuLinks.forEach(link => {
            link.addEventListener('click', handleMenuLinkClick);
        });
        
        // Keyboard navigation
        mobileToggle.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleMobileMenu();
            }
        });
        
        // Initialize
        setActiveMenuItem();
        handleScroll();
        
        // Add loading animation
        navbar.style.opacity = '0';
        navbar.style.transform = 'translateX(-50%) translateY(-20px)';
        
        setTimeout(() => {
            navbar.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            navbar.style.opacity = '1';
            navbar.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }
    
})();

/**
 * Premium Glassmorphism Navbar JavaScript
 * Handles scroll effects, mobile menu, and active states
 */

(function() {
    'use strict';
    
    const navbar = document.getElementById('premiumNavbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    const menuLinks = document.querySelectorAll('.menu-link');
    
    if (!navbar) return;
    
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
    function toggleMobileMenu() {
        mobileToggle.classList.toggle('active');
        navbarMenu.classList.toggle('active');
        
        // Update aria-expanded
        const isExpanded = navbarMenu.classList.contains('active');
        mobileToggle.setAttribute('aria-expanded', isExpanded);
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
    if (mobileToggle) mobileToggle.addEventListener('click', toggleMobileMenu);
    document.addEventListener('click', handleOutsideClick);
    
    menuLinks.forEach(link => {
        link.addEventListener('click', handleMenuLinkClick);
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
    
})();

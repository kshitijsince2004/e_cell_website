// Simple client-side router for admin access
class SimpleRouter {
    constructor() {
        this.routes = {
            '/admin': () => this.loadAdminPanel(),
            '/': () => this.loadHomePage()
        };
        
        this.init();
    }

    init() {
        // Handle initial page load
        this.handleRoute();
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Handle admin link clicks
        this.setupAdminLinks();
    }

    handleRoute() {
        const path = window.location.pathname;
        const route = this.routes[path];
        
        if (route) {
            route();
        } else if (path === '/admin' || path.endsWith('/admin')) {
            this.loadAdminPanel();
        } else {
            // Default to home page for unknown routes
            this.loadHomePage();
        }
    }

    loadAdminPanel() {
        // Redirect to admin/index.html
        if (!window.location.pathname.includes('admin/index.html')) {
            window.location.href = 'admin/index.html';
        }
    }

    loadHomePage() {
        // Ensure we're on the main page
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
            window.location.href = '/';
        }
    }

    setupAdminLinks() {
        // Add admin access functionality
        document.addEventListener('DOMContentLoaded', () => {
            // Create admin access link (hidden by default)
            this.createAdminAccessLink();
            
            // Listen for admin keyboard shortcut (Ctrl+Alt+A)
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.altKey && e.key === 'a') {
                    e.preventDefault();
                    this.navigateToAdmin();
                }
            });
        });
    }

    createAdminAccessLink() {
        // Create a hidden admin link in the footer
        const footer = document.querySelector('footer');
        if (footer) {
            const adminLink = document.createElement('a');
            adminLink.href = '#';
            adminLink.textContent = 'Admin';
            adminLink.style.cssText = `
                position: fixed;
                bottom: 10px;
                right: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 5px 10px;
                border-radius: 3px;
                text-decoration: none;
                font-size: 12px;
                z-index: 9999;
                opacity: 0.3;
                transition: opacity 0.3s;
            `;
            
            adminLink.addEventListener('mouseenter', () => {
                adminLink.style.opacity = '1';
            });
            
            adminLink.addEventListener('mouseleave', () => {
                adminLink.style.opacity = '0.3';
            });
            
            adminLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToAdmin();
            });
            
            document.body.appendChild(adminLink);
        }
    }

    navigateToAdmin() {
        // Navigate to admin panel
        window.location.href = 'admin/index.html';
    }

    // Method to programmatically navigate
    navigate(path) {
        window.history.pushState({}, '', path);
        this.handleRoute();
    }
}

// Initialize router when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.router = new SimpleRouter();
});

// Handle /admin URL access
if (window.location.pathname === '/admin' || window.location.pathname.endsWith('/admin')) {
    window.location.href = 'admin/index.html';
}
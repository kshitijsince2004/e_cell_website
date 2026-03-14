/**
 * E-Cell Advertisement Popup System
 * Handles fetching and displaying advertisement popups from Supabase
 * 
 * Features:
 * - Fetches active advertisements from Supabase
 * - Shows popup on every page load (no localStorage dependency)
 * - Responsive design with 4:5 aspect ratio
 * - Click to redirect to event details
 * - Close button functionality
 * - Error handling and fallbacks
 */

class AdvertisementPopup {
    constructor() {
        this.apiBase = window?.ECELL_ENV?.API_BASE || '/api/data';
        this.currentAd = null;
        this.popupElement = null;
        this.init();
    }

    async init() {
        try {
            await this.loadAndShowAdvertisement();
            console.log('✅ Advertisement popup system initialized');
        } catch (error) {
            console.error('❌ Error initializing advertisement popup:', error);
        }
    }

    async fetchActiveAdvertisement() {
        try {
            const url = new URL(this.apiBase, window.location.origin);
            url.searchParams.set('table', 'advertisements');
            url.searchParams.set('status', 'active');
            url.searchParams.set('limit', '1');
            const res = await fetch(url.toString());
            if (!res.ok) return null;
            const json = await res.json();
            const ads = json.data || [];
            return ads.length > 0 ? ads[0] : null;
        } catch (error) {
            console.error('Error fetching advertisement:', error);
            return null;
        }
    }

    async shouldShowPopup() {
        try {
            const currentPage = window.location.pathname.split('/').pop();
            const hasIdParam = window.location.search.includes('id=');
            const isDetailsPage = currentPage === 'blog-details.html' ||
                                  currentPage === 'events-detail.html' || hasIdParam;
            if (isDetailsPage) return false;

            const url = new URL(this.apiBase, window.location.origin);
            url.searchParams.set('table', 'settings');
            const res = await fetch(url.toString());
            if (!res.ok) return true;
            const json = await res.json();
            const setting = (json.data || []).find(r => r.setting_key === 'global_popup_enabled');
            return setting ? setting.setting_value === 'true' : true;
        } catch (e) {
            return true;
        }
    }

    /**
     * Load and show advertisement if available and allowed
     */
    async loadAndShowAdvertisement() {
        try {
            // Check if we should show popup
            const shouldShow = await this.shouldShowPopup();
            if (!shouldShow) {
                console.log('Popup disabled by settings or page type');
                return;
            }
            
            const advertisement = await this.fetchActiveAdvertisement();
            
            if (advertisement) {
                this.currentAd = advertisement;
                this.createPopupElement();
                this.showPopup();
            } else {
                console.log('No active advertisement found');
            }
        } catch (error) {
            console.error('Error loading advertisement:', error);
        }
    }

    /**
     * Create the popup HTML element
     */
    createPopupElement() {
        if (!this.currentAd) return;

        // Remove existing popup if any
        this.removePopupElement();

        // Create popup HTML
        const popupHTML = `
            <div class="ad-popup-overlay" id="adPopupOverlay">
                <div class="ad-popup-container">
                    <button class="ad-popup-close" id="adPopupClose" aria-label="Close Advertisement">
                        ×
                    </button>
                    <img 
                        src="${this.escapeHtml(this.currentAd.image_url)}" 
                        alt="${this.escapeHtml(this.currentAd.title)}"
                        class="ad-popup-image"
                        id="adPopupImage"
                        loading="eager"
                    />
                </div>
            </div>
        `;

        // Insert popup into DOM
        document.body.insertAdjacentHTML('beforeend', popupHTML);
        
        // Get popup element reference
        this.popupElement = document.getElementById('adPopupOverlay');
        
        // Bind events
        this.bindPopupEvents();
    }

    /**
     * Bind popup events (close, click, keyboard)
     */
    bindPopupEvents() {
        if (!this.popupElement) return;

        const closeBtn = document.getElementById('adPopupClose');
        const popupImage = document.getElementById('adPopupImage');
        const overlay = this.popupElement;

        // Close button click
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closePopup();
            });
        }

        // Image click - redirect to event
        if (popupImage) {
            popupImage.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleAdvertisementClick();
            });
        }

        // Overlay click - close popup
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closePopup();
            }
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.popupElement && this.popupElement.classList.contains('show')) {
                this.closePopup();
            }
        });

        // Image load error handling
        if (popupImage) {
            popupImage.addEventListener('error', () => {
                console.error('Failed to load advertisement image');
                this.closePopup();
            });
        }
    }

    /**
     * Show the popup with animation
     */
    showPopup() {
        if (!this.popupElement) return;

        // Add show class for animation
        setTimeout(() => {
            this.popupElement.classList.add('show');
        }, 100);

        // Focus management for accessibility
        const closeBtn = document.getElementById('adPopupClose');
        if (closeBtn) {
            closeBtn.focus();
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close the popup with animation
     */
    closePopup() {
        if (!this.popupElement) return;

        // Remove show class for animation
        this.popupElement.classList.remove('show');

        // Remove element after animation
        setTimeout(() => {
            this.removePopupElement();
        }, 300);

        // Restore body scroll
        document.body.style.overflow = '';
    }

    /**
     * Remove popup element from DOM
     */
    removePopupElement() {
        const existingPopup = document.getElementById('adPopupOverlay');
        if (existingPopup) {
            existingPopup.remove();
        }
        this.popupElement = null;
    }

    /**
     * Handle advertisement click - redirect to event details
     */
    handleAdvertisementClick() {
        if (!this.currentAd) return;

        try {
            // If advertisement is linked to an event, redirect to event details
            if (this.currentAd.event_id && this.currentAd.events) {
                const eventId = this.currentAd.event_id;
                
                // Close popup first
                this.closePopup();
                
                // Redirect to event details page
                setTimeout(() => {
                    window.location.href = `events-detail.html?id=${eventId}`;
                }, 300);
            } else {
                // If no event linked, just close the popup
                console.log('Advertisement has no linked event');
                this.closePopup();
            }
        } catch (error) {
            console.error('Error handling advertisement click:', error);
            this.closePopup();
        }
    }

    /**
     * Validate image aspect ratio (4:5)
     */
    validateImageAspectRatio(imageUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                const aspectRatio = this.width / this.height;
                const expectedRatio = 4 / 5; // 0.8
                const tolerance = 0.1;
                
                const isValidRatio = Math.abs(aspectRatio - expectedRatio) <= tolerance;
                resolve(isValidRatio);
            };
            img.onerror = () => resolve(false);
            img.src = imageUrl;
        });
    }

    /**
     * Public method to manually trigger advertisement load
     */
    async refresh() {
        await this.loadAndShowAdvertisement();
    }

    /**
     * Public method to check if popup is currently shown
     */
    isShown() {
        return this.popupElement && this.popupElement.classList.contains('show');
    }

    /**
     * Escape HTML string
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize advertisement popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Multiple ways to detect if we're on a details page
    const currentPage = window.location.pathname.split('/').pop();
    const hasIdParam = window.location.search.includes('id=');
    const isBlogDetails = currentPage === 'blog-details.html' || 
                         currentPage.includes('blog-details') ||
                         document.title.includes('Blog Details') ||
                         document.querySelector('#blogContent') !== null;
    const isEventDetails = currentPage === 'events-detail.html' || 
                          currentPage.includes('events-detail');
    
    const isDetailsPage = isBlogDetails || isEventDetails || hasIdParam;
    
    console.log('Advertisement Popup Debug:');
    console.log('Current page:', currentPage);
    console.log('Has ID param:', hasIdParam);
    console.log('Is blog details:', isBlogDetails);
    console.log('Is event details:', isEventDetails);
    console.log('Is details page:', isDetailsPage);
    console.log('Full URL:', window.location.href);
    
    // Don't show popup on any details pages
    if (isDetailsPage) {
        console.log('✅ Skipping advertisement popup on details page');
        return;
    }
    
    console.log('🎯 Initializing advertisement popup...');
    
    // Wait a bit for other scripts to load
    setTimeout(() => {
        window.advertisementPopup = new AdvertisementPopup();
    }, 1000);
});

// Export for manual usage
window.AdvertisementPopup = AdvertisementPopup;
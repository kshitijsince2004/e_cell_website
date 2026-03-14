// Join E-Cell Button Handler
class JoinEcellHandler {
    constructor() {
        this.supabaseClient = null;
        this.settings = {
            google_form_join_ecell: '',
            google_form_enabled: 'false'
        };
        this.init();
    }

    async init() {
        try {
            await this.loadSettings();
            this.setupButtonHandlers();
        } catch (error) {
            console.error('Error initializing Join E-Cell handler:', error);
            this.setupButtonHandlers();
        }
    }

    async loadSettings() {
        try {
            const apiBase = window?.ECELL_ENV?.API_BASE || '/api/data';
            const url = new URL(apiBase, window.location.origin);
            url.searchParams.set('table', 'settings');
            const res = await fetch(url.toString());
            if (!res.ok) return;
            const json = await res.json();
            (json.data || []).forEach(row => {
                this.settings[row.setting_key] = row.setting_value;
            });
        } catch (error) {
            console.error('Error loading Join E-Cell settings:', error);
        }
    }

    setupButtonHandlers() {
        const joinButtons = this.findJoinButtons();
        
        joinButtons.forEach(button => {
            button.onclick = null;
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleButtonClick();
            });
        });
    }

    findJoinButtons() {
        const buttons = [];
        const allButtons = document.querySelectorAll('a.btn, button.btn');
        
        allButtons.forEach(button => {
            const text = button.textContent.toLowerCase().trim();
            if (text.includes('join e-cell') || text.includes('become a member')) {
                buttons.push(button);
            }
        });

        const specificSelectors = [
            'a[href*="contact.html"]',
            'a[href*="about.html"]'
        ];

        specificSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const text = element.textContent.toLowerCase().trim();
                if (text.includes('join e-cell') || text.includes('become a member')) {
                    if (!buttons.includes(element)) {
                        buttons.push(element);
                    }
                }
            });
        });

        return buttons;
    }

    handleButtonClick() {
        const isEnabled = this.settings.google_form_enabled === 'true';
        const googleFormLink = this.settings.google_form_join_ecell;
        const hasValidLink = googleFormLink && googleFormLink.trim() !== '';

            if (isEnabled && hasValidLink) {
                // Redirect to Google Form
                try {
                    new URL(googleFormLink); // Validate URL
                    window.open(googleFormLink, '_blank');
                } catch (error) {
                    console.error('Invalid Google Form URL:', googleFormLink);
                    this.fallbackRedirect();
                }
            } else {
                // Fallback to contact page
                this.fallbackRedirect();
            }
    }

    fallbackRedirect() {
        // Redirect to contact page
        window.location.href = 'contact.html';
    }

    // Method to manually refresh settings (can be called from admin panel)
    async refreshSettings() {
        await this.loadSettings();
        this.setupButtonHandlers();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.joinEcellHandler = new JoinEcellHandler();
    }, 100);
});

window.JoinEcellHandler = JoinEcellHandler;
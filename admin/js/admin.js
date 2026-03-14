// =====================================================
// ADMIN PANEL - SECURE VERSION WITH SUPABASE AUTH
// =====================================================

// Wait for page to load and initialize everything
document.addEventListener("DOMContentLoaded", async function() {
    // Check if required libraries are loaded
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase library not loaded');
        alert('Error: Supabase library not loaded. Please check your internet connection.');
        return;
    }

    if (!window.authManager) {
        console.error('Auth manager not loaded');
        alert('Error: Authentication system not loaded.');
        return;
    }

    console.log('🔑 Supabase Auth initialized');
    console.log('🔐 Row Level Security enabled');

    // Initialize admin panel with authentication
    window.adminPanel = new AdminPanel();
});

// Admin Panel JavaScript Class with Supabase Authentication
class AdminPanel {
    constructor() {
        this.authManager = window.authManager;
        this.supabase = window.supabaseClient;
        this.currentEditingBlog = null;
        this.currentEditingEvent = null;
        this.currentEditingAd = null;
        this.init();
    }

    async init() {
        // Check for existing session
        const isAuthenticated = await this.authManager.init();
        
        if (isAuthenticated) {
            console.log('✅ User already authenticated');
            this.hideLoginModal();
            this.showAdminPanel();
            await this.loadDashboardData();
            this.updateUserDisplay();
        } else {
            console.log('🔓 No active session, showing login');
            this.showLoginModal();
        }
        
        this.bindEvents();
        this.setupAuthListener();
    }

    setupAuthListener() {
        let wasAuthenticated = false;

        // Listen for auth state changes
        this.authManager.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                // Only react on actual sign-in transitions, not token refreshes
                if (!wasAuthenticated) {
                    wasAuthenticated = true;
                    this.hideLoginModal();
                    this.showAdminPanel();
                    this.loadDashboardData();
                    this.updateUserDisplay();
                }
            } else if (event === 'SIGNED_OUT') {
                wasAuthenticated = false;
                this.hideAdminPanel();
                this.showLoginModal();
            }
        });
    }

    bindEvents() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;
                
                if (!email || !password) {
                    this.showLoginError('Please enter both email and password');
                    return;
                }
                
                await this.handleLogin(email, password);
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    bindAdminEvents() {
        // These events are bound after admin panel is shown
        // Add any additional event listeners here
    }

    /* ================= AUTHENTICATION ================= */

    async handleLogin(email, password) {
        try {
            this.hideLoginError();
            
            // Show loading state
            const submitBtn = document.querySelector('#loginForm button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

            // Attempt login
            const result = await this.authManager.login(email, password);

            if (result.success) {
                this.showAlert(`Welcome back, ${result.profile?.full_name || result.user.email}!`, "success");
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showLoginError(error.message);
            
            // Reset button
            const submitBtn = document.querySelector('#loginForm button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        }
    }

    async handleLogout() {
        if (!confirm('Are you sure you want to logout?')) return;

        try {
            await this.authManager.logout();
            this.showAlert("Logged out successfully", "info");
        } catch (error) {
            console.error('Logout error:', error);
            this.showAlert("Logout failed: " + error.message, "danger");
        }
    }

    /* ================= UI MANAGEMENT ================= */

    showLoginModal() {
        const loginModalElement = document.getElementById("loginModal");
        if (loginModalElement) {
            loginModalElement.style.display = 'block';
            loginModalElement.classList.add('show');
            
            // Create backdrop
            let backdrop = document.querySelector('.modal-backdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop fade show';
                document.body.appendChild(backdrop);
            }
            
            // Focus on email field
            setTimeout(() => {
                const emailField = document.getElementById('email');
                if (emailField) emailField.focus();
            }, 100);
        }
    }

    hideLoginModal() {
        const loginModalElement = document.getElementById("loginModal");
        if (loginModalElement) {
            loginModalElement.style.display = 'none';
            loginModalElement.classList.remove('show');
            
            // Remove backdrop
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
        }
    }

    showAdminPanel() {
        document.getElementById("adminPanel").classList.remove("d-none");
        console.log('✅ Admin panel displayed');
        this.bindAdminEvents();
    }

    hideAdminPanel() {
        document.getElementById("adminPanel").classList.add("d-none");
    }

    showLoginError(message) {
        const errorDiv = document.getElementById("loginError");
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove("d-none");
            
            setTimeout(() => {
                errorDiv.classList.add("d-none");
            }, 5000);
        }
    }

    hideLoginError() {
        const errorDiv = document.getElementById("loginError");
        if (errorDiv) {
            errorDiv.classList.add("d-none");
        }
    }

    updateUserDisplay() {
        const user = this.authManager.getUser();
        const profile = this.authManager.getProfile();
        
        if (!user) return;

        // Update user badge in sidebar
        const userBadge = document.getElementById('currentUsername');
        if (userBadge) {
            userBadge.textContent = profile?.full_name || user.email;
        }
        
        // Update welcome message
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            const userName = profile?.full_name || user.email;
            welcomeMessage.innerHTML = `<i class="fas fa-user"></i> Welcome, ${this.escapeHtml(userName)}!`;
        }
    }

    showAlert(message, type = "info") {
        const div = document.createElement("div");
        div.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        div.style.cssText = "top:20px;right:20px;z-index:9999;min-width:300px;";
        div.innerHTML = `
            ${this.escapeHtml(message)}
            <button class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 5000);
    }

    /* ================= NAVIGATION ================= */

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav links
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        const section = document.getElementById(sectionName);
        if (section) {
            section.classList.add('active');
        }

        // Add active class to clicked nav link
        const navLink = document.querySelector(`.sidebar-nav .nav-link[data-section="${sectionName}"]`);
        if (navLink) {
            navLink.classList.add('active');
        }

        // Load data for the section
        switch(sectionName) {
            case 'blogs':
                this.loadBlogs();
                break;
            case 'events':
                this.loadEvents();
                break;
            case 'advertisements':
                this.loadAdvertisements();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    /* ================= DASHBOARD ================= */

    async loadDashboardData() {
        try {
            // Fetch all counts in parallel for performance
            const [blogsResult, eventsResult, adsResult] = await Promise.all([
                this.supabase.from(window.CONFIG.tables.BLOGS).select("*", { count: "exact", head: true }),
                this.supabase.from(window.CONFIG.tables.EVENTS).select("*", { count: "exact", head: true }),
                this.supabase.from(window.CONFIG.tables.ADVERTISEMENTS).select("*", { count: "exact", head: true }).eq('status', 'active')
            ]);

            if (blogsResult.error) throw blogsResult.error;
            if (eventsResult.error) throw eventsResult.error;
            if (adsResult.error) throw adsResult.error;

            // Update dashboard UI
            document.getElementById("totalBlogs").textContent = blogsResult.count || 0;
            document.getElementById("totalEvents").textContent = eventsResult.count || 0;
            document.getElementById("totalAds").textContent = adsResult.count || 0;

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showAlert('Error loading dashboard: ' + error.message, 'danger');
        }
    }

    /* ================= BLOGS ================= */

    async loadBlogs() {
        try {
            const { data, error } = await this.supabase
                .from(window.CONFIG.tables.BLOGS)
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            this.renderBlogsTable(data || []);
        } catch (error) {
            console.error('Error loading blogs:', error);
            this.showAlert('Error loading blogs: ' + error.message, 'danger');
        }
    }

    renderBlogsTable(blogs) {
        const tbody = document.getElementById("blogsTable");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (blogs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        <i class="fas fa-inbox"></i> No blogs found. Create your first blog!
                    </td>
                </tr>`;
            return;
        }

        let html = "";
        blogs.forEach(b => {
            html += `
            <tr>
              <td>${this.escapeHtml(b.title)}</td>
              <td>${this.escapeHtml(b.author)}</td>
              <td>${new Date(b.date).toLocaleDateString()}</td>
              <td>
                <span class="badge bg-${b.status === "published" ? "success" : "warning"}">
                  ${this.escapeHtml(b.status)}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-primary me-1"
                  onclick="adminPanel.editBlog(${b.id})" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger"
                  onclick="adminPanel.deleteBlog(${b.id})" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }

    async editBlog(id) {
        try {
            const { data, error } = await this.supabase
                .from(window.CONFIG.tables.BLOGS)
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;

            this.openBlogModal(data);
            new bootstrap.Modal(document.getElementById('blogModal')).show();
        } catch (error) {
            console.error('Error loading blog:', error);
            this.showAlert('Error loading blog: ' + error.message, 'danger');
        }
    }

    async deleteBlog(id) {
        if (!confirm("Are you sure you want to delete this blog?")) return;

        try {
            const { error } = await this.supabase
                .from(window.CONFIG.tables.BLOGS)
                .delete()
                .eq("id", id);

            if (error) throw error;

            // Log activity
            await this.authManager.logActivity('delete', 'blogs', id, null, null);

            this.showAlert("Blog deleted successfully", "success");
            this.loadBlogs();
            this.loadDashboardData();
        } catch (error) {
            console.error('Error deleting blog:', error);
            this.showAlert('Error deleting blog: ' + error.message, 'danger');
        }
    }

    openBlogModal(blog = null) {
        this.currentEditingBlog = blog;
        const title = document.getElementById('blogModalTitle');
        
        if (blog) {
            title.textContent = 'Edit Blog';
            this.populateBlogForm(blog);
        } else {
            title.textContent = 'Add New Blog';
            this.clearBlogForm();
        }
    }

    populateBlogForm(blog) {
        document.getElementById('blogId').value = blog.id;
        document.getElementById('blogTitle').value = blog.title;
        document.getElementById('blogAuthor').value = blog.author;
        document.getElementById('blogDate').value = blog.date;
        document.getElementById('blogStatus').value = blog.status;
        document.getElementById('blogImage').value = blog.image || '';
        document.getElementById('blogExcerpt').value = blog.excerpt || '';
        document.getElementById('blogContent').value = blog.content;
        
        // Load content into Quill editor if available
        setTimeout(() => {
            if (typeof quillEditor !== 'undefined' && quillEditor && blog.content) {
                quillEditor.root.innerHTML = blog.content;
            }
        }, 200);
    }

    clearBlogForm() {
        document.getElementById('blogForm').reset();
        document.getElementById('blogId').value = '';
        
        setTimeout(() => {
            if (typeof quillEditor !== 'undefined' && quillEditor) {
                quillEditor.setContents([]);
            }
        }, 100);
    }

    /* ================= EVENTS ================= */

    async loadEvents() {
        try {
            const { data, error } = await this.supabase
                .from(window.CONFIG.tables.EVENTS)
                .select("*")
                .order("date", { ascending: false });

            if (error) throw error;

            this.renderEventsTable(data || []);
        } catch (error) {
            console.error('Error loading events:', error);
            this.showAlert('Error loading events: ' + error.message, 'danger');
        }
    }

    renderEventsTable(events) {
        const tbody = document.getElementById("eventsTable");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (events.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        <i class="fas fa-inbox"></i> No events found. Create your first event!
                    </td>
                </tr>`;
            return;
        }

        let html = "";
        events.forEach(e => {
            const eventDate = e.date ? new Date(e.date).toLocaleDateString() : 'Not set';
            
            html += `
            <tr>
              <td>${this.escapeHtml(e.title)}</td>
              <td>${eventDate}</td>
              <td>${this.escapeHtml(e.location || 'TBD')}</td>
              <td>
                <span class="badge bg-${this.getStatusColor(e.status)}">
                  ${this.escapeHtml(e.status || 'upcoming')}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-primary me-1"
                  onclick="adminPanel.editEvent(${e.id})" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger"
                  onclick="adminPanel.deleteEvent(${e.id})" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }

    getStatusColor(status) {
        const colors = {
            'upcoming': 'primary',
            'ongoing': 'success',
            'completed': 'secondary',
            'cancelled': 'danger'
        };
        return colors[status] || 'primary';
    }

    async editEvent(id) {
        try {
            const { data, error } = await this.supabase
                .from(window.CONFIG.tables.EVENTS)
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;

            this.openEventModal(data);
            new bootstrap.Modal(document.getElementById('eventModal')).show();
        } catch (error) {
            console.error('Error loading event:', error);
            this.showAlert('Error loading event: ' + error.message, 'danger');
        }
    }

    async deleteEvent(id) {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            const { error } = await this.supabase
                .from(window.CONFIG.tables.EVENTS)
                .delete()
                .eq("id", id);

            if (error) throw error;

            await this.authManager.logActivity('delete', 'events', id, null, null);

            this.showAlert("Event deleted successfully", "success");
            this.loadEvents();
            this.loadDashboardData();
        } catch (error) {
            console.error('Error deleting event:', error);
            this.showAlert('Error deleting event: ' + error.message, 'danger');
        }
    }

    openEventModal(event = null) {
        // Open the event modal
        const modal = new bootstrap.Modal(document.getElementById('eventModal'));
        const title = document.getElementById('eventModalTitle');
        
        // Helper function to safely set value
        const setValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.value = value || '';
        };
        
        if (event) {
            // Edit mode - populate form with existing data
            title.textContent = 'Edit Event';
            setValue('eventId', event.id);
            setValue('eventTitle', event.title);
            setValue('eventDescription', event.description);
            setValue('eventDate', event.date);
            setValue('eventTime', event.time);
            setValue('eventVenue', event.location);
            setValue('eventStatus', event.status || 'upcoming');
            setValue('eventType', event.event_type);
            setValue('eventOrganizer', event.organizer);
            setValue('eventCategory', event.category);
            setValue('eventImage', event.image);
            
            // Show current image if exists
            if (event.image) {
                const preview = document.getElementById('eventImagePreview');
                if (preview) {
                    preview.style.display = 'block';
                    const img = document.getElementById('eventImagePreviewImg');
                    if (img) img.src = event.image;
                }
            }
        } else {
            // Create mode - clear form
            title.textContent = 'Add New Event';
            const form = document.getElementById('eventForm');
            if (form) form.reset();
            setValue('eventId', '');
            const preview = document.getElementById('eventImagePreview');
            if (preview) preview.style.display = 'none';
        }
        
        modal.show();
    }

    /* ================= ADVERTISEMENTS ================= */

    async loadAdvertisements() {
        try {
            const { data, error } = await this.supabase
                .from(window.CONFIG.tables.ADVERTISEMENTS)
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            this.renderAdvertisementsTable(data || []);
        } catch (error) {
            console.error('Error loading advertisements:', error);
            this.showAlert('Error loading advertisements: ' + error.message, 'danger');
        }
    }

    renderAdvertisementsTable(ads) {
        const tbody = document.getElementById("advertisementsTable");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (ads.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        <i class="fas fa-inbox"></i> No advertisements found.
                    </td>
                </tr>`;
            return;
        }

        let html = "";
        ads.forEach(ad => {
            html += `
            <tr>
              <td>
                ${ad.image_url ? `<img src="${this.escapeHtml(ad.image_url)}" style="max-width:50px;max-height:50px;" alt="Ad">` : '<i class="fas fa-image text-muted"></i>'}
              </td>
              <td>${this.escapeHtml(ad.title || 'Untitled')}</td>
              <td>${this.escapeHtml(ad.event_title || 'N/A')}</td>
              <td>
                <span class="badge bg-${ad.status === 'active' ? 'success' : 'secondary'}">
                  ${this.escapeHtml(ad.status)}
                </span>
              </td>
              <td>${new Date(ad.created_at).toLocaleDateString()}</td>
              <td>
                <button class="btn btn-sm btn-primary me-1"
                  onclick="adminPanel.editAdvertisement(${ad.id})" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger"
                  onclick="adminPanel.deleteAdvertisement(${ad.id})" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }

    async deleteAdvertisement(id) {
        if (!confirm("Are you sure you want to delete this advertisement?")) return;

        try {
            const { error } = await this.supabase
                .from(window.CONFIG.tables.ADVERTISEMENTS)
                .delete()
                .eq("id", id);

            if (error) throw error;

            await this.authManager.logActivity('delete', 'advertisements', id, null, null);

            this.showAlert("Advertisement deleted successfully", "success");
            this.loadAdvertisements();
            this.loadDashboardData();
        } catch (error) {
            console.error('Error deleting advertisement:', error);
            this.showAlert('Error deleting advertisement: ' + error.message, 'danger');
        }
    }

    async openAdvertisementModal(ad = null) {
        // Load events into the dropdown first
        await this.loadEventsIntoAdDropdown(ad ? ad.event_id : null);

        // Open the advertisement modal
        const modal = new bootstrap.Modal(document.getElementById('advertisementModal'));
        
        // Helper function to safely set value
        const setValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.value = value || '';
        };
        
        if (ad) {
            // Edit mode - populate form with existing data
            setValue('advertisementId', ad.id);
            setValue('adTitle', ad.title);
            setValue('adExternalLink', ad.external_link);
            setValue('adStatus', ad.status || 'active');
            setValue('adDisplayType', ad.display_type || 'popup');
            setValue('adStartDate', ad.start_date);
            setValue('adEndDate', ad.end_date);
            setValue('adDisplayFrequency', ad.display_frequency || 'once');
            setValue('adTargetPages', ad.target_pages || 'all');
            setValue('adEventId', ad.event_id || '');
            
            // Show current image if exists
            if (ad.image_url) {
                setValue('adImageUrl', ad.image_url);
                const preview = document.getElementById('adImagePreview');
                if (preview) {
                    preview.src = ad.image_url;
                    preview.style.display = 'block';
                }
                // Enable preview button
                const previewBtn = document.getElementById('previewAdBtn');
                if (previewBtn) previewBtn.disabled = false;
            }
        } else {
            // Create mode - clear form
            const form = document.getElementById('advertisementForm');
            if (form) form.reset();
            setValue('advertisementId', '');
            const preview = document.getElementById('adImagePreview');
            if (preview) preview.style.display = 'none';
            const previewBtn = document.getElementById('previewAdBtn');
            if (previewBtn) previewBtn.disabled = true;
        }
        
        modal.show();
    }

    async loadEventsIntoAdDropdown(selectedEventId = null) {
        const select = document.getElementById('adEventId');
        if (!select) return;

        try {
            const { data: events, error } = await this.supabase
                .from(window.CONFIG.tables.EVENTS)
                .select('id, title')
                .order('date', { ascending: false });

            if (error) throw error;

            select.innerHTML = '<option value="">No Event Link</option>';
            (events || []).forEach(ev => {
                const opt = document.createElement('option');
                opt.value = ev.id;
                opt.textContent = ev.title;
                if (selectedEventId && String(ev.id) === String(selectedEventId)) {
                    opt.selected = true;
                }
                select.appendChild(opt);
            });
        } catch (err) {
            console.warn('Could not load events for ad dropdown:', err);
        }
    }

    editAdvertisement(id) {
        // Find the advertisement and open modal
        this.supabase
            .from(window.CONFIG.tables.ADVERTISEMENTS)
            .select('*')
            .eq('id', id)
            .single()
            .then(({ data, error }) => {
                if (error) throw error;
                this.openAdvertisementModal(data);
            })
            .catch(error => {
                console.error('Error loading advertisement:', error);
                this.showAlert('Error loading advertisement: ' + error.message, 'danger');
            });
    }

    /* ================= SETTINGS ================= */

    async loadSettings() {
        try {
            const { data, error } = await this.supabase
                .from(window.CONFIG.tables.SETTINGS)
                .select('setting_key, setting_value')
                .in('setting_key', ['google_form_join_ecell', 'google_form_enabled', 'global_popup_enabled']);

            if (error) throw error;

            const map = {};
            (data || []).forEach(row => { map[row.setting_key] = row.setting_value; });

            const googleFormLink = document.getElementById('googleFormLink');
            const googleFormEnabled = document.getElementById('googleFormEnabled');

            if (googleFormLink) googleFormLink.value = map['google_form_join_ecell'] || '';
            if (googleFormEnabled) googleFormEnabled.checked = map['google_form_enabled'] === 'true';

        } catch (error) {
            console.error('Error loading settings:', error);
            this.showAlert('Error loading settings: ' + error.message, 'warning');
        }
    }

    async saveGoogleFormSettings() {
        try {
            const googleFormLink = document.getElementById('googleFormLink').value.trim();
            const googleFormEnabled = document.getElementById('googleFormEnabled').checked;

            // Upsert each setting as a key-value row
            const upserts = [
                { setting_key: 'google_form_join_ecell', setting_value: googleFormLink, is_public: false },
                { setting_key: 'google_form_enabled', setting_value: String(googleFormEnabled), is_public: false }
            ];

            const { error } = await this.supabase
                .from(window.CONFIG.tables.SETTINGS)
                .upsert(upserts, { onConflict: 'setting_key' });

            if (error) throw error;

            await this.authManager.logActivity('update', 'settings', null, null, { google_form_join_ecell: googleFormLink, google_form_enabled: googleFormEnabled });

            this.showAlert('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showAlert('Error saving settings: ' + error.message, 'danger');
        }
    }

    testGoogleFormLink() {
        const link = document.getElementById('googleFormLink').value.trim();
        if (link) {
            window.open(link, '_blank');
        } else {
            this.showAlert('Please enter a Google Form link first', 'warning');
        }
    }

    /* ================= UTILITIES ================= */

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for onclick handlers
window.openBlogModal = function(blog = null) {
    if (window.adminPanel) {
        window.adminPanel.openBlogModal(blog);
    }
};

window.openEventModal = function(event = null) {
    if (window.adminPanel) {
        window.adminPanel.openEventModal(event);
    }
};

window.openAdvertisementModal = function(ad = null) {
    if (window.adminPanel) {
        window.adminPanel.openAdvertisementModal(ad);
    }
};

window.saveBlog = async function() {
    console.log('Save blog function called');
    
    if (!window.adminPanel) {
        console.error('Admin panel not initialized');
        return;
    }
    
    try {
        // Get form data
        const blogId = document.getElementById('blogId').value;
        const title = document.getElementById('blogTitle').value;
        const author = document.getElementById('blogAuthor').value;
        const date = document.getElementById('blogDate').value;
        const status = document.getElementById('blogStatus').value;
        const excerpt = document.getElementById('blogExcerpt').value;
        const category = document.getElementById('blogCategory')?.value || '';
        const tags = document.getElementById('blogTags')?.value || '';
        
        // Get content from Quill editor
        const content = window.quillEditor ? window.quillEditor.root.innerHTML : '';
        
        // Get image URL (either typed or uploaded as data URL)
        const imageUrl = document.getElementById('blogImage')?.value || '';

        // Validate required fields
        if (!title) {
            window.adminPanel.showAlert('Blog title is required.', 'warning');
            return;
        }
        if (!date) {
            window.adminPanel.showAlert('Blog date is required.', 'warning');
            return;
        }
        
        // Prepare blog data
        const blogData = {
            title,
            author,
            date,
            status,
            excerpt,
            content,
            image: imageUrl,
            category,
            tags,
            updated_at: new Date().toISOString()
        };
        
        let result;
        if (blogId) {
            // Update existing blog
            result = await window.adminPanel.supabase
                .from(window.CONFIG.tables.BLOGS)
                .update(blogData)
                .eq('id', blogId);
        } else {
            // Create new blog
            blogData.created_at = new Date().toISOString();
            result = await window.adminPanel.supabase
                .from(window.CONFIG.tables.BLOGS)
                .insert([blogData]);
        }
        
        if (result.error) throw result.error;
        
        // Log activity
        await window.adminPanel.authManager.logActivity(
            blogId ? 'update' : 'create',
            'blogs',
            blogId || null,
            null,
            blogData
        );
        
        // Close modal and reload
        const modal = bootstrap.Modal.getInstance(document.getElementById('blogModal'));
        if (modal) modal.hide();
        
        window.adminPanel.showAlert(
            `Blog ${blogId ? 'updated' : 'created'} successfully!`,
            'success'
        );
        window.adminPanel.loadBlogs();
        window.adminPanel.loadDashboardData();
        
    } catch (error) {
        console.error('Error saving blog:', error);
        window.adminPanel.showAlert('Error saving blog: ' + error.message, 'danger');
    }
};

window.saveEvent = async function() {
    console.log('Save event function called');
    
    if (!window.adminPanel) {
        console.error('Admin panel not initialized');
        return;
    }
    
    try {
        // Get form data
        const eventId = document.getElementById('eventId').value;
        const title = document.getElementById('eventTitle').value.trim();
        const description = document.getElementById('eventDescription').value;
        const date = document.getElementById('eventDate').value || null;
        const time = document.getElementById('eventTime').value || null;
        const location = document.getElementById('eventVenue')?.value || '';
        const status = document.getElementById('eventStatus').value;
        const eventType = document.getElementById('eventType')?.value || '';
        const organizer = document.getElementById('eventOrganizer')?.value || '';
        const category = document.getElementById('eventCategory')?.value || '';
        
        // Validate required fields
        if (!title) {
            window.adminPanel.showAlert('Event title is required.', 'warning');
            return;
        }
        if (!date) {
            window.adminPanel.showAlert('Event date is required.', 'warning');
            return;
        }
        
        // Get image URL (either typed or uploaded as data URL)
        const imageUrl = document.getElementById('eventImage')?.value || '';
        
        // Prepare event data
        const eventData = {
            title,
            description,
            date,
            time,
            location,
            status,
            event_type: eventType,
            organizer,
            category,
            image: imageUrl,
            updated_at: new Date().toISOString()
        };
        
        let result;
        if (eventId) {
            // Update existing event
            result = await window.adminPanel.supabase
                .from(window.CONFIG.tables.EVENTS)
                .update(eventData)
                .eq('id', eventId);
        } else {
            // Create new event
            eventData.created_at = new Date().toISOString();
            result = await window.adminPanel.supabase
                .from(window.CONFIG.tables.EVENTS)
                .insert([eventData]);
        }
        
        if (result.error) throw result.error;
        
        // Log activity
        await window.adminPanel.authManager.logActivity(
            eventId ? 'update' : 'create',
            'events',
            eventId || null,
            null,
            eventData
        );
        
        // Close modal and reload
        const modal = bootstrap.Modal.getInstance(document.getElementById('eventModal'));
        if (modal) modal.hide();
        
        window.adminPanel.showAlert(
            `Event ${eventId ? 'updated' : 'created'} successfully!`,
            'success'
        );
        window.adminPanel.loadEvents();
        window.adminPanel.loadDashboardData();
        
    } catch (error) {
        console.error('Error saving event:', error);
        window.adminPanel.showAlert('Error saving event: ' + error.message, 'danger');
    }
};

window.saveAdvertisement = async function() {
    console.log('Save advertisement function called');
    
    if (!window.adminPanel) {
        console.error('Admin panel not initialized');
        return;
    }
    
    try {
        // Helper function to safely get value
        const getValue = (id, defaultValue = '') => {
            const element = document.getElementById(id);
            return element ? element.value : defaultValue;
        };
        
        // Get form data
        const adId = getValue('advertisementId');
        const title = getValue('adTitle');
        const externalLink = getValue('adExternalLink');
        const status = getValue('adStatus', 'active');
        const displayType = getValue('adDisplayType', 'popup');
        const startDate = getValue('adStartDate') || null;
        const endDate = getValue('adEndDate') || null;
        const displayFrequency = getValue('adDisplayFrequency', 'once');
        const targetPages = getValue('adTargetPages', 'all');
        
        // Get image URL (either typed or uploaded as data URL)
        const imageUrl = getValue('adImageUrl');
        const eventId = getValue('adEventId') || null;
        
        // Prepare advertisement data
        const adData = {
            title,
            image_url: imageUrl,
            external_link: externalLink,
            event_id: eventId,
            status,
            display_type: displayType,
            start_date: startDate,
            end_date: endDate,
            display_frequency: displayFrequency,
            target_pages: targetPages,
            updated_at: new Date().toISOString()
        };
        
        let result;
        if (adId) {
            // Update existing advertisement
            result = await window.adminPanel.supabase
                .from(window.CONFIG.tables.ADVERTISEMENTS)
                .update(adData)
                .eq('id', adId);
        } else {
            // Create new advertisement
            adData.created_at = new Date().toISOString();
            result = await window.adminPanel.supabase
                .from(window.CONFIG.tables.ADVERTISEMENTS)
                .insert([adData]);
        }
        
        if (result.error) throw result.error;
        
        // Log activity
        await window.adminPanel.authManager.logActivity(
            adId ? 'update' : 'create',
            'advertisements',
            adId || null,
            null,
            adData
        );
        
        // Close modal and reload
        const modal = bootstrap.Modal.getInstance(document.getElementById('advertisementModal'));
        if (modal) modal.hide();
        
        window.adminPanel.showAlert(
            `Advertisement ${adId ? 'updated' : 'created'} successfully!`,
            'success'
        );
        window.adminPanel.loadAdvertisements();
        window.adminPanel.loadDashboardData();
        
    } catch (error) {
        console.error('Error saving advertisement:', error);
        window.adminPanel.showAlert('Error saving advertisement: ' + error.message, 'danger');
    }
};

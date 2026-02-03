// Wait for page to load and initialize everything
document.addEventListener("DOMContentLoaded", function() {
    // Check if supabase is available
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase library not loaded');
        alert('Error: Supabase library not loaded. Please check your internet connection.');
        return;
    }

    // Supabase client is now initialized in secure-config.js
    console.log('Supabase client loaded from secure-config.js');

    // Initialize admin panel
    window.adminPanel = new AdminPanel();
    
    // Fallback navigation function for onclick handlers
    window.navigateToSection = function(sectionName) {
        if (window.adminPanel) {
            window.adminPanel.showSection(sectionName);
        } else {
            console.error('Admin panel not initialized');
        }
    };
});

// Admin Panel JavaScript Class
class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.currentEditingBlog = null;
        this.currentEditingEvent = null;
        this.init();
    }

    init() {
        this.checkAuthState();
        this.bindEvents();
        this.showLoginModal();
    }

    /* ================= AUTH ================= */

    async checkAuthState() {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();

            if (user) {
                this.currentUser = user;
                this.showAdminPanel();
                this.loadDashboardData();
            } else {
                this.showLoginModal();
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
            this.showLoginModal();
        }
    }

    async login(email, password) {
        try {
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.currentUser = data.user;
            this.hideLoginModal();
            this.showAdminPanel();
            this.loadDashboardData();
            this.showAlert("Login successful!", "success");
        } catch (error) {
            console.error('Login error:', error);
            this.showLoginError(error.message);
        }
    }

    async logout() {
        try {
            await window.supabaseClient.auth.signOut();
            this.currentUser = null;
            this.hideAdminPanel();
            this.showLoginModal();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    /* ================= UI ================= */

    showLoginModal() {
        const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
        loginModal.show();
    }

    hideLoginModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
        if (modal) modal.hide();
    }

    showAdminPanel() {
        document.getElementById("adminPanel").classList.remove("d-none");
        // Bind admin-specific events after panel is shown
        this.bindAdminEvents();
    }

    hideAdminPanel() {
        document.getElementById("adminPanel").classList.add("d-none");
    }

    showLoginError(message) {
        const err = document.getElementById("loginError");
        err.textContent = message;
        err.classList.remove("d-none");
    }

    showAlert(message, type = "info") {
        const div = document.createElement("div");
        div.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        div.style.cssText = "top:20px;right:20px;z-index:9999;min-width:300px;";
        div.innerHTML = `
            ${message}
            <button class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 5000);
    }

    /* ================= DASHBOARD ================= */

    async loadDashboardData() {
        try {
            const { count: blogsCount } = await window.supabaseClient
                .from(window.CONFIG.tables.BLOGS)
                .select("*", { count: "exact", head: true });

            const { count: eventsCount } = await window.supabaseClient
                .from(window.CONFIG.tables.EVENTS)
                .select("*", { count: "exact", head: true });

            const { count: adsCount } = await window.supabaseClient
                .from(window.CONFIG.tables.ADVERTISEMENTS)
                .select("*", { count: "exact", head: true })
                .eq('status', 'active');

            document.getElementById("totalBlogs").textContent = blogsCount || 0;
            document.getElementById("totalEvents").textContent = eventsCount || 0;
            document.getElementById("totalAds").textContent = adsCount || 0;
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    /* ================= BLOGS ================= */

    async loadBlogs() {
        try {
            const { data } = await window.supabaseClient
                .from(window.CONFIG.tables.BLOGS)
                .select("*")
                .order("created_at", { ascending: false });

            this.renderBlogsTable(data || []);
        } catch (error) {
            console.error('Error loading blogs:', error);
            this.showAlert('Error loading blogs', 'danger');
        }
    }

    renderBlogsTable(blogs) {
        const tbody = document.getElementById("blogsTable");
        tbody.innerHTML = "";

        blogs.forEach(b => {
            tbody.innerHTML += `
            <tr>
              <td>${b.title}</td>
              <td>${b.author}</td>
              <td>${new Date(b.date).toLocaleDateString()}</td>
              <td>
                <span class="badge bg-${b.status === "published" ? "success" : "warning"}">
                  ${b.status}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-primary me-1"
                  onclick="adminPanel.editBlog(${b.id})">
                  ✏️
                </button>
                <button class="btn btn-sm btn-danger"
                  onclick="adminPanel.deleteBlog(${b.id})">
                  🗑
                </button>
              </td>
            </tr>`;
        });
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
    }

    clearBlogForm() {
        document.getElementById('blogForm').reset();
        document.getElementById('blogId').value = '';
    }

    async saveBlog() {
        try {
            const blog = {
                title: document.getElementById('blogTitle').value,
                author: document.getElementById('blogAuthor').value,
                date: document.getElementById('blogDate').value,
                status: document.getElementById('blogStatus').value,
                image: document.getElementById('blogImage').value,
                excerpt: document.getElementById('blogExcerpt').value,
                content: document.getElementById('blogContent').value
            };

            const id = document.getElementById('blogId').value;

            if (id) {
                await window.supabaseClient
                    .from(window.CONFIG.tables.BLOGS)
                    .update(blog)
                    .eq("id", id);
            } else {
                await window.supabaseClient
                    .from(window.CONFIG.tables.BLOGS)
                    .insert([blog]);
            }

            this.showAlert("Blog saved!", "success");
            bootstrap.Modal.getInstance(document.getElementById('blogModal')).hide();
            this.loadBlogs();
            this.loadDashboardData();
        } catch (error) {
            console.error('Error saving blog:', error);
            this.showAlert('Error saving blog', 'danger');
        }
    }

    async editBlog(id) {
        try {
            const { data } = await window.supabaseClient
                .from(window.CONFIG.tables.BLOGS)
                .select("*")
                .eq("id", id)
                .single();

            this.openBlogModal(data);
            new bootstrap.Modal(document.getElementById('blogModal')).show();
        } catch (error) {
            console.error('Error loading blog:', error);
            this.showAlert('Error loading blog', 'danger');
        }
    }

    async deleteBlog(id) {
        if (!confirm("Delete blog?")) return;

        try {
            await window.supabaseClient
                .from(window.CONFIG.tables.BLOGS)
                .delete()
                .eq("id", id);

            this.showAlert("Blog deleted", "success");
            this.loadBlogs();
            this.loadDashboardData();
        } catch (error) {
            console.error('Error deleting blog:', error);
            this.showAlert('Error deleting blog', 'danger');
        }
    }

    /* ================= DATABASE COMPATIBILITY CHECK ================= */

    async checkDatabaseCompatibility() {
        try {
            // Try to query with enhanced columns to see if they exist
            const { data, error } = await window.supabaseClient
                .from(window.CONFIG.tables.EVENTS)
                .select('id, title, event_type, organizer, venue')
                .limit(1);

            if (error) {
                // Enhanced columns don't exist
                this.showAlert('Database needs migration for full functionality. Currently using basic mode.', 'warning');
                return false;
            } else {
                // Enhanced columns exist
                this.showAlert('Database is fully compatible!', 'success');
                return true;
            }
        } catch (error) {
            console.warn('Database compatibility check failed:', error);
            return false;
        }
    }

    /* ================= EVENTS ================= */

    async loadEvents() {
        try {
            const { data, error } = await window.supabaseClient
                .from(window.CONFIG.tables.EVENTS)
                .select(`
                    id, title, description, date, time, location,
                    event_type, organizer, category, duration, status,
                    registration_link, registration_note, created_at
                `)
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
        tbody.innerHTML = "";

        events.forEach(e => {
            const eventDate = e.date ? new Date(e.date).toLocaleDateString() : 'Not set';
            const eventTime = e.time ? ` at ${e.time}` : '';
            const eventType = e.event_type ? ` (${e.event_type})` : '';
            
            tbody.innerHTML += `
            <tr>
              <td>
                <strong>${e.title}</strong>${eventType}
                <br><small class="text-muted">${e.category || 'No category'}</small>
              </td>
              <td>
                ${eventDate}${eventTime}
                <br><small class="text-muted">${e.duration || 'Duration not set'}</small>
              </td>
              <td>
                ${e.location || 'Location TBD'}
                ${e.registration_note ? `<br><small class="text-muted">${e.registration_note.substring(0, 50)}${e.registration_note.length > 50 ? '...' : ''}</small>` : ''}
              </td>
              <td>
                <span class="badge bg-${this.getStatusColor(e.status)}">${e.status || 'upcoming'}</span>
                ${e.registration_link ? `<br><small class="text-muted"><i class="fas fa-link"></i> Registration Link</small>` : ''}
              </td>
              <td>
                <button class="btn btn-sm btn-primary me-1"
                  onclick="adminPanel.editEvent(${e.id})" title="Edit Event">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger"
                  onclick="adminPanel.deleteEvent(${e.id})" title="Delete Event">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>`;
        });
    }

    getStatusColor(status) {
        switch(status) {
            case 'upcoming': return 'primary';
            case 'ongoing': return 'success';
            case 'completed': return 'secondary';
            case 'cancelled': return 'danger';
            default: return 'primary';
        }
    }

    openEventModal(event = null) {
        this.currentEditingEvent = event;
        const title = document.getElementById('eventModalTitle');
        
        if (event) {
            title.textContent = 'Edit Event';
            this.populateEventForm(event);
        } else {
            title.textContent = 'Add New Event';
            this.clearEventForm();
        }
    }

    populateEventForm(event) {
        // Basic Information
        document.getElementById('eventId').value = event.id || '';
        document.getElementById('eventTitle').value = event.title || '';
        document.getElementById('eventType').value = event.event_type || 'Workshop';
        document.getElementById('eventOrganizer').value = event.organizer || 'E-Cell Team';
        document.getElementById('eventCategory').value = event.category || '';
        document.getElementById('eventDate').value = event.date || '';
        document.getElementById('eventTime').value = event.time || '';
        document.getElementById('eventDuration').value = event.duration || '';
        document.getElementById('eventVenue').value = event.location || '';
        document.getElementById('eventStatus').value = event.status || 'upcoming';
        document.getElementById('eventImage').value = event.image || '';
        document.getElementById('eventDescription').value = event.description || '';

        // Event Overview
        document.getElementById('eventOverview').value = event.overview || '';
        document.getElementById('eventLearning').value = event.learning_description || '';

        // Learning Points
        const learningPoints = event.learning_points ? JSON.parse(event.learning_points) : [];
        for (let i = 1; i <= 6; i++) {
            const element = document.getElementById(`learningPoint${i}`);
            if (element) {
                element.value = learningPoints[i-1] || '';
            }
        }

        // Event Schedule
        document.getElementById('scheduleDescription').value = event.schedule_description || '';
        const schedule = event.schedule ? JSON.parse(event.schedule) : [];
        for (let i = 1; i <= 8; i++) {
            const element = document.getElementById(`schedule${i}`);
            if (element) {
                element.value = schedule[i-1] || '';
            }
        }

        // Registration Link
        document.getElementById('registrationLink').value = event.registration_link || '';
        document.getElementById('registrationNote').value = event.registration_note || '';

        // Additional Information
        document.getElementById('eventRating').value = event.rating || '';
        document.getElementById('contactEmail').value = event.contact_email || '';
        document.getElementById('eventTags').value = event.tags || '';
        document.getElementById('specialNotes').value = event.special_notes || '';
    }

    clearEventForm() {
        document.getElementById('eventForm').reset();
        document.getElementById('eventId').value = '';
        // Set default values
        document.getElementById('eventOrganizer').value = 'E-Cell Team';
        document.getElementById('eventStatus').value = 'upcoming';
    }

    async saveEvent() {
        try {
            // Collect learning points
            const learningPoints = [];
            for (let i = 1; i <= 6; i++) {
                const value = document.getElementById(`learningPoint${i}`).value.trim();
                if (value) learningPoints.push(value);
            }

            // Collect schedule items
            const schedule = [];
            for (let i = 1; i <= 8; i++) {
                const value = document.getElementById(`schedule${i}`).value.trim();
                if (value) schedule.push(value);
            }

            const event = {
                // Basic Information
                title: document.getElementById('eventTitle').value,
                event_type: document.getElementById('eventType').value,
                organizer: document.getElementById('eventOrganizer').value,
                category: document.getElementById('eventCategory').value,
                date: document.getElementById('eventDate').value,
                time: document.getElementById('eventTime').value,
                duration: document.getElementById('eventDuration').value,
                location: document.getElementById('eventVenue').value, // Map to location for compatibility
                status: document.getElementById('eventStatus').value,
                image: document.getElementById('eventImage').value,
                description: document.getElementById('eventDescription').value,

                // Event Overview
                overview: document.getElementById('eventOverview').value,
                learning_description: document.getElementById('eventLearning').value,

                // Learning Points (stored as JSON)
                learning_points: learningPoints.length > 0 ? JSON.stringify(learningPoints) : null,

                // Event Schedule
                schedule_description: document.getElementById('scheduleDescription').value,
                schedule: schedule.length > 0 ? JSON.stringify(schedule) : null,

                // Registration Link
                registration_link: document.getElementById('registrationLink').value,
                registration_note: document.getElementById('registrationNote').value,

                // Additional Information
                rating: parseInt(document.getElementById('eventRating').value) || null,
                contact_email: document.getElementById('contactEmail').value,
                tags: document.getElementById('eventTags').value,
                special_notes: document.getElementById('specialNotes').value
            };

            // Validate required fields
            if (!event.title || !event.description || !event.date || !event.location) {
                throw new Error('Please fill in all required fields (Title, Description, Date, Location)');
            }

            const id = document.getElementById('eventId').value;

            if (id) {
                const { error } = await window.supabaseClient
                    .from(window.CONFIG.tables.EVENTS)
                    .update(event)
                    .eq("id", id);
                
                if (error) throw error;
                this.showAlert("Event updated successfully!", "success");
            } else {
                const { error } = await window.supabaseClient
                    .from(window.CONFIG.tables.EVENTS)
                    .insert([event]);
                
                if (error) throw error;
                this.showAlert("Event created successfully!", "success");
            }

            bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
            this.loadEvents();
            this.loadDashboardData();

        } catch (error) {
            console.error('Error saving event:', error);
            this.showAlert('Error saving event: ' + error.message, 'danger');
        }
    }

    async editEvent(id) {
        try {
            const { data, error } = await window.supabaseClient
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
        if (!confirm("Delete event?")) return;

        try {
            await window.supabaseClient
                .from(window.CONFIG.tables.EVENTS)
                .delete()
                .eq("id", id);

            this.showAlert("Event deleted", "success");
            this.loadEvents();
            this.loadDashboardData();
        } catch (error) {
            console.error('Error deleting event:', error);
            this.showAlert('Error deleting event', 'danger');
        }
    }

    /* ================= ADVERTISEMENTS ================= */

    async loadAdvertisements() {
        try {
            const { data, error } = await window.supabaseClient
                .from(window.CONFIG.tables.ADVERTISEMENTS)
                .select(`
                    id, title, image_url, event_id, status, created_at,
                    events (
                        id, title
                    )
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            this.renderAdvertisementsTable(data || []);
        } catch (error) {
            console.error('Error loading advertisements:', error);
            this.showAlert('Error loading advertisements: ' + error.message, 'danger');
        }
    }

    renderAdvertisementsTable(advertisements) {
        const tbody = document.getElementById("advertisementsTable");
        tbody.innerHTML = "";

        advertisements.forEach(ad => {
            const createdDate = new Date(ad.created_at).toLocaleDateString();
            const eventTitle = ad.events ? ad.events.title : 'No Event';
            const statusBadge = ad.status === 'active' ? 'success' : 'secondary';
            
            tbody.innerHTML += `
            <tr>
              <td>
                <img src="${ad.image_url}" alt="${ad.title}" 
                     style="width: 40px; height: 50px; object-fit: cover; border-radius: 4px;"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA0MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyNUMyMi4yMDkxIDI1IDI0IDIzLjIwOTEgMjQgMjFDMjQgMTguNzkwOSAyMi4yMDkxIDE3IDIwIDE3QzE3Ljc5MDkgMTcgMTYgMTguNzkwOSAxNiAyMUMxNiAyMy4yMDkxIDE3Ljc5MDkgMjUgMjAgMjVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMCAzM0wxNCAyOUwyMCAzNUwyNiAyOUwzMCAzM1YzN0gxMFYzM1oiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cg=='">
              </td>
              <td>
                <strong>${ad.title}</strong>
              </td>
              <td>
                ${eventTitle}
                ${ad.event_id ? `<br><small class="text-muted">ID: ${ad.event_id}</small>` : ''}
              </td>
              <td>
                <span class="badge bg-${statusBadge}">${ad.status}</span>
                ${ad.status === 'active' ? '<br><small class="text-success"><i class="fas fa-eye"></i> Visible</small>' : ''}
              </td>
              <td>
                ${createdDate}
              </td>
              <td>
                <button class="btn btn-sm btn-primary me-1"
                  onclick="adminPanel.editAdvertisement(${ad.id})" title="Edit Advertisement">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-success me-1"
                  onclick="adminPanel.previewAdvertisement(${ad.id})" title="Preview Popup">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger"
                  onclick="adminPanel.deleteAdvertisement(${ad.id})" title="Delete Advertisement">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>`;
        });
    }

    async loadEventsForDropdown() {
        try {
            const { data, error } = await window.supabaseClient
                .from(window.CONFIG.tables.EVENTS)
                .select('id, title, date, status')
                .order('date', { ascending: false });

            if (error) throw error;

            const dropdown = document.getElementById('adEventId');
            if (dropdown) {
                // Clear existing options except the first one
                dropdown.innerHTML = '<option value="">No Event Link</option>';
                
                data.forEach(event => {
                    const eventDate = event.date ? new Date(event.date).toLocaleDateString() : '';
                    const option = document.createElement('option');
                    option.value = event.id;
                    option.textContent = `${event.title} ${eventDate ? `(${eventDate})` : ''}`;
                    dropdown.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading events for dropdown:', error);
        }
    }

    openAdvertisementModal(advertisement = null) {
        this.currentEditingAdvertisement = advertisement;
        const title = document.getElementById('advertisementModalTitle');
        
        if (advertisement) {
            title.textContent = 'Edit Advertisement';
            this.populateAdvertisementForm(advertisement);
        } else {
            title.textContent = 'Add New Advertisement';
            this.clearAdvertisementForm();
        }

        // Setup image preview functionality
        this.setupImagePreview();
    }

    populateAdvertisementForm(advertisement) {
        document.getElementById('advertisementId').value = advertisement.id || '';
        document.getElementById('adTitle').value = advertisement.title || '';
        document.getElementById('adImageUrl').value = advertisement.image_url || '';
        document.getElementById('adEventId').value = advertisement.event_id || '';
        document.getElementById('adStatus').value = advertisement.status || 'inactive';

        // Trigger image preview
        this.updateImagePreview(advertisement.image_url);
    }

    clearAdvertisementForm() {
        document.getElementById('advertisementForm').reset();
        document.getElementById('advertisementId').value = '';
        
        // Clear image preview
        this.clearImagePreview();
    }

    setupImagePreview() {
        const imageUrlInput = document.getElementById('adImageUrl');
        const previewBtn = document.getElementById('previewAdBtn');

        if (imageUrlInput) {
            imageUrlInput.addEventListener('input', (e) => {
                const url = e.target.value.trim();
                this.updateImagePreview(url);
                
                // Enable/disable preview button
                if (previewBtn) {
                    previewBtn.disabled = !url;
                }
            });
        }

        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.previewCurrentAdvertisement();
            });
        }
    }

    updateImagePreview(imageUrl) {
        const preview = document.getElementById('imagePreview');
        const placeholder = document.getElementById('imagePreviewPlaceholder');
        const warningDiv = document.getElementById('aspectRatioWarning');

        if (!imageUrl) {
            this.clearImagePreview();
            return;
        }

        if (preview && placeholder) {
            preview.src = imageUrl;
            preview.style.display = 'block';
            placeholder.style.display = 'none';

            // Check aspect ratio
            preview.onload = () => {
                const aspectRatio = preview.naturalWidth / preview.naturalHeight;
                const expectedRatio = 4 / 5; // 0.8
                const tolerance = 0.1;
                
                const isValidRatio = Math.abs(aspectRatio - expectedRatio) <= tolerance;
                
                if (warningDiv) {
                    warningDiv.style.display = isValidRatio ? 'none' : 'block';
                }
            };

            preview.onerror = () => {
                this.clearImagePreview();
                this.showAlert('Failed to load image. Please check the URL.', 'warning');
            };
        }
    }

    clearImagePreview() {
        const preview = document.getElementById('imagePreview');
        const placeholder = document.getElementById('imagePreviewPlaceholder');
        const warningDiv = document.getElementById('aspectRatioWarning');

        if (preview) {
            preview.style.display = 'none';
            preview.src = '';
        }
        if (placeholder) {
            placeholder.style.display = 'block';
        }
        if (warningDiv) {
            warningDiv.style.display = 'none';
        }
    }

    async saveAdvertisement() {
        try {
            const advertisement = {
                title: document.getElementById('adTitle').value.trim(),
                image_url: document.getElementById('adImageUrl').value.trim(),
                event_id: document.getElementById('adEventId').value || null,
                status: document.getElementById('adStatus').value
            };

            // Validate required fields
            if (!advertisement.title || !advertisement.image_url) {
                throw new Error('Please fill in all required fields (Title and Image)');
            }

            // Validate URL format (for both URLs and data URLs)
            if (!advertisement.image_url.startsWith('data:') && !advertisement.image_url.startsWith('http')) {
                throw new Error('Please enter a valid image URL or upload an image file');
            }

            const id = document.getElementById('advertisementId').value;

            // If setting to active, deactivate all other advertisements first
            if (advertisement.status === 'active') {
                await this.deactivateAllAdvertisements();
            }

            if (id) {
                const { error } = await window.supabaseClient
                    .from(window.CONFIG.tables.ADVERTISEMENTS)
                    .update(advertisement)
                    .eq("id", id);
                
                if (error) throw error;
                this.showAlert("Advertisement updated successfully!", "success");
            } else {
                const { error } = await window.supabaseClient
                    .from(window.CONFIG.tables.ADVERTISEMENTS)
                    .insert([advertisement]);
                
                if (error) throw error;
                this.showAlert("Advertisement created successfully!", "success");
            }

            bootstrap.Modal.getInstance(document.getElementById('advertisementModal')).hide();
            this.loadAdvertisements();
            this.loadDashboardData();

        } catch (error) {
            console.error('Error saving advertisement:', error);
            this.showAlert('Error saving advertisement: ' + error.message, 'danger');
        }
    }

    async deactivateAllAdvertisements() {
        try {
            const { error } = await window.supabaseClient
                .from(window.CONFIG.tables.ADVERTISEMENTS)
                .update({ status: 'inactive' })
                .eq('status', 'active');

            if (error) throw error;
        } catch (error) {
            console.error('Error deactivating advertisements:', error);
            throw error;
        }
    }

    async editAdvertisement(id) {
        try {
            const { data, error } = await window.supabaseClient
                .from(window.CONFIG.tables.ADVERTISEMENTS)
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;

            this.openAdvertisementModal(data);
            new bootstrap.Modal(document.getElementById('advertisementModal')).show();
        } catch (error) {
            console.error('Error loading advertisement:', error);
            this.showAlert('Error loading advertisement: ' + error.message, 'danger');
        }
    }

    async deleteAdvertisement(id) {
        if (!confirm("Delete advertisement? This action cannot be undone.")) return;

        try {
            const { error } = await window.supabaseClient
                .from(window.CONFIG.tables.ADVERTISEMENTS)
                .delete()
                .eq("id", id);

            if (error) throw error;

            this.showAlert("Advertisement deleted successfully", "success");
            this.loadAdvertisements();
            this.loadDashboardData();
        } catch (error) {
            console.error('Error deleting advertisement:', error);
            this.showAlert('Error deleting advertisement: ' + error.message, 'danger');
        }
    }

    async previewAdvertisement(id) {
        try {
            const { data, error } = await window.supabaseClient
                .from(window.CONFIG.tables.ADVERTISEMENTS)
                .select(`
                    id, title, image_url, event_id,
                    events (
                        id, title
                    )
                `)
                .eq("id", id)
                .single();

            if (error) throw error;

            // Create a temporary popup for preview
            this.showAdvertisementPreview(data);
        } catch (error) {
            console.error('Error loading advertisement for preview:', error);
            this.showAlert('Error loading advertisement preview', 'danger');
        }
    }

    previewCurrentAdvertisement() {
        const title = document.getElementById('adTitle').value.trim();
        const imageUrl = document.getElementById('adImageUrl').value.trim();
        const eventId = document.getElementById('adEventId').value;

        if (!title || !imageUrl) {
            this.showAlert('Please fill in title and image (URL or upload)', 'warning');
            return;
        }

        const mockAd = {
            id: 'preview',
            title: title,
            image_url: imageUrl,
            event_id: eventId || null,
            events: eventId ? { id: eventId, title: 'Sample Event' } : null
        };

        this.showAdvertisementPreview(mockAd);
    }

    showAdvertisementPreview(advertisement) {
        // Remove existing preview
        const existingPreview = document.getElementById('adPreviewOverlay');
        if (existingPreview) {
            existingPreview.remove();
        }

        // Create preview popup
        const previewHTML = `
            <div class="ad-popup-overlay show" id="adPreviewOverlay" style="z-index: 10000;">
                <div class="ad-popup-container">
                    <button class="ad-popup-close" onclick="document.getElementById('adPreviewOverlay').remove()">
                        ×
                    </button>
                    <img 
                        src="${advertisement.image_url}" 
                        alt="${advertisement.title}"
                        class="ad-popup-image"
                        style="cursor: default;"
                    />
                    <div style="position: absolute; bottom: 10px; left: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px; font-size: 12px; text-align: center;">
                        PREVIEW MODE - ${advertisement.event_id ? 'Links to Event' : 'No Event Link'}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', previewHTML);

        // Auto-close after 5 seconds
        setTimeout(() => {
            const preview = document.getElementById('adPreviewOverlay');
            if (preview) {
                preview.remove();
            }
        }, 5000);
    }

    /* ================= SETTINGS ================= */

    async loadSettings() {
        try {
            const { data, error } = await window.supabaseClient
                .from(window.CONFIG.tables.SETTINGS)
                .select('setting_key, setting_value')
                .in('setting_key', ['google_form_join_ecell', 'google_form_enabled']);

            if (error) throw error;

            const settings = {};
            data.forEach(setting => {
                settings[setting.setting_key] = setting.setting_value;
            });

            const googleFormLink = document.getElementById('googleFormLink');
            const googleFormEnabled = document.getElementById('googleFormEnabled');
            const googleFormStatusText = document.getElementById('googleFormStatusText');
            const buttonRedirectText = document.getElementById('buttonRedirectText');

            if (googleFormLink) {
                googleFormLink.value = settings.google_form_join_ecell || '';
            }

            if (googleFormEnabled) {
                const isEnabled = settings.google_form_enabled === 'true';
                googleFormEnabled.checked = isEnabled;
                
                if (googleFormStatusText) {
                    googleFormStatusText.textContent = isEnabled ? 'Enabled' : 'Disabled';
                }
            }

            this.updateButtonPreview(settings.google_form_join_ecell, settings.google_form_enabled === 'true');

            if (buttonRedirectText) {
                const isEnabled = settings.google_form_enabled === 'true';
                const hasLink = settings.google_form_join_ecell && settings.google_form_join_ecell.trim() !== '';
                
                if (isEnabled && hasLink) {
                    buttonRedirectText.textContent = 'Google Form';
                } else {
                    buttonRedirectText.textContent = 'Contact Page (Google Form disabled)';
                }
            }

        } catch (error) {
            console.error('Error loading settings:', error);
            this.showAlert('Error loading settings: ' + error.message, 'danger');
        }
    }

    updateButtonPreview(googleFormLink, isEnabled) {
        const previewJoinBtn = document.getElementById('previewJoinBtn');
        const previewMemberBtn = document.getElementById('previewMemberBtn');
        
        const hasValidLink = googleFormLink && googleFormLink.trim() !== '';
        const shouldEnable = isEnabled && hasValidLink;

        if (previewJoinBtn) {
            previewJoinBtn.disabled = !shouldEnable;
            previewJoinBtn.onclick = shouldEnable ? () => window.open(googleFormLink, '_blank') : null;
        }

        if (previewMemberBtn) {
            previewMemberBtn.disabled = !shouldEnable;
            previewMemberBtn.onclick = shouldEnable ? () => window.open(googleFormLink, '_blank') : null;
        }
    }

    async saveGoogleFormSettings() {
        try {
            const googleFormLink = document.getElementById('googleFormLink').value.trim();
            const googleFormEnabled = document.getElementById('googleFormEnabled').checked;

            if (googleFormLink && googleFormLink !== '') {
                try {
                    new URL(googleFormLink);
                } catch {
                    throw new Error('Please enter a valid URL for the Google Form link');
                }
            }

            const updates = [
                {
                    setting_key: 'google_form_join_ecell',
                    setting_value: googleFormLink
                },
                {
                    setting_key: 'google_form_enabled',
                    setting_value: googleFormEnabled.toString()
                }
            ];

            for (const update of updates) {
                const { error } = await window.supabaseClient
                    .from(window.CONFIG.tables.SETTINGS)
                    .update({ setting_value: update.setting_value })
                    .eq('setting_key', update.setting_key);

                if (error) throw error;
            }

            const googleFormStatusText = document.getElementById('googleFormStatusText');
            const buttonRedirectText = document.getElementById('buttonRedirectText');

            if (googleFormStatusText) {
                googleFormStatusText.textContent = googleFormEnabled ? 'Enabled' : 'Disabled';
            }

            if (buttonRedirectText) {
                const hasLink = googleFormLink && googleFormLink.trim() !== '';
                if (googleFormEnabled && hasLink) {
                    buttonRedirectText.textContent = 'Google Form';
                } else {
                    buttonRedirectText.textContent = 'Contact Page (Google Form disabled)';
                }
            }

            this.updateButtonPreview(googleFormLink, googleFormEnabled);
            this.showAlert('Settings saved successfully!', 'success');

        } catch (error) {
            console.error('Error saving settings:', error);
            this.showAlert('Error saving settings: ' + error.message, 'danger');
        }
    }

    testGoogleFormLink() {
        const googleFormLink = document.getElementById('googleFormLink').value.trim();
        
        if (!googleFormLink) {
            this.showAlert('Please enter a Google Form link first', 'warning');
            return;
        }

        try {
            new URL(googleFormLink);
            window.open(googleFormLink, '_blank');
            this.showAlert('Opening Google Form in new tab...', 'info');
        } catch {
            this.showAlert('Invalid URL format. Please check the link.', 'danger');
        }
    }

    /* ================= NAVIGATION ================= */

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
            console.error('Section not found:', sectionName);
            return;
        }

        // Add active class to clicked nav link
        const navLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (navLink) {
            navLink.classList.add('active');
        }

        // Load data based on section
        switch (sectionName) {
            case 'blogs':
                this.loadBlogs();
                break;
            case 'events':
                this.loadEvents();
                // Check database compatibility when entering events section
                setTimeout(() => this.checkDatabaseCompatibility(), 1000);
                break;
            case 'advertisements':
                this.loadAdvertisements();
                this.loadEventsForDropdown();
                break;
            case 'settings':
                this.loadSettings();
                this.setupSettingsEventListeners();
                break;
            case 'dashboard':
                this.loadDashboardData();
                break;
            default:
                console.warn('Unknown section:', sectionName);
        }
    }

    setupSettingsEventListeners() {
        const googleFormEnabled = document.getElementById('googleFormEnabled');
        if (googleFormEnabled) {
            googleFormEnabled.addEventListener('change', (e) => {
                const statusText = document.getElementById('googleFormStatusText');
                const buttonRedirectText = document.getElementById('buttonRedirectText');
                const googleFormLink = document.getElementById('googleFormLink').value.trim();
                
                if (statusText) {
                    statusText.textContent = e.target.checked ? 'Enabled' : 'Disabled';
                }
                
                if (buttonRedirectText) {
                    const hasLink = googleFormLink && googleFormLink.trim() !== '';
                    if (e.target.checked && hasLink) {
                        buttonRedirectText.textContent = 'Google Form';
                    } else {
                        buttonRedirectText.textContent = 'Contact Page (Google Form disabled)';
                    }
                }

                this.updateButtonPreview(googleFormLink, e.target.checked);
            });
        }

        const googleFormLink = document.getElementById('googleFormLink');
        if (googleFormLink) {
            googleFormLink.addEventListener('input', (e) => {
                const isEnabled = document.getElementById('googleFormEnabled').checked;
                const buttonRedirectText = document.getElementById('buttonRedirectText');
                
                if (buttonRedirectText) {
                    const hasLink = e.target.value.trim() !== '';
                    if (isEnabled && hasLink) {
                        buttonRedirectText.textContent = 'Google Form';
                    } else {
                        buttonRedirectText.textContent = 'Contact Page (Google Form disabled)';
                    }
                }

                this.updateButtonPreview(e.target.value.trim(), isEnabled);
            });
        }
    }

    /* ================= EVENT BINDING ================= */

    bindEvents() {
        // Login form event
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.login(
                    document.getElementById('email').value, 
                    document.getElementById('password').value
                );
            });
        }

        // Logout button event - use event delegation since it might not exist initially
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'logoutBtn') {
                e.preventDefault();
                this.logout();
            }
        });

        // Navigation events - use event delegation for better reliability
        document.addEventListener('click', (e) => {
            if (e.target && e.target.hasAttribute('data-section')) {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                this.showSection(section);
            }
        });
    }

    // Method to bind events after admin panel is shown
    bindAdminEvents() {
        // Navigation links
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }
}

/* ================= GLOBAL FUNCTIONS ================= */

// Global functions for onclick handlers
function openBlogModal(blog = null) {
    if (window.adminPanel) {
        window.adminPanel.openBlogModal(blog);
    }
}

function openEventModal(event = null) {
    if (window.adminPanel) {
        window.adminPanel.openEventModal(event);
    }
}

function saveBlog() {
    if (window.adminPanel) {
        window.adminPanel.saveBlog();
    }
}

function saveEvent() {
    if (window.adminPanel) {
        window.adminPanel.saveEvent();
    }
}

function openAdvertisementModal(advertisement = null) {
    if (window.adminPanel) {
        window.adminPanel.openAdvertisementModal(advertisement);
    }
}

function saveAdvertisement() {
    if (window.adminPanel) {
        window.adminPanel.saveAdvertisement();
    }
}
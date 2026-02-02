// Events Client - Handles database operations for events
class EventsClient {
    constructor() {
        // Initialize Supabase client
        this.SUPABASE_URL = "https://khxeesffponvgpgnszpz.supabase.co";
        this.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoeGVlc2ZmcG9udmdwZ25zenB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MjQ0OTcsImV4cCI6MjA4NTIwMDQ5N30.Nie54ajcJH6Ll51VBVTablRlZEETYUMOHxogWHbwThY";
        
        this.supabaseClient = null;
        this.initializeClient();
    }

    // Initialize Supabase client
    initializeClient() {
        try {
            if (typeof window.supabase !== 'undefined') {
                this.supabaseClient = window.supabase.createClient(this.SUPABASE_URL, this.SUPABASE_ANON_KEY);
                console.log('Events client initialized successfully');
            } else {
                console.error('Supabase library not loaded');
            }
        } catch (error) {
            console.error('Error initializing events client:', error);
        }
    }

    // Get all events with comprehensive fields
    async getAllEvents() {
        try {
            if (!this.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }

            const { data: events, error } = await this.supabaseClient
                .from('events')
                .select(`
                    id, title, description, date, time, location, venue, image, status,
                    event_type, organizer, category, duration, 
                    registration_link, registration_note,
                    rating, contact_email, tags, special_notes,
                    overview, learning_description, learning_points, 
                    schedule_description, schedule,
                    created_at, updated_at
                `)
                .order('date', { ascending: true });

            if (error) throw error;
            return events || [];
        } catch (error) {
            console.error('Error fetching events:', error);
            // Fallback to basic query if comprehensive query fails
            try {
                const { data: basicEvents, error: basicError } = await this.supabaseClient
                    .from('events')
                    .select('*')
                    .order('date', { ascending: true });
                
                if (basicError) throw basicError;
                return basicEvents || [];
            } catch (fallbackError) {
                console.error('Fallback query also failed:', fallbackError);
                return [];
            }
        }
    }

    // Get event by ID
    async getEventById(id) {
        try {
            if (!this.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }

            const { data: event, error } = await this.supabaseClient
                .from('events')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return event;
        } catch (error) {
            console.error('Error fetching event by ID:', error);
            return null;
        }
    }

    // Get upcoming events with comprehensive fields
    async getUpcomingEvents() {
        try {
            if (!this.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }

            const today = new Date().toISOString().split('T')[0];
            
            const { data: events, error } = await this.supabaseClient
                .from('events')
                .select(`
                    id, title, description, date, time, location, venue, image, status,
                    event_type, organizer, category, duration, 
                    registration_link, registration_note,
                    rating, contact_email, tags, special_notes,
                    overview, learning_description, learning_points, 
                    schedule_description, schedule,
                    created_at, updated_at
                `)
                .gte('date', today)
                .order('date', { ascending: true });

            if (error) throw error;
            return events || [];
        } catch (error) {
            console.error('Error fetching upcoming events:', error);
            // Fallback to basic query
            try {
                const today = new Date().toISOString().split('T')[0];
                const { data: basicEvents, error: basicError } = await this.supabaseClient
                    .from('events')
                    .select('*')
                    .gte('date', today)
                    .order('date', { ascending: true });
                
                if (basicError) throw basicError;
                return basicEvents || [];
            } catch (fallbackError) {
                console.error('Fallback query also failed:', fallbackError);
                return [];
            }
        }
    }

    // Get events by status with comprehensive fields
    async getEventsByStatus(status) {
        try {
            if (!this.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }

            // Try comprehensive query first
            const { data: events, error } = await this.supabaseClient
                .from('events')
                .select(`
                    id, title, description, date, time, location, venue, image, status,
                    event_type, organizer, category, duration, 
                    registration_link, registration_note,
                    rating, contact_email, tags, special_notes,
                    overview, learning_description, learning_points, 
                    schedule_description, schedule,
                    created_at, updated_at
                `)
                .eq('status', status)
                .order('date', { ascending: true });

            if (error) {
                console.error('Database error:', error);
                // If status column doesn't exist, just return all events
                const { data: basicEvents, error: basicError } = await this.supabaseClient
                    .from('events')
                    .select('*')
                    .order('date', { ascending: true });
                
                if (basicError) throw basicError;
                return basicEvents || [];
            }
            return events || [];
        } catch (error) {
            console.error('Error fetching events by status:', error);
            return [];
        }
    }

    // Utility functions
    formatEventDate(date, time) {
        if (!date) return 'Date TBD';
        
        const eventDate = new Date(date).toLocaleDateString();
        const eventTime = time ? ` at ${time}` : '';
        
        return `${eventDate}${eventTime}`;
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

    getStatusBadge(status) {
        const color = this.getStatusColor(status);
        return `<span class="badge bg-${color}">${status || 'upcoming'}</span>`;
    }

    // Create event card HTML with glassmorphism and top-right status
    createEventCardHTML(event) {
        console.log('🔮 Creating glassmorphism event card for:', event.title);
        const eventDate = this.formatEventDate(event.date, event.time);
        const eventImage = event.image || 'img/gallery/protfolio-img01.png';
        const eventType = event.event_type ? ` (${event.event_type})` : '';
        const statusColor = this.getStatusColor(event.status);
        const venue = event.venue || event.location || 'Venue TBD';

        return `
            <div class="col-lg-6 col-md-6 mb-4">
                <a href="events-detail.html?id=${event.id}" style="text-decoration: none; color: inherit;">
                    <div class="event-card" style="
                        position: relative;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 20px;
                        overflow: hidden;
                        transition: all 0.3s ease;
                        cursor: pointer;
                        height: 100%;
                        background: rgba(42, 42, 42, 0.7);
                        backdrop-filter: blur(15px);
                        -webkit-backdrop-filter: blur(15px);
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    " 
                    onmouseover="
                        this.style.transform='translateY(-10px)';
                        this.style.boxShadow='0 20px 40px rgba(0,0,0,0.4)';
                        this.style.background='rgba(42, 42, 42, 0.8)';
                        this.style.borderColor='rgba(255, 255, 255, 0.2)';
                    " 
                    onmouseout="
                        this.style.transform='translateY(0)';
                        this.style.boxShadow='0 8px 32px rgba(0, 0, 0, 0.3)';
                        this.style.background='rgba(42, 42, 42, 0.7)';
                        this.style.borderColor='rgba(255, 255, 255, 0.1)';
                    ">
                        
                        <!-- Status Badge - Top Right of Card -->
                        <div style="position: absolute; top: 15px; right: 15px; z-index: 10;">
                            <span class="badge bg-${statusColor}" style="
                                font-size: 0.75rem;
                                padding: 6px 12px;
                                border-radius: 20px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                background: rgba(${this.getStatusRGBA(event.status)}, 0.9) !important;
                                backdrop-filter: blur(10px);
                                -webkit-backdrop-filter: blur(10px);
                                border: 1px solid rgba(255, 255, 255, 0.2);
                                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                                transform: none !important;
                                transition: none !important;
                                display: inline-block;
                                white-space: nowrap;
                            ">
                                ${event.status || 'upcoming'}
                            </span>
                        </div>

                        <!-- Event Image -->
                        <div style="position: relative; overflow: hidden;">
                            <img src="${eventImage}" alt="${event.title}" class="img-fluid" style="
                                height: 220px;
                                object-fit: cover;
                                width: 100%;
                                transition: transform 0.3s ease;
                            ">
                            <!-- Gradient overlay for better text readability -->
                            <div style="
                                position: absolute;
                                bottom: 0;
                                left: 0;
                                right: 0;
                                height: 60px;
                                background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
                            "></div>
                        </div>

                        <!-- Event Content -->
                        <div class="event-content" style="
                            padding: 25px;
                            background: rgba(42, 42, 42, 0.3);
                            backdrop-filter: blur(10px);
                            -webkit-backdrop-filter: blur(10px);
                        ">
                            <!-- Title and Status Row -->
                            <div class="mb-3" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 15px;">
                                <!-- Title and Type (Left Side) -->
                                <div style="flex: 1;">
                                    <h4 style="
                                        color: #ffffff;
                                        margin-bottom: 8px;
                                        font-size: 1.3rem;
                                        font-weight: 700;
                                        line-height: 1.3;
                                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                                    ">${event.title}${eventType}</h4>
                                    ${event.category ? `<small style="
                                        color: rgba(255, 255, 255, 0.7);
                                        font-size: 0.9rem;
                                        font-weight: 500;
                                    ">${event.category}</small>` : ''}
                                </div>
                                
                                <!-- Status Text (Right Side) -->
                                <div style="flex-shrink: 0;">
                                    <span style="
                                        background: rgba(${this.getStatusRGBA(event.status)}, 0.2);
                                        color: rgb(${this.getStatusRGBA(event.status)});
                                        padding: 6px 12px;
                                        border-radius: 15px;
                                        font-size: 0.8rem;
                                        font-weight: 600;
                                        text-transform: uppercase;
                                        letter-spacing: 0.5px;
                                        border: 1px solid rgba(${this.getStatusRGBA(event.status)}, 0.3);
                                        backdrop-filter: blur(10px);
                                        -webkit-backdrop-filter: blur(10px);
                                        white-space: nowrap;
                                    ">
                                        ${event.status || 'upcoming'}
                                    </span>
                                </div>
                            </div>

                            <!-- Description -->
                            <p style="
                                color: rgba(255, 255, 255, 0.85);
                                margin-bottom: 20px;
                                font-size: 1rem;
                                line-height: 1.6;
                                display: -webkit-box;
                                -webkit-line-clamp: 3;
                                -webkit-box-orient: vertical;
                                overflow: hidden;
                                font-weight: 400;
                            ">${event.description || 'No description available'}</p>

                            <!-- Event Meta Information -->
                            <div class="event-meta" style="margin-bottom: 20px;">
                                ${eventDate !== 'Date TBD' ? `
                                    <div style="
                                        color: rgba(255, 255, 255, 0.8);
                                        font-size: 0.95rem;
                                        margin-bottom: 8px;
                                        font-weight: 500;
                                        display: flex;
                                        align-items: center;
                                    ">
                                        <i class="fas fa-calendar-alt" style="
                                            color: #3498db;
                                            margin-right: 8px;
                                            width: 16px;
                                        "></i> ${eventDate}
                                    </div>
                                ` : ''}
                                ${venue !== 'Venue TBD' ? `
                                    <div style="
                                        color: rgba(255, 255, 255, 0.8);
                                        font-size: 0.95rem;
                                        margin-bottom: 8px;
                                        font-weight: 500;
                                        display: flex;
                                        align-items: center;
                                    ">
                                        <i class="fas fa-map-marker-alt" style="
                                            color: #e74c3c;
                                            margin-right: 8px;
                                            width: 16px;
                                        "></i> ${venue}
                                    </div>
                                ` : ''}
                                ${event.duration ? `
                                    <div style="
                                        color: rgba(255, 255, 255, 0.8);
                                        font-size: 0.95rem;
                                        margin-bottom: 8px;
                                        font-weight: 500;
                                        display: flex;
                                        align-items: center;
                                    ">
                                        <i class="fas fa-clock" style="
                                            color: #f39c12;
                                            margin-right: 8px;
                                            width: 16px;
                                        "></i> ${event.duration}
                                    </div>
                                ` : ''}
                            </div>

                            <!-- Action Button -->
                            <div class="text-center">
                                <span class="btn" style="
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    padding: 12px 30px;
                                    border-radius: 25px;
                                    font-size: 0.95rem;
                                    font-weight: 600;
                                    border: none;
                                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                                    transition: all 0.3s ease;
                                    backdrop-filter: blur(10px);
                                    -webkit-backdrop-filter: blur(10px);
                                ">
                                    View Details
                                </span>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `;
    }

    // Helper function to get RGBA values for status colors
    getStatusRGBA(status) {
        switch(status) {
            case 'upcoming': return '52, 152, 219'; // Blue
            case 'ongoing': return '46, 204, 113'; // Green
            case 'completed': return '149, 165, 166'; // Grey
            case 'cancelled': return '231, 76, 60'; // Red
            default: return '52, 152, 219'; // Blue
        }
    }
}

// Initialize global events client
window.eventsClient = new EventsClient();

// Global utility functions
window.loadEventsFromDatabase = async function() {
    try {
        const events = await window.eventsClient.getAllEvents();
        const container = document.getElementById('eventsContainer');
        const loadingElement = document.getElementById('loadingEvents');
        const noEventsElement = document.getElementById('noEvents');
        
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        if (!events || events.length === 0) {
            if (noEventsElement) {
                noEventsElement.classList.remove('d-none');
            }
            return;
        }
        
        if (container) {
            events.forEach(event => {
                container.innerHTML += window.eventsClient.createEventCardHTML(event);
            });
        }
        
    } catch (error) {
        console.error('Error loading events:', error);
        const loadingElement = document.getElementById('loadingEvents');
        const noEventsElement = document.getElementById('noEvents');
        
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        if (noEventsElement) {
            noEventsElement.classList.remove('d-none');
        }
    }
};

// URL parameter utility
window.getUrlParameter = function(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

console.log('Events client loaded successfully');
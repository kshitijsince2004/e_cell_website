// Supabase Client for Main Website
// This file handles fetching data from Supabase for the main E-Cell website

class EcellDataManager {
    constructor() {
        // Initialize Supabase client (same credentials as admin panel)
        this.supabaseUrl = "https://khxeesffponvgpgnszpz.supabase.co";
        this.supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoeGVlc2ZmcG9udmdwZ25zenB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MjQ0OTcsImV4cCI6MjA4NTIwMDQ5N30.Nie54ajcJH6Ll51VBVTablRlZEETYUMOHxogWHbwThY";
        
        // Initialize client when Supabase library is loaded
        this.initClient();
    }

    initClient() {
        if (typeof supabase !== 'undefined') {
            this.client = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            console.log('E-Cell Data Manager initialized');
        } else {
            // Retry after a short delay if Supabase isn't loaded yet
            setTimeout(() => this.initClient(), 100);
        }
    }

    // Fetch published blogs
    async getPublishedBlogs(limit = null) {
        try {
            let query = this.client
                .from('blogs')
                .select('*')
                .eq('status', 'published')
                .order('date', { ascending: false });

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching blogs:', error);
            return [];
        }
    }

    // Fetch events
    async getEvents(status = null, limit = null) {
        try {
            let query = this.client
                .from('events')
                .select('*')
                .order('date', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    }

    // Fetch upcoming events
    async getUpcomingEvents(limit = 3) {
        return await this.getEvents('upcoming', limit);
    }

    // Fetch recent events for homepage
    async getRecentEvents(limit = 3) {
        try {
            const { data, error } = await this.client
                .from('events')
                .select('*')
                .order('date', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching recent events:', error);
            return [];
        }
    }

    // Fetch latest blogs for homepage
    async getLatestBlogs(limit = 3) {
        return await this.getPublishedBlogs(limit);
    }

    // Get single blog by ID
    async getBlogById(id) {
        try {
            const { data, error } = await this.client
                .from('blogs')
                .select('*')
                .eq('id', id)
                .eq('status', 'published')
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching blog:', error);
            return null;
        }
    }

    // Get single event by ID
    async getEventById(id) {
        try {
            const { data, error } = await this.client
                .from('events')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching event:', error);
            return null;
        }
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Format date for blog meta
    formatBlogDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).toUpperCase();
    }

    // Truncate text for excerpts
    truncateText(text, maxLength = 150) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    // Generate blog HTML for homepage
    generateBlogHTML(blog) {
        return `
            <div class="single-post2 hover-zoomin mb-30 wow fadeInUp animated" data-animation="fadeInUp" data-delay=".4s">
                <div class="blog-thumb2">
                    <a href="blog-details.html?id=${blog.id}">
                        <img src="${blog.image || 'img/blog/inner_b1.jpg'}" alt="${blog.title}">
                    </a>
                </div>
                <div class="blog-content2">
                    <div class="b-meta">
                        <div class="meta-info">
                            <ul>
                                <li>${this.formatBlogDate(blog.date)}</li>
                                <li><span></span></li>
                                <li>${blog.author}</li>
                            </ul>
                        </div>
                    </div>
                    <h4><a href="blog-details.html?id=${blog.id}">${blog.title}</a></h4>
                </div>
            </div>
        `;
    }

    // Generate event HTML for homepage
    generateEventHTML(event) {
        return `
            <div class="grid-item hover-zoomin financial">
                <a href="events.html#event-${event.id}">
                    <figure class="gallery-image">
                        <img src="${event.image || 'img/gallery/protfolio-img01.png'}" alt="${event.title}" class="img">
                        <figcaption>
                            <h4>${event.title}</h4>
                            <span>${this.truncateText(event.description, 100)}</span>
                        </figcaption>
                    </figure>
                </a>
            </div>
        `;
    }

    // Load blogs into homepage
    async loadHomepageBlogs() {
        const blogs = await this.getLatestBlogs(4);
        const container = document.querySelector('.home-blog-active');
        
        if (container && blogs.length > 0) {
            container.innerHTML = blogs.map(blog => this.generateBlogHTML(blog)).join('');
        }
    }

    // Load events into homepage
    async loadHomepageEvents() {
        const events = await this.getRecentEvents(3);
        const container = document.querySelector('#events-area .grid.col2');
        
        if (container && events.length > 0) {
            container.innerHTML = events.map(event => this.generateEventHTML(event)).join('');
        }
    }

    // Load all events into events page
    async loadEventsPage() {
        const events = await this.getEvents();
        const container = document.querySelector('#events-area .grid.col2');
        
        if (container && events.length > 0) {
            container.innerHTML = events.map(event => this.generateEventHTML(event)).join('');
        }
    }

    // Load all blogs into blog page
    async loadBlogPage() {
        const blogs = await this.getPublishedBlogs();
        const container = document.querySelector('#blog-posts-container');
        
        if (container && blogs.length > 0) {
            container.innerHTML = blogs.map(blog => this.generateBlogPageHTML(blog)).join('');
        }
    }

    // Generate blog HTML for blog page (different from homepage)
    generateBlogPageHTML(blog) {
        const formattedDate = this.formatDate(blog.date);
        const excerpt = this.truncateText(blog.content, 200);
        const defaultImage = 'img/blog/inner_b1.jpg';
        
        return `
            <div class="bsingle__post mb-50">
                <div class="bsingle__post-thumb">
                    <img src="${blog.image || defaultImage}" alt="${blog.title}" onerror="this.src='${defaultImage}'">
                </div>
                <div class="bsingle__content">
                    <div class="meta-info">
                        <ul>
                            <li><i class="fal fa-user"></i>By ${blog.author || 'E-Cell'}</li>
                            <li><i class="fal fa-calendar-alt"></i> ${formattedDate}</li>
                        </ul>
                    </div>
                    <h2><a href="blog-details.html?id=${blog.id}">${blog.title}</a></h2>
                    <p>${excerpt}</p>
                    <div class="blog__btn">
                        <a href="blog-details.html?id=${blog.id}" class="btn3">Read More <i class="fa-sharp fa-solid fa-arrow-up"></i></a>
                    </div>
                </div>
            </div>
        `;
    }

    // Initialize content loading based on current page
    async initPageContent() {
        const currentPage = window.location.pathname.split('/').pop();
        
        switch (currentPage) {
            case 'index.html':
            case '':
                await this.loadHomepageBlogs();
                await this.loadHomepageEvents();
                break;
            case 'blog.html':
                await this.loadBlogPage();
                break;
            case 'events.html':
                await this.loadEventsPage();
                break;
        }
    }
}

// Initialize the data manager
window.ecellData = new EcellDataManager();

// Auto-load content when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for Supabase to load, then initialize content
    setTimeout(() => {
        if (window.ecellData) {
            window.ecellData.initPageContent();
        }
    }, 500);
});
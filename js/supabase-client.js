// =====================================================
// SUPABASE CLIENT FOR PUBLIC WEBSITE
// All requests go through /api/data proxy
// Keys are never exposed to the browser
// =====================================================

class EcellDataManager {
    constructor() {
        this.apiBase = window?.ECELL_ENV?.API_BASE || '/api/data';
        console.log('✅ E-Cell Data Manager initialized (proxy mode)');
    }

    async _fetch(params) {
        const url = new URL(this.apiBase, window.location.origin);
        Object.entries(params).forEach(([k, v]) => { if (v != null) url.searchParams.set(k, v); });
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        return json.data;
    }

    async getPublishedBlogs(limit = null) {
        try { return await this._fetch({ table: 'blogs', limit }); }
        catch (e) { console.error('Error fetching blogs:', e); return []; }
    }

    async getEvents(status = null, limit = null) {
        try { return await this._fetch({ table: 'events', status, limit }); }
        catch (e) { console.error('Error fetching events:', e); return []; }
    }

    async getUpcomingEvents(limit = 3) { return this.getEvents('upcoming', limit); }
    async getRecentEvents(limit = 3) { return this.getEvents(null, limit); }
    async getLatestBlogs(limit = 3) { return this.getPublishedBlogs(limit); }

    async getBlogById(id) {
        try { return await this._fetch({ table: 'blogs', id }); }
        catch (e) { console.error('Error fetching blog:', e); return null; }
    }

    async getEventById(id) {
        try { return await this._fetch({ table: 'events', id }); }
        catch (e) { console.error('Error fetching event:', e); return null; }
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    formatBlogDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    }

    truncateText(text, maxLength = 150) {
        if (!text) return '';
        return text.length <= maxLength ? text : text.substring(0, maxLength).trim() + '...';
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    generateBlogHTML(blog) {
        return `
            <div class="single-post2 hover-zoomin mb-30 wow fadeInUp animated" data-animation="fadeInUp" data-delay=".4s">
                <div class="blog-thumb2">
                    <a href="blog-details.html?id=${encodeURIComponent(blog.id)}">
                        <img src="${this.escapeHtml(blog.image || 'img/blog/inner_b1.jpg')}" alt="${this.escapeHtml(blog.title)}">
                    </a>
                </div>
                <div class="blog-content2">
                    <div class="b-meta">
                        <div class="meta-info">
                            <ul>
                                <li>${this.formatBlogDate(blog.date)}</li>
                                <li><span></span></li>
                                <li>${this.escapeHtml(blog.author)}</li>
                            </ul>
                        </div>
                    </div>
                    <h4><a href="blog-details.html?id=${encodeURIComponent(blog.id)}">${this.escapeHtml(blog.title)}</a></h4>
                </div>
            </div>`;
    }

    generateEventHTML(event) {
        return `
            <div class="grid-item hover-zoomin financial">
                <a href="events-detail.html?id=${encodeURIComponent(event.id)}">
                    <figure class="gallery-image">
                        <img src="${this.escapeHtml(event.image || 'img/gallery/protfolio-img01.png')}" alt="${this.escapeHtml(event.title)}" class="img">
                        <figcaption>
                            <h4>${this.escapeHtml(event.title)}</h4>
                            <span>${this.escapeHtml(this.truncateText(event.description, 100))}</span>
                        </figcaption>
                    </figure>
                </a>
            </div>`;
    }

    generateBlogPageHTML(blog) {
        const defaultImage = 'img/blog/inner_b1.jpg';
        return `
            <div class="bsingle__post mb-50">
                <div class="bsingle__post-thumb">
                    <img src="${this.escapeHtml(blog.image || defaultImage)}" alt="${this.escapeHtml(blog.title)}" onerror="this.src='${defaultImage}'">
                </div>
                <div class="bsingle__content">
                    <div class="meta-info">
                        <ul>
                            <li><i class="fal fa-user"></i>By ${this.escapeHtml(blog.author || 'E-Cell')}</li>
                            <li><i class="fal fa-calendar-alt"></i> ${this.formatDate(blog.date)}</li>
                        </ul>
                    </div>
                    <h2><a href="blog-details.html?id=${encodeURIComponent(blog.id)}">${this.escapeHtml(blog.title)}</a></h2>
                    <p>${this.escapeHtml(this.truncateText(blog.content, 200))}</p>
                    <div class="blog__btn">
                        <a href="blog-details.html?id=${encodeURIComponent(blog.id)}" class="btn3">Read More <i class="fa-sharp fa-solid fa-arrow-up"></i></a>
                    </div>
                </div>
            </div>`;
    }

    async loadHomepageBlogs() {
        const blogs = await this.getLatestBlogs(4);
        const container = document.querySelector('.home-blog-active');
        if (container && blogs.length > 0) container.innerHTML = blogs.map(b => this.generateBlogHTML(b)).join('');
    }

    async loadHomepageEvents() {
        const events = await this.getRecentEvents(3);
        const container = document.querySelector('#events-area .grid.col2');
        if (container && events.length > 0) container.innerHTML = events.map(e => this.generateEventHTML(e)).join('');
    }

    async loadEventsPage() {
        const events = await this.getEvents();
        const container = document.querySelector('#events-area .grid.col2');
        if (container && events.length > 0) container.innerHTML = events.map(e => this.generateEventHTML(e)).join('');
    }

    async loadBlogPage() {
        const blogs = await this.getPublishedBlogs();
        const container = document.querySelector('#blog-posts-container');
        if (container && blogs.length > 0) container.innerHTML = blogs.map(b => this.generateBlogPageHTML(b)).join('');
    }

    async initPageContent() {
        const page = window.location.pathname.split('/').pop();
        if (page === 'index.html' || page === '') {
            await this.loadHomepageBlogs();
            await this.loadHomepageEvents();
        } else if (page === 'blog.html') {
            await this.loadBlogPage();
        } else if (page === 'events.html') {
            await this.loadEventsPage();
        }
    }
}

window.ecellData = new EcellDataManager();

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { if (window.ecellData) window.ecellData.initPageContent(); }, 500);
});

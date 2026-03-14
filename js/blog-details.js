// Blog Details Page JavaScript
class BlogDetailsManager {
    constructor() {
        this.apiBase = window?.ECELL_ENV?.API_BASE || '/api/data';
        this.blogId = new URLSearchParams(window.location.search).get('id');
        this.init();
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

    async init() {
        console.log('Blog ID from URL:', this.blogId);
        if (!this.blogId) { this.showError(); return; }
        await this.loadBlogDetails();
        await this.loadRecentPosts();
    }

    async loadBlogDetails() {
        try {
            const blog = await this._fetch({ table: 'blogs', id: this.blogId });
            if (blog) {
                this.displayBlog(blog);
            } else {
                this.showError();
            }
        } catch (error) {
            console.error('Error loading blog details:', error);
            this.showError();
        }
    }

    displayBlog(blog) {
        document.getElementById('loadingState').classList.add('d-none');
        document.getElementById('errorState').classList.add('d-none');
        document.getElementById('blogContent').classList.remove('d-none');

        document.title = `${blog.title} - E-Cell NFSU Tripura`;
        document.getElementById('blogTitle').textContent = blog.title;
        document.getElementById('blogAuthor').textContent = blog.author;
        document.getElementById('blogDate').textContent = this.formatDate(blog.date);
        document.getElementById('blogStatus').textContent = blog.status;

        if (blog.image) {
            document.getElementById('blogImage').src = blog.image;
            document.getElementById('blogImage').alt = blog.title;
        } else {
            document.getElementById('blogImageContainer').style.display = 'none';
        }

        if (blog.excerpt) {
            document.getElementById('blogExcerpt').textContent = blog.excerpt;
        } else {
            document.getElementById('blogExcerptContainer').style.display = 'none';
        }

        document.getElementById('blogText').innerHTML = this.formatBlogContent(blog.content);
        this.setupSocialSharing(blog);
    }

    formatBlogContent(content) {
        if (!content) return '<p>No content available.</p>';
        if (content.includes('<') || content.includes('&')) return content;
        return content.split('\n\n').filter(p => p.trim())
            .map(p => `<p>${this.escapeHtml(p.trim())}</p>`).join('');
    }

    async loadRecentPosts() {
        try {
            const blogs = await this._fetch({ table: 'blogs', limit: 5 });
            const others = (Array.isArray(blogs) ? blogs : [])
                .filter(b => String(b.id) !== String(this.blogId))
                .slice(0, 4);
            this.displayRecentPosts(others);
        } catch (error) {
            console.error('Error loading recent posts:', error);
        }
    }

    displayRecentPosts(blogs) {
        const container = document.getElementById('recentPosts');
        if (!container) return;
        if (blogs.length === 0) { container.innerHTML = '<p>No other posts available.</p>'; return; }
        container.innerHTML = blogs.map(blog => `
            <div class="recent-post-item mb-3">
                <div class="row align-items-center">
                    <div class="col-4">
                        <img src="${this.escapeHtml(blog.image || 'img/blog/inner_b1.jpg')}"
                             alt="${this.escapeHtml(blog.title)}" class="img-fluid rounded">
                    </div>
                    <div class="col-8">
                        <h6><a href="blog-details.html?id=${blog.id}" class="text-decoration-none">${this.escapeHtml(blog.title)}</a></h6>
                        <small class="text-muted">${this.formatBlogDate(blog.date)}</small>
                    </div>
                </div>
            </div>`).join('');
    }

    setupSocialSharing(blog) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(blog.title);
        const fb = document.querySelector('.share-facebook');
        const tw = document.querySelector('.share-twitter');
        const li = document.querySelector('.share-linkedin');
        if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        if (tw) tw.href = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        if (li) li.href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    }

    showError() {
        document.getElementById('loadingState')?.classList.add('d-none');
        document.getElementById('blogContent')?.classList.add('d-none');
        document.getElementById('errorState')?.classList.remove('d-none');
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate();
        const suffix = day > 3 && day < 21 ? 'th' : ['th','st','nd','rd'][day % 10] || 'th';
        return `${day}${suffix} ${date.toLocaleDateString('en-US', { month: 'long' })} ${date.getFullYear()}`;
    }

    formatBlogDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        }).toUpperCase();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!window.blogDetailsManager) {
        window.blogDetailsManager = new BlogDetailsManager();
    }
});

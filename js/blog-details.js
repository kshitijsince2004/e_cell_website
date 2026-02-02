// Blog Details Page JavaScript
class BlogDetailsManager {
    constructor() {
        this.blogId = this.getBlogIdFromUrl();
        this.init();
    }

    // Get blog ID from URL parameters
    getBlogIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async init() {
        if (!this.blogId) {
            this.showError();
            return;
        }

        await this.loadBlogDetails();
        await this.loadRecentPosts();
    }

    async loadBlogDetails() {
        try {
            // Wait for ecellData to be initialized
            if (!window.ecellData || !window.ecellData.client) {
                setTimeout(() => this.loadBlogDetails(), 100);
                return;
            }

            const blog = await window.ecellData.getBlogById(this.blogId);
            
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
        // Hide loading state
        document.getElementById('loadingState').classList.add('d-none');
        
        // Show blog content
        document.getElementById('blogContent').classList.remove('d-none');

        // Update page title
        document.title = `${blog.title} - E-Cell NFSU Tripura`;
        document.getElementById('blogTitle').textContent = blog.title;

        // Update blog details
        document.getElementById('blogAuthor').textContent = blog.author;
        document.getElementById('blogDate').textContent = window.ecellData.formatDate(blog.date);
        document.getElementById('blogStatus').textContent = blog.status;

        // Update blog image
        if (blog.image) {
            document.getElementById('blogImage').src = blog.image;
            document.getElementById('blogImage').alt = blog.title;
        } else {
            document.getElementById('blogImageContainer').style.display = 'none';
        }

        // Update blog excerpt
        if (blog.excerpt) {
            document.getElementById('blogExcerpt').textContent = blog.excerpt;
        } else {
            document.getElementById('blogExcerptContainer').style.display = 'none';
        }

        // Update blog content
        document.getElementById('blogText').innerHTML = this.formatBlogContent(blog.content);

        // Update social sharing
        this.setupSocialSharing(blog);
    }

    formatBlogContent(content) {
        // Convert line breaks to paragraphs
        const paragraphs = content.split('\n\n').filter(p => p.trim());
        return paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
    }

    setupSocialSharing(blog) {
        const currentUrl = window.location.href;
        const title = encodeURIComponent(blog.title);
        const description = encodeURIComponent(blog.excerpt || 'Check out this blog post from E-Cell NFSU Tripura');

        // Facebook share
        document.querySelector('.share-facebook').href = 
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;

        // Twitter share
        document.querySelector('.share-twitter').href = 
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${title}`;

        // LinkedIn share
        document.querySelector('.share-linkedin').href = 
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    }

    async loadRecentPosts() {
        try {
            if (!window.ecellData || !window.ecellData.client) {
                setTimeout(() => this.loadRecentPosts(), 100);
                return;
            }

            const recentBlogs = await window.ecellData.getLatestBlogs(5);
            
            // Filter out current blog
            const otherBlogs = recentBlogs.filter(blog => blog.id != this.blogId);
            
            this.displayRecentPosts(otherBlogs.slice(0, 4));
        } catch (error) {
            console.error('Error loading recent posts:', error);
        }
    }

    displayRecentPosts(blogs) {
        const container = document.getElementById('recentPosts');
        
        if (blogs.length === 0) {
            container.innerHTML = '<p>No other posts available.</p>';
            return;
        }

        container.innerHTML = blogs.map(blog => `
            <div class="recent-post-item mb-3">
                <div class="row align-items-center">
                    <div class="col-4">
                        <img src="${blog.image || 'img/blog/inner_b1.jpg'}" 
                             alt="${blog.title}" 
                             class="img-fluid rounded">
                    </div>
                    <div class="col-8">
                        <h6><a href="blog-details.html?id=${blog.id}" class="text-decoration-none">${blog.title}</a></h6>
                        <small class="text-muted">${window.ecellData.formatBlogDate(blog.date)}</small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showError() {
        document.getElementById('loadingState').classList.add('d-none');
        document.getElementById('errorState').classList.remove('d-none');
    }
}

// Initialize blog details manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Supabase and ecellData to be ready
    setTimeout(() => {
        window.blogDetailsManager = new BlogDetailsManager();
    }, 500);
});
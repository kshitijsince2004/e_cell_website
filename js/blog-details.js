// Blog Details Page JavaScript
class BlogDetailsManager {
    constructor() {
        this.supabaseUrl = "https://khxeesffponvgpgnszpz.supabase.co";
        this.supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoeGVlc2ZmcG9udmdwZ25zenB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MjQ0OTcsImV4cCI6MjA4NTIwMDQ5N30.Nie54ajcJH6Ll51VBVTablRlZEETYUMOHxogWHbwThY";
        this.client = null;
        this.blogId = this.getBlogIdFromUrl();
        this.init();
    }

    // Get blog ID from URL parameters
    getBlogIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async init() {
        console.log('Blog Details Manager initializing...');
        console.log('Blog ID from URL:', this.blogId);
        
        if (!this.blogId) {
            console.error('No blog ID found in URL');
            this.showError();
            return;
        }

        // Initialize Supabase client using centralized manager
        if (typeof supabase !== 'undefined') {
            this.client = window.supabaseManager ? 
                window.supabaseManager.getPublicClient() : 
                supabase.createClient(this.supabaseUrl, this.supabaseKey);
            console.log('Supabase client initialized');
        } else {
            console.error('Supabase library not loaded');
            setTimeout(() => this.init(), 100);
            return;
        }

        await this.loadBlogDetails();
        await this.loadRecentPosts();
    }

    async loadBlogDetails() {
        try {
            console.log('Loading blog details for ID:', this.blogId);
            
            // Add a small delay to ensure DOM is fully ready
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const { data: blog, error } = await this.client
                .from('blogs')
                .select('*')
                .eq('id', this.blogId)
                .eq('status', 'published')
                .single();

            if (error) {
                console.error('Supabase error:', error);
                
                // If it's a "not found" error, show error state
                if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
                    console.log('Blog not found in database');
                    this.showError();
                    return;
                }
                
                throw error;
            }

            console.log('Blog data received:', blog);
            
            if (blog) {
                // Ensure we don't show error state after successful load
                setTimeout(() => {
                    this.displayBlog(blog);
                }, 50);
            } else {
                console.log('No blog found with ID:', this.blogId);
                this.showError();
            }
        } catch (error) {
            console.error('Error loading blog details:', error);
            this.showError();
        }
    }

    displayBlog(blog) {
        console.log('Displaying blog:', blog.title);
        
        // Hide loading state
        document.getElementById('loadingState').classList.add('d-none');
        
        // Hide error state (in case it was shown before)
        document.getElementById('errorState').classList.add('d-none');
        
        // Show blog content
        document.getElementById('blogContent').classList.remove('d-none');

        // Update page title
        document.title = `${blog.title} - E-Cell NFSU Tripura`;
        document.getElementById('blogTitle').textContent = blog.title;

        // Update blog details
        document.getElementById('blogAuthor').textContent = blog.author;
        document.getElementById('blogDate').textContent = this.formatDate(blog.date);
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
        
        console.log('Blog display completed successfully');
    }

    formatBlogContent(content) {
        // If content is already HTML (from Quill.js), return as is
        if (content && (content.includes('<') || content.includes('&'))) {
            return content;
        }
        
        // Otherwise, convert line breaks to paragraphs
        if (!content) return '<p>No content available.</p>';
        
        const paragraphs = content.split('\n\n').filter(p => p.trim());
        return paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        const year = date.getFullYear();
        
        const suffix = this.getOrdinalSuffix(day);
        return `${day}${suffix} ${month} ${year}`;
    }

    getOrdinalSuffix(day) {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    formatBlogDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).toUpperCase();
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
            console.log('Loading recent posts...');
            
            const { data: recentBlogs, error } = await this.client
                .from('blogs')
                .select('id, title, date, image, excerpt')
                .eq('status', 'published')
                .order('date', { ascending: false })
                .limit(5);

            if (error) {
                console.error('Error loading recent posts:', error);
                return;
            }
            
            // Filter out current blog
            const otherBlogs = recentBlogs.filter(blog => blog.id != this.blogId);
            
            console.log('Recent posts loaded:', otherBlogs.length);
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
                        <small class="text-muted">${this.formatBlogDate(blog.date)}</small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showError() {
        console.log('Showing error state for blog ID:', this.blogId);
        document.getElementById('loadingState').classList.add('d-none');
        document.getElementById('blogContent').classList.add('d-none');
        document.getElementById('errorState').classList.remove('d-none');
    }
}

// Initialize blog details manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing blog details manager...');
    
    // Prevent multiple instances
    if (window.blogDetailsManager) {
        console.log('Blog details manager already exists, skipping initialization');
        return;
    }
    
    // Initialize immediately
    window.blogDetailsManager = new BlogDetailsManager();
    
    // Also add a test to check if there are any blogs in the database
    setTimeout(async () => {
        if (window.blogDetailsManager && window.blogDetailsManager.client) {
            try {
                const { data: allBlogs, error } = await window.blogDetailsManager.client
                    .from('blogs')
                    .select('id, title, status')
                    .limit(5);
                
                console.log('All blogs in database:', allBlogs);
                if (error) console.log('Database query error:', error);
            } catch (err) {
                console.error('Error testing database connection:', err);
            }
        }
    }, 1000);
});
// =====================================================
// SUPABASE AUTHENTICATION MANAGER
// Handles secure login/logout with Supabase Auth
// =====================================================

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.currentSession = null;
        this.supabase = window.supabaseClient;
    }

    async init() {
        // Check for existing session
        const { data: { session }, error } = await this.supabase.auth.getSession();
        
        if (error) {
            console.error('Session check error:', error);
            return false;
        }

        if (session) {
            this.currentSession = session;
            this.currentUser = session.user;
            await this.loadUserProfile();
            return true;
        }

        return false;
    }

    async login(email, password) {
        try {
            console.log('🔐 Attempting login for:', email);

            // Sign in with Supabase Auth
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('Login error:', error);
                throw new Error(this.getReadableError(error));
            }

            if (!data.session) {
                throw new Error('Login failed: No session created');
            }

            this.currentSession = data.session;
            this.currentUser = data.user;

            // Load user profile
            await this.loadUserProfile();

            // Update login stats
            await this.updateLoginStats();

            // Log activity
            await this.logActivity('login', null, null, null, {
                email: email,
                login_time: new Date().toISOString()
            });

            console.log('✅ Login successful:', this.currentUser.email);
            return {
                success: true,
                user: this.currentUser,
                profile: this.userProfile
            };

        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async loadUserProfile() {
        try {
            const { data, error } = await this.supabase
                .from('admin_profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error) {
                console.warn('Profile load error:', error);
                // Create profile if it doesn't exist
                await this.createUserProfile();
                return;
            }

            this.userProfile = data;
            console.log('✅ Profile loaded:', this.userProfile);

        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    async createUserProfile() {
        try {
            const { data, error } = await this.supabase
                .from('admin_profiles')
                .insert([{
                    id: this.currentUser.id,
                    email: this.currentUser.email,
                    full_name: this.currentUser.user_metadata?.full_name || this.currentUser.email
                }])
                .select()
                .single();

            if (error) throw error;

            this.userProfile = data;
            console.log('✅ Profile created:', this.userProfile);

        } catch (error) {
            console.error('Error creating profile:', error);
        }
    }

    async updateLoginStats() {
        try {
            await this.supabase
                .from('admin_profiles')
                .update({
                    last_login: new Date().toISOString(),
                    login_count: (this.userProfile?.login_count || 0) + 1
                })
                .eq('id', this.currentUser.id);

        } catch (error) {
            console.warn('Failed to update login stats:', error);
        }
    }

    async logout() {
        try {
            // Log activity before logout
            if (this.currentUser) {
                await this.logActivity('logout', null, null, null, {
                    email: this.currentUser.email,
                    logout_time: new Date().toISOString()
                });
            }

            // Sign out from Supabase
            const { error } = await this.supabase.auth.signOut();

            if (error) {
                console.error('Logout error:', error);
                throw error;
            }

            // Clear local state
            this.currentUser = null;
            this.currentSession = null;
            this.userProfile = null;

            console.log('🔓 User logged out');
            return { success: true };

        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if error
            this.currentUser = null;
            this.currentSession = null;
            this.userProfile = null;
            throw error;
        }
    }

    async updatePassword(newPassword) {
        try {
            const { data, error } = await this.supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            
            await this.logActivity('password_update', null, null, null, {
                email: this.currentUser.email,
                updated_at: new Date().toISOString()
            });

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Password update error:', error);
            throw error;
        }
    }

    async logActivity(action, tableName, recordId, oldValues, newValues) {
        try {
            if (!this.currentUser) return;

            await this.supabase
                .from('admin_activity_log')
                .insert([{
                    admin_id: this.currentUser.id,
                    action: action,
                    table_name: tableName,
                    record_id: recordId,
                    old_values: oldValues,
                    new_values: newValues,
                    user_agent: navigator.userAgent
                }]);

        } catch (error) {
            console.warn('Failed to log activity:', error);
        }
    }

    getReadableError(error) {
        const errorMessages = {
            'Invalid login credentials': 'Invalid email or password',
            'Email not confirmed': 'Please confirm your email address',
            'User not found': 'Invalid email or password',
            'Invalid email': 'Please enter a valid email address'
        };

        return errorMessages[error.message] || error.message || 'Login failed';
    }

    isAuthenticated() {
        return this.currentSession !== null && this.currentUser !== null;
    }

    getUser() {
        return this.currentUser;
    }

    getProfile() {
        return this.userProfile;
    }

    getSession() {
        return this.currentSession;
    }

    // Listen for auth state changes
    onAuthStateChange(callback) {
        return this.supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_IN' && !this.currentUser) {
                // Only load profile on actual new sign-in, not token refreshes
                this.currentSession = session;
                this.currentUser = session.user;
                this.loadUserProfile();
            } else if (event === 'SIGNED_IN') {
                // Token refresh — just update session silently
                this.currentSession = session;
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.currentSession = null;
                this.userProfile = null;
            }

            callback(event, session);
        });
    }
}

// Create global instance
window.authManager = new AuthManager();

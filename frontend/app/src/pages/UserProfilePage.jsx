import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserDetail } from '../services/api';

const UserProfilePage = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        console.log('UserProfilePage: Fetching profile for:', username);
        
        getUserDetail(username)
            .then(res => {
                console.log('UserProfilePage: Response received', res.data);
                if (res.data && typeof res.data === 'object' && res.data.id) {
                    setUser(res.data);
                } else {
                    console.error('UserProfilePage: Invalid user data:', res.data);
                    setError('Could not load profile data correctly.');
                }
            })
            .catch(err => {
                console.error('UserProfilePage: Fetch error:', err);
                const msg = err.response?.data?.detail || err.message || 'Failed to load user profile.';
                setError(msg);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ui-bg">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mb-4"></div>
                    <p className="text-ui-text-secondary text-sm font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-ui-bg">
                <div className="max-w-md w-full bg-ui-white p-8 rounded-3xl shadow-xl border border-ui-border text-center">
                    <div className="w-20 h-20 bg-error-light text-error rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-ui-text-main mb-2">Oops!</h2>
                    <p className="text-ui-text-secondary mb-8">{error || 'User not found'}</p>
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => window.location.reload()} 
                            className="w-full py-3 bg-brand text-white rounded-xl font-bold shadow-lg hover:bg-brand-hover transition-all"
                        >
                            Try Again
                        </button>
                        <button 
                            onClick={() => navigate('/app')} 
                            className="w-full py-3 bg-ui-bg-alt text-ui-text-main rounded-xl font-bold border border-ui-border hover:bg-ui-border/30 transition-all"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const getMediaUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    };

    return (
        <div className="min-h-screen bg-ui-bg animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start mb-12 text-center md:text-left gap-6 md:gap-10">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-brand to-accent-indigo rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                        <img 
                            src={getMediaUrl(user.profile_picture) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'} 
                            alt={user.username} 
                            className="relative w-28 h-28 md:w-40 md:h-40 rounded-full object-cover shadow-2xl border-4 border-ui-white bg-ui-white" 
                        />
                    </div>
                    
                    <div className="flex-1 flex flex-col pt-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                            <h1 className="text-3xl md:text-4xl font-black text-ui-text-main tracking-tight italic">
                                {user.username}
                            </h1>
                            {user.account_type && user.account_type !== 'traveller' && (
                                <span className="w-fit mx-auto md:mx-0 bg-brand/10 text-brand text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-brand/20">
                                    {user.account_type}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-8 mb-6">
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-ui-text-main leading-none">{user.posts_count || 0}</span>
                                <span className="text-[10px] font-bold text-ui-muted uppercase tracking-widest mt-1">Posts</span>
                            </div>
                            <div className="flex flex-col border-l border-ui-border pl-8">
                                <span className="text-xl font-black text-ui-text-main leading-none">{user.followers_count || 0}</span>
                                <span className="text-[10px] font-bold text-ui-muted uppercase tracking-widest mt-1">Followers</span>
                            </div>
                            <div className="flex flex-col border-l border-ui-border pl-8">
                                <span className="text-xl font-black text-ui-text-main leading-none">{user.following_count || 0}</span>
                                <span className="text-[10px] font-bold text-ui-muted uppercase tracking-widest mt-1">Following</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {(user.city || user.country) && (
                                <p className="text-sm font-bold text-brand flex items-center justify-center md:justify-start gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {[user.city, user.country].filter(Boolean).join(', ')}
                                </p>
                            )}
                            {user.bio && (
                                <p className="text-ui-text-secondary text-sm md:text-base leading-relaxed max-w-xl">
                                    {user.bio}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Posts Section */}
                <div className="border-t border-ui-border pt-10">
                    <div className="flex items-center justify-center mb-10">
                        <div className="flex items-center gap-2 border-b-2 border-ui-text-main pb-3 px-4">
                            <svg className="w-4 h-4 text-ui-text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-ui-text-main">Shared Moments</span>
                        </div>
                    </div>

                    {user.posts && Array.isArray(user.posts) && user.posts.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1 md:gap-4 lg:gap-6">
                            {user.posts.map(post => (
                                <div 
                                    key={post.id} 
                                    onClick={() => navigate(`/app/posts/${post.id}`, { state: { background: { pathname: `/app/profile/${username}` } } })}
                                    className="relative aspect-square group overflow-hidden bg-ui-bg-alt rounded-xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
                                >
                                    {post.media_file ? (
                                        post.media_file.toLowerCase().endsWith('.mp4') ? (
                                            <video src={getMediaUrl(post.media_file)} className="w-full h-full object-cover" />
                                        ) : (
                                            <img 
                                                src={getMediaUrl(post.media_file)} 
                                                alt="" 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                            />
                                        )
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center p-4 text-center bg-gradient-to-br from-brand-light/30 to-accent-indigo/10">
                                            <p className="text-[10px] md:text-xs font-medium text-ui-text-secondary line-clamp-4 italic">
                                                "{post.caption || 'No caption'}"
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-brand/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                        <div className="flex gap-4 text-white scale-90 group-hover:scale-100 transition-transform duration-300">
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                                <span className="font-black text-sm">{post.likes_count || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l4-4V5a2 2 0 012-2h6a2 2 0 012 2v10z"/></svg>
                                                <span className="font-black text-sm">{post.comments_count || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 bg-ui-white/50 rounded-[2.5rem] border-2 border-dashed border-ui-border animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-ui-bg-alt text-ui-muted rounded-full flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-ui-text-main mb-1">No Moments Shared</h3>
                            <p className="text-ui-text-secondary text-sm">This explorer hasn't posted any photos yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;

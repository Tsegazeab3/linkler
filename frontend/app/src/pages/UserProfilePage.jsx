import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserDetail } from '../services/api';

const UserProfilePage = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        getUserDetail(userId)
            .then(res => {
                setUser(res.data);
            })
            .catch(err => {
                console.error('Error fetching user profile:', err);
                setError('Could not load user profile.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <p className="text-red-500 font-semibold">{error || 'User not found'}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start mb-8 text-center md:text-left">
                    <img 
                        src={user.profile_picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'} 
                        alt={user.username} 
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover mb-4 md:mb-0 md:mr-8 shadow-lg border-2 border-white" 
                    />
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.username}</h1>
                            <div className="flex items-center justify-center space-x-2 mt-2 md:mt-0">
                                {user.account_type === 'guide' && (
                                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                        Guide
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-center md:justify-start space-x-6 mt-4 text-sm md:text-base text-gray-600">
                            <p><span className="font-bold text-black">{user.posts_count || 0}</span> posts</p>
                            <p><span className="font-bold text-black">{user.followers_count || 0}</span> followers</p>
                            <p><span className="font-bold text-black">{user.following_count || 0}</span> following</p>
                        </div>
                        <div className="mt-4 text-gray-700 max-w-lg mx-auto md:mx-0">
                            <p className="font-medium text-gray-900 mb-1">{user.city}, {user.country}</p>
                            <p className="whitespace-pre-wrap">{user.bio}</p>
                        </div>
                    </div>
                </div>

                {/* Posts Grid */}
                <div className="border-t border-gray-200 pt-8">
                    <div className="flex items-center justify-center mb-6 space-x-8">
                        <button className="border-t-2 border-black pt-4 text-xs font-bold uppercase tracking-widest flex items-center">
                            <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M2 2h20v20H2V2zm2 2v16h16V4H4zm3 3h4v4H7V7zm6 0h4v4h-4V7zm-6 6h4v4H7v-4zm6 0h4v4h-4v-4z"/></svg>
                            Posts
                        </button>
                    </div>
                    {user.posts && user.posts.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1 md:gap-6">
                            {user.posts.map(post => (
                                <div key={post.id} className="relative aspect-square group overflow-hidden bg-gray-100 rounded-sm">
                                    {post.media_file ? (
                                        post.media_file.endsWith('.mp4') ? (
                                            <video src={post.media_file} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={post.media_file} alt={post.caption} className="w-full h-full object-cover md:hover:scale-105 transition-transform duration-500" />
                                        )
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center p-2 text-center text-[10px] md:text-sm text-gray-500 overflow-hidden">
                                            {post.caption}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 md:group-hover:bg-opacity-40 transition flex items-center justify-center">
                                        <div className="text-white flex items-center opacity-0 md:group-hover:opacity-100 transition space-x-4 font-bold">
                                            <span className="flex items-center"><svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>{post.likes_count}</span>
                                            <span className="flex items-center"><svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l4-4V5a2 2 0 012-2h6a2 2 0 012 2v10z"/></svg>{post.comments_count}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500 italic">
                            No posts to show yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;

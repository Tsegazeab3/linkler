import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { getUserDetail, createDM, followUser, unfollowUser } from '../services/api';
import { useOutletContext } from 'react-router-dom';

const GuideDetailPage = () => {
    const { id } = useParams();
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const { handleOpenChat } = useOutletContext() || {};

    useEffect(() => {
        setLoading(true);
        getUserDetail(id)
            .then(res => {
                setGuide(res.data);
                setIsFollowing(res.data.is_following);
            })
            .catch(err => {
                console.error('Error fetching guide:', err);
                setError('Guide not found');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    const handleChat = async () => {
        try {
            const res = await createDM(guide.id);
            if (handleOpenChat) handleOpenChat(res.data, 'dm');
        } catch (err) {
            console.error('Chat error:', err);
        }
    };

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await unfollowUser(guide.id);
                setIsFollowing(false);
            } else {
                await followUser(guide.id);
                setIsFollowing(true);
            }
        } catch (err) {
            console.error('Follow error:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !guide) {
        return <div className="p-8 text-center text-red-500 font-bold">{error || 'Guide not found!'}</div>;
    }

    return (
        <div className="min-h-screen p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Guide Details Section */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
                    <img src={guide.profile_picture || 'https://images.unsplash.com/photo-1440778303588-435521a205bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'} alt={guide.username} className="w-full md:w-64 h-64 md:h-80 object-cover" />
                    <div className="p-8 flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{guide.username}</h1>
                                <p className="text-gray-500 font-medium">{guide.city}, {guide.country}</p>
                            </div>
                            <div className="bg-blue-50 px-3 py-1 rounded-full flex items-center">
                                <span className="text-yellow-400 mr-1 text-sm">★</span>
                                <span className="text-blue-700 font-bold">4.5</span>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex space-x-4">
                            <div className="text-center">
                                <p className="text-xl font-bold text-gray-900">{guide.followers_count}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Followers</p>
                            </div>
                            <div className="text-center border-l border-gray-200 pl-4">
                                <p className="text-xl font-bold text-gray-900">{guide.posts_count}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Posts</p>
                            </div>
                        </div>

                        <p className="mt-6 text-gray-700 leading-relaxed italic">"{guide.bio || 'Professional local guide ready to show you the best spots.'}"</p>
                        <p className="text-3xl font-black text-gray-900 mt-6">$25<span className="text-sm font-normal text-gray-400">/hour</span></p>
                        
                        <div className="mt-8 flex space-x-3">
                            <button 
                                onClick={handleChat}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                                Start Chat
                            </button>
                            <button 
                                onClick={handleFollow}
                                className={`flex-1 font-bold py-3 px-6 rounded-xl transition-all active:scale-95 flex items-center justify-center border-2 ${isFollowing ? 'border-gray-200 text-gray-500 hover:bg-gray-50' : 'border-blue-600 text-blue-600 hover:bg-blue-50'}`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Schedule Section */}
                {guide.schedule && guide.schedule.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-3xl font-bold mb-6">Availability</h2>
                        <div className="bg-white rounded-lg shadow p-6">
                            <ul className="space-y-2">
                                {guide.schedule.map(slot => (
                                    <li key={slot.day} className="flex justify-between">
                                        <span className="font-semibold">{slot.day}</span>
                                        <span>{slot.time}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Event Pictures Section */}
                {guide.eventPictures && guide.eventPictures.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-3xl font-bold mb-6">Gallery</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {guide.eventPictures.map((pic, index) => (
                                <img key={index} src={pic} alt={`Event picture ${index + 1}`} className="w-full h-48 object-cover rounded-lg shadow-md" />
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                {guide.reviews && guide.reviews.length > 0 ? (
                    <div className="mt-12">
                        <h2 className="text-3xl font-bold mb-6">Reviews</h2>
                        <div className="space-y-6">
                            {guide.reviews.map(review => (
                                <div key={review.id} className="bg-white rounded-lg shadow p-6 flex items-start space-x-4">
                                    <img src={review.avatar} alt={review.reviewer} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                                    <div className="flex-grow">
                                        <div className="flex items-center mb-2">
                                            <h3 className="text-lg font-semibold">{review.reviewer}</h3>
                                            <div className="ml-4">
                                                <StarRating rating={review.rating} />
                                            </div>
                                        </div>
                                        <p className="text-gray-700">{review.comment}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mt-12">
                        <h2 className="text-3xl font-bold mb-6">Reviews</h2>
                        <p>No reviews yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuideDetailPage;

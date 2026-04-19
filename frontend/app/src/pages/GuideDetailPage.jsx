import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { getUserDetail, createDM, followUser, unfollowUser, getProviderReviews, createProviderReview } from '../services/api';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReviewModal from '../components/ReviewModal';
import { toast } from 'sonner';

const GuideDetailPage = () => {
    const { username } = useParams();
    const { user } = useAuth();
    const [guide, setGuide] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const { handleOpenChat } = useOutletContext() || {};

    const fetchGuideData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getUserDetail(username);
            setGuide(res.data);
            setIsFollowing(res.data.is_following);
            
            try {
                const reviewsRes = await getProviderReviews(res.data.id);
                const reviewsData = Array.isArray(reviewsRes.data) ? reviewsRes.data : (reviewsRes.data.results || []);
                setReviews(reviewsData);

            } catch (revErr) {
                console.error('Error fetching reviews:', revErr);
                // Don't fail the whole page if just reviews fail
            }
        } catch (err) {
            console.error('Error fetching guide data:', err);
            setError(`Failed to load guide "${username}". ${err.response?.data?.detail || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuideData();
    }, [username]);

    const handleSubmitReview = async (rating, comment) => {
        try {
            await createProviderReview(guide.id, rating, comment);
            fetchGuideData(); // Refresh data to show new review and updated rating
        } catch (err) {
            console.error('Error submitting review:', err);
        }
    };

    const handleChat = async () => {
        try {
            const res = await createDM(guide.id);
            if (handleOpenChat) handleOpenChat(res.data, 'dm');
        } catch (err) {
            console.error('Chat error:', err);
        }
    };

    const handleBookNow = () => {
        toast.success(`Booking request sent to ${guide.username}!`, {
            description: "They will get back to you shortly via chat."
        });
    };

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await unfollowUser(guide.username);
                setIsFollowing(false);
            } else {
                await followUser(guide.username);
                setIsFollowing(true);
            }
        } catch (err) {
            console.error('Follow error:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
            </div>
        );
    }

    if (error || !guide) {
        return <div className="p-8 text-center text-error font-bold">{error || 'Guide not found!'}</div>;
    }

    return (
        <div className="min-h-screen p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Guide Details Section */}
                <Card className="rounded-2xl shadow-sm border-ui-border/50 overflow-hidden flex flex-col md:flex-row">
                    <img src={guide.profile_picture || 'https://images.unsplash.com/photo-1440778303588-435521a205bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'} alt={guide.username} className="w-full md:w-64 h-64 md:h-80 object-cover" />
                    <CardContent className="p-8 flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-ui-text-main">{guide.username}</h1>
                                <p className="text-ui-muted font-medium mt-1">{guide.city}, {guide.country}</p>
                            </div>
                            <div className="bg-brand-light px-3 py-1.5 rounded-full flex items-center border border-brand/10">
                                <span className="text-warning mr-1.5 text-sm">★</span>
                                <span className="text-brand font-bold">{guide.rating > 0 ? guide.rating : 'New'}</span>
                                {guide.review_count > 0 && (
                                    <span className="text-xs text-ui-muted ml-1">({guide.review_count})</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-6 flex space-x-6 items-center">
                            <div className="text-center">
                                <p className="text-xl font-bold text-foreground">{guide.followers_count}</p>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Followers</p>
                            </div>
                            <div className="text-center border-l border-border pl-6">
                                <p className="text-xl font-bold text-foreground">{guide.posts_count}</p>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Posts</p>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="ml-auto rounded-xl font-black italic text-[10px] uppercase tracking-widest border-brand/20 text-brand hover:bg-brand hover:text-white transition-all"
                                onClick={() => setIsReviewModalOpen(true)}
                            >
                                Rate this Guide
                            </Button>
                        </div>

                        <p className="mt-6 text-foreground/80 leading-relaxed italic text-lg opacity-90">"{guide.bio || 'Professional local guide ready to show you the best spots.'}"</p>
                        <p className="text-3xl font-black text-foreground mt-6">${guide.price || '25'}<span className="text-sm font-medium text-muted-foreground ml-1">/hour</span></p>
                        
                        <div className="mt-8 flex space-x-4">
                            {user?.id !== guide.id && (
                                <>
                                    <Button 
                                        onClick={handleBookNow}
                                        size="lg"
                                        className="flex-1 rounded-xl shadow-lg ring-offset-background bg-success hover:bg-success-hover text-white font-bold"
                                    >
                                        Book Now
                                    </Button>
                                    <Button 
                                        onClick={handleChat}
                                        size="lg"
                                        className="flex-1 rounded-xl shadow-lg ring-offset-background"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                                        Start Chat
                                    </Button>
                                    <Button 
                                        onClick={handleFollow}
                                        size="lg"
                                        variant={isFollowing ? "outline" : "secondary"}
                                        className={`flex-1 rounded-xl font-bold ${isFollowing ? 'border-border text-muted-foreground' : ''}`}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Schedule Section */}
                {guide.schedule && guide.schedule.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-3xl font-bold mb-6 text-ui-text-main">Availability</h2>
                        <div className="bg-ui-white rounded-lg shadow p-6">
                            <ul className="space-y-2">
                                {guide.schedule.map(slot => (
                                    <li key={slot.day} className="flex justify-between">
                                        <span className="font-semibold text-ui-text-main">{slot.day}</span>
                                        <span className="text-ui-text-secondary">{slot.time}</span>
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
                {reviews.length > 0 ? (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-6 tracking-tight">Reviews</h2>
                        <div className="space-y-4">
                            {reviews.map(review => (
                                <Card key={review.id} className="border-border/50 shadow-sm rounded-2xl">
                                    <CardContent className="p-6 flex items-start space-x-4">
                                        <Avatar className="w-12 h-12 border border-border">
                                            <AvatarImage src={review.user_profile_picture} alt={review.user_username} className="object-cover" />
                                            <AvatarFallback>{review.user_username?.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow">
                                            <div className="flex items-center mb-1">
                                                <h3 className="text-base font-bold text-ui-text-main">@{review.user_username}</h3>
                                                <div className="ml-3">
                                                    <StarRating rating={review.rating} size="xs" />
                                                </div>
                                            </div>
                                            <p className="text-ui-text-secondary text-sm font-medium">{review.comment}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mt-12 text-center py-12 bg-ui-white rounded-3xl border-2 border-dashed border-ui-border">
                        <h2 className="text-2xl font-bold mb-2">No reviews yet</h2>
                        <p className="text-ui-muted mb-6">Be the first to rate this guide!</p>
                        <Button variant="secondary" onClick={() => setIsReviewModalOpen(true)}>Leave a Review</Button>
                    </div>
                )}

                <ReviewModal 
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    onSubmit={handleSubmitReview}
                    title={`Rate ${guide.username}`}
                />
            </div>
        </div>
    );
};

export default GuideDetailPage;

import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { getUserDetail, createDM, followUser, unfollowUser, getProviderReviews, createProviderReview, getGuideAvailability } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReviewModal from '../components/ReviewModal';
import { toast } from 'sonner';
import { XCircle, ChevronLeft, ChevronRight, Share2, Heart, ShieldCheck, MapPin, Clock, Info } from 'lucide-react';

const GuideDetailPage = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [guide, setGuide] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookedDates, setBookedDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [activeExp, setActiveExp] = useState(null);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { handleOpenChat } = useOutletContext() || {};

    const fetchGuideData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getUserDetail(username);
            setGuide(res.data);
            setIsFollowing(res.data.is_following);
            
            const reviewsRes = await getProviderReviews(res.data.id);
            setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : (reviewsRes.data.results || []));
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Could not load guide details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuideData();
    }, [username]);

    const handleChat = async () => {
        try {
            const res = await createDM(guide.id);
            if (handleOpenChat) handleOpenChat(res.data, 'dm');
        } catch (err) {
            console.error('Chat error:', err);
        }
    };

    const handleBookNow = async (experience = null) => {
        setLoadingAvailability(true);
        setActiveExp(experience);
        try {
            const res = await getGuideAvailability(guide.username);
            setBookedDates(res.data.booked_dates);
            setIsBookingModalOpen(true);
        } catch (err) {
            console.error(err);
            toast.error("Could not fetch availability");
        } finally {
            setLoadingAvailability(false);
        }
    };

    const confirmDateSelection = () => {
        if (!selectedDate) return;
        navigate('/app/checkout', { 
            state: { 
                provider: guide, 
                experience: activeExp, 
                date: selectedDate 
            } 
        });
    };

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await unfollowUser(guide.username);
                setIsFollowing(false);
                toast.success(`Unfollowed ${guide.username}`);
            } else {
                await followUser(guide.username);
                setIsFollowing(true);
                toast.success(`Following ${guide.username}`);
            }
        } catch (err) {
            console.error(err);
            toast.error("Action failed");
        }
    };

    const handleSubmitReview = async (rating, comment) => {
        try {
            await createProviderReview(guide.id, rating, comment);
            toast.success("Review submitted!");
            const reviewsRes = await getProviderReviews(guide.id);
            setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : (reviewsRes.data.results || []));
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit review");
        }
    };

    const allImages = React.useMemo(() => {
        if (!guide) return [];
        const images = [];
        if (guide.experiences) {
            guide.experiences.forEach(exp => {
                if (exp.images && exp.images.length > 0) {
                    exp.images.forEach(img => images.push(img.image));
                }
            });
        }
        if (images.length === 0) images.push('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80');
        return images;
    }, [guide]);

    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ui-bg">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand"></div>
            </div>
        );
    }

    if (error || !guide) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ui-bg p-4">
                <Card className="max-w-md w-full p-8 text-center rounded-[2rem] border-none shadow-2xl bg-ui-white">
                    <h2 className="text-2xl font-bold text-ui-text-main mb-4">Error</h2>
                    <p className="text-ui-text-secondary mb-8">{error}</p>
                    <Button onClick={() => navigate('/app/guides')} className="w-full rounded-xl">Back to Guides</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ui-bg animate-in fade-in duration-500 pb-24">
            {/* Header / Nav */}
            <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-ui-bg-alt rounded-full transition-colors text-ui-text-main">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-ui-bg-alt rounded-full transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ui-text-main"><Share2 className="w-4 h-4" /> Share</button>
                    <button onClick={handleFollow} className={`p-2 hover:bg-ui-bg-alt rounded-full transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${isFollowing ? 'text-brand' : 'text-ui-text-main'}`}>
                        <Heart className={`w-4 h-4 ${isFollowing ? 'fill-brand text-brand' : ''}`} /> {isFollowing ? 'Following' : 'Save'}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Left Column: Image Gallery (Primary Focus) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="relative rounded-[2.5rem] overflow-hidden aspect-[16/10] bg-ui-bg-alt group shadow-2xl border border-ui-border">
                            <img 
                                src={allImages[currentImageIndex]} 
                                className="w-full h-full object-cover transition-transform duration-700" 
                                alt="Gallery" 
                            />
                            
                            {allImages.length > 1 && (
                                <>
                                    <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-ui-white/90 backdrop-blur-md rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-ui-white active:scale-90">
                                        <ChevronLeft className="w-6 h-6 text-ui-text-main" />
                                    </button>
                                    <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-ui-white/90 backdrop-blur-md rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-ui-white active:scale-90">
                                        <ChevronRight className="w-6 h-6 text-ui-text-main" />
                                    </button>
                                    <div className="absolute bottom-8 right-8 bg-ui-text-main/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                        {currentImageIndex + 1} / {allImages.length}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Description Section (Width aligned with Gallery) */}
                        <div className="space-y-10 py-6 border-b border-ui-border">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-ui-text-main">About this experience</h2>
                                <p className="text-lg text-ui-text-secondary leading-relaxed font-medium italic">
                                    "{guide.bio || 'Professional guide dedicated to providing unforgettable experiences.'}"
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-ui-bg-alt rounded-3xl border border-ui-border/50">
                                    <ShieldCheck className="w-6 h-6 text-brand mb-3" />
                                    <p className="text-[10px] font-black uppercase text-ui-muted mb-1">Identity</p>
                                    <p className="font-bold text-ui-text-main">{guide.verification_status === 'verified' ? 'Verified Expert' : 'Under Review'}</p>
                                </div>
                                <div className="p-6 bg-ui-bg-alt rounded-3xl border border-ui-border/50">
                                    <MapPin className="w-6 h-6 text-success mb-3" />
                                    <p className="text-[10px] font-black uppercase text-ui-muted mb-1">Base</p>
                                    <p className="font-bold text-ui-text-main">{guide.country || 'Global'}</p>
                                </div>
                                <div className="p-6 bg-ui-bg-alt rounded-3xl border border-ui-border/50">
                                    <Clock className="w-6 h-6 text-accent-indigo mb-3" />
                                    <p className="text-[10px] font-black uppercase text-ui-muted mb-1">Response</p>
                                    <p className="font-bold text-ui-text-main">Under 2h</p>
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section (Width aligned with Gallery) */}
                        <div className="pt-10 space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-ui-text-main flex items-center gap-3">
                                        Reviews <span className="bg-brand/10 text-brand px-3 py-1 rounded-full text-xs font-black">{guide.review_count || 0}</span>
                                    </h2>
                                    <StarRating rating={guide.rating} />
                                </div>
                                <Button variant="outline" className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-ui-white shadow-sm" onClick={() => setIsReviewModalOpen(true)}>Leave a Review</Button>
                            </div>

                            {reviews.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {reviews.map(review => (
                                        <Card key={review.id} className="border border-ui-border/50 shadow-sm rounded-[2rem] bg-ui-white overflow-hidden">
                                            <CardContent className="p-8 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-10 h-10 border border-ui-border">
                                                            <AvatarImage src={review.user_profile_picture} className="object-cover" />
                                                            <AvatarFallback>{review.user_username?.charAt(0).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h3 className="text-sm font-black text-ui-text-main">@{review.user_username}</h3>
                                                            <p className="text-[9px] font-black text-ui-muted uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <StarRating rating={review.rating} size="xs" />
                                                </div>
                                                <p className="text-sm text-ui-text-secondary font-medium leading-relaxed italic">"{review.comment}"</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-ui-bg-alt rounded-[3rem] border-2 border-dashed border-ui-border">
                                    <p className="text-ui-muted font-bold italic">No reviews yet. Be the first to share your experience!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Profile & Details (Sticky) */}
                    <div className="space-y-8">
                        <div className="lg:sticky lg:top-8">
                            <Card className="rounded-[3rem] border border-ui-border shadow-2xl overflow-hidden bg-ui-white p-10 space-y-10">
                                {/* Profile Area */}
                                <div className="flex flex-col items-center text-center space-y-6">
                                    <Avatar className="w-32 h-32 md:w-40 md:h-40 border-8 border-ui-bg-alt shadow-2xl">
                                        <AvatarImage src={guide.profile_picture} className="object-cover" />
                                        <AvatarFallback className="text-5xl bg-brand-light text-brand font-black italic">{guide.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <h1 className="text-3xl font-black text-ui-text-main italic tracking-tighter uppercase">{guide.username}</h1>
                                            {guide.verification_status === 'verified' && (
                                                <div className="bg-success/10 text-success p-1 rounded-full">< ShieldCheck className="w-5 h-5 fill-success/10" /></div>
                                            )}
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-brand">Professional Provider</p>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-6 border-t border-ui-border">
                                    <div className="flex items-center justify-between p-6 bg-ui-bg-alt rounded-[2rem] border border-ui-border/50">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-ui-muted mb-1">Standard Rate</p>
                                            <p className="text-3xl font-black text-ui-text-main italic">${guide.experiences?.[0]?.price || '45'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-ui-muted mb-1">Duration</p>
                                            <p className="text-lg font-black text-ui-text-main">{guide.experiences?.[0]?.duration || 'Custom'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Button 
                                            onClick={() => handleBookNow()}
                                            disabled={loadingAvailability}
                                            className="w-full h-16 rounded-2xl bg-brand hover:bg-brand-hover text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand/20 transition-all active:scale-[0.98]"
                                        >
                                            {loadingAvailability ? 'Checking Availability...' : 'Book Discovery Trip'}
                                        </Button>
                                        
                                        <div className="flex gap-3">
                                            <Button 
                                                onClick={handleChat}
                                                variant="outline"
                                                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[9px] border-ui-border bg-ui-white shadow-sm text-ui-text-main"
                                            >
                                                Start Chat
                                            </Button>
                                            <Button 
                                                onClick={handleFollow}
                                                variant="outline"
                                                className={`flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[9px] border-ui-border ${isFollowing ? 'bg-ui-bg-alt text-brand' : 'bg-ui-white text-ui-text-main shadow-sm'}`}
                                            >
                                                {isFollowing ? 'Following' : 'Add Friend'}
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <p className="text-[9px] text-center text-ui-muted font-bold uppercase tracking-widest">
                                        * Cancellation available up to 24h before trip
                                    </p>
                                </div>
                            </Card>

                            <div className="mt-8 p-8 bg-brand/5 rounded-[2.5rem] border border-brand/10 space-y-4">
                                <div className="flex items-center gap-3 text-brand">
                                    <Info className="w-5 h-5" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Trust & Safety</p>
                                </div>
                                <p className="text-[11px] text-ui-text-secondary leading-relaxed font-medium">To protect your payment, always communicate and pay through the Linkler platform.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ReviewModal 
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSubmit={handleSubmitReview}
                title={`Rate ${guide.username}`}
            />

            {/* Booking Modal */}
            <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] p-10 border-none bg-ui-white shadow-2xl">
                    <div className="space-y-8">
                        <div className="text-center">
                            <DialogTitle className="text-3xl font-black italic uppercase tracking-tight text-ui-text-main">Select a Date</DialogTitle>
                            <DialogDescription className="text-ui-muted text-xs mt-2 font-medium">Coordinate your schedule with {guide.username}</DialogDescription>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1">Preferred Arrival</Label>
                                <Input 
                                    type="date" 
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="h-14 rounded-2xl bg-ui-bg-alt border-ui-border focus:ring-brand font-bold text-ui-text-main"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            {bookedDates.includes(selectedDate) && (
                                <p className="text-xs text-error font-bold flex items-center gap-1.5 animate-in shake-1 bg-error/5 p-3 rounded-xl border border-error/10">
                                    <XCircle className="w-4 h-4" /> This date is already fully booked.
                                </p>
                            )}
                        </div>

                        <Button 
                            disabled={!selectedDate || bookedDates.includes(selectedDate)}
                            onClick={confirmDateSelection}
                            className="w-full h-16 rounded-2xl bg-success hover:bg-success-hover text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-success/20"
                        >
                            Finalize Trip Details
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GuideDetailPage;

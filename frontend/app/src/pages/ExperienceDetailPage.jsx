import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate, Link } from 'react-router-dom';
import StarRating from '../components/StarRating';
import ReviewModal from '../components/ReviewModal';
import { getExperienceDetail, createDM, followUser, unfollowUser, getExperienceReviews, createExperienceReview, getGuideAvailability } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, ShieldCheck, MapPin, Clock, Info } from 'lucide-react';
import { useDirector } from '../context/DirectorContext';

const ExperienceDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { triggerAction } = useDirector();
    const [exp, setExp] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookedDates, setBookedDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [availability, setAvailability] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const { handleOpenChat } = useOutletContext() || {};

    const getMediaUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getExperienceDetail(id);
            setExp(res.data);
            
            if (res.data.user_username === 'dubai_expert_guide') {
                setTimeout(() => {
                    if (typeof triggerAction === 'function') triggerAction('action:hassan-opened');
                }, 500);
            }

            const reviewsRes = await getExperienceReviews(id);
            setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : (reviewsRes.data.results || []));

            const availRes = await getGuideAvailability(res.data.user_username);
            setAvailability(availRes.data.manual_availability || []);
            setBookedDates(availRes.data.booked_dates || []);
        } catch (err) {
            console.error(err);
            setError("Could not load listing details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleReviewSubmit = async (rating, comment) => {
        try {
            await createExperienceReview(id, rating, comment);
            toast.success("Thank you! Your review has been submitted.");
            // Refetch reviews to show the new one
            const reviewsRes = await getExperienceReviews(id);
            setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : (reviewsRes.data.results || []));
        } catch (err) {
            console.error("Review submission failed:", err);
            toast.error("Failed to submit review. Have you booked this experience before?");
        }
    };

    const handleBookNow = (dateStr) => {
        if (!user) {
            navigate('/signin');
            return;
        }
        setSelectedDate(dateStr);
        setIsBookingModalOpen(true);
    };

    const confirmDateSelection = () => {
        if (!selectedDate) return;
        navigate('/app/checkout', { 
            state: { 
                provider: { id: exp.user, username: exp.user_username }, 
                experience: exp, 
                date: selectedDate 
            } 
        });
    };

    const handleChat = async () => {
        try {
            const res = await createDM(exp.user);
            if (handleOpenChat) handleOpenChat(res.data, 'dm');
        } catch (err) {
            console.error('Chat error:', err);
        }
    };

    const renderCalendar = () => {
        if (!currentMonth) return null;
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-ui-text-main">
                        {currentMonth.toLocaleString('default', { month: 'long' })} {year}
                    </h3>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={(e) => { e.stopPropagation(); setCurrentMonth(new Date(year, month - 1)); }}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={(e) => { e.stopPropagation(); setCurrentMonth(new Date(year, month + 1)); }}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <div key={d} className="text-center text-[8px] font-black text-ui-muted py-1">{d}</div>
                    ))}
                    {days.map((date, idx) => {
                        if (!date) return <div key={`empty-${idx}`} />;
                        
                        const dateStr = date.toISOString().split('T')[0];
                        const isBooked = bookedDates.includes(dateStr);
                        const avail = availability.find(a => a.date === dateStr);
                        const isBlackout = !isBooked && avail && avail.is_available === false;
                        const isToday = new Date().toISOString().split('T')[0] === dateStr;
                        const isPast = date < new Date(new Date().setHours(0,0,0,0));

                        const isUnavailable = isBooked || isBlackout || isPast;

                        return (
                            <button
                                key={dateStr}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); !isUnavailable && handleBookNow(dateStr); }}
                                disabled={isUnavailable}
                                className={`
                                    aspect-square rounded-xl text-[10px] font-bold transition-all flex items-center justify-center relative
                                    ${isBooked ? 'bg-brand/10 text-brand border border-brand/20' : 
                                      isBlackout ? 'bg-error/5 text-error/40 border border-error/10' : 
                                      isPast ? 'text-ui-muted opacity-30 cursor-not-allowed' :
                                      'bg-ui-bg-alt text-ui-text-main hover:bg-brand hover:text-white border border-transparent'}
                                    ${isToday ? 'ring-2 ring-brand ring-offset-1 ring-offset-ui-white' : ''}
                                `}
                            >
                                {date.getDate()}
                                {isBooked && <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-brand" />}
                            </button>
                        );
                    })}
                </div>
                
                <div className="flex flex-wrap gap-3 pt-2 border-t border-ui-border/50">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-brand" /><span className="text-[8px] font-bold uppercase text-ui-muted">Reserved</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-error/30" /><span className="text-[8px] font-bold uppercase text-ui-muted">Unavailable</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-ui-bg-alt border border-ui-border" /><span className="text-[8px] font-bold uppercase text-ui-muted">Available</span></div>
                </div>
            </div>
        );
    };

    const allImages = React.useMemo(() => {
        if (!exp) return [];
        const imgs = (exp.images || []).map(i => getMediaUrl(i.image));
        if (imgs.length === 0) imgs.push('https://images.unsplash.com/photo-1530789253388-582c481c54b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80');
        return imgs;
    }, [exp]);

    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-ui-bg"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand"></div></div>;
    if (error || !exp) return <div className="min-h-screen flex items-center justify-center bg-ui-bg p-4"><Card className="max-w-md w-full p-8 text-center rounded-[2rem] shadow-2xl bg-ui-white"><h2 className="text-2xl font-bold mb-4">Error</h2><p className="mb-8">{error}</p><Button onClick={() => navigate(-1)} className="w-full">Go Back</Button></Card></div>;

    const isService = exp.listing_type === 'service';

    return (
        <div className="min-h-screen bg-ui-bg animate-in fade-in duration-500 pb-24">
            <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-ui-bg-alt rounded-full transition-colors text-ui-text-main">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 rounded-2xl bg-ui-white border border-ui-border shadow-sm text-[10px] font-black uppercase tracking-widest text-brand">
                        {isService ? '🛠️ Essential Service' : '🏹 Experience'}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="relative rounded-[2.5rem] overflow-hidden aspect-[16/10] bg-ui-bg-alt group shadow-2xl border border-ui-border">
                            <img src={allImages[currentImageIndex]} className="w-full h-full object-cover" alt="Gallery" />
                            {allImages.length > 1 && (
                                <>
                                    <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-ui-white/90 backdrop-blur-md rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-ui-white"><ChevronLeft className="w-6 h-6" /></button>
                                    <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-ui-white/90 backdrop-blur-md rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-ui-white"><ChevronRight className="w-6 h-6" /></button>
                                    <div className="absolute bottom-8 right-8 bg-ui-text-main/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">{currentImageIndex + 1} / {allImages.length}</div>
                                </>
                            )}
                        </div>

                        <div className="space-y-6">
                            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-ui-text-main">{exp.title}</h1>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-ui-muted bg-ui-white px-4 py-2 rounded-full border border-ui-border"><MapPin className="w-4 h-4 text-brand" /> {exp.location}, {exp.country}</div>
                                <div className="flex items-center gap-2 text-xs font-bold text-ui-muted bg-ui-white px-4 py-2 rounded-full border border-ui-border"><Clock className="w-4 h-4 text-brand" /> {exp.duration || 'Flexible Time'}</div>
                                <div 
                                    id="walkthrough-hassan-verified"
                                    className="flex items-center gap-2 text-xs font-bold text-success bg-success/5 px-4 py-2 rounded-full border border-success/20 shadow-sm"
                                >
                                    <ShieldCheck className="w-4 h-4 text-success" /> Verified Expert
                                </div>
                            </div>
                            <p className="text-lg text-ui-text-secondary leading-relaxed font-medium italic">"{exp.description}"</p>
                        </div>

                        {/* Reviews Section */}
                        <div id="walkthrough-hassan-reviews" className="bg-ui-white/50 backdrop-blur-sm rounded-[2.5rem] p-10 border border-ui-border shadow-sm space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-ui-text-main">Traveler Reviews</h3>
                                <Button size="sm" className="rounded-full font-black text-xs" onClick={() => setIsReviewModalOpen(true)}>Leave a Review</Button>
                            </div>

                            <div className="space-y-6">
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <div key={review.id} className="p-6 bg-white rounded-3xl border border-ui-border shadow-sm space-y-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="w-10 h-10 border border-ui-border">
                                                    <AvatarImage src={getMediaUrl(review.user_profile_picture)} />
                                                    <AvatarFallback className="bg-brand-light text-brand font-bold">
                                                        {review.user_username?.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-bold">@{review.user_username}</p>
                                                    <div className="flex gap-0.5 mt-0.5"><StarRating rating={review.rating} size="xs" /></div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-ui-text-secondary italic font-medium leading-relaxed">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-10 text-ui-muted italic">No reviews yet for this listing.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="lg:sticky lg:top-8 space-y-6">
                            <Card className="rounded-[3rem] border border-ui-border shadow-2xl overflow-hidden bg-ui-white p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-ui-muted mb-1">{isService ? 'Service Fee' : 'From'}</p>
                                        <p className="text-4xl font-black text-ui-text-main italic">${exp.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-ui-muted mb-1">Rating</p>
                                        <div className="flex items-center justify-end gap-1"><StarRating rating={exp.rating || 5} size="sm" /></div>
                                    </div>
                                </div>

                                {exp.user_booking ? (
                                    <div className="bg-brand/5 p-6 rounded-[2rem] border border-brand/20 space-y-4 animate-in zoom-in-95 duration-500">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-brand">Your Booking</p>
                                            <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border ${exp.user_booking.status === 'confirmed' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                                                {exp.user_booking.status}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="w-5 h-5 text-brand" />
                                            <div>
                                                <p className="text-sm font-bold text-ui-text-main">{exp.user_booking.date}</p>
                                                <p className="text-[9px] text-ui-muted uppercase font-medium">Coordinate in messages</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pt-2 border-t border-ui-border/50">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-muted mb-6 text-center">Check Availability</p>
                                        {renderCalendar()}
                                    </div>
                                )}

                                <div className="space-y-4 pt-4 border-t border-ui-border">
                                    <Button onClick={handleChat} variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-ui-border shadow-sm">
                                        Ask a Question
                                    </Button>
                                </div>

                                <Link to={`/app/profile/${exp.user_username}`} className="flex items-center gap-4 p-4 bg-ui-bg-alt rounded-2xl hover:bg-ui-bg transition-colors border border-ui-border/30">
                                    <Avatar className="w-12 h-12 border-2 border-ui-white shadow-sm">
                                        <AvatarFallback className="bg-brand-light text-brand font-black">{exp.user_username?.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-[9px] font-black text-ui-muted uppercase tracking-widest">Listing Provider</p>
                                        <p className="font-bold text-ui-text-main hover:underline">@{exp.user_username}</p>
                                    </div>
                                </Link>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] p-10 border-none bg-ui-white shadow-2xl">
                    <div className="space-y-8">
                        <div className="text-center">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-black italic uppercase tracking-tight text-center">Select a Date</DialogTitle>
                                <DialogDescription className="text-ui-muted text-xs mt-2 text-center">Coordinate with @{exp?.user_username}</DialogDescription>
                            </DialogHeader>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1">Preferred Date</Label>
                                <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="h-14 rounded-2xl bg-ui-bg-alt border-ui-border font-bold" min={new Date().toISOString().split('T')[0]}/>
                            </div>
                        </div>
                        <Button disabled={!selectedDate} onClick={confirmDateSelection} className="w-full h-16 rounded-2xl bg-brand text-white font-black uppercase tracking-widest shadow-2xl">Confirm Selection</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSubmit={handleReviewSubmit}
                title={`Reviewing "${exp?.title}"`}
            />
        </div>
    );
};

export default ExperienceDetailPage;

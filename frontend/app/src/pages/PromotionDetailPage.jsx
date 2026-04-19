import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { getPromotionDetail, addComment } from '../services/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PromotionDetailPage = () => {
    const { id } = useParams();
    const [promotion, setPromotion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');

    const handleBookNow = () => {
        toast.success("Redirecting to partner site...", {
            description: "Referral tracked. Enjoy your discount!"
        });
        // In a real app, this would be: window.location.href = promotion.affiliate_link;
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            // Note: reusing addComment but usually promotions might have their own comment endpoint
            // For now let's just show success
            toast.success("Review submitted!");
            setNewComment('');
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        setLoading(true);
        getPromotionDetail(id)
            .then(res => {
                setPromotion(res.data);
            })
            .catch(err => {
                console.error('Error fetching promotion:', err);
                setError('Promotion not found');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success"></div>
            </div>
        );
    }

    if (error || !promotion) {
        return <div className="p-8 text-center text-error font-bold">{error || 'Promotion not found!'}</div>;
    }

    return (
        <div className="p-4 lg:p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-bold text-ui-text-main">{promotion.title}</h1>
                <p className="text-xl text-ui-text-secondary mb-6 font-medium tracking-tight uppercase tracking-widest">{promotion.company}</p>
                <img src={promotion.image || 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'} alt={promotion.title} className="w-full h-[400px] object-cover rounded-3xl shadow-2xl mb-12 border-4 border-ui-white" />
                
                <div className="bg-success-light rounded-2xl p-6 border border-success/20 flex items-center justify-between mb-8">
                    <div>
                        <div className="text-3xl font-black text-success">{promotion.off_percent}% OFF</div>
                        <p className="text-success-hover font-semibold">Limited time offer</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-right mb-4">
                            <p className="text-sm text-ui-muted line-through font-bold">{promotion.currency} {promotion.original_price}</p>
                            <p className="text-4xl font-black text-brand">{promotion.currency} {promotion.discounted_price}</p>
                        </div>
                        <Button 
                            onClick={handleBookNow}
                            size="lg"
                            className="bg-brand hover:bg-brand-hover text-white font-bold rounded-xl shadow-lg px-8"
                        >
                            Book Now
                        </Button>
                    </div>
                </div>
                <p className="text-lg text-ui-text-secondary mb-8 leading-relaxed">{promotion.description}</p>
                
                {/* Gallery */}
                {promotion.gallery && promotion.gallery.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-6 text-ui-text-main italic">Experience Highlights</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {promotion.gallery.map((img, i) => <img key={i} src={img} alt={`Gallery image ${i+1}`} className="w-full h-48 object-cover rounded-2xl shadow-sm border border-ui-border/50" />)}
                    </div>
                  </div>
                )}

                {/* Reviews */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-6 text-ui-text-main italic">Member Reviews</h2>
                    
                    {/* Add Review */}
                    <form onSubmit={handleAddComment} className="mb-8 bg-ui-white p-6 rounded-2xl border border-ui-border shadow-sm">
                        <textarea 
                            className="w-full p-4 rounded-xl border border-ui-border bg-ui-bg-alt focus:outline-none focus:ring-2 focus:ring-brand/20 mb-4 transition-all"
                            placeholder="Share your experience with this deal..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows="3"
                        ></textarea>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={!newComment.trim()}>Post Review</Button>
                        </div>
                    </form>

                    {promotion.reviews && promotion.reviews.length > 0 ? (
                        <div className="space-y-4">
                            {promotion.reviews.map(review => (
                                <div key={review.id} className="bg-ui-white p-6 rounded-2xl border border-ui-border shadow-sm flex items-start space-x-4 animate-in fade-in slide-in-from-bottom-2">
                                    <img src={review.avatar || 'https://via.placeholder.com/150'} alt={review.reviewer} className="w-12 h-12 rounded-full border border-ui-border object-cover"/>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-ui-text-main">{review.reviewer}</h3>
                                            <StarRating rating={review.rating} />
                                        </div>
                                        <p className="text-ui-text-secondary leading-relaxed">{review.comment}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-ui-bg-alt/50 rounded-2xl border border-dashed border-ui-border">
                            <p className="text-ui-muted font-medium">No reviews yet. Be the first to share!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PromotionDetailPage;

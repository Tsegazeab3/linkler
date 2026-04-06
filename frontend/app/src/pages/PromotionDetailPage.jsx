import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { getPromotionDetail } from '../services/api';

const PromotionDetailPage = () => {
    const { id } = useParams();
    const [promotion, setPromotion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                    <div className="text-right">
                        <p className="text-sm text-ui-muted line-through font-bold">{promotion.currency} {promotion.original_price}</p>
                        <p className="text-4xl font-black text-brand">{promotion.currency} {promotion.discounted_price}</p>
                    </div>
                </div>
                <p className="text-lg text-ui-text-secondary mb-8">{promotion.description}</p>
                
                {/* Gallery */}
                {promotion.gallery && promotion.gallery.length > 0 && (
                  <>
                    <h2 className="text-3xl font-bold mb-4 text-ui-text-main">Gallery</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        {promotion.gallery.map((img, i) => <img key={i} src={img} alt={`Gallery image ${i+1}`} className="w-full h-48 object-cover rounded-md shadow" />)}
                    </div>
                  </>
                )}

                {/* Reviews */}
                {promotion.reviews && promotion.reviews.length > 0 && (
                  <>
                    <h2 className="text-3xl font-bold mb-4 text-ui-text-main">Reviews</h2>
                    <div className="space-y-4">
                        {promotion.reviews.map(review => (
                            <div key={review.id} className="bg-ui-white p-4 rounded-lg shadow flex items-start space-x-4">
                                <img src={review.avatar} alt={review.reviewer} className="w-12 h-12 rounded-full border border-ui-border"/>
                                <div>
                                    <h3 className="font-bold text-ui-text-main">{review.reviewer}</h3>
                                    <StarRating rating={review.rating} />
                                    <p className="mt-1 text-ui-text-secondary">{review.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                  </>
                )}
            </div>
        </div>
    );
};

export default PromotionDetailPage;

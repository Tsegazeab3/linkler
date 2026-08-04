import React from 'react';
import StarRating from './StarRating';

const PromotionCard = ({ promotion }) => {
    const getMediaUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    };

    const displayImage = getMediaUrl((promotion.images && promotion.images.length > 0) 
        ? promotion.images[0].image 
        : promotion.image);

    return (
        <div className="bg-ui-white rounded-[2rem] shadow-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-300 border border-ui-border group cursor-pointer h-full flex flex-col">
            <div className="relative h-56 overflow-hidden bg-ui-bg-alt shrink-0">
                <img src={displayImage || 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'} alt={promotion.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4">
                    <div className="px-3 py-1.5 rounded-xl bg-brand/90 text-white text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md">
                        {promotion.off_percent}% OFF
                    </div>
                </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-ui-text-main line-clamp-1 group-hover:text-brand transition-colors uppercase tracking-tight">{promotion.title}</h3>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-ui-bg-alt text-ui-muted px-2 py-1 rounded-lg border border-ui-border">
                        {promotion.region}
                    </span>
                </div>
                <p className="text-xs font-bold text-ui-muted mb-4 flex items-center italic">
                    {promotion.country} • {promotion.company}
                </p>
                
                <div className="mt-auto pt-4 border-t border-ui-border space-y-3">
                    <div className="flex items-center gap-2">
                        <StarRating rating={promotion.rating} size="sm" />
                        {promotion.rating === 0 && (
                            <span className="text-[9px] font-bold text-ui-muted uppercase tracking-tighter">No reviews yet</span>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-black text-brand italic">{promotion.currency}{promotion.discounted_price}</p>
                            <p className="text-[10px] text-ui-muted line-through font-bold">{promotion.currency}{promotion.original_price}</p>
                        </div>
                        <div className="text-[9px] font-black text-success uppercase tracking-widest bg-success/10 px-2 py-1 rounded-md">Limited</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromotionCard;

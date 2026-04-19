import React from 'react';
import StarRating from './StarRating';

const PromotionCard = ({ promotion }) => {
    return (
        <div className="bg-ui-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img src={promotion.image} alt={promotion.title} className="w-full h-56 object-cover" />
            <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold text-ui-text-main line-clamp-1">{promotion.title}</h3>
                    <span className="text-[8px] font-black uppercase tracking-tighter bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded shrink-0 ml-2">
                        {promotion.region}
                    </span>
                </div>
                <p className="text-sm font-bold text-ui-muted mb-2 flex items-center italic">
                    {promotion.country} • {promotion.company}
                </p>
                <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={promotion.rating} size="sm" />
                    {promotion.rating === 0 && (
                        <span className="text-[10px] font-bold text-ui-muted bg-ui-bg-alt px-1.5 py-0.5 rounded">New</span>
                    )}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                    <p className="text-lg font-bold text-brand">{promotion.currency} {promotion.discounted_price}</p>
                    <p className="text-sm text-ui-muted line-through">{promotion.currency} {promotion.original_price}</p>
                </div>
                <p className="text-sm font-bold text-success mt-1">{promotion.offer}</p>
            </div>
        </div>
    );
};

export default PromotionCard;

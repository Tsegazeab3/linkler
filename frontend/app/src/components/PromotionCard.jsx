import React from 'react';
import StarRating from './StarRating';

const PromotionCard = ({ promotion }) => {
    return (
        <div className="bg-ui-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img src={promotion.image} alt={promotion.title} className="w-full h-56 object-cover" />
            <div className="p-4">
                <h3 className="text-xl font-bold text-ui-text-main">{promotion.title}</h3>
                <p className="text-md text-ui-text-secondary mb-2">{promotion.company}</p>
                <StarRating rating={promotion.rating} />
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

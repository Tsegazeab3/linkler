import React from 'react';
import StarRating from './StarRating';

const GuidePreviewCard = ({ guide }) => {
  return (
    <div className="bg-linkler-orange-light rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <img src={guide.picture} alt={guide.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-bold">{guide.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{guide.country}</p>
        <StarRating rating={guide.rating} />
        <p className="text-lg font-bold text-gray-800 mt-2">${guide.price.toFixed(2)}</p>
        <p className="text-sm text-gray-700 mt-2 truncate">{guide.serviceDescription}</p>
      </div>
    </div>
  );
};

export default GuidePreviewCard;

import React from 'react';
import StarRating from './StarRating';
import BookNowButton from './BookNowButton';

const GuideCard = ({
  picture,
  name,
  bio,
  gender,
  serviceDescription,
  price,
  rating,
}) => {
  return (
    <div className="rounded-lg max-w-2xl mx-auto my-4 overflow-hidden flex">
      <div className="w-1/2 shrink-0">
        <img
          src={picture}
          alt={`${name}'s profile`}
          className="w-full h-full object-cover rounded-l-lg"
        />
      </div>
      <div className="w-1/2 p-4 flex flex-col justify-between">
        <div className="flex flex-col items-center text-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{name}</h2>
          <p className="text-sm text-gray-500 mb-2">{gender}</p>
          <div className="flex justify-center mt-2">
            <StarRating rating={rating} />
          </div>
        </div>
        <div className="flex-grow">
          <p className="text-xs text-gray-700 mb-2">{bio}</p>
          <h3 className="font-semibold text-gray-800">Service Description</h3>
          <p className="text-sm text-gray-600 mb-2">{serviceDescription}</p>
        </div>
        <p className="text-lg text-center font-bold text-gray-800">${price.toFixed(2)}</p>
        <div className="flex justify-center mt-4">
          <BookNowButton />
        </div>
      </div>
    </div>
  );
};

export default GuideCard;

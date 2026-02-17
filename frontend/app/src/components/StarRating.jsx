import React from 'react';

const StarRating = ({ rating }) => {
  const stars = [];
  const starColor = "#FFD700";

  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<i key={i} className="fas fa-star" style={{ color: starColor }}></i>);
    } else if (i - 0.5 <= rating) {
      stars.push(<i key={i} className="fas fa-star-half-alt" style={{ color: starColor }}></i>);
    } else {
      stars.push(<i key={i} className="far fa-star" style={{ color: starColor }}></i>);
    }
  }
  return (
    <div className="flex items-center">
      <div className="flex">{stars}</div>
      <span className="ml-2 text-2xl font-bold text-gray-800">{rating.toFixed(1)}</span>
    </div>
  );
};

export default StarRating;

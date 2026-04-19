import React from 'react';

const StarRating = ({ rating = 0, size = "sm" }) => {
  const stars = [];
  const starColor = "#FFD700"; // Gold
  
  const numRating = Number(rating) || 0;

  for (let i = 1; i <= 5; i++) {
    if (i <= numRating) {
      stars.push(<span key={i} className="text-warning">★</span>);
    } else if (i - 0.5 <= numRating) {
      stars.push(<span key={i} className="relative text-ui-muted">
        <span className="absolute left-0 top-0 w-1/2 overflow-hidden text-warning">★</span>
        ★
      </span>);
    } else {
      stars.push(<span key={i} className="text-ui-muted opacity-30">★</span>);
    }
  }

  const sizeClasses = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-base",
    lg: "text-xl"
  };

  return (
    <div className={`flex items-center gap-1 ${sizeClasses[size] || sizeClasses.sm}`}>
      <div className="flex leading-none">{stars}</div>
      {numRating > 0 && (
        <span className="ml-1 font-black text-ui-text-main italic">{numRating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;

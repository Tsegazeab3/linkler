import React from 'react';

const BookNowButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="text-white bg-brand hover:bg-brand-hover px-3 py-1 rounded-lg text-sm"
    >
      Book Now
    </button>
  );
};

export default BookNowButton;

import React from 'react';

const BookNowButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-lg text-sm"
    >
      Book Now
    </button>
  );
};

export default BookNowButton;

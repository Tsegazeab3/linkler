import React from 'react';

const FilterComponent = ({ filterOptions = [], placeholder = "Search..." }) => {
  return (
    <div className="w-full max-w-full mx-auto my-4 rounded-lg">
      <div className="mb-4">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex overflow-x-auto whitespace-nowrap gap-2 no-scrollbar pb-2">
        {filterOptions.map(option => (
          <button
            key={option}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterComponent;

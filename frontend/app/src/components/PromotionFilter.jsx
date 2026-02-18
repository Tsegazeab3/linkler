import React from 'react';

const PromotionFilter = () => {
  const categories = ['Hotels', 'Restaurants', 'Bars', 'Travel', 'Activities'];

  return (
    <div className="p-4 rounded-lg shadow-lg bg-white">
      <h3 className="text-lg font-bold mb-4">Filter Promotions</h3>
      
      {/* Category Filter */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Category</h4>
        {categories.map(category => (
          <div key={category} className="flex items-center">
            <input type="checkbox" id={category} name={category} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
            <label htmlFor={category} className="ml-2 block text-sm text-gray-900">{category}</label>
          </div>
        ))}
      </div>
      
      {/* I can add more filters here later, like location or price range */}
    </div>
  );
};

export default PromotionFilter;

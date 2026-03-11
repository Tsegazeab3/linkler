import React from 'react';

const PromotionFilter = () => {
  const categories = ['Hotels', 'Restaurants', 'Bars', 'Travel', 'Activities'];

  return (
    <div className="p-4 rounded-lg shadow-lg bg-ui-white">
      <h3 className="text-lg font-bold mb-4 text-ui-text-main">Filter Promotions</h3>
      
      {/* Category Filter */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2 text-ui-text-main">Category</h4>
        {categories.map(category => (
          <div key={category} className="flex items-center">
            <input type="checkbox" id={category} name={category} className="h-4 w-4 text-accent-indigo border-ui-border rounded" />
            <label htmlFor={category} className="ml-2 block text-sm text-ui-text-main">{category}</label>
          </div>
        ))}
      </div>
      
      {/* I can add more filters here later, like location or price range */}
    </div>
  );
};

export default PromotionFilter;

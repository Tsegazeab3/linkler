import React from 'react';

const LeftSidebarFilter = ({ activeCategory, onCategoryChange, categories = [] }) => {
  return (
    <div className="p-5 rounded-3xl shadow-sm bg-ui-white border border-ui-border">
      <h3 className="text-lg font-bold mb-4 text-ui-text-main">Categories</h3>
      
      <div className="space-y-1">
        <button
          onClick={() => onCategoryChange('')}
          className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeCategory === '' 
              ? 'bg-brand/10 text-brand' 
              : 'text-ui-text-secondary hover:bg-ui-bg-alt'
          }`}
        >
          All Categories
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeCategory === category 
                ? 'bg-brand/10 text-brand' 
                : 'text-ui-text-secondary hover:bg-ui-bg-alt'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-ui-border">
        <h4 className="font-bold text-xs uppercase tracking-widest text-ui-muted mb-4">Price Range</h4>
        <div className="px-2">
            <input type="range" className="w-full accent-brand" min="0" max="100" />
            <div className="flex justify-between mt-2 text-[10px] font-bold text-ui-muted">
                <span>$0</span>
                <span>$500+</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebarFilter;

import React from 'react';
import LocationAutocomplete from './LocationAutocomplete';

const LeftSidebarFilter = ({ 
  activeCategory = '', 
  onCategoryChange, 
  categories = [],
  activeRegion = '',
  onRegionChange,
  regions = [],
  activeCountry = '',
  onCountryChange,
  quickFilters = {},
  onQuickFilterToggle,
  placeholder = "Search country..."
}) => {
  const handleSelect = (item, current, onChange) => {
    if (!onChange) return;
    if (item === '' || current === item) {
      onChange('');
    } else {
      onChange(item);
    }
  };

  const handleLocationSelect = (e) => {
    if (!onCountryChange) return;
    const loc = e.target.locationData;
    if (loc) {
        onCountryChange(loc.type === 'country' ? loc.name : loc.country_code);
    } else {
        onCountryChange(e.target.value);
    }
  };

  const quickFilterOptions = ['Top Rated', 'Available Now', 'Instant Reply', 'Verified'];

  return (
    <div className="space-y-6 hidden lg:block">
      <div className="p-5 rounded-3xl shadow-sm bg-ui-white border border-ui-border">
        <h3 className="text-lg font-bold mb-4 text-ui-text-main">Categories</h3>
        <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar">
          <button
            onClick={() => handleSelect('', activeCategory, onCategoryChange)}
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
              onClick={() => handleSelect(category, activeCategory, onCategoryChange)}
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
      </div>

      <div className="p-5 rounded-3xl shadow-sm bg-ui-white border border-ui-border">
        <h3 className="text-lg font-bold mb-4 text-ui-text-main">Quick Filters</h3>
        <div className="space-y-2">
          {quickFilterOptions.map(pill => {
            const isActive = quickFilters[pill];
            return (
              <button 
                key={pill}
                onClick={() => onQuickFilterToggle && onQuickFilterToggle(pill)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                  isActive 
                    ? 'bg-brand text-white border-brand' 
                    : 'bg-ui-white border-ui-border text-ui-text-secondary hover:bg-ui-bg-alt'
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>
      </div>

      {regions.length > 0 && (
        <div className="p-5 rounded-3xl shadow-sm bg-ui-white border border-ui-border">
          <h3 className="text-lg font-bold mb-4 text-ui-text-main">Regions</h3>
          <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar">
            <button
              onClick={() => handleSelect('', activeRegion, onRegionChange)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeRegion === '' 
                  ? 'bg-brand/10 text-brand' 
                  : 'text-ui-text-secondary hover:bg-ui-bg-alt'
              }`}
            >
              All Regions
            </button>
            {regions.map(region => (
              <button
                key={region}
                onClick={() => handleSelect(region, activeRegion, onRegionChange)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeRegion === region 
                    ? 'bg-brand/10 text-brand' 
                    : 'text-ui-text-secondary hover:bg-ui-bg-alt'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      )}

      {onCountryChange && (
        <div className="p-5 rounded-3xl shadow-sm bg-ui-white border border-ui-border">
          <h3 className="text-lg font-bold mb-4 text-ui-text-main">Location</h3>
          <LocationAutocomplete
            value={activeCountry}
            onChange={handleLocationSelect}
            placeholder={placeholder}
          />
          {activeCountry && (
            <button 
                onClick={() => onCountryChange('')}
                className="mt-2 text-[10px] font-black uppercase text-brand hover:underline"
            >
                Clear Location
            </button>
          )}
        </div>
      )}
      
      <div className="p-5 rounded-3xl shadow-sm bg-ui-white border border-ui-border">
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

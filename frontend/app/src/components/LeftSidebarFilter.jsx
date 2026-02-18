import React from 'react';

const LeftSidebarFilter = () => {
  const languages = ['English', 'Spanish', 'French', 'German'];
  const countries = ['USA', 'Spain', 'France', 'Germany'];
  const services = ['Travel', 'Housing', 'Documentation'];

  return (
    <div className="p-4 rounded-lg shadow-lg bg-white">
      <h3 className="text-lg font-bold mb-4">Filter By</h3>
      
      {/* Price Filter */}
      <div className="mb-4">
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Max Price</label>
        <input type="range" id="price" name="price" min="0" max="500" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        {/* Simple range slider for price */}
      </div>

      {/* Language Filter */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Language</h4>
        {languages.map(lang => (
          <div key={lang} className="flex items-center">
            <input type="checkbox" id={lang} name={lang} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
            <label htmlFor={lang} className="ml-2 block text-sm text-gray-900">{lang}</label>
          </div>
        ))}
      </div>

      {/* Country Filter */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Country</h4>
        {countries.map(country => (
          <div key={country} className="flex items-center">
            <input type="checkbox" id={country} name={country} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
            <label htmlFor={country} className="ml-2 block text-sm text-gray-900">{country}</label>
          </div>
        ))}
      </div>
      
      {/* Services Filter */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Services</h4>
        {services.map(service => (
          <div key={service} className="flex items-center">
            <input type="checkbox" id={service} name={service} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
            <label htmlFor={service} className="ml-2 block text-sm text-gray-900">{service}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftSidebarFilter;

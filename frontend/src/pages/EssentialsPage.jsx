import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FilterComponent from '../components/FilterComponent';
import GuidePreviewCard from '../components/GuidePreviewCard';
import ExperiencePreviewCard from '../components/ExperiencePreviewCard';
import LeftSidebarFilter from '../components/LeftSidebarFilter';
import { getGuides, getExperiences, getExperienceRegions } from '../services/api';

const EssentialsPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeRegion, setActiveRegion] = useState('');
  const [activeCountry, setActiveCountry] = useState('');
  const [quickFilters, setQuickFilters] = useState({
    'Top Rated': false,
    'Available Now': false,
    'Instant Reply': false,
    'Verified': false
  });

  const essentialCategories = ['Transportation', 'Housing', 'Documentation', 'Connectivity', 'Local Support'];

  const toggleQuickFilter = (name) => {
    setQuickFilters(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const getApiQuickFilters = () => ({
    top_rated: quickFilters['Top Rated'],
    available_now: quickFilters['Available Now'],
    instant_reply: quickFilters['Instant Reply'],
    verified: quickFilters['Verified']
  });

  useEffect(() => {
    setCategories(essentialCategories);
    getExperienceRegions().then(res => setRegions(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    
    getExperiences(searchQuery, activeCategory, activeRegion, activeCountry, getApiQuickFilters(), '', 'service')
      .then(response => {
        const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
        setItems(data);
      })
      .catch(err => {
        console.error(`Error fetching services:`, err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchQuery, activeCategory, activeRegion, activeCountry, quickFilters]);

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <header className="mb-10">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-ui-text-main leading-none">Essentials</h1>
        <p className="text-ui-muted font-black uppercase tracking-[0.3em] text-[10px] mt-3">Logistics, housing, and local support</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <LeftSidebarFilter 
            categories={categories} 
            activeCategory={activeCategory} 
            onCategoryChange={setActiveCategory} 
            regions={regions}
            activeRegion={activeRegion}
            onRegionChange={setActiveRegion}
            activeCountry={activeCountry}
            onCountryChange={setActiveCountry}
            quickFilters={quickFilters}
            onQuickFilterToggle={toggleQuickFilter}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="flex flex-col space-y-8">
            {/* Top Search Bar */}
            <div className="relative group max-w-2xl">
                <input 
                  type="text" 
                  placeholder="Search housing, transport, or local support..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 rounded-2xl border-ui-border bg-ui-white pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all text-sm font-bold text-ui-text-main"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted group-focus-within:text-brand transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
            </div>

            {/* Mobile-Only Quick Filters */}
            <div className="lg:hidden space-y-2">
              <FilterComponent 
                filterOptions={categories}
                placeholder="Category..."
                onSearchChange={setSearchQuery}
                onCategoryChange={setActiveCategory}
                activeCategory={activeCategory}
                quickFilters={quickFilters}
                onQuickFilterToggle={toggleQuickFilter}
                value={searchQuery}
                showCategoryFilter={true}
              />
              <FilterComponent 
                filterOptions={regions}
                placeholder="Country/Region..."
                onSearchChange={setActiveCountry}
                onCategoryChange={setActiveRegion}
                activeCategory={activeRegion}
                quickFilters={quickFilters}
                onQuickFilterToggle={toggleQuickFilter}
                value={activeCountry}
              />
            </div>

            {loading ? (
              <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.length > 0 ? (
                  items.map(item => (
                    <ExperiencePreviewCard key={item.id} experience={item} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-20 bg-ui-white rounded-3xl border-2 border-dashed border-ui-border">
                    <p className="text-ui-text-secondary font-medium italic">No services found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EssentialsPage;

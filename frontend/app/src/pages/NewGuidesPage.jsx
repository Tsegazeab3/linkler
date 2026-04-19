import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FilterComponent from '../components/FilterComponent';
import GuidePreviewCard from '../components/GuidePreviewCard';
import ExperiencePreviewCard from '../components/ExperiencePreviewCard';
import LeftSidebarFilter from '../components/LeftSidebarFilter';
import { getGuides, getExperiences } from '../services/api';

const NewGuidesPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('guide'); // 'guide', 'service', 'experience'
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
    const api = import('../services/api');
    if (activeTab === 'experience') {
        api.then(({ getExperienceCategories, getExperienceRegions }) => {
            getExperienceCategories().then(res => setCategories(res.data));
            getExperienceRegions().then(res => setRegions(res.data));
        });
    } else {
        api.then(({ getGuideCountries }) => {
            getGuideCountries(activeTab).then(res => setCategories(res.data));
        });
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    
    if (activeTab === 'experience') {
        getExperiences(searchQuery, activeCategory, activeRegion, activeCountry, getApiQuickFilters())
          .then(response => {
            const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
            setItems(data);
          })
          .catch(err => {
            console.error(`Error fetching experiences:`, err);
          })
          .finally(() => {
            setLoading(false);
          });
    } else {
        getGuides(activeTab, searchQuery, activeCategory, getApiQuickFilters())
          .then(response => {
            const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
            setItems(data);
          })
          .catch(err => {
            console.error(`Error fetching ${activeTab}s:`, err);
          })
          .finally(() => {
            setLoading(false);
          });
    }
  }, [activeTab, searchQuery, activeCategory, activeRegion, activeCountry, quickFilters]);

  const tabs = [
    { id: 'guide', label: 'Guides', icon: '🗺️' },
    { id: 'service', label: 'Services', icon: '🏢' },
    { id: 'experience', label: 'Experiences', icon: '🎒' },
  ];

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <h1 className="text-4xl font-bold mb-8 italic">Guides & Services</h1>
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
          <div className="flex flex-col space-y-6">
            <div className="flex bg-ui-bg-alt p-1 rounded-2xl w-fit border border-ui-border shadow-sm">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery('');
                    setActiveCategory('');
                    setActiveRegion('');
                    setActiveCountry('');
                    setQuickFilters({
                      'Top Rated': false,
                      'Available Now': false,
                      'Instant Reply': false,
                      'Verified': false
                    });
                  }}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-ui-white text-brand shadow-md scale-[1.02]' 
                      : 'text-ui-text-secondary hover:text-ui-text-main'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <FilterComponent 
                filterOptions={categories}
                placeholder={`Search for ${activeTab}s...`}
                onSearchChange={setSearchQuery}
                onCategoryChange={setActiveCategory}
                activeCategory={activeCategory}
                quickFilters={quickFilters}
                onQuickFilterToggle={toggleQuickFilter}
                value={searchQuery}
              />
              {activeTab === 'experience' && (
                <FilterComponent 
                  filterOptions={regions}
                  placeholder="Search by country..."
                  onSearchChange={setActiveCountry}
                  onCategoryChange={setActiveRegion}
                  activeCategory={activeRegion}
                  quickFilters={quickFilters}
                  onQuickFilterToggle={toggleQuickFilter}
                  value={activeCountry}
                />
              )}
            </div>

            {loading ? (
              <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.length > 0 ? (
                  items.map(item => (
                    activeTab === 'experience' ? (
                      <ExperiencePreviewCard key={item.id} experience={item} />
                    ) : (
                      <Link to={`/app/guides/${item.username}`} key={item.id}>
                        <GuidePreviewCard guide={{
                          id: item.id,
                          user_id: item.id,
                          username: item.username,
                          is_following: item.is_following,
                          name: item.username,
                          location: `${item.city || ''}, ${item.country || ''}`,
                          picture: item.profile_picture,
                          price: 25, // Mock price
                          rating: 4.5,
                          country: item.country
                        }} />
                      </Link>
                    )
                  ))
                ) : (
                  <div className="col-span-full text-center py-20 bg-ui-white rounded-3xl border-2 border-dashed border-ui-border">
                    <p className="text-ui-text-secondary font-medium italic">No {activeTab}s found.</p>
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

export default NewGuidesPage;

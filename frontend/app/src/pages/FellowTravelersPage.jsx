import React, { useState, useEffect } from 'react';
import TripCard from '../components/TripCard';
import ActionButtons from '../components/ActionButtons';
import FilterComponent from '../components/FilterComponent';
import { getTrips } from '../services/api';

const FellowTravelersPage = () => {
  const [trips, setTrips] = useState([]);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeRegion, setActiveRegion] = useState('');
  const [activeCountry, setActiveCountry] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
    import('../services/api').then(({ getTripCategories, getTripRegions }) => {
      getTripCategories().then(res => setCategories(res.data));
      getTripRegions().then(res => setRegions(res.data));
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    getTrips(activeCategory, activeRegion, activeCountry, searchQuery, getApiQuickFilters())
      .then(response => {
        const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
        setTrips(data);
        setCurrentIndex(0);
      })
      .catch(err => {
        console.error('Error fetching trips:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeCategory, activeRegion, activeCountry, searchQuery, quickFilters]);

  const handleNext = () => {
    if (currentIndex < trips.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentTrip = trips.length > 0 ? trips[currentIndex] : null;
  
  // Format trip data for TripCard
  const formattedTrip = currentTrip ? {
    id: currentTrip.id,
    user_id: currentTrip.author?.id,
    is_following: currentTrip.author?.is_following,
    picture: currentTrip.author?.profile_picture || 'https://via.placeholder.com/400',
    name: currentTrip.author?.username || 'User',
    username: currentTrip.author?.username,
    bio: currentTrip.author?.bio || '',
    from: currentTrip.origin,
    to: currentTrip.destination,
    country: currentTrip.destination_country,
    region: currentTrip.region,
    dates: `${new Date(currentTrip.start_date).toLocaleDateString()} - ${new Date(currentTrip.end_date).toLocaleDateString()}`,
    message: currentTrip.message,
    image: currentTrip.image
  } : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8">
      <div className='items-center flex flex-col w-full max-w-2xl'>
        <div className="w-full mb-8">
          <FilterComponent 
            filterOptions={categories}
            placeholder="Search destination or message..."
            onSearchChange={setSearchQuery}
            onCategoryChange={setActiveCategory}
            activeCategory={activeCategory}
            secondaryFilterOptions={regions}
            onSecondaryCategoryChange={setActiveRegion}
            activeSecondaryCategory={activeRegion}
            quickFilters={quickFilters}
            onQuickFilterToggle={toggleQuickFilter}
            value={searchQuery}
          />
        </div>

        {loading ? (
          <div className="flex-grow flex items-center justify-center py-20 w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20 bg-ui-white rounded-3xl border-2 border-dashed border-ui-border w-full">
            <p className="text-ui-text-secondary font-medium italic">No trips found. Why not create one?</p>
          </div>
        ) : (
          <>
            {formattedTrip && <TripCard trip={formattedTrip} />}
            <div className="mt-4 flex flex-col items-center">
              <ActionButtons onNext={handleNext} onPrevious={handlePrevious} />
              <p className="text-xs text-gray-500 mt-2">
                Trip {currentIndex + 1} of {trips.length}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FellowTravelersPage;

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

  useEffect(() => {
    import('../services/api').then(({ getTripCategories, getTripRegions }) => {
      getTripCategories().then(res => setCategories(res.data));
      getTripRegions().then(res => setRegions(res.data));
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    getTrips(activeCategory, activeRegion, activeCountry, searchQuery)
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
  }, [activeCategory, activeRegion, activeCountry, searchQuery]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b82f6]"></div>
      </div>
    );
  }

  const trip = trips.length > 0 ? trips[currentIndex] : null;
  // Map backend trip to TripCard requirements
  const formattedTrip = trip ? {
    id: trip.id,
    user_id: trip.author?.id,
    is_following: trip.author?.is_following,
    picture: trip.author?.profile_picture || 'https://via.placeholder.com/400',
    name: trip.author?.username || 'User',
    username: trip.author?.username,
    bio: trip.author?.bio || '',
    from: trip.origin,
    to: trip.destination,
    country: trip.destination_country,
    region: trip.region,
    dates: `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`,
    message: trip.message
  } : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8">
      <div className='items-center flex flex-col w-full max-w-2xl'>
        <div className="w-full space-y-2 mb-8">
          <FilterComponent 
            filterOptions={categories}
            placeholder="Search destination or message..."
            onSearchChange={setSearchQuery}
            onCategoryChange={setActiveCategory}
            activeCategory={activeCategory}
          />
          <FilterComponent 
            filterOptions={regions}
            placeholder="Search by country..."
            onSearchChange={setActiveCountry}
            onCategoryChange={setActiveRegion}
            activeCategory={activeRegion}
          />
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-20 bg-ui-white rounded-3xl border-2 border-dashed border-ui-border w-full">
            <p className="text-ui-text-secondary font-medium italic">No trips found. Why not create one?</p>
          </div>
        ) : (
          <>
            <TripCard trip={formattedTrip} />
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

import React, { useState, useEffect } from 'react';
import TripCard from '../components/TripCard';
import ActionButtons from '../components/ActionButtons';
import FilterComponent from '../components/FilterComponent';
import { getTrips } from '../services/api';
import { MapPin, Compass } from 'lucide-react';

const FellowTravelersPage = () => {
  const [trips, setTrips] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fromCountry, setFromCountry] = useState('');
  const [toCountry, setToCountry] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
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
    setLoading(true);
    // getTrips signature: (category, region, destination_country, search, quickFilters, user, origin)
    // We repurpose the call or update it in services/api.js
    getTrips('', '', toCountry, searchQuery, getApiQuickFilters(), '', fromCountry)
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
  }, [fromCountry, toCountry, searchQuery, quickFilters]);

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

  const handleToggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };

  const currentTrip = trips.length > 0 ? trips[currentIndex] : null;
  
  // Format trip data for TripCard
  const formattedTrip = currentTrip ? {
    id: currentTrip.id,
    user_id: currentTrip.author?.id,
    verification_status: currentTrip.author?.verification_status,
    is_following: currentTrip.author?.is_following,
    picture: currentTrip.author?.profile_picture,
    name: currentTrip.author?.username || 'User',
    username: currentTrip.author?.username,
    bio: currentTrip.author?.bio || '',
    from: currentTrip.origin,
    to: currentTrip.destination,
    country: currentTrip.destination_country,
    region: currentTrip.region,
    category: currentTrip.category,
    dates: `${new Date(currentTrip.start_date).toLocaleDateString()} - ${new Date(currentTrip.end_date).toLocaleDateString()}`,
    message: currentTrip.message,
    image: currentTrip.image
  } : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8">
      <div className='items-center flex flex-col w-full max-w-4xl'>
        <div className="w-full mb-8 max-w-2xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
             <div className="flex-1 relative group">
                <input 
                  type="text" 
                  placeholder="From (Origin)..." 
                  value={fromCountry}
                  onChange={(e) => setFromCountry(e.target.value)}
                  className="w-full h-14 rounded-2xl border-ui-border bg-ui-white pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all text-sm font-bold"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted group-focus-within:text-brand transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
             </div>
             <div className="flex-1 relative group">
                <input 
                  type="text" 
                  placeholder="To (Destination)..." 
                  value={toCountry}
                  onChange={(e) => setToCountry(e.target.value)}
                  className="w-full h-14 rounded-2xl border-ui-border bg-ui-white pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all text-sm font-bold"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted group-focus-within:text-brand transition-colors">
                  <Compass className="w-5 h-5" />
                </div>
             </div>
          </div>

          <FilterComponent 
            placeholder="Search message or user..."
            onSearchChange={setSearchQuery}
            quickFilters={quickFilters}
            onQuickFilterToggle={toggleQuickFilter}
            value={searchQuery}
            showQuickFilters={true}
            showCategoryFilter={false}
          />
        </div>

        {loading ? (
          <div className="flex-grow flex items-center justify-center py-20 w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20 bg-ui-white rounded-3xl border-2 border-dashed border-ui-border w-full max-w-2xl mx-auto">
            <p className="text-ui-text-secondary font-medium italic">No trips found. Why not create one?</p>
          </div>
        ) : (
          <>
            <div className="w-full">
               {formattedTrip && <TripCard trip={formattedTrip} isExpanded={isDetailsOpen} />}
            </div>

            <div className="mt-8 flex flex-col items-center">
              <ActionButtons
                onNext={handleNext}
                onPrevious={handlePrevious}
                onToggleDetails={handleToggleDetails}
                isDetailsOpen={isDetailsOpen}
              />
              <p className="text-[10px] text-ui-muted font-black uppercase tracking-widest bg-ui-bg-alt px-4 py-1.5 rounded-full border border-ui-border">
                Explorer {currentIndex + 1} of {trips.length}
              </p>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FellowTravelersPage;

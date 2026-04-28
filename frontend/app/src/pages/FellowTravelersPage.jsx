import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TripCard from '../components/TripCard';
import ActionButtons from '../components/ActionButtons';
import FilterComponent from '../components/FilterComponent';
import { getTrips } from '../services/api';
import { MapPin, Compass, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { useDirector } from '../context/DirectorContext';

const FellowTravelersPage = () => {
  const [searchParams] = useSearchParams();
  const [trips, setTrips] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fromCountry, setFromCountry] = useState(searchParams.get('origin') || '');
  const [toCountry, setToCountry] = useState(searchParams.get('destination') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const { triggerAction } = useDirector();

  const handleLocationSelect = (type, e) => {
    const loc = e.target.locationData;
    const value = loc ? (loc.type === 'city' ? loc.city : loc.name) : e.target.value;
    if (type === 'from') setFromCountry(value);
    else setToCountry(value);
  };
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
    if (typeof triggerAction === 'function') triggerAction('action:trips-opened');
    
    // We pass toCountry to both destination_country and destination fields 
    // but the backend uses AND filtering. 
    // To be safe for the presentation, we'll pass it to destination which matches "Dubai".
    getTrips('', '', '', searchQuery, getApiQuickFilters(), '', fromCountry, toCountry)
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
          <div className="flex items-center justify-between mb-2">
             <h2 className="text-xl font-black italic uppercase tracking-tighter text-ui-text-main">Find Travelers</h2>
             <Button 
                id="walkthrough-create-trip"
                size="sm" 
                className="rounded-full font-black uppercase tracking-tighter text-[10px] bg-brand hover:bg-brand-hover"
                onClick={() => navigate('/create-trip', { state: { background: location } })}
             >
                <Plus className="w-4 h-4 mr-1" /> Create Trip
             </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
             <div className="flex-1 relative group">
                <LocationAutocomplete
                  value={fromCountry}
                  onChange={(e) => handleLocationSelect('from', e)}
                  placeholder="From (Origin)..."
                />
             </div>
             <div className="flex-1 relative group">
                <LocationAutocomplete
                  value={toCountry}
                  onChange={(e) => handleLocationSelect('to', e)}
                  placeholder="To (Destination)..."
                />
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
               {formattedTrip && (
                 <div id="first-trip-card">
                   <TripCard trip={formattedTrip} isExpanded={isDetailsOpen} />
                 </div>
               )}
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

import React, { useState, useEffect, useRef } from 'react';
import TripCard from '../components/TripCard';
import { getTrips } from '../services/api';

const FellowTravelersPage = () => {
  const [trips, setTrips] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Swipe logic refs
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    getTrips()
      .then(response => {
        setTrips(response.data);
      })
      .catch(err => {
        console.error('Error fetching trips:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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

  const onTouchStart = (e) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b82f6]"></div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No trips found. Why not create one?</p>
        </div>
      </div>
    );
  }

  const trip = trips[currentIndex];
  // Map backend trip to TripCard requirements
  const formattedTrip = {
    id: trip.id,
    user_id: trip.author?.id,
    is_following: trip.author?.is_following,
    picture: trip.author?.profile_picture || 'https://via.placeholder.com/400',
    name: trip.author?.username || 'User',
    bio: trip.author?.bio || '',
    from: trip.origin,
    to: trip.destination,
    dates: `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`,
    message: trip.message
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 lg:p-8 select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className='items-center flex flex-col w-full max-w-sm'>
        <div className="relative w-full transition-all duration-300">
           <TripCard trip={formattedTrip} />
        </div>
        
        {/* Pagination Dots */}
        <div className="mt-6 flex items-center space-x-2">
          {trips.slice(0, 10).map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 transition-all duration-300 rounded-full ${idx === currentIndex ? 'w-6 bg-[#3b82f6]' : 'w-1.5 bg-gray-300'}`}
            />
          ))}
          {trips.length > 10 && <span className="text-[10px] text-gray-400 font-bold">+{trips.length - 10}</span>}
        </div>

        <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-4 font-bold">
          Swipe left or right to explore
        </p>
      </div>
    </div>
  );
};

export default FellowTravelersPage;

import React, { useState, useEffect } from 'react';
import TripCard from '../components/TripCard';
import ActionButtons from '../components/ActionButtons';
import { getTrips } from '../services/api';

const FellowTravelersPage = () => {
  const [trips, setTrips] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

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
    username: trip.author?.username,
    bio: trip.author?.bio || '',
    from: trip.origin,
    to: trip.destination,
    dates: `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`,
    message: trip.message
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8">
      <div className='items-center flex flex-col w-full'>
        <TripCard trip={formattedTrip} />
        <div className="mt-4 flex flex-col items-center">
          <ActionButtons onNext={handleNext} onPrevious={handlePrevious} />
          <p className="text-xs text-gray-500 mt-2">
            Trip {currentIndex + 1} of {trips.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FellowTravelersPage;

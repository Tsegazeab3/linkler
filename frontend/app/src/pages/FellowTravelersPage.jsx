import React from 'react';
import TripCard from '../components/TripCard';
import ActionButtons from '../components/ActionButtons';

const fakeTrips = [
  {
    id: 1,
    picture: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=2080&auto=format&fit=crop',
    name: 'John Doe',
    bio: '28, Software Engineer. I enjoy hiking, photography, and exploring new cultures. Looking for a travel companion for my next adventure.',
    from: 'Dubai, UAE',
    to: 'Muscat, Oman',
    dates: 'March 15 - March 22',
    message: 'Looking for someone to split the drive and explore Oman with. I have a car and love adventure!',
  },
  // Add more trips here for a real implementation
];

const FellowTravelersPage = () => {
  const trip = fakeTrips[0];
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className='items-center flex flex-col'>
        <TripCard trip={trip} />
        <ActionButtons />
      </div>
    </div>
  );
};

export default FellowTravelersPage;

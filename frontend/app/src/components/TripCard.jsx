import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { followUser, unfollowUser, createDM } from '../services/api';

const LocationPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1 text-ui-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1 text-ui-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TripCard = ({ trip }) => {
  const { picture, name, username, bio, from, to, country, region, dates, message, id, user_id, is_following: initialIsFollowing } = trip;
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const { handleOpenChat } = useOutletContext();

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(username);
        setIsFollowing(false);
      } else {
        await followUser(username);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const handleChat = async () => {
    try {
      const res = await createDM(user_id);
      handleOpenChat(res.data, 'dm');
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  return (
    <div className="rounded-lg max-w-4xl mx-auto my-4 overflow-hidden flex flex-col md:flex-row shadow-xl bg-gradient-to-br from-ui-white to-ui-bg-alt group">
      <div className="w-full md:w-1/2 shrink-0 relative overflow-hidden">
        <img
          src={picture || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'}
          alt={`${name}'s profile`}
          className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          <button 
            onClick={handleChat}
            className="p-2 bg-ui-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-ui-white transition-colors text-brand"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          <button 
            onClick={handleFollow}
            className={`p-2 bg-ui-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-ui-white transition-colors ${isFollowing ? 'text-ui-muted' : 'text-brand'}`}
          >
            {isFollowing ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
        <div>
          <Link to={`/app/profile/${username}`}>
            <h2 className="text-2xl font-bold text-ui-text-main mb-2 hover:text-brand transition-colors">{name}</h2>
          </Link>
          <Link to={`/app/profile/${username}`}>
            <p className="text-sm text-ui-text-secondary mb-4 h-20 overflow-y-auto no-scrollbar hover:text-brand transition-colors cursor-pointer">{bio}</p>
          </Link>
        </div>
        <div className="border-t-2 border-ui-border pt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg text-ui-text-secondary">Trip Details</h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-brand/10 text-brand px-2 py-1 rounded">
              {region} • {country}
            </span>
          </div>
          <div className="flex justify-between items-center text-center mb-3">
            <div className="flex items-center">
              <LocationPinIcon />
              <p className="text-md font-semibold">{from}</p>
            </div>
            <div className="text-2xl text-ui-muted">→</div>
            <div className="flex items-center">
              <LocationPinIcon />
              <p className="text-md font-semibold">{to}</p>
            </div>
          </div>
          <div className="text-center mb-4">
            <div className="flex items-center justify-center">
              <CalendarIcon />
              <p className="text-sm font-medium">{dates}</p>
            </div>
          </div>
          <p className="text-sm text-ui-text-secondary italic bg-ui-bg-alt p-2 rounded-lg">"{message}"</p>
        </div>
      </div>
    </div>
  );
};

export default TripCard;


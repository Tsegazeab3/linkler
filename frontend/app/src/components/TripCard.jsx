import React from 'react';
import { Link } from 'react-router-dom';

const LocationPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TripCard = ({ trip }) => {
  const { picture, name, bio, from, to, dates, message, id } = trip;
  return (
    <div className="rounded-lg max-w-4xl mx-auto my-4 overflow-hidden flex shadow-xl bg-gradient-to-br from-white to-gray-100">
      <div className="w-1/2 shrink-0">
        <img
          src={picture}
          alt={`${name}'s profile`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-1/2 p-6 flex flex-col justify-between">
        <div>
          <Link to={`/app/profile/${id}`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors">{name}</h2>
          </Link>
          <p className="text-sm text-gray-600 mb-4 h-20 overflow-y-auto">{bio}</p>
        </div>
        <div className="border-t-2 border-gray-200 pt-4">
          <h3 className="font-bold text-lg mb-3 text-gray-700">Trip Details</h3>
          <div className="flex justify-between items-center text-center mb-3">
            <div className="flex items-center">
              <LocationPinIcon />
              <p className="text-md font-semibold">{from}</p>
            </div>
            <div className="text-2xl text-gray-400">→</div>
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
          <p className="text-sm text-gray-700 italic bg-gray-100 p-2 rounded-lg">"{message}"</p>
        </div>
      </div>
    </div>
  );
};

export default TripCard;


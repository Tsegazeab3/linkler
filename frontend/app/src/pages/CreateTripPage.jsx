import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';

const CreateTripPage = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false); // For animation
  const [tripData, setTripData] = useState({
    from: '',
    to: '',
    dates: '',
    message: '',
  });

  // Effect for enter animation and body cleanup
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setShow(true); // Trigger the "enter" animation

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTripData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Trip Data Submitted:', tripData);
    // In a real app, you'd send this data to a backend
    handleClose();
  };

  const handleClose = () => {
    setShow(false); // Trigger the "leave" animation
    setTimeout(() => {
      navigate(-1); // Navigate back after the animation
    }, 200); // Should match the duration of the transition
  };

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 bg-white/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div
        className={`bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md transition-all duration-200 relative ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">
            Plan Your Journey
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Tell us about your next adventure!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="from" className="block text-sm font-medium text-gray-700">From</label>
            <input
              type="text"
              name="from"
              id="from"
              value={tripData.from}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-gray-700">To</label>
            <input
              type="text"
              name="to"
              id="to"
              value={tripData.to}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="dates" className="block text-sm font-medium text-gray-700">Dates</label>
            <input
              type="text"
              name="dates"
              id="dates"
              value={tripData.dates}
              onChange={handleChange}
              placeholder="e.g., March 15 - March 22"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              name="message"
              id="message"
              rows="3"
              value={tripData.message}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell others about your trip plans and what you're looking for..."
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Trip
          </button>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default CreateTripPage;

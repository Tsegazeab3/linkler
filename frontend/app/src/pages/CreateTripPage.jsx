import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { createTrip } from '../services/api';

const CreateTripPage = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [error, setError] = useState('');
  const [tripData, setTripData] = useState({
    origin: '',
    destination: '',
    destination_country: '',
    region: 'Europe',
    category: 'Adventure',
    start_date: '',
    end_date: '',
    message: '',
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    import('../services/api').then(({ getTripCategories, getTripRegions }) => {
      getTripCategories().then(res => setCategories(res.data));
      getTripRegions().then(res => setRegions(res.data));
    });
    document.body.style.overflow = 'hidden';
    setShow(true);

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
    const { name, value, files } = e.target;
    if (name === 'image' && files) {
      setImage(files[0]);
    } else {
      setTripData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      Object.entries(tripData).forEach(([key, val]) => formData.append(key, val));
      if (image) formData.append('image', image);
      
      await createTrip(formData);
      handleClose();
    } catch (err) {
      console.error('Error creating trip:', err);
      setError(err.response?.data?.detail || 'Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      navigate('/app/travelers');
    }, 200);
  };

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 bg-ui-white/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div
        className={`bg-ui-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md transition-all duration-200 relative ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-ui-muted hover:text-ui-text-main z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-brand">
            Plan Your Journey
          </h1>
          <p className="text-ui-muted mt-2 text-sm">
            Tell us about your next adventure!
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-light text-error text-sm rounded-md border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-ui-text-secondary">Origin</label>
              <input
                type="text"
                name="origin"
                id="origin"
                value={tripData.origin}
                onChange={handleChange}
                placeholder="e.g. Dubai"
                className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand bg-ui-bg-alt text-ui-text-main"
                required
              />
            </div>
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-ui-text-secondary">Destination</label>
              <input
                type="text"
                name="destination"
                id="destination"
                value={tripData.destination}
                onChange={handleChange}
                placeholder="e.g. Muscat"
                className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand bg-ui-bg-alt text-ui-text-main"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-ui-text-secondary">Trip Category</label>
            <select
              name="category"
              id="category"
              value={tripData.category}
              onChange={handleChange}
              className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand bg-ui-bg-alt text-ui-text-main"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="destination_country" className="block text-sm font-medium text-ui-text-secondary">Country</label>
              <input
                type="text"
                name="destination_country"
                id="destination_country"
                value={tripData.destination_country}
                onChange={handleChange}
                placeholder="e.g. UAE"
                className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand bg-ui-bg-alt text-ui-text-main"
                required
              />
            </div>
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-ui-text-secondary">Region</label>
              <select
                name="region"
                id="region"
                value={tripData.region}
                onChange={handleChange}
                className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand bg-ui-bg-alt text-ui-text-main"
                required
              >
                {regions.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-ui-text-secondary">Start Date</label>
              <input
                type="date"
                name="start_date"
                id="start_date"
                value={tripData.start_date}
                onChange={handleChange}
                className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand"
                required
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-ui-text-secondary">End Date</label>
              <input
                type="date"
                name="end_date"
                id="end_date"
                value={tripData.end_date}
                onChange={handleChange}
                className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-ui-text-secondary">Message</label>
            <textarea
              name="message"
              id="message"
              rows="3"
              value={tripData.message}
              onChange={handleChange}
              className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand"
              placeholder="Tell others what you're looking for..."
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-ui-text-secondary">Trip Image (Optional)</label>
            <input
              type="file"
              name="image"
              id="image"
              onChange={handleChange}
              accept="image/*"
              className="mt-1 block w-full text-sm text-ui-text-main"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Trip'}
          </button>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default CreateTripPage;

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { createExperience } from '../services/api';
import { useForm } from '../hooks/useForm';

const CreateExperiencePage = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [error, setError] = useState('');
  
  const { values, handleChange, resetForm } = useForm({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    location: '',
    country: '',
    region: 'Europe',
    duration: '',
    category: 'Cultural',
  });
  
  const [images, setImages] = useState([]);

  useEffect(() => {
    import('../services/api').then(({ getExperienceCategories, getExperienceRegions }) => {
      getExperienceCategories().then(res => setCategories(res.data));
      getExperienceRegions().then(res => setRegions(res.data));
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

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    Object.keys(values).forEach(key => {
      data.append(key, values[key]);
    });
    
    images.forEach(image => {
      data.append('images', image);
    });

    try {
      await createExperience(data);
      handleClose();
    } catch (err) {
      console.error('Error creating experience:', err);
      setError(err.response?.data?.detail || 'Failed to create experience. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      navigate(-1); // Go back to previous page
    }, 200);
  };

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 bg-ui-white/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div
        className={`bg-ui-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-lg transition-all duration-200 relative max-h-[90vh] overflow-y-auto ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-ui-muted hover:text-ui-text-main z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-600">
            Create Experience
          </h1>
          <p className="text-ui-muted mt-2 text-sm">
            List a new service or tour for travellers.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-light text-error text-sm rounded-md border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-ui-text-secondary">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              value={values.title}
              onChange={handleChange}
              placeholder="e.g. Historic Walking Tour of Dubai"
              className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-ui-bg-alt text-ui-text-main"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-ui-text-secondary">Description</label>
            <textarea
              name="description"
              id="description"
              rows="3"
              value={values.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-ui-bg-alt text-ui-text-main"
              placeholder="Describe what makes this experience special..."
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-ui-text-secondary">Price</label>
              <input
                type="number"
                name="price"
                id="price"
                value={values.price}
                onChange={handleChange}
                placeholder="0.00"
                className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-ui-bg-alt text-ui-text-main"
                required
              />
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-ui-text-secondary">Currency</label>
              <select
                name="currency"
                id="currency"
                value={values.currency}
                onChange={handleChange}
                className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-ui-bg-alt text-ui-text-main"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="AED">AED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-ui-text-secondary">Location</label>
              <input
                type="text"
                name="location"
                id="location"
                value={values.location}
                onChange={handleChange}
                placeholder="e.g. Old Dubai"
                className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-ui-bg-alt text-ui-text-main"
                required
              />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-ui-text-secondary">Duration</label>
              <input
                type="text"
                name="duration"
                id="duration"
                value={values.duration}
                onChange={handleChange}
                placeholder="e.g. 3 hours"
                className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-ui-bg-alt text-ui-text-main"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-ui-text-secondary">Category</label>
            <select
              name="category"
              id="category"
              value={values.category}
              onChange={handleChange}
              className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-ui-bg-alt text-ui-text-main"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-ui-text-secondary">Country</label>
              <input
                type="text"
                name="country"
                id="country"
                value={values.country}
                onChange={handleChange}
                placeholder="e.g. France"
                className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-ui-bg-alt text-ui-text-main"
                required
              />
            </div>
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-ui-text-secondary">Region</label>
              <select
                name="region"
                id="region"
                value={values.region}
                onChange={handleChange}
                className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-ui-bg-alt text-ui-text-main"
                required
              >
                {regions.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-ui-text-secondary">Experience Images (Multiple)</label>
            <input
              type="file"
              name="images"
              id="image"
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="mt-1 block w-full text-sm text-ui-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {images.length > 0 && (
              <p className="text-xs text-ui-muted mt-1">{images.length} images selected</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 mt-6"
          >
            {loading ? 'Creating...' : 'Create Experience'}
          </button>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default CreateExperiencePage;

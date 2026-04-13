import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { createPromotion } from '../services/api';

const CreatePromotionPage = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    category: 'Hotels',
    region: 'Europe',
    country: '',
    off_percent: '',
    description: '',
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    import('../services/api').then(({ getPromotionCategories, getPromotionRegions }) => {
      getPromotionCategories().then(res => setCategories(res.data));
      getPromotionRegions().then(res => setRegions(res.data));
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (image) {
      data.append('image', image);
    }

    try {
      await createPromotion(data);
      handleClose();
    } catch (err) {
      console.error('Error creating promotion:', err);
      setError(err.response?.data?.detail || 'Failed to create promotion. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      navigate(-1);
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
          <h1 className="text-3xl font-bold text-purple-600">
            Post Promotion
          </h1>
          <p className="text-ui-muted mt-2 text-sm">
            Share a special offer with the community.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-light text-error text-sm rounded-md border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-ui-text-secondary">Promotion Title</label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 20% off Desert Safari"
              className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-ui-bg-alt text-ui-text-main"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-ui-text-secondary">Category</label>
            <select
              name="category"
              id="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-ui-bg-alt text-ui-text-main"
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
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g. France"
                className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-ui-bg-alt text-ui-text-main"
                required
              />
            </div>
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-ui-text-secondary">Region</label>
              <select
                name="region"
                id="region"
                value={formData.region}
                onChange={handleChange}
                className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-ui-bg-alt text-ui-text-main"
                required
              >
                {regions.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-ui-text-secondary">Company Name</label>
            <input
              type="text"
              name="company"
              id="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Desert Adventures Ltd."
              className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-ui-bg-alt text-ui-text-main"
              required
            />
          </div>

          <div>
            <label htmlFor="off_percent" className="block text-sm font-medium text-ui-text-secondary">Discount Percentage (%)</label>
            <input
              type="number"
              name="off_percent"
              id="off_percent"
              value={formData.off_percent}
              onChange={handleChange}
              placeholder="e.g. 20"
              className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-ui-bg-alt text-ui-text-main"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-ui-text-secondary">Description</label>
            <textarea
              name="description"
              id="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-ui-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-ui-bg-alt text-ui-text-main"
              placeholder="Provide details about the promotion..."
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-ui-text-secondary">Promotion Image</label>
            <input
              type="file"
              name="image"
              id="image"
              onChange={handleImageChange}
              accept="image/*"
              className="mt-1 block w-full text-sm text-ui-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 mt-6"
          >
            {loading ? 'Posting...' : 'Post Promotion'}
          </button>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default CreatePromotionPage;

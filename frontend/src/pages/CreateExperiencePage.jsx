import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { createExperience, getExperienceCategories, getExperienceRegions } from '../services/api';
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
    category: 'Adventure',
    listing_type: 'experience'
  });

  const funCategories = ['Adventure', 'Culture', 'Nightlife', 'History', 'Nature', 'Gastronomy'];
  const essentialCategories = ['Transportation', 'Housing', 'Documentation', 'Connectivity', 'Local Support'];
  
  const activeCategories = values.listing_type === 'experience' ? funCategories : essentialCategories;

  // Set default category when listing type changes
  useEffect(() => {
    const defaultCat = values.listing_type === 'experience' ? 'Adventure' : 'Transportation';
    handleChange({ target: { name: 'category', value: defaultCat } });
  }, [values.listing_type]);
  
  const [orderedMedia, setOrderedMedia] = useState([]);
  const [draggedIndex, setDragIndex] = useState(null);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newItems = files.map(file => ({
      file: file,
      preview: URL.createObjectURL(file)
    }));
    setOrderedMedia(prev => [...prev, ...newItems]);
  };

  const removeMediaItem = (index) => {
    setOrderedMedia(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and Drop Logic
  const onDragStart = (index) => setDragIndex(index);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (index) => {
    if (draggedIndex === null) return;
    const items = [...orderedMedia];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);
    setOrderedMedia(items);
    setDragIndex(null);
  };

  useEffect(() => {
    getExperienceCategories().then(res => setCategories(res.data)).catch(console.error);
    getExperienceRegions().then(res => setRegions(res.data)).catch(console.error);
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
    
    // Add images in the current order
    orderedMedia.forEach((item, idx) => {
        data.append('images', item.file);
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

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-brand leading-none">
            List Your Offering
          </h1>
          <p className="text-ui-muted mt-3 text-xs font-black uppercase tracking-[0.2em]">
            Share an experience or essential service.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-light text-error text-sm rounded-md border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Listing Type Toggle */}
          <div className="flex bg-ui-bg-alt p-1 rounded-2xl border border-ui-border">
            <button
              type="button"
              onClick={() => handleChange({ target: { name: 'listing_type', value: 'experience' } })}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${values.listing_type === 'experience' ? 'bg-brand text-white shadow-lg' : 'text-ui-muted hover:text-ui-text-main'}`}
            >
              🏹 Experience
            </button>
            <button
              type="button"
              onClick={() => handleChange({ target: { name: 'listing_type', value: 'service' } })}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${values.listing_type === 'service' ? 'bg-brand text-white shadow-lg' : 'text-ui-muted hover:text-ui-text-main'}`}
            >
              🛠️ Essential Service
            </button>
          </div>

          <div>
            <label htmlFor="category" className="block text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1 mb-3">Primary Category</label>
            <div className="flex flex-wrap gap-2">
                {activeCategories.map(cat => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => handleChange({ target: { name: 'category', value: cat } })}
                        className={`px-4 py-2 rounded-full border-2 text-[10px] font-black uppercase tracking-widest transition-all ${values.category === cat ? 'border-brand bg-brand/5 text-brand shadow-md border-brand/20' : 'border-ui-border text-ui-muted hover:bg-ui-bg-alt'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
          </div>

          <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1 mb-2">Headline</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={values.title}
                  onChange={handleChange}
                  placeholder={values.listing_type === 'experience' ? "e.g. Historic Walking Tour of Dubai" : "e.g. Airport Transfer & SIM Setup"}
                  className="h-12 w-full rounded-xl bg-ui-bg-alt border-ui-border px-4 font-bold text-ui-text-main"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1 mb-2">The Details</label>
                <textarea
                  name="description"
                  id="description"
                  rows="3"
                  value={values.description}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-ui-bg-alt border-ui-border p-4 font-medium text-ui-text-secondary italic"
                  placeholder="Describe your offering..."
                  required
                ></textarea>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1 mb-2">Price</label>
              <input
                type="number"
                name="price"
                id="price"
                value={values.price}
                onChange={handleChange}
                placeholder="0.00"
                className="h-12 w-full rounded-xl bg-ui-bg-alt border-ui-border px-4 font-bold text-ui-text-main shadow-inner focus-visible:ring-brand"
                required
              />
            </div>
            <div>
              <label htmlFor="currency" className="block text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1 mb-2">Currency</label>
              <select
                name="currency"
                id="currency"
                value={values.currency}
                onChange={handleChange}
                className="h-12 w-full rounded-xl bg-ui-bg-alt border-ui-border px-4 font-bold text-ui-text-main shadow-inner focus-visible:ring-brand"
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
              <label htmlFor="location" className="block text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1 mb-2">Specific Area</label>
              <input
                type="text"
                name="location"
                id="location"
                value={values.location}
                onChange={handleChange}
                placeholder="e.g. Marina / Downtown"
                className="h-12 w-full rounded-xl bg-ui-bg-alt border-ui-border px-4 font-bold text-ui-text-main shadow-inner focus-visible:ring-brand"
                required
              />
            </div>
            <div>
              <label htmlFor="duration" className="block text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1 mb-2">
                {values.listing_type === 'experience' ? 'Duration' : 'Processing Time'} 
                {values.listing_type === 'service' && <span className="opacity-50 lowercase font-medium ml-1">(optional)</span>}
              </label>
              <input
                type="text"
                name="duration"
                id="duration"
                value={values.duration}
                onChange={handleChange}
                placeholder={values.listing_type === 'experience' ? "e.g. 3 hours" : "e.g. 2-3 days"}
                className="h-12 w-full rounded-xl bg-ui-bg-alt border-ui-border px-4 font-bold text-ui-text-main shadow-inner focus-visible:ring-brand"
                required={values.listing_type === 'experience'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className="block text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1 mb-2">Country</label>
              <input
                type="text"
                name="country"
                id="country"
                value={values.country}
                onChange={handleChange}
                placeholder="e.g. UAE"
                className="h-12 w-full rounded-xl bg-ui-bg-alt border-ui-border px-4 font-bold text-ui-text-main"
                required
              />
            </div>
            <div>
              <label htmlFor="region" className="block text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1 mb-2">Region</label>
              <select
                name="region"
                id="region"
                value={values.region}
                onChange={handleChange}
                className="h-12 w-full rounded-xl bg-ui-bg-alt border-ui-border px-4 font-bold text-ui-text-main"
                required
              >
                {regions.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1 mb-4">Visual Gallery</label>
            <div className="grid grid-cols-3 gap-3 mb-4">
                {orderedMedia.map((item, index) => (
                    <div 
                        key={index} 
                        draggable
                        onDragStart={() => onDragStart(index)}
                        onDragOver={onDragOver}
                        onDrop={() => onDrop(index)}
                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 cursor-move transition-all group ${draggedIndex === index ? 'opacity-30 scale-95' : 'opacity-100 hover:border-brand/40 shadow-sm'}`}
                    >
                        <img src={item.preview} className="w-full h-full object-cover" alt="" />
                        <button 
                            type="button"
                            onClick={() => removeMediaItem(index)}
                            className="absolute top-1.5 right-1.5 p-1 bg-error/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-ui-border bg-ui-bg-alt flex flex-col items-center justify-center text-ui-muted hover:border-brand/40 hover:text-brand transition-all hover:bg-brand/5 group"
                >
                  <div className="w-8 h-8 rounded-full bg-ui-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                  </div>
                  <span className="text-[8px] font-black uppercase mt-2">Add Photo</span>
                </button>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {orderedMedia.length > 0 && (
              <p className="text-[10px] font-black uppercase tracking-widest text-brand mt-1 ml-1">{orderedMedia.length} files attached</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-5 px-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white bg-brand hover:bg-brand-hover shadow-2xl shadow-brand/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-8"
          >
            {loading ? 'Processing...' : `List ${values.listing_type === 'experience' ? 'Experience' : 'Essential'}`}
          </button>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default CreateExperiencePage;

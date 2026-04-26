import React, { useState, useEffect, useRef } from 'react';
import { searchLocations } from '../services/api';

const LocationAutocomplete = ({ value, onChange, placeholder, label, name, required = false }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await searchLocations(q);
        setResults(res.data);
        setIsOpen(true);
      } catch (err) {
        console.error('Location search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const selectLocation = (loc) => {
    setQuery(loc.name);
    setIsOpen(false);
    // Custom event-like object for useForm
    onChange({
      target: {
        name,
        value: loc.name,
        locationData: loc // Pass full data if parent needs it
      }
    });
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          className="h-12 w-full rounded-xl bg-ui-bg-alt border-ui-border px-4 font-bold text-ui-text-main shadow-inner focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-[100] w-full mt-2 bg-ui-white rounded-2xl shadow-2xl border border-ui-border overflow-hidden max-h-60 overflow-y-auto">
          {results.map((loc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectLocation(loc)}
              className="w-full text-left px-4 py-3 hover:bg-brand/5 flex items-center justify-between border-b border-ui-border last:border-0 transition-colors group"
            >
              <div>
                <span className="text-xs font-bold text-ui-text-main block">{loc.name}</span>
                <span className="text-[9px] font-black uppercase tracking-tighter text-ui-muted">
                  {loc.type} {loc.is_gcc && <span className="text-brand ml-1">● GCC</span>}
                </span>
              </div>
              <svg className="w-4 h-4 text-ui-muted opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;

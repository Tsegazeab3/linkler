import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FilterComponent from '../components/FilterComponent';
import GuidePreviewCard from '../components/GuidePreviewCard';
import LeftSidebarFilter from '../components/LeftSidebarFilter';
import { getGuides } from '../services/api';

const guideFilterOptions = ['Certified Guides', 'Local Experts', 'Family Friendly', 'Accessible', 'Budget Friendly', 'Walking Tours', 'Museums', 'Nightlife', 'Food Tasting', 'History'];

const NewGuidesPage = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGuides()
      .then(response => {
        setGuides(response.data);
      })
      .catch(err => {
        console.error('Error fetching guides:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b82f6]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Sidebar */}
        <div className="md:col-span-1">
          <LeftSidebarFilter />
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <FilterComponent 
            filterOptions={guideFilterOptions}
            placeholder="Search for guides or services..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {guides.length > 0 ? (
              guides.map(guide => (
                <Link to={`/app/guides/${guide.id}`} key={guide.id}>
                  <GuidePreviewCard guide={{
                    id: guide.id,
                    user_id: guide.id,
                    is_following: guide.is_following,
                    name: guide.username,
                    location: `${guide.city}, ${guide.country}`,
                    picture: guide.profile_picture || 'https://via.placeholder.com/300',
                    avatarUrl: guide.profile_picture || 'https://via.placeholder.com/100',
                    price: 25, // Mock price for now
                    rating: 4.5,
                    reviewsCount: 12,
                    country: guide.country
                  }} />
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">No guides found in your area.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewGuidesPage;


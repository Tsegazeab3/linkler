import React from 'react';
import { Link } from 'react-router-dom';
import FilterComponent from '../components/FilterComponent';
import GuidePreviewCard from '../components/GuidePreviewCard';
import LeftSidebarFilter from '../components/LeftSidebarFilter';
import { fakeGuidesData } from '../data/guides';


const guideFilterOptions = ['Certified Guides', 'Local Experts', 'Family Friendly', 'Accessible', 'Budget Friendly', 'Walking Tours', 'Museums', 'Nightlife', 'Food Tasting', 'History'];

const NewGuidesPage = () => {
  return (
    <div className="min-h-screen p-8">
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
            {fakeGuidesData.map(guide => (
              <Link to={`/app/guides/${guide.id}`} key={guide.id}>
                <GuidePreviewCard guide={guide} />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewGuidesPage;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PromotionCard from '../components/PromotionCard';
import PromotionFilter from '../components/PromotionFilter';
import FilterComponent from '../components/FilterComponent';
import { getPromotions } from '../services/api';

const PromotionsPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(''); // Single string
    const [activeRegion, setActiveRegion] = useState(''); // Single string
    const [activeCountry, setActiveCountry] = useState(''); // Single string
    const [quickFilters, setQuickFilters] = useState({
        'Top Rated': false,
        'Available Now': false,
        'Instant Reply': false,
        'Verified': false
    });

    const toggleQuickFilter = (name) => {
        setQuickFilters(prev => ({ ...prev, [name]: !prev[name] }));
    };

    // Map UI names to API keys
    const getApiQuickFilters = () => ({
        top_rated: quickFilters['Top Rated'],
        available_now: quickFilters['Available Now'],
        instant_reply: quickFilters['Instant Reply'],
        verified: quickFilters['Verified']
    });

    useEffect(() => {
        import('../services/api').then(({ getPromotionCategories, getPromotionRegions }) => {
            getPromotionCategories().then(res => setCategories(res.data));
            getPromotionRegions().then(res => setRegions(res.data));
        });
    }, []);

    useEffect(() => {
        setLoading(true);
        getPromotions(searchQuery, activeCategory, activeRegion, activeCountry, getApiQuickFilters())
            .then(response => {
                const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
                setPromotions(data);
            })
            .catch(err => {
                console.error('Error fetching promotions:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [searchQuery, activeCategory, activeRegion, activeCountry, quickFilters]);

    return (
        <div className="p-4 lg:p-8">
            <h1 className="text-4xl font-bold mb-8">Deals & Promotions</h1>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar for Filters */}
                <div className="hidden lg:block lg:col-span-1">
                    <PromotionFilter 
                        categories={categories}
                        activeCategory={activeCategory} 
                        onCategoryChange={setActiveCategory} 
                        regions={regions}
                        activeRegion={activeRegion}
                        onRegionChange={setActiveRegion}
                        activeCountry={activeCountry}
                        onCountryChange={setActiveCountry}
                        quickFilters={quickFilters}
                        onQuickFilterToggle={toggleQuickFilter}
                    />
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div className="mb-8">
                        <FilterComponent 
                            filterOptions={categories}
                            placeholder="Search for promotions..."
                            onSearchChange={setSearchQuery}
                            onCategoryChange={setActiveCategory}
                            activeCategory={activeCategory}
                            secondaryFilterOptions={regions}
                            onSecondaryCategoryChange={setActiveRegion}
                            activeSecondaryCategory={activeRegion}
                            quickFilters={quickFilters}
                            onQuickFilterToggle={toggleQuickFilter}
                            value={searchQuery}
                        />
                    </div>
                    
                    {loading ? (
                        <div className="min-h-[400px] flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                            {promotions.length > 0 ? (
                                promotions.map(promo => (
                                    <Link to={`/app/promotions/${promo.id}`} key={promo.id}>
                                        <PromotionCard promotion={{
                                            id: promo.id,
                                            title: promo.title,
                                            company: promo.company,
                                            region: promo.region,
                                            country: promo.country,
                                            image: promo.image || 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
                                            rating: promo.rating,
                                            offer: `${promo.off_percent}% Off`,
                                            original_price: promo.original_price,
                                            discounted_price: promo.discounted_price,
                                            currency: promo.currency
                                        }} />
                                    </Link>

                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 bg-ui-white rounded-3xl border-2 border-dashed border-ui-border">
                                    <p className="text-ui-text-secondary font-medium italic">No active promotions found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PromotionsPage;

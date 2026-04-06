import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PromotionCard from '../components/PromotionCard';
import PromotionFilter from '../components/PromotionFilter';
import FilterComponent from '../components/FilterComponent';
import { getPromotions } from '../services/api';

const promotionFilterOptions = ['Hotels', 'Restaurants', 'Bars', 'Travel', 'Activities'];

const PromotionsPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('');

    useEffect(() => {
        setLoading(true);
        getPromotions(searchQuery, activeCategory)
            .then(response => {
                setPromotions(response.data);
            })
            .catch(err => {
                console.error('Error fetching promotions:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [searchQuery, activeCategory]);

    return (
        <div className="p-4 lg:p-8">
            <h1 className="text-4xl font-bold mb-8">Deals & Promotions</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Left Sidebar for Filters */}
                <div className="md:col-span-1">
                    <PromotionFilter 
                        activeCategory={activeCategory} 
                        onCategoryChange={setActiveCategory} 
                    />
                </div>

                {/* Main Content */}
                <div className="md:col-span-3">
                    <FilterComponent 
                        filterOptions={promotionFilterOptions}
                        placeholder="Search for promotions..."
                        onSearchChange={setSearchQuery}
                        onCategoryChange={setActiveCategory}
                        activeCategory={activeCategory}
                    />
                    
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

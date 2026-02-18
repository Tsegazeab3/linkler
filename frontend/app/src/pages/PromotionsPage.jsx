import React from 'react';
import { Link } from 'react-router-dom';
import PromotionCard from '../components/PromotionCard';
import PromotionFilter from '../components/PromotionFilter';
import FilterComponent from '../components/FilterComponent';

const fakePromotions = [
    { id: 1, title: '50% Off Luxury Suite', company: 'Grand Hyatt Hotel', image: 'https://picsum.photos/seed/hotel1/800/600', rating: 4.9, offer: '50% Off' },
    { id: 2, title: 'Happy Hour Cocktails', company: 'The Alchemist Bar', image: 'https://picsum.photos/seed/bar1/800/600', rating: 4.7, offer: '2-for-1 Drinks' },
    { id: 3, title: 'Gourmet Dining Experience', company: 'Le Ciel Restaurant', image: 'https://picsum.photos/seed/food1/800/600', rating: 4.8, offer: 'Free Dessert' },
    { id: 4, title: 'City Tour Bus', company: 'Dubai Hop-On Hop-Off', image: 'https://picsum.photos/seed/bus1/800/600', rating: 4.6, offer: '20% Discount' },
    { id: 5, title: 'Skydiving Over The Palm', company: 'Skydive Dubai', image: 'https://picsum.photos/seed/sky1/800/600', rating: 5.0, offer: 'Free Video Package' },
    { id: 6, title: 'Spa & Relaxation', company: 'Serenity Spa', image: 'https://picsum.photos/seed/spa1/800/600', rating: 4.8, offer: '30% Off Massages' },
];

const promotionFilterOptions = ['Hotels', 'Restaurants', 'Bars', 'Travel', 'Activities'];

const PromotionsPage = () => {
    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold mb-8">Deals & Promotions</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Left Sidebar for Filters */}
                <div className="md:col-span-1">
                    <PromotionFilter />
                </div>

                {/* Main Content */}
                <div className="md:col-span-3">
                    <FilterComponent 
                        filterOptions={promotionFilterOptions}
                        placeholder="Search for promotions..."
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                        {fakePromotions.map(promo => (
                            <Link to={`/app/promotions/${promo.id}`} key={promo.id}>
                                <PromotionCard promotion={promo} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromotionsPage;

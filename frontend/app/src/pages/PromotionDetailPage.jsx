import React from 'react';
import { useParams } from 'react-router-dom';
import StarRating from '../components/StarRating';

// In a real app, this data would be fetched based on the ID
const fakePromotionsData = [
    { id: 1, title: '50% Off Luxury Suite', company: 'Grand Hyatt Hotel', image: 'https://picsum.photos/seed/hotel1/1200/800', rating: 4.9, offer: '50% Off', description: 'Enjoy a luxurious stay in our premium suites with breathtaking city views. This offer includes complimentary breakfast and access to our spa.', gallery: ['https://picsum.photos/seed/hotel_gallery1/800/600', 'https://picsum.photos/seed/hotel_gallery2/800/600', 'https://picsum.photos/seed/hotel_gallery3/800/600'], reviews: [{ id: 1, reviewer: 'Samantha', rating: 5, comment: 'Absolutely stunning hotel and an unbeatable deal!', avatar: 'https://i.pravatar.cc/40?img=20' }, { id: 2, reviewer: 'Mark', rating: 4, comment: 'Great location and service. The room was fantastic.', avatar: 'https://i.pravatar.cc/40?img=21' }] },
    { id: 2, title: 'Happy Hour Cocktails', company: 'The Alchemist Bar', image: 'https://picsum.photos/seed/bar1/1200/800', rating: 4.7, offer: '2-for-1 Drinks', description: 'Join us for happy hour from 5-7pm every weekday. All cocktails are 2-for-1!', gallery: ['https://picsum.photos/seed/bar_gallery1/800/600'], reviews: [{ id: 1, reviewer: 'Chloe', rating: 5, comment: 'Best cocktails in town!', avatar: 'https://i.pravatar.cc/40?img=22' }] },
    // Add more promotion details to match the list on PromotionsPage
];


const PromotionDetailPage = () => {
    const { id } = useParams();
    // Find the promotion from the fake data. In a real app, you would fetch this.
    const promotion = fakePromotionsData.find(p => p.id === parseInt(id)) || fakePromotionsData[0];

    return (
        <div className="p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-bold">{promotion.title}</h1>
                <p className="text-xl text-gray-500 mb-4">{promotion.company}</p>
                <img src={promotion.image} alt={promotion.title} className="w-full h-96 object-cover rounded-lg shadow-lg mb-8" />
                
                <div className="text-2xl font-bold text-green-600 mb-6">{promotion.offer}</div>
                <p className="text-lg text-gray-700 mb-8">{promotion.description}</p>
                
                {/* Gallery */}
                <h2 className="text-3xl font-bold mb-4">Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {promotion.gallery.map((img, i) => <img key={i} src={img} alt={`Gallery image ${i+1}`} className="w-full h-48 object-cover rounded-md shadow" />)}
                </div>

                {/* Reviews */}
                <h2 className="text-3xl font-bold mb-4">Reviews</h2>
                <div className="space-y-4">
                    {promotion.reviews.map(review => (
                        <div key={review.id} className="bg-white p-4 rounded-lg shadow flex items-start space-x-4">
                            <img src={review.avatar} alt={review.reviewer} className="w-12 h-12 rounded-full"/>
                            <div>
                                <h3 className="font-bold">{review.reviewer}</h3>
                                <StarRating rating={review.rating} />
                                <p className="mt-1">{review.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PromotionDetailPage;

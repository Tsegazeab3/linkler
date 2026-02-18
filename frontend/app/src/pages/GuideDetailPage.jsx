import React from 'react';
import { useParams } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { fakeGuidesData } from '../data/guides';

const GuideDetailPage = () => {
    const { id } = useParams();
    // Find the guide from the fake data.
    const guide = fakeGuidesData.find(g => g.id === parseInt(id));

    if (!guide) {
        return <div className="p-8">Guide not found!</div>;
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                {/* Guide Details Section */}
                <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col md:flex-row">
                    <img src={guide.picture} alt={guide.name} className="w-48 h-48 rounded-full object-cover md:mr-8 flex-shrink-0" />
                    <div className="mt-4 md:mt-0">
                        <h1 className="text-4xl font-bold">{guide.name}</h1>
                        <p className="text-xl text-gray-600">{guide.country}</p>
                        <div className="my-4">
                            <StarRating rating={guide.rating} />
                        </div>
                        <p className="text-lg">{guide.serviceDescription}</p>
                        <p className="text-2xl font-bold text-gray-800 mt-4">${guide.price.toFixed(2)}</p>
                        <button 
                            onClick={() => console.log(`Saving guide ${guide.id}`)}
                            className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            Save Guide
                        </button>
                    </div>
                </div>

                {/* Schedule Section */}
                {guide.schedule && guide.schedule.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-3xl font-bold mb-6">Availability</h2>
                        <div className="bg-white rounded-lg shadow p-6">
                            <ul className="space-y-2">
                                {guide.schedule.map(slot => (
                                    <li key={slot.day} className="flex justify-between">
                                        <span className="font-semibold">{slot.day}</span>
                                        <span>{slot.time}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Event Pictures Section */}
                {guide.eventPictures && guide.eventPictures.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-3xl font-bold mb-6">Gallery</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {guide.eventPictures.map((pic, index) => (
                                <img key={index} src={pic} alt={`Event picture ${index + 1}`} className="w-full h-48 object-cover rounded-lg shadow-md" />
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                {guide.reviews && guide.reviews.length > 0 ? (
                    <div className="mt-12">
                        <h2 className="text-3xl font-bold mb-6">Reviews</h2>
                        <div className="space-y-6">
                            {guide.reviews.map(review => (
                                <div key={review.id} className="bg-white rounded-lg shadow p-6 flex items-start space-x-4">
                                    <img src={review.avatar} alt={review.reviewer} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                                    <div className="flex-grow">
                                        <div className="flex items-center mb-2">
                                            <h3 className="text-lg font-semibold">{review.reviewer}</h3>
                                            <div className="ml-4">
                                                <StarRating rating={review.rating} />
                                            </div>
                                        </div>
                                        <p className="text-gray-700">{review.comment}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mt-12">
                        <h2 className="text-3xl font-bold mb-6">Reviews</h2>
                        <p>No reviews yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuideDetailPage;

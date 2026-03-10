import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const FloatingPlusButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleNewPostClick = () => {
        navigate('/create', { state: { background: location } });
        setIsOpen(false);
    };

    const handleNewTripClick = () => {
        navigate('/create-trip', { state: { background: location } });
        setIsOpen(false);
    };

    return (
        <div className="hidden lg:block fixed bottom-8 right-8 z-30">
            <div className="relative flex flex-col items-end">
                {/* Expanded Action Buttons */}
                {isOpen && (
                    <div className="flex flex-col items-end mb-4 space-y-2">
                        {/* New Trip Post Button */}
                        <button
                            onClick={handleNewTripClick}
                            className="flex items-center space-x-2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300"
                        >
                            <span className="font-semibold text-gray-700">New Trip</span>
                            {/* Placeholder for a trip icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>

                        {/* New Home Post Button */}
                        <button
                            onClick={handleNewPostClick}
                            className="flex items-center space-x-2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300"
                        >
                            <span className="font-semibold text-gray-700">New Post</span>
                            {/* Placeholder for a post icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </button>
                    </div>
                )}

                {/* Main FAB */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className=" text-black  rounded-full w-14 h-14 flex items-center justify-center  transition-transform transform"
                    aria-expanded={isOpen}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 transition-transform transform ${isOpen ? 'rotate-45' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default FloatingPlusButton;

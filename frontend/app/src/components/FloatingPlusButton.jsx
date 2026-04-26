import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FloatingPlusButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
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

    const handleNewServiceClick = () => {
        // Placeholder for new service creation
        navigate('/create-service', { state: { background: location } });
        setIsOpen(false);
    };

    const handleNewPromotionClick = () => {
        // Placeholder for new promotion creation
        navigate('/create-promotion', { state: { background: location } });
        setIsOpen(false);
    };

    const handleNewGroupClick = () => {
        // We'll trigger a custom event or use a prop if we move the modal to App.jsx
        // For now, let's assume we can trigger it via a window event or just navigate
        // Actually, the best way is to move the modal to App.jsx and use a handler.
        window.dispatchEvent(new CustomEvent('open-create-group-modal'));
        setIsOpen(false);
    };

    return (
        <div className="hidden lg:block fixed bottom-8 right-8 z-30">
            <div className="relative flex flex-col items-end">
                {/* Expanded Action Buttons */}
                {isOpen && (
                    <div className="flex flex-col items-end mb-4 space-y-2">
                        {/* New Group Button */}
                        <button
                            onClick={handleNewGroupClick}
                            className="flex items-center space-x-2 bg-ui-white p-3 rounded-full shadow-lg hover:bg-ui-bg-alt transition-all duration-300 animate-in slide-in-from-bottom-2"
                        >
                            <span className="font-semibold text-ui-text-secondary">New Group</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </button>

                        {/* Role specific buttons */}
                        {user?.account_type === 'guide' && (
                            <button
                                onClick={handleNewServiceClick}
                                className="flex items-center space-x-2 bg-ui-white p-3 rounded-full shadow-lg hover:bg-ui-bg-alt transition-all duration-300"
                            >
                                <span className="font-semibold text-ui-text-secondary">Post Service</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </button>
                        )}

                        {user?.account_type === 'service' && (
                            <button
                                onClick={handleNewPromotionClick}
                                className="flex items-center space-x-2 bg-ui-white p-3 rounded-full shadow-lg hover:bg-ui-bg-alt transition-all duration-300"
                            >
                                <span className="font-semibold text-ui-text-secondary">Post Promotion</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                            </button>
                        )}

                        {/* New Trip Post Button */}
                        <button
                            onClick={handleNewTripClick}
                            className="flex items-center space-x-2 bg-ui-white p-3 rounded-full shadow-lg hover:bg-ui-bg-alt transition-all duration-300"
                        >
                            <span className="font-semibold text-ui-text-secondary">New Trip</span>
                            {/* Placeholder for a trip icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>

                        {/* New Home Post Button */}
                        <button
                            onClick={handleNewPostClick}
                            className="flex items-center space-x-2 bg-ui-white p-3 rounded-full shadow-lg hover:bg-ui-bg-alt transition-all duration-300"
                        >
                            <span className="font-semibold text-ui-text-secondary">New Post</span>
                            {/* Placeholder for a post icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </button>
                    </div>
                )}

                {/* Main FAB */}
                <button
                    id="walkthrough-plus"
                    onClick={() => setIsOpen(!isOpen)}
                    className=" text-ui-text-main  rounded-full w-14 h-14 flex items-center justify-center  transition-transform transform"
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


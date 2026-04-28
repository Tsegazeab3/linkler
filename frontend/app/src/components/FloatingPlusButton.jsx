import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FloatingPlusButton = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleNewPostClick = () => {
        navigate('/create', { state: { background: location } });
    };

    return (
        <div className="hidden lg:block fixed bottom-8 right-8 z-30">
            <button
                id="walkthrough-create-post"
                onClick={handleNewPostClick}
                className="bg-brand text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:bg-brand-hover rounded-full w-16 h-16 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
                title="Create New Post"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
    );
};

export default FloatingPlusButton;


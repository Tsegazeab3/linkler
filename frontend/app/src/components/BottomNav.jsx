import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SvgHome from './icons/Home.jsx';
import SvgFellowTravelers from './icons/FellowTravelers.jsx';
import SvgNewGuides from './icons/NewGuides.jsx';
import SvgChats from './icons/Chats.jsx';

const BottomNav = ({ onOpenChat, onPanelItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { id: 'home', icon: SvgHome, label: 'Home', path: '/app' },
    { id: 'travelers', icon: SvgFellowTravelers, label: 'Travelers', path: '/app/travelers' },
    { id: 'create', label: 'Create', path: '/create', isCenter: true },
    { id: 'guides', icon: SvgNewGuides, label: 'Guides', path: '/app/guides' },
    { id: 'messages', icon: SvgChats, label: 'Chats', path: '/app', panelId: 3 }, 
  ];

  const handleNavClick = (item) => {
    if (item.panelId && onPanelItemClick) {
      onPanelItemClick(item.panelId);
      return;
    }
    navigate(item.path);
  };

  const handleCreateClick = () => {
    navigate('/create', { state: { background: location } });
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around z-50 px-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        if (item.isCenter) {
          return (
            <button
              key={item.id}
              onClick={handleCreateClick}
              className="flex items-center justify-center -mt-8 bg-[#3b82f6] text-white rounded-full w-14 h-14 shadow-lg border-4 border-[var(--color-linkler-bg)] active:scale-95 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={`flex flex-col items-center justify-center w-12 h-full transition-colors ${isActive ? 'text-[#3b82f6]' : 'text-gray-400'}`}
          >
            {Icon && <Icon className="w-6 h-6" />}
            <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
          </button>
        );
      })}
      
      {isAuthenticated && user && (
        <button
          onClick={() => navigate(`/app/profile/${user.id}`)}
          className={`flex flex-col items-center justify-center w-12 h-full ${location.pathname.includes('/profile/') ? 'text-[#3b82f6]' : 'text-gray-400'}`}
        >
          <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
            {user.profile_picture ? (
              <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                {user.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-medium">Profile</span>
        </button>
      )}
    </div>
  );
};

export default BottomNav;

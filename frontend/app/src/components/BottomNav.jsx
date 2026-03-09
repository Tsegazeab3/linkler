import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SvgHome from './icons/Home.jsx';
import SvgFellowTravelers from './icons/FellowTravelers.jsx';
import SvgNewGuides from './icons/NewGuides.jsx';

const BottomNav = ({ onPanelItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const handleCreateClick = () => {
    navigate('/create', { state: { background: location } });
  };

  const isPathActive = (path) =>
    path === '/app' ? location.pathname === '/app' : location.pathname.startsWith(path);

  // 5 fixed slots — always balanced
  const slots = [
    {
      id: 'home',
      label: 'Home',
      icon: <SvgHome className="w-6 h-6" />,
      active: isPathActive('/app'),
      onClick: () => navigate('/app'),
    },
    {
      id: 'travelers',
      label: 'Travelers',
      icon: <SvgFellowTravelers className="w-6 h-6" />,
      active: isPathActive('/app/travelers'),
      onClick: () => navigate('/app/travelers'),
    },
    {
      id: 'create',
      isCenter: true,
      onClick: handleCreateClick,
    },
    {
      id: 'guides',
      label: 'Guides',
      icon: <SvgNewGuides className="w-6 h-6" />,
      active: isPathActive('/app/guides'),
      onClick: () => navigate('/app/guides'),
    },
    {
      id: 'profile',
      label: isAuthenticated && user ? 'Profile' : 'Sign In',
      icon: isAuthenticated && user ? (
        <Avatar className="w-6 h-6 border border-gray-200">
          <AvatarImage src={user.profile_picture} alt="Profile" className="object-cover" />
          <AvatarFallback className="text-[10px] text-gray-500">{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      active: location.pathname.includes('/profile/') || location.pathname === '/signin',
      onClick: () => isAuthenticated && user ? navigate(`/app/profile/${user.id}`) : navigate('/signin'),
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-sm border-t border-gray-200 flex items-center z-50">
      {slots.map((slot) => {
        if (slot.isCenter) {
          return (
            <button
              key={slot.id}
              onClick={slot.onClick}
              className="flex-1 flex items-center justify-center"
              aria-label="Create"
            >
              <span className="-mt-7 flex items-center justify-center bg-[#3b82f6] text-white rounded-full w-14 h-14 shadow-lg border-4 border-[var(--color-linkler-bg)] active:scale-95 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </span>
            </button>
          );
        }

        return (
          <button
            key={slot.id}
            onClick={slot.onClick}
            className={`flex-1 flex flex-col items-center justify-center h-full gap-0.5 transition-colors ${
              slot.active ? 'text-[#3b82f6]' : 'text-gray-400'
            }`}
          >
            {slot.icon}
            <span className="text-[10px] font-medium leading-none">{slot.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;

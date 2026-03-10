import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SvgHome from './icons/Home.jsx';
import SvgFellowTravelers from './icons/FellowTravelers.jsx';
import SvgChats from './icons/Chats.jsx';
import SvgSettings from './icons/Settings.jsx';
import SvgNewGuides from './icons/NewGuides.jsx';
import SvgPromotions from './icons/Promotions.jsx';

const BottomNav = ({ onPanelItemClick, selectedNavItemId, showSidePanel }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'home', icon: SvgHome, label: 'Home', path: '/app' },
    { id: 'travelers', icon: SvgFellowTravelers, label: 'Travelers', path: '/app/travelers' },
    { id: 'messages', icon: SvgChats, label: 'Messages', panelId: 3 },
    { id: 'guides', icon: SvgNewGuides, label: 'Guides', path: '/app/guides' },
    { id: 'promotions', icon: SvgPromotions, label: 'Deals', path: '/app/promotions' },
    { id: 'settings', icon: SvgSettings, label: 'Settings', path: '/app/settings' },
  ];

  const handleNavClick = (item) => {
    setIsMenuOpen(false);
    if (item.panelId) {
      onPanelItemClick(item.panelId);
    } else {
      // Close side panel if navigating elsewhere
      if (showSidePanel) onPanelItemClick(null);
      navigate(item.path);
    }
  };

  const handleCreateAction = (path) => {
    setIsMenuOpen(false);
    if (showSidePanel) onPanelItemClick(null);
    navigate(path, { state: { background: location } });
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center">
      {/* Sileo-Style Popup Menu (The 'Toaster') */}
      {isMenuOpen && (
        <div className="w-[92%] max-w-sm mb-4 animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="bg-white border border-gray-200 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="p-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCreateAction('/create-trip')}
                className="flex flex-col items-center justify-center py-6 px-4 rounded-[1.5rem] bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-3 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="font-bold text-xs text-blue-600 uppercase tracking-widest">New Trip</span>
              </button>

              <button
                onClick={() => handleCreateAction('/create')}
                className="flex flex-col items-center justify-center py-6 px-4 rounded-[1.5rem] bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 transition-all group"
              >
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-3 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <span className="font-bold text-xs text-emerald-600 uppercase tracking-widest">New Post</span>
              </button>
            </div>
            
            <button 
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-4 bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] border-t border-gray-100 hover:text-gray-600 transition-colors"
            >
                Close Menu
            </button>
          </div>
        </div>
      )}

      {/* Main Create Button - Centered above the bar */}
      <div className="mb-2">
          <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`bg-blue-600 text-white rounded-full w-16 h-16 shadow-[0_10px_30px_rgba(37,99,235,0.4)] border-4 border-white active:scale-90 transition-all flex items-center justify-center ${isMenuOpen ? 'rotate-45 bg-gray-900 shadow-none' : ''}`}
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
          </button>
      </div>

      {/* Main Navigation Bar - Full Width & Swipable */}
      <div className="w-full h-16 bg-white border-t border-gray-200 flex items-center overflow-hidden">
        <div className="w-full h-full flex items-center overflow-x-auto no-scrollbar px-6 space-x-8 scroll-smooth">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.panelId 
              ? showSidePanel && selectedNavItemId === item.panelId 
              : location.pathname === item.path;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center justify-center min-w-[48px] h-full transition-all shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
              >
                <div className={`transition-all duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                  {Icon && <Icon className="w-6 h-6" />}
                </div>
                <span className={`text-[8px] mt-1 font-black uppercase tracking-[0.15em] ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 h-0 translate-y-2'} transition-all duration-300`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Profile Link with Avatar */}
          <button
            onClick={() => { 
                setIsMenuOpen(false); 
                if (showSidePanel) onPanelItemClick(null);
                isAuthenticated && user ? navigate(`/app/profile/${user.id}`) : navigate('/signin');
            }}
            className={`flex flex-col items-center justify-center min-w-[48px] h-full shrink-0 ${location.pathname.includes('/profile/') || location.pathname === '/signin' ? 'text-blue-600' : 'text-gray-500'}`}
          >
            <div className={`transition-all duration-300 ${location.pathname.includes('/profile/') || location.pathname === '/signin' ? 'scale-110 -translate-y-0.5' : ''}`}>
                {isAuthenticated && user ? (
                  <Avatar className="w-6 h-6 border border-gray-200">
                    <AvatarImage src={user.profile_picture} alt="Profile" className="object-cover" />
                    <AvatarFallback className="text-[10px] text-gray-500">{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
            </div>
            <span className={`text-[8px] mt-1 font-black uppercase tracking-[0.15em] ${location.pathname.includes('/profile/') || location.pathname === '/signin' ? 'opacity-100 translate-y-0' : 'opacity-0 h-0 translate-y-2'} transition-all duration-300`}>
              {isAuthenticated && user ? 'Me' : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;

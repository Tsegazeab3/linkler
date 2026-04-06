import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    { id: 'messages', icon: SvgChats, label: 'Messages', path: '/app/messages' },
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

  const isHome = location.pathname === '/app';

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center">
      {/* Sileo-Style Popup Menu (The 'Toaster') */}
      {isHome && isMenuOpen && (
        <div className="w-[92%] max-w-sm mb-4 animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="bg-ui-white border border-ui-border rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="p-2 grid grid-cols-3 gap-2">
              <button
                onClick={() => { setIsMenuOpen(false); window.dispatchEvent(new CustomEvent('open-create-group-modal')); }}
                className="flex flex-col items-center justify-center py-4 px-2 rounded-[1.5rem] bg-accent-indigo/10 hover:bg-accent-indigo/20 active:scale-95 transition-all group"
              >
                <div className="w-10 h-10 bg-accent-indigo rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent-indigo/30 mb-2 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <span className="font-bold text-[9px] text-accent-indigo uppercase tracking-widest text-center">New Group</span>
              </button>

              <button
                onClick={() => handleCreateAction('/create-trip')}
                className="flex flex-col items-center justify-center py-4 px-2 rounded-[1.5rem] bg-brand/10 hover:bg-brand/20 active:scale-95 transition-all group"
              >
                <div className="w-10 h-10 bg-brand rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand/30 mb-2 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="font-bold text-[9px] text-brand uppercase tracking-widest text-center">New Trip</span>
              </button>

              <button
                onClick={() => handleCreateAction('/create')}
                className="flex flex-col items-center justify-center py-4 px-2 rounded-[1.5rem] bg-success/10 hover:bg-success/20 active:scale-95 transition-all group"
              >
                <div className="w-10 h-10 bg-success rounded-2xl flex items-center justify-center text-white shadow-lg shadow-success/30 mb-2 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <span className="font-bold text-[9px] text-success uppercase tracking-widest text-center">New Post</span>
              </button>
            </div>
            
            <button 
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-4 bg-ui-bg-alt/50 text-ui-muted text-[10px] font-bold uppercase tracking-[0.2em] border-t border-ui-border/50 hover:text-ui-text-secondary transition-colors"
            >
                Close Menu
            </button>
          </div>
        </div>
      )}

      {/* Main Create Button - Centered above the bar */}
      {isHome && (
        <div className="mb-2">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`bg-brand text-white rounded-full w-16 h-16 shadow-[0_10px_30px_rgba(37,99,235,0.4)] border-4 border-ui-white active:scale-90 transition-all flex items-center justify-center ${isMenuOpen ? 'rotate-45 bg-ui-text-main shadow-none' : ''}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
      )}

      {/* Main Navigation Bar - Full Width & Swipable */}
      <div className="w-full h-16 bg-ui-white border-t border-ui-border flex items-center overflow-hidden">
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
                className={`flex flex-col items-center justify-center min-w-[48px] h-full transition-all shrink-0 ${isActive ? 'text-brand' : 'text-ui-muted'}`}
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
                isAuthenticated && user ? navigate(`/app/profile/${user.username}`) : navigate('/signin');
            }}
            className={`flex flex-col items-center justify-center min-w-[48px] h-full shrink-0 ${location.pathname.includes('/profile/') || location.pathname === '/signin' ? 'text-brand' : 'text-ui-muted'}`}
          >
            <div className={`transition-all duration-300 ${location.pathname.includes('/profile/') || location.pathname === '/signin' ? 'scale-110 -translate-y-0.5' : ''}`}>
                {isAuthenticated && user ? (
                  <Avatar className="w-6 h-6 border border-ui-border">
                    <AvatarImage src={user.profile_picture} alt="Profile" className="object-cover" />
                    <AvatarFallback className="text-[10px] text-ui-muted">{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
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

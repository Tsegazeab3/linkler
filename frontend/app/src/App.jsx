import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import SideNav from './components/SideNav';
import ChatWindow from './components/ChatWindow'; // Import the new component
import FloatingPlusButton from './components/FloatingPlusButton';
import BottomNav from './components/BottomNav';
import SearchModal from './components/SearchModal';
import CreateGroupModal from './components/CreateGroupModal';
import GroupSearchModal from './components/GroupSearchModal';
import Director from './Director';
import { Toaster } from "@/components/ui/sonner";
import { DataProvider } from './context/DataContext';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openChats, setOpenChats] = useState([]);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedNavItemId, setSelectedNavItemId] = useState(null);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGroupSearchOpen, setIsGroupSearchOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenGroupModal = () => setIsGroupModalOpen(true);
    const handleOpenGroupSearch = () => setIsGroupSearchOpen(true);
    window.addEventListener('open-create-group-modal', handleOpenGroupModal);
    window.addEventListener('open-discover-groups-modal', handleOpenGroupSearch);
    return () => {
      window.removeEventListener('open-create-group-modal', handleOpenGroupModal);
      window.removeEventListener('open-discover-groups-modal', handleOpenGroupSearch);
    };
  }, []);

  const handlePanelItemClick = (itemId, peerData = null) => {
    if (itemId === null) {
      setShowSidePanel(false);
      return;
    }

    // On mobile, 'Messages' (ID 3) should be a page navigation, not a panel overlay
    if (window.innerWidth < 1024 && itemId === 3) {
      navigate('/app/messages');
      setShowSidePanel(false);
      return;
    }

    if (itemId === 'peer_profile') {
        setSelectedPeer(peerData);
        setSelectedNavItemId('peer_profile');
        setShowSidePanel(true);
        return;
    }

    if (showSidePanel && selectedNavItemId === itemId && itemId !== 'peer_profile') {
      setShowSidePanel(false);
    } else {
      setSelectedNavItemId(itemId);
      setShowSidePanel(true);
    }
  };

  const handleClosePanel = () => {
    setShowSidePanel(false);
  };

  const handleOpenChat = (chat, type) => {
    const preference = localStorage.getItem('chatViewPreference') || 'small';

    // Check if we are on mobile (screen width < 1024px) OR preference is large
    if (window.innerWidth < 1024 || preference === 'large') {
      navigate(`/app/messages/${chat.id}`, { state: { chat } });
      setShowSidePanel(false);
      return;
    }

    // Desktop Small preference: Floating windows
    const existingChat = openChats.find(c => c.id === chat.id && c.type === type);
    if (!existingChat) {
      // Limit to 3 open chats for sanity, remove the oldest if full
      const newOpenChats = openChats.length >= 3
        ? [...openChats.slice(1), { ...chat, type }]
        : [...openChats, { ...chat, type }];
      setOpenChats(newOpenChats);
    }
  };

  const handleCloseChat = (id, type) => {
    setOpenChats(prev => prev.filter(c => !(c.id === id && c.type === type)));
  };

  const handleGroupCreated = (newGroup) => {
    handleOpenChat(newGroup, 'group');
  };

  // No left margin on mobile, 80px (w-20) on desktop, 400px when side panel is open on desktop
  const mainContentMargin = showSidePanel
    ? 'lg:ml-[400px]'
    : 'ml-0 lg:ml-20';

  const isHome = location.pathname === '/app' || location.pathname === '/app/';
  const isSpecificChat = location.pathname.startsWith('/app/messages/') && location.pathname !== '/app/messages';

  useEffect(() => {
    // If we are navigating AWAY from a specific chat to the home page, pin it as a floating window
    const prevPath = sessionStorage.getItem('prevPath');
    if (prevPath?.startsWith('/app/messages/') && isHome) {
       const chatId = prevPath.split('/').pop();
       // We'd need the chat object here, but for the presentation 
       // we can assume the user is using the floating windows or we can mock it.
       // For now, let's just make sure the preference logic works.
    }
    sessionStorage.setItem('prevPath', location.pathname);
  }, [location.pathname, isHome]);

  useEffect(() => {
    // On desktop, if we are in the messages section, ensure the side panel is open to 'Messages' (ID 3)
    if (window.innerWidth >= 1024 && location.pathname.startsWith('/app/messages')) {
      setSelectedNavItemId(3);
      setShowSidePanel(true);
    }
  }, [location.pathname]);

  return (
    <Director>
      <div className="flex flex-col min-h-screen bg-[var(--color-linkler-bg)]">
        <div className="flex flex-1 overflow-hidden">
        <SideNav
          onOpenChat={handleOpenChat}
          showSidePanel={showSidePanel}
          selectedNavItemId={selectedNavItemId}
          onPanelItemClick={handlePanelItemClick}
          onClosePanel={handleClosePanel}
          onOpenSearch={() => setIsSearchOpen(true)}
          selectedUser={selectedPeer}
        />

        {/* Mobile backdrop overlay when side panel is open */}
        {showSidePanel && (
          <div
            className="fixed inset-0 bg-black/40 z-[40] lg:hidden"
            onClick={handleClosePanel}
            aria-hidden="true"
          />
        )}

        <main className={`flex-1 transition-[margin] duration-300 ease-in-out ${mainContentMargin} pb-16 lg:pb-0 min-w-0 flex flex-col relative`}>
          {/* Mobile Top Header - ONLY on home page */}
          {isHome && (
            <div className={`lg:hidden sticky top-0 z-[30] bg-ui-white/95 backdrop-blur-md border-b border-ui-border px-4 py-3 flex items-center justify-between`}>
              <h1 
                onClick={() => handlePanelItemClick('user_profile')}
                className="text-xl font-bold bg-gradient-to-r from-brand to-accent-indigo bg-clip-text text-transparent italic font-display cursor-pointer active:scale-95 transition-transform"
              >
                Linkler
              </h1>
              <button
                id="walkthrough-search-mobile"
                onClick={() => setIsSearchOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-ui-bg-alt text-ui-text-secondary active:scale-95 transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto w-full">
            <Outlet context={{ 
                handleOpenChat, 
                handleOpenPeerProfile: (userData) => handlePanelItemClick('peer_profile', userData) 
            }} />
          </div>
        </main>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <GroupSearchModal isOpen={isGroupSearchOpen} onClose={() => setIsGroupSearchOpen(false)} />
      
      <CreateGroupModal 
          isOpen={isGroupModalOpen} 
          onClose={() => setIsGroupModalOpen(false)} 
          onSuccess={handleGroupCreated}
      />

      {!isSpecificChat && (        <BottomNav
          onPanelItemClick={handlePanelItemClick}
          selectedNavItemId={selectedNavItemId}
          showSidePanel={showSidePanel}
        />
      )}

      {/* Render Open Chat Windows */}
      <div className="fixed bottom-16 lg:bottom-0 right-0 z-[9998] flex flex-col lg:flex-row-reverse items-end gap-2">
        {openChats.map((chat, index) => (
          <ChatWindow
            key={`${chat.type}-${chat.id}`}
            chat={chat}
            type={chat.type}
            onClose={handleCloseChat}
            index={index}
            onOpenChat={(chatData, chatType) => handlePanelItemClick('peer_profile', chatData)}
          />
        ))}
      </div>
      <Toaster />
    </div>
    </Director>
  );
}

export default App;

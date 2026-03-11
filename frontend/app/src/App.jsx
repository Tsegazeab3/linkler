import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideNav from './components/SideNav';
import ChatWindow from './components/ChatWindow'; // Import the new component
import FloatingPlusButton from './components/FloatingPlusButton';
import BottomNav from './components/BottomNav';
import SearchModal from './components/SearchModal';
import { Toaster } from "@/components/ui/sonner";

function App() {
  const [openChats, setOpenChats] = useState([]);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedNavItemId, setSelectedNavItemId] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handlePanelItemClick = (itemId) => {
    if (itemId === null) {
      setShowSidePanel(false);
      return;
    }

    if (showSidePanel && selectedNavItemId === itemId) {
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
    // Check if we are on mobile (screen width < 1024px)
    if (window.innerWidth < 1024) {
      navigate(`/app/chat/${chat.id}`);
      setShowSidePanel(false);
      return;
    }

    // Desktop: Floating windows
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

  // No left margin on mobile, 80px (w-20) on desktop, 400px when side panel is open on desktop
  const mainContentMargin = showSidePanel
    ? 'lg:ml-[400px]'
    : 'ml-0 lg:ml-20';

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-linkler-bg)]">
      <div className="flex flex-1">
        <SideNav
          onOpenChat={handleOpenChat}
          showSidePanel={showSidePanel}
          selectedNavItemId={selectedNavItemId}
          onPanelItemClick={handlePanelItemClick}
          onClosePanel={handleClosePanel}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Mobile backdrop overlay when side panel is open */}
        {showSidePanel && (
          <div
            className="fixed inset-0 bg-black/40 z-[40] lg:hidden"
            onClick={handleClosePanel}
            aria-hidden="true"
          />
        )}

        <main className={`flex-1 transition-[margin] duration-300 ease-in-out ${mainContentMargin} pb-16 lg:pb-0 min-w-0 flex flex-col`}>
          {/* Mobile Top Header (only visible on small screens) */}
          <div className="lg:hidden sticky top-0 z-[30] bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic font-display">
              Linkler
            </h1>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 active:scale-95 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto w-full">
            <Outlet context={{ handleOpenChat }} />
          </div>
        </main>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <FloatingPlusButton />

      {/* Mobile Navigation */}
      <BottomNav
        onPanelItemClick={handlePanelItemClick}
        selectedNavItemId={selectedNavItemId}
        showSidePanel={showSidePanel}
      />

      {/* Render Open Chat Windows */}
      <div className="fixed bottom-16 lg:bottom-0 right-0 z-[9998] flex flex-col lg:flex-row-reverse items-end gap-2">
        {openChats.map((chat, index) => (
          <ChatWindow
            key={`${chat.type}-${chat.id}`}
            chat={chat}
            type={chat.type}
            onClose={handleCloseChat}
            index={index}
          />
        ))}
      </div>
      <Toaster />
    </div>
  );
}

export default App;

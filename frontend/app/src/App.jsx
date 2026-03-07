import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideNav from './components/SideNav';
import ChatWindow from './components/ChatWindow'; // Import the new component
import BottomNav from './components/BottomNav';
import FloatingPlusButton from './components/FloatingPlusButton';

function App() {
  const [openChats, setOpenChats] = useState([]);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedNavItemId, setSelectedNavItemId] = useState(null);

  const handlePanelItemClick = (itemId) => {
    if (showSidePanel && selectedNavItemId === itemId) {
      setShowSidePanel(false);
      setSelectedNavItemId(null);
    } else {
      setSelectedNavItemId(itemId);
      setShowSidePanel(true);
    }
  };

  const handleClosePanel = () => {
    setShowSidePanel(false);
    setSelectedNavItemId(null);
  };

  const handleOpenChat = (chat, type) => {
    // Prevent opening the same chat twice
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
    <div className="flex bg-[var(--color-linkler-bg)]">
      <SideNav
        onOpenChat={handleOpenChat}
        showSidePanel={showSidePanel}
        selectedNavItemId={selectedNavItemId}
        onPanelItemClick={handlePanelItemClick}
        onClosePanel={handleClosePanel}
      />

      <main className={`flex-1 transition-all duration-300 ${mainContentMargin} pb-16 lg:pb-0`}>
        <Outlet context={{ handleOpenChat }} />
      </main>

      <FloatingPlusButton />

      {/* Mobile Navigation */}
      <BottomNav
        onOpenChat={handleOpenChat}
        onPanelItemClick={handlePanelItemClick}
      />

      {/* Render Open Chat Windows */}
      <div className="fixed bottom-16 lg:bottom-0 right-0 z-[9998] flex flex-col lg:flex-row-reverse items-end space-y-2 lg:space-y-0 lg:space-x-2 lg:space-x-reverse">
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
    </div>
  );
}

export default App;

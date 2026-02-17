import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import SideNav from './components/SideNav';
import ChatWindow from './components/ChatWindow'; // Import the new component

function App() {
  const location = useLocation();
  const [openChats, setOpenChats] = useState([]);

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

  return (
    <div className="flex bg-[var(--color-linkler-bg)]">
      <SideNav onOpenChat={handleOpenChat} />

      <main className="grow">
        <Outlet />
      </main>

      {/* Floating Action Button for posting */}
      <Link
        to="/create"
        state={{ background: location }}
        className="fixed bottom-8 right-8 bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition z-30"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </Link>

      {/* Render Open Chat Windows */}
      <div className="fixed bottom-0 right-0 z-9998">
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

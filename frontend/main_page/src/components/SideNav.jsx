import React, { useState } from 'react';

import SvgChats from './icons/Chats.jsx';
import SvgHome from './icons/Home.jsx';
import SvgSavedGuides from './icons/SavedGuides.jsx';
import SvgFellowTravelers from './icons/FellowTravelers.jsx';
import SvgGroups from './icons/Groups.jsx';
import SvgNewGuides from './icons/NewGuides.jsx';
import SvgSettings from './icons/Settings.jsx';

const SideNav = () => {
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedNavItemId, setSelectedNavItemId] = useState(null);

  const handleItemClick = (itemId) => {
    // If clicking the same item that's already open, close the panel
    if (showSidePanel && selectedNavItemId === itemId) {
      setShowSidePanel(false);
      setSelectedNavItemId(null);
    } else {
      setSelectedNavItemId(itemId);
      setShowSidePanel(true);
    }
  };

  const closeSidePanel = () => {
    setShowSidePanel(false);
    setSelectedNavItemId(null);
  };

  const navItems = [
    { id: 1, icon: SvgHome, name: 'Home' },
    { id: 2, icon: SvgSavedGuides, name: 'Saved Guides' },
    { id: 3, icon: SvgChats, name: 'Messages' },
    { id: 4, icon: SvgGroups, name: 'Groups' },
    { id: 5, icon: SvgFellowTravelers, name: 'Fellow Travelers' },
    { id: 6, icon: SvgNewGuides, name: 'New Guides' },
    { id: 7, icon: SvgSettings, name: 'Settings' },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 h-full bg-[#D9B382] text-black flex flex-col z-10 w-20">
        <nav className="flex-grow mt-10">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="mb-2">
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={`flex flex-col items-center justify-center w-full p-4 hover:bg-gray-700 transition-colors duration-200 focus:outline-none ${selectedNavItemId === item.id ? 'bg-gray-600' : ''}`}
                    aria-label={item.name}
                    aria-expanded={selectedNavItemId === item.id && showSidePanel}
                  >
                    <span className="mb-1">
                      <Icon className="w-10 h-10" />
                    </span>
                    <span className="text-xs mt-1">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Side Panel */}
      {showSidePanel && (
        <div
          className="fixed top-0 left-20 h-full bg-gray-700 w-64 p-4 border-l border-gray-600 z-20 transition-opacity duration-300"
          role="complementary"
          aria-label={`${navItems.find(item => item.id === selectedNavItemId)?.name} details`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">
              {navItems.find(item => item.id === selectedNavItemId)?.name}
            </h3>
            <button
              onClick={closeSidePanel}
              className="text-white focus:outline-none text-xl"
              aria-label="Close side panel"
            >
              ✕
            </button>
          </div>
          <p>Content for {navItems.find(item => item.id === selectedNavItemId)?.name} goes here.</p>
        </div>
      )}
    </>
  );
};

export default SideNav;

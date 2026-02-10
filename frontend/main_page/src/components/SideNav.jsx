import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SvgChats from './icons/Chats.jsx';
import SvgHome from './icons/Home.jsx';
import SvgSavedGuides from './icons/SavedGuides.jsx';
import SvgFellowTravelers from './icons/FellowTravelers.jsx';
import SvgGroups from './icons/Groups.jsx';
import SvgNewGuides from './icons/NewGuides.jsx';
import SvgSettings from './icons/Settings.jsx';

// --- Mock Data ---
const fakeChats = [
  { id: 1, name: 'John Doe', message: 'Hey, are we still on for tomorrow?', avatarUrl: 'https://i.pravatar.cc/40?img=4', time: '10m', unread: true },
  { id: 2, name: 'Jane Smith', message: 'I saw the guide you sent, it looks great!', avatarUrl: 'https://i.pravatar.cc/40?img=5', time: '1h', unread: false },
];
const fakeSavedGuides = [
  { id: 1, name: 'A Culinary Journey Through Tokyo', location: 'Tokyo, Japan', avatarUrl: 'https://picsum.photos/id/1060/100/100' },
  { id: 2, name: 'Hiking the Swiss Alps', location: 'Interlaken, Switzerland', avatarUrl: 'https://picsum.photos/id/1015/100/100' },
];
const fakeGroups = [
  { id: 1, name: 'NYC Foodies', avatarUrl: 'https://picsum.photos/id/237/100/100', unread: true, lastMessage: { user: 'Sarah', text: 'Who wants to grab pizza tonight?', time: '5m' } },
  { id: 2, name: 'Weekend Hikers', avatarUrl: 'https://picsum.photos/id/250/100/100', unread: false, lastMessage: { user: 'Mike', text: 'Trail conditions look good for Saturday.', time: '2h' } },
];


// --- Sub-components for Previews ---
const ChatPreview = ({ onSelect, ...chat }) => (
  <button onClick={onSelect} className="w-full text-left p-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-3">
    <img src={chat.avatarUrl} alt={chat.name} className="w-10 h-10 rounded-full flex-shrink-0" />
    <div className="flex-grow overflow-hidden">
      <div className="flex justify-between items-center">
        <h4 className={`font-semibold text-sm truncate ${chat.unread ? 'text-white' : 'text-gray-300'}`}>{chat.name}</h4>
        <span className="text-xs text-gray-400 flex-shrink-0">{chat.time}</span>
      </div>
      <p className={`text-xs truncate ${chat.unread ? 'text-white font-medium' : 'text-gray-300'}`}>{chat.message}</p>
    </div>
    {chat.unread && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 self-center ml-2"></div>}
  </button>
);

const GuidePreview = ({ onSelect, ...guide }) => (
  <button onClick={onSelect} className="w-full text-left p-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-3">
    <img src={guide.avatarUrl} alt={guide.name} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
    <div className="flex-grow overflow-hidden">
      <h4 className="font-semibold text-sm text-white truncate">{guide.name}</h4>
      <p className="text-xs text-gray-300 truncate">{guide.location}</p>
    </div>
  </button>
);

const GroupChatPreview = ({ ...group }) => (
    <div className="w-full text-left p-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-3">
        <img src={group.avatarUrl} alt={group.name} className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-grow overflow-hidden">
            <div className="flex justify-between items-center">
                <h4 className={`font-semibold text-sm truncate ${group.unread ? 'text-white' : 'text-gray-300'}`}>{group.name}</h4>
                <span className="text-xs text-gray-400 flex-shrink-0">{group.lastMessage.time}</span>
            </div>
            <p className={`text-xs truncate ${group.unread ? 'text-white font-medium' : 'text-gray-300'}`}>
                <span className="font-medium">{group.lastMessage.user}: </span>
                {group.lastMessage.text}
            </p>
        </div>
        {group.unread && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 self-center ml-2"></div>}
    </div>
);

const PreviewList = ({ items, renderItem }) => (
  <div className="space-y-2">
    {items.map(item => renderItem(item))}
  </div>
);


const SideNav = ({ onOpenChat }) => {
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedNavItemId, setSelectedNavItemId] = useState(null);
  
  const unreadCount = fakeChats.filter(chat => chat.unread).length + fakeGroups.filter(group => group.unread).length;

  const handlePanelItemClick = (itemId) => {
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
    { id: 1, icon: SvgHome, name: 'Home', type: 'link', href: '/' },
    { id: 2, icon: SvgSavedGuides, name: 'Saved Guides', type: 'panel' },
    { id: 3, icon: SvgChats, name: 'Messages', type: 'panel' },
    { id: 4, icon: SvgGroups, name: 'Groups', type: 'panel' },
    { id: 5, icon: SvgFellowTravelers, name: 'Fellow Travelers', type: 'link', href: '/travelers' },
    { id: 6, icon: SvgNewGuides, name: 'New Guides', type: 'link', href: '/guides' },
    { id: 7, icon: SvgSettings, name: 'Settings', type: 'panel' },
  ];
  
  const selectedNavItem = navItems.find(item => item.id === selectedNavItemId);

  const renderPanelContent = () => {
    if (!selectedNavItem) return null;

    switch (selectedNavItem.name) {
      case 'Messages':
        return <PreviewList items={fakeChats} renderItem={chat => <ChatPreview key={chat.id} {...chat} onSelect={() => onOpenChat(chat, 'chat')} />} />;
      case 'Saved Guides':
        return <PreviewList items={fakeSavedGuides} renderItem={guide => <GuidePreview key={guide.id} {...guide} onSelect={() => onOpenChat(guide, 'guide')} />} />;
      case 'Groups':
        return <PreviewList items={fakeGroups} renderItem={group => (
          <Link to={`/groups/${group.id}`} key={group.id} onClick={closeSidePanel}>
            <GroupChatPreview {...group} />
          </Link>
        )} />;
      default:
        return <p className="text-gray-300">Content for {selectedNavItem.name} goes here.</p>;
    }
  };
  
  const renderNavItem = (item) => {
    const Icon = item.icon;
    const content = (
      <>
        <span className="relative mb-1">
          <Icon className="w-10 h-10" />
          {(item.name === 'Messages' || item.name === 'Groups') && unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold border-2 border-[#D9B382]">
              {unreadCount}
            </span>
          )}
        </span>
        <span className="text-xs mt-1">{item.name}</span>
      </>
    );

    if (item.type === 'link') {
      const handleClick = item.name === 'Home' ? closeSidePanel : null;
      return (
        <Link to={item.href} onClick={handleClick} className="flex flex-col items-center justify-center w-full p-4 hover:bg-gray-700 transition-colors duration-200 focus:outline-none">
          {content}
        </Link>
      );
    }

    return (
      <button
        onClick={() => handlePanelItemClick(item.id)}
        className={`flex flex-col items-center justify-center w-full p-4 hover:bg-gray-700 transition-colors duration-200 focus:outline-none ${selectedNavItemId === item.id ? 'bg-gray-600' : ''}`}
        aria-label={item.name}
        aria-expanded={selectedNavItemId === item.id && showSidePanel}
      >
        {content}
      </button>
    );
  };

  return (
    <>
      <div className="fixed top-0 left-0 h-full bg-[#D9B382] text-black flex flex-col z-40 w-20">
        <nav className="flex-grow mt-10">
          <ul>
            {navItems.map((item) => (
              <li key={item.id} className="mb-2">
                {renderNavItem(item)}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {showSidePanel && (
        <div
          className="fixed top-0 left-20 h-full bg-gray-700 w-80 p-4 border-l border-gray-600 z-50"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">{selectedNavItem?.name}</h3>
            <button onClick={closeSidePanel} className="text-white focus:outline-none text-xl" aria-label="Close side panel">
              ✕
            </button>
          </div>
          <div className="overflow-y-auto h-full pb-16">
            {renderPanelContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default SideNav;

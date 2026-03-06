import React from 'react';
import { Link } from 'react-router-dom';
import SvgChats from './icons/Chats.jsx';
import SvgHome from './icons/Home.jsx';
import SvgSavedGuides from './icons/SavedGuides.jsx';
import SvgFellowTravelers from './icons/FellowTravelers.jsx';
import SvgGroups from './icons/Groups.jsx';
import SvgNewGuides from './icons/NewGuides.jsx';
import SvgSettings from './icons/Settings.jsx';
import SvgPromotions from './icons/Promotions.jsx';

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


// --- Sub-component for Side Panel Items ---
const SidePanelItem = ({
  onClick,
  image,
  imageAlt,
  title,
  subtitle,
  time,
  unread,
  isSquareImage = false,
  as: Component = 'button'
}) => (
  <Component
    onClick={onClick}
    className="w-full text-left p-2 rounded-lg hover:bg-[var(--color-linkler-hover)] transition-colors duration-200 flex items-center space-x-3 focus:outline-none"
  >
    <img
      src={image}
      alt={imageAlt}
      className={`${isSquareImage ? 'w-12 h-12 rounded-md object-cover' : 'w-10 h-10 rounded-full'} flex-shrink-0`}
    />
    <div className="flex-grow overflow-hidden">
      <div className="flex justify-between items-center">
        <h4 className={`font-semibold text-sm truncate ${unread ? 'text-gray-800' : 'text-black'}`}>
          {title}
        </h4>
        {time && <span className="text-xs text-black flex-shrink-0">{time}</span>}
      </div>
      <div className={`text-xs truncate ${unread ? 'text-gray-800 font-medium' : 'text-black'}`}>
        {subtitle}
      </div>
    </div>
    {unread && <div className="w-2 h-2 bg-[#3b82f6] rounded-full flex-shrink-0 self-center ml-2"></div>}
  </Component>
);

const PreviewList = ({ items, renderItem }) => (
  <div className="space-y-2">
    {items.map(item => renderItem(item))}
  </div>
);


const SideNav = ({ onOpenChat, showSidePanel, selectedNavItemId, onPanelItemClick, onClosePanel }) => {
  const unreadCount = fakeChats.filter(chat => chat.unread).length + fakeGroups.filter(group => group.unread).length;

  const navItems = [
    { id: 1, icon: SvgHome, name: 'Home', type: 'link', href: '/app' },
    { id: 2, icon: SvgSavedGuides, name: 'Saved Guides', type: 'panel' },
    { id: 3, icon: SvgChats, name: 'Messages', type: 'panel' },
    { id: 4, icon: SvgGroups, name: 'Groups', type: 'panel' },
    { id: 5, icon: SvgFellowTravelers, name: 'Fellow Travelers', type: 'link', href: '/app/fellow_travelers' },
    { id: 6, icon: SvgNewGuides, name: 'New Guides', type: 'link', href: '/app/guides' },
    { id: 8, icon: SvgPromotions, name: 'Promotions', type: 'link', href: '/app/promotions' },
    { id: 7, icon: SvgSettings, name: 'Settings', type: 'panel' },
  ];

  const selectedNavItem = navItems.find(item => item.id === selectedNavItemId);

  const renderPanelContent = () => {
    if (!selectedNavItem) return null;

    switch (selectedNavItem.name) {
      case 'Messages':
        return (
          <PreviewList
            items={fakeChats}
            renderItem={chat => (
              <SidePanelItem
                key={chat.id}
                title={chat.name}
                subtitle={chat.message}
                image={chat.avatarUrl}
                imageAlt={chat.name}
                time={chat.time}
                unread={chat.unread}
                onClick={() => onOpenChat(chat, 'chat')}
              />
            )}
          />
        );
      case 'Saved Guides':
        return (
          <PreviewList
            items={fakeSavedGuides}
            renderItem={guide => (
              <SidePanelItem
                key={guide.id}
                title={guide.name}
                subtitle={guide.location}
                image={guide.avatarUrl}
                imageAlt={guide.name}
                isSquareImage
                onClick={() => onOpenChat(guide, 'guide')}
              />
            )}
          />
        );
      case 'Groups':
        return (
          <PreviewList
            items={fakeGroups}
            renderItem={group => (
              <Link to={`/app/groups/${group.id}`} key={group.id} onClick={onClosePanel}>
                <SidePanelItem
                  as="div"
                  title={group.name}
                  subtitle={
                    <>
                      <span className="font-medium">{group.lastMessage.user}: </span>
                      {group.lastMessage.text}
                    </>
                  }
                  image={group.avatarUrl}
                  imageAlt={group.name}
                  time={group.lastMessage.time}
                  unread={group.unread}
                />
              </Link>
            )}
          />
        );
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
            <span className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold border-2 border-[var(--color-primary)]">
              {unreadCount}
            </span>
          )}
        </span>
        <span className="text-xs mt-1">{item.name}</span>
      </>
    );

    if (item.type === 'link') {
      const handleClick = item.name === 'Home' ? onClosePanel : null;
      return (
        <Link to={item.href} onClick={handleClick} className="flex flex-col items-center justify-center w-full p-4 hover:bg-[var(--color-linkler-hover)]  transition-colors duration-200 focus:outline-none">
          {content}
        </Link>
      );
    }

    return (
      <button
        onClick={() => onPanelItemClick(item.id)}
        className={`flex flex-col items-center justify-center w-full p-4 hover:bg-[var(--color-linkler-hover)]  transition-colors duration-200 focus:outline-none ${selectedNavItemId === item.id ? 'bg-[#8D6E63]' : ''}`}
        aria-label={item.name}
        aria-expanded={selectedNavItemId === item.id && showSidePanel}
      >
        {content}
      </button>
    );
  };

  return (
    <>
      <div className="fixed top-0 left-0 h-full bg-[var(--color-linkler-bg)] text-black flex flex-col z-40 w-20">
        <nav className="flex-grow mt-10">
          <ul>
            {navItems.map((item) => (
              <li key={item.id} className="mb-2 text-center">
                {renderNavItem(item)}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {showSidePanel && (
        <div
          className="fixed top-0 left-20 h-full bg-[#f5deb3] w-80 p-4 border-l border-gray-600 z-50"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">{selectedNavItem?.name}</h3>
            <button onClick={onClosePanel} className="text-white focus:outline-none text-xl" aria-label="Close side panel">
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

import React, { useState } from 'react';

// --- Mock Message Data ---
const fakeMessageHistory = {
  // Direct Chats
  1: [ 
    { from: 'them', text: 'Hey, are we still on for tomorrow?' },
    { from: 'me', text: 'Yep! 2 PM at the usual spot.' },
    { from: 'them', text: 'I wanted to confirm the time.' },
  ],
  3: [
    { from: 'them', text: 'LOL that was hilarious 😂' },
  ],
  // Groups
  'group-1': [
      { from: 'Sarah', text: 'Who wants to grab pizza tonight?' },
      { from: 'me', text: 'I am down!' },
      { from: 'Dave', text: 'Sorry, can\'t make it tonight.' },
  ],
  'group-2': [
      { from: 'Mike', text: 'Trail conditions look good for Saturday.' },
  ],
  // Guides
  'guide-1': [
      { from: 'them', text: 'Welcome to "A Culinary Journey Through Tokyo"! Ask me anything about the best ramen spots or hidden sushi gems.' },
      { from: 'me', text: 'What is the best place for tempura?' },
  ],
  'guide-2': [
      { from: 'them', text: 'Welcome to "Hiking the Swiss Alps"! Let me know if you need recommendations on trails or gear.' },
  ],
};

const ChatWindow = ({ chat, type, onClose, index }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  
  const rightPosition = 20 + (index * 340);
  const historyKey = `${type}-${chat.id}`;
  const chatHistory = fakeMessageHistory[historyKey] || [];
  
  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    console.log(`Sending message to ${chat.name}: ${newMessage}`);
    setNewMessage('');
  };

  const content = (
    <>
      <div className="flex-grow overflow-y-auto space-y-4 p-4">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-xs ${msg.from === 'me' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {(type === 'group' || type === 'guide') && msg.from !== 'me' && <p className="text-xs font-bold text-blue-500">{chat.name}</p>}
              {type === 'group' && msg.from !== 'me' && <p className="text-xs font-bold text-blue-500">{msg.from}</p>}
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-2 flex-shrink-0 flex items-center border-t border-gray-200">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full p-2 bg-transparent text-gray-800 focus:outline-none"
        />
        <button type="submit" className="p-2 text-blue-600 hover:text-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </form>
    </>
  );

  return (
    <div 
      className="fixed bottom-0 bg-white w-80 h-[400px] rounded-t-lg shadow-2xl flex flex-col transition-all duration-300 ease-in-out"
      style={{ right: `${rightPosition}px`, transform: isMinimized ? 'translateY(350px)' : 'translateY(0)' }}
    >
      <div 
        className="flex items-center p-2 border-b border-gray-200 cursor-pointer flex-shrink-0"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <img src={chat.avatarUrl} alt={chat.name} className="w-8 h-8 rounded-full mr-3" />
        <h3 className="text-md font-bold text-gray-800 truncate">{chat.name}</h3>
        <div className="flex-grow" />
        <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="text-gray-500 hover:text-gray-800 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onClose(chat.id, type); }} className="text-gray-500 hover:text-gray-800 p-1 ml-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {!isMinimized && content}
    </div>
  );
};

export default ChatWindow;

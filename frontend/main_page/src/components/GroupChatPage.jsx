import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// --- Mock Data (can be moved to a separate file later) ---
const fakeGroups = [
  { id: 1, name: 'NYC Foodies', avatarUrl: 'https://picsum.photos/id/237/100/100' },
  { id: 2, name: 'Weekend Hikers', avatarUrl: 'https://picsum.photos/id/250/100/100' },
];
const fakeMessageHistory = {
  'group-1': [
      { from: 'Sarah', text: 'Who wants to grab pizza tonight?' },
      { from: 'me', text: 'I am down!' },
      { from: 'Dave', text: 'Sorry, can&apos;t make it tonight.' },
  ],
  'group-2': [
      { from: 'Mike', text: 'Trail conditions look good for Saturday.' },
  ]
};

const GroupChatPage = () => {
  const { groupId } = useParams();
  const [newMessage, setNewMessage] = useState('');
  
  const group = fakeGroups.find(g => g.id === parseInt(groupId));
  const chatHistory = fakeMessageHistory[`group-${groupId}`] || [];

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    console.log(`Sending message to ${group.name}: ${newMessage}`);
    setNewMessage('');
  };

  if (!group) {
    return (
      <div className="p-8 ml-20 text-center">
        <h1 className="text-2xl font-bold">Group not found</h1>
        <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen ml-20 bg-white">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-gray-200 flex-shrink-0">
        <img src={group.avatarUrl} alt={group.name} className="w-10 h-10 rounded-full mr-4" />
        <h2 className="text-xl font-bold text-gray-800">{group.name}</h2>
      </header>

      {/* Message History */}
      <main className="flex-grow overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-lg ${msg.from === 'me' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {msg.from !== 'me' && <p className="text-xs font-bold text-blue-600 mb-1">{msg.from}</p>}
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
      </main>

      {/* Message Input */}
      <footer className="p-4 border-t border-gray-200 flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="p-3 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">
            Send
          </button>
        </form>
      </footer>
    </div>
  );
};

export default GroupChatPage;
import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/messages/')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setMessages(data);
        setError(null); // Clear any previous errors
      })
      .catch(error => {
        console.error("Failed to fetch messages:", error);
        setError("Failed to load messages. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />
      <HeroSection />

      <h2 className="text-xl font-bold mt-8 mb-4">Messages from Django API:</h2>
      {loading && <p>Loading messages...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && messages.length === 0 && (
        <p>No messages yet. Try adding some via the Django admin or API.</p>
      )}
      {!loading && !error && messages.length > 0 && (
        <ul className="list-disc pl-5">
          {messages.map(message => (
            <li key={message.id} className="mb-2 p-2 bg-gray-100 rounded-md">
              {message.text} (ID: {message.id}, Created: {new Date(message.created_at).toLocaleString()})
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default App;

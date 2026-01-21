import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  return (
    <div>
      <Header />
      <HeroSection />
    </div>
  );
}

export default App;

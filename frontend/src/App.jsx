import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import CompleteProfilePage from './components/CompleteProfilePage';

function Home() {
  return (
    <>
      <Header />
      <HeroSection />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/complete-profile" element={<CompleteProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

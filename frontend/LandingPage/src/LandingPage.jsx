import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Link is now imported by SimpleHeader
import './App.css';
import SimpleHeader from './components/SimpleHeader'; // New import for SimpleHeader
import HeroSection from './components/HeroSection';
import LoginPage from './components/LoginPage';
// SignUpPage import removed
import CompleteProfilePage from './components/CompleteProfilePage';
import RegistrationForm from './components/RegistrationForm'; // Renamed import

function HomeContent() { // Renamed from Home to avoid confusion, to be rendered by Route "/"
  return (
    <>
      <SimpleHeader />
      <HeroSection />
      {/* Other components that belong to the main landing page content */}
    </>
  );
}

function LandingPage() {
  return (
    <Router>
      <div className="relative">
        <Routes>
          <Route path="/" element={<HomeContent />} /> {/* Use HomeContent */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationForm />} /> {/* Combined Registration */}
          <Route path="/complete-profile" element={<CompleteProfilePage />} />
          {/* Note: /signup route is removed, /register-guide route is removed */}
        </Routes>
      </div>
    </Router>
  );
}

export default LandingPage;

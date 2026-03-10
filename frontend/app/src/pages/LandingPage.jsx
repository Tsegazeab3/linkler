import React from 'react';
import SimpleHeader from '../components/SimpleHeader';
import HeroSection from '../components/HeroSection';

function LandingPage() {
  return (
    <div className="relative bg-linkler-bg min-h-screen">
      <SimpleHeader />
      <HeroSection />
    </div>
  );
}

export default LandingPage;

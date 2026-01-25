import React, { useState, useEffect } from 'react';
import ContentSection from './ContentSection.jsx';

function HeroSection() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cards/')
      .then(response => response.json())
      .then(data => {
        setSections(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching sections data:', error);
        setLoading(false);
      });
  }, []);

  return (
    <main>
      {loading ? (
        <p>Loading...</p>
      ) : (
        sections.map((section, index) => (
          <ContentSection
            key={index}
            title={section.title}
            description={section.description}
            imageSrc={section.image}
          />
        ))
      )}
    </main>
  );
}

export default HeroSection;

import React from 'react';
import ContentSection from './ContentSection.jsx';

// Hardcoded data for the cards, retrieved from Django database
const staticSections = [
  {
    title: "A place To find Travel companions",
    description: "If you love travelling Linkler is made for you. find people who want to go to the same places you want to go and travel with them. Save money, explore, get out of your comfort zone and most of all make memories.",
    image: "/assets/page_1.png"
  },
  {
    title: "Find guides that are well versed with your needs",
    description: "Afraid that you will get lost? we got you covered. you can choose from the many trained guides who know the city like the back of their hand. you can hire guides on your self or with your companions what they offer.",
    image: "/assets/page_2.png"
  },
  {
    title: "Check out your destination",
    description: "Linkler will help you find a group of people who’ve already been to your destination. message them or check out their posts to learn from their experiences and know more about where you want to go.",
    image: "/assets/page_3.jpg"
  },
  {
    "title": "Find your next stop",
    "description": "Answer some questions to find out where you need to be at this time of the year. Be it you’re looking for a job or become a wonderer check out our personalized suggestions to help you find your next adventure. and use the support group to make your trip a reality",
    "image": "/assets/page_4.jpg"
  },
  {
    "title": "Become a guide",
    "description": "Take our free courses to get verified and get hired. take control of your career by posting regularly. Sign up, Explore and get paid.",
    "image": "/assets/page_5.png"
  }
];

function HeroSection() {
  return (
    <main>
      {staticSections.map((section, index) => (
        <ContentSection
          key={index}
          title={section.title}
          description={section.description}
          imageSrc={section.image}
        />
      ))}
    </main>
  );
}

export default HeroSection;

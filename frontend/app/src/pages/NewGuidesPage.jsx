import React from 'react';
import GuideCard from '../components/GuideCard';
import ActionButtons from '../components/ActionButtons';

const fakeGuides = [
  {
    id: 1,
    picture: 'https://i.pravatar.cc/400?img=7',
    name: 'John Doe',
    bio: 'Experienced tour guide with a passion for history and architecture.',
    gender: 'Male',
    serviceDescription: 'Walking tours of the historic city center. Learn about the rich history and see the stunning architecture of our city.',
    price: 50.00,
    rating: 4.5,
  },
];

const NewGuidesPage = () => {
  const guide = fakeGuides[0];
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="relative">
        <GuideCard
          key={guide.id}
          picture={guide.picture}
          name={guide.name}
          bio={guide.bio}
          gender={guide.gender}
          serviceDescription={guide.serviceDescription}
          price={guide.price}
          rating={guide.rating}
        />
        <ActionButtons />
      </div>
    </div>
  );
};

export default NewGuidesPage;

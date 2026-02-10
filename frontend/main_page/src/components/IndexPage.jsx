import React from 'react';
import PostCard from './PostCard';

// This is the same fake data from App.jsx
export const fakePosts = [
  {
    id: '1',
    author: { username: 'alice', avatarUrl: 'https://i.pravatar.cc/40?img=1' },
    userProfilePic: 'https://i.pravatar.cc/40?img=1',
    username: 'alice',
    isFollowing: false,
    userBio: 'Software Engineer | Traveller | Photographer. Always seeking new adventures and coding challenges.',
    content: { type: 'image', src: 'https://picsum.photos/400/400?random=1' },
    caption: 'Enjoying the sunshine today! 🌞',
    timestamp: '2 hours ago',
    likes: 120,
    isLiked: false,
    isSaved: false,
  },
  {
    id: '2',
    author: { username: 'bob', avatarUrl: 'https://i.pravatar.cc/40?img=2' },
    userProfilePic: 'https://i.pravatar.cc/40?img=2',
    username: 'bob',
    isFollowing: true,
    userBio: 'Digital artist creating captivating visuals. Love exploring the intersection of art and tech.',
    content: { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    caption: 'Check out this cool clip!',
    timestamp: '5 hours ago',
    likes: 85,
    isLiked: true,
    isSaved: true,
  },
  {
    id: '3',
    author: { username: 'carol', avatarUrl: 'https://i.pravatar.cc/40?img=3' },
    userProfilePic: 'https://i.pravatar.cc/40?img=3',
    username: 'carol',
    isFollowing: false,
    userBio: 'Foodie & travel enthusiast. Documenting my culinary journeys around the world.',
    content: { type: 'image', src: 'https://picsum.photos/400/500?random=2' },
    caption: 'My latest artwork 🎨',
    timestamp: '1 day ago',
    likes: 230,
    isLiked: false,
    isSaved: false,
  },
];

const IndexPage = () => {
  return (
    <div className="flex-grow p-4 ml-20">
      {fakePosts.map(post => (
        <PostCard
          key={post.id}
          mediaType={post.content.type}
          mediaUrl={post.content.src}
          aspectRatio={post.content.type === 'video' ? '4:5' : '1:1'}
          caption={post.caption}
          timestamp={post.timestamp}
          likeCount={post.likes}
          isLiked={post.isLiked}
          isSaved={post.isSaved}
          username={post.username}
          userProfilePic={post.userProfilePic}
          isFollowing={post.isFollowing}
          userBio={post.userBio}
        />
      ))}
    </div>
  );
};

export default IndexPage;

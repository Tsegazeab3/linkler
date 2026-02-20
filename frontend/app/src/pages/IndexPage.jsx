import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { getPosts } from '../services/api';

const IndexPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts()
      .then(response => {
        setPosts(response.data);
      })
      .catch(err => {
        console.error('Error fetching posts:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b82f6]"></div>
      </div>
    );
  }

  return (
    <div className="flex-grow p-2 lg:p-4 overflow-x-hidden">
      {posts.length > 0 ? (
        posts.map(post => {
          // Map backend fields to PostCard props
          return (
            <PostCard
              key={post.id}
              mediaType={post.media_type || (post.media_file ? (post.media_file.endsWith('.mp4') ? 'video' : 'image') : 'text')}
              mediaUrl={post.media_file}
              aspectRatio={post.aspect_ratio || '1:1'}
              caption={post.caption}
              timestamp={new Date(post.created_at).toLocaleDateString()}
              likeCount={post.likes_count}
              isLiked={false} // Would need a separate check for real liked status
              isSaved={false}
              username={post.author?.username || 'user'}
              userId={post.author?.id}
              userProfilePic={post.author?.profile_picture}
              isFollowing={false}
              userBio={post.author?.bio || ''}
            />
          );
        })
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No posts yet. Follow people or create one!</p>
        </div>
      )}
    </div>
  );
};

export default IndexPage;

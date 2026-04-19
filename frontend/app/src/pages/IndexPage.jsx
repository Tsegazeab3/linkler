import React, { useEffect } from 'react';
import PostCard from '../components/PostCard';
import { useData } from '../context/DataContext';
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from 'react-intersection-observer';
import { Loader2 } from "lucide-react";

const IndexPage = () => {
  const { posts, loadingPosts, loadMorePosts, loadingMore } = useData();
  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView && !loadingMore && !loadingPosts) {
      loadMorePosts();
    }
  }, [inView, loadingMore, loadingPosts, loadMorePosts]);

  if (loadingPosts && posts.length === 0) {
    return (
      <div className="flex-grow p-4 space-y-6 max-w-sm mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4 rounded-xl border border-border/50 p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-grow p-2 lg:p-4 overflow-x-hidden">
      <div className="max-w-sm mx-auto space-y-4">
        {posts.length > 0 ? (
          <>
            {posts.map(post => (
              <PostCard
                key={post.id}
                id={post.id}
                mediaType={post.media_type || (post.media_file ? (post.media_file.endsWith('.mp4') ? 'video' : 'image') : 'text')}
                mediaUrl={post.media_file}
                images={post.images}
                aspectRatio={post.aspect_ratio || '1:1'}
                caption={post.caption}
                timestamp={new Date(post.created_at).toLocaleDateString()}
                likeCount={post.likes_count}
                isLiked={post.is_liked} 
                isSaved={post.is_saved}
                username={post.author?.username || 'user'}
                userId={post.author?.id}
                userProfilePic={post.author?.profile_picture}
                isFollowing={post.author?.is_following}
                userBio={post.author?.bio || ''}
              />
            ))}
            
            {/* Infinite Scroll Trigger */}
            <div ref={ref} className="py-8 flex justify-center">
              {loadingMore && (
                <Loader2 className="h-6 w-6 animate-spin text-brand" />
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No posts yet. Follow people or create one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexPage;

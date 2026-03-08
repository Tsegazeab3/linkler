import React, { useState } from 'react';
import { useOutletContext, Link, useLocation } from 'react-router-dom';
import { followUser, unfollowUser, createDM } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PostCard = ({
  id,
  mediaType,
  mediaUrl,
  aspectRatio, // '1:1' or '4:5'
  textAlignment = 'center',
  caption,
  timestamp,
  likeCount,
  isLiked,
  isSaved,
  username,
  userId,
  userProfilePic,
  isFollowing: initialIsFollowing,
  userBio, // New prop
}) => {
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followLoading, setFollowLoading] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { handleOpenChat } = useOutletContext();
  const { user } = useAuth();
  const location = useLocation();

  const isAuthor = user?.id === userId || user?.pk === userId;

  // Helper to ensure media URLs are handled correctly
  const getFullMediaUrl = (url) => {
    if (!url) return null;
    // With Vite proxy, /media/... will be automatically routed to http://localhost:8000/media/...
    return url;
  };

  const fullMediaUrl = getFullMediaUrl(mediaUrl);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
      } else {
        await followUser(userId);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleChat = async () => {
    try {
      const res = await createDM(userId);
      handleOpenChat(res.data, 'dm');
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  // Determine aspect ratio class
  const aspectRatioClass = aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-square';

  return (
    <div className="bg-white border border-gray-300 rounded-lg w-full max-w-sm mx-auto my-4 overflow-hidden shadow-sm">
      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300 backdrop-blur-sm"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button className="absolute top-6 right-6 text-white hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img 
            src={fullMediaUrl} 
            alt="Fullscreen view" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
          />
        </div>
      )}

      {/* User Info Section */}
      <div className="flex items-center p-2">
        <img
          src={userProfilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'}
          alt={`${username}'s profile`}
          className="w-10 h-10 rounded-full mr-2 object-cover border border-gray-100"
        />
        <div className="flex-grow">
          <div className="font-semibold text-gray-800 text-sm md:text-base">{username}</div>
          {userBio && (
            <p className="text-gray-500 pr-3 line-clamp-1 text-xs">
              {userBio}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isAuthor ? (
            <Link
              to={`/edit-post/${id}`}
              state={{ background: location }}
              className="text-xs font-bold px-3 py-1 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              Edit
            </Link>
          ) : (
            <>
              <button 
                onClick={handleChat}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Start Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <button 
                onClick={handleFollow}
                disabled={followLoading}
                className={`${isFollowing ? 'text-gray-500' : 'text-blue-500'} text-xs font-bold px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Media Renderer */}
      {(mediaType === 'image' || mediaType === 'video') ? (
        <div 
            className={`relative w-full bg-gray-200 ${aspectRatioClass} ${mediaType === 'image' ? 'cursor-zoom-in' : ''}`}
            onClick={() => mediaType === 'image' && setIsLightboxOpen(true)}
        >
          {mediaType === 'image' && (
            <img
              src={fullMediaUrl || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'}
              alt="Post media"
              className="absolute top-0 left-0 w-full h-full object-cover"
              loading="lazy" // Compatible with lazy loading
            />
          )}
          {mediaType === 'video' && (
            <video
              src={fullMediaUrl}
              controls
              className="absolute top-0 left-0 w-full h-full object-cover"
              preload="metadata" // Compatible with preloading
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      ) : (
        /* Text-only Post Style: Height is now relative to text length */
        <div className={`relative w-full flex items-center justify-center py-12 px-6 bg-linear-to-br from-blue-50 to-indigo-50 border-y border-gray-100`}>
           <p className={`text-lg md:text-xl text-gray-800 font-medium italic leading-relaxed w-full text-${textAlignment}`}>
             {caption}
           </p>
        </div>
      )}

      {/* Action Bar */}
      <div className="p-2 flex items-center justify-between">
        <div className="flex space-x-3">
          <button className="flex items-center text-gray-700 hover:text-red-500">
            {/* Like Icon */}
            <svg
              className={`w-6 h-6 ${isLiked ? 'text-red-500' : ''}`}
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
          </button>
          <button className="flex items-center text-gray-700 hover:text-blue-500">
            {/* Comment Icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              ></path>
            </svg>
          </button>
          <button className="flex items-center text-gray-700 hover:text-purple-500">
            {/* Share Icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              ></path>
            </svg>
          </button>
        </div>
        <button className="text-gray-700 hover:text-green-500">
          {/* Save Icon */}
          <svg
            className={`w-6 h-6 ${isSaved ? 'text-green-500' : ''}`}
            fill={isSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            ></path>
          </svg>
        </button>
      </div>

      {/* Post Metadata (Like Count) */}
      <div className="px-2 text-sm font-semibold text-gray-800">
        {likeCount} likes
      </div>

      {/* Caption Block */}
      {(caption && (mediaType === 'image' || mediaType === 'video')) && (
        <div className="px-2 py-1 text-sm text-gray-600">
          <p className={isCaptionExpanded ? '' : 'line-clamp-2'}>
            <span className="font-semibold mr-1">{username}</span>
            {caption}
          </p>
          {caption.length > 100 && ( // Simple heuristic for showing "more" button
            <button
              onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
              className="text-gray-500 hover:underline text-xs mt-1"
            >
              {isCaptionExpanded ? 'less' : 'more'}
            </button>
          )}
        </div>
      )}

      {/* Post Metadata (Timestamp) */}
      <div className="px-2 py-1 text-xs text-gray-400">
        {timestamp}
      </div>
    </div>
  );
};

export default PostCard;

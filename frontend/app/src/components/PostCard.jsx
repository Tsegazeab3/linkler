import React, { useState } from 'react';
import { useOutletContext, Link, useLocation, useNavigate } from 'react-router-dom';
import { followUser, unfollowUser, createDM, toggleLike } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PostCard = ({
  id,
  mediaType,
  mediaUrl,
  aspectRatio, // '1:1' or '4:5'
  textAlignment = 'center',
  caption,
  timestamp,
  likeCount: initialLikeCount,
  commentsCount,
  isLiked: initialIsLiked,
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
  const [isLiked, setIsLiked] = useState(initialIsLiked || false);
  const [likeCount, setLikeCount] = useState(initialLikeCount || 0);
  const [likeLoading, setLikeLoading] = useState(false);
  
  const { handleOpenChat } = useOutletContext();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthor = user?.id === userId || user?.pk === userId;

  // Helper to ensure media URLs are handled correctly
  const getFullMediaUrl = (url) => {
    if (!url) return null;
    return url;
  };

  const fullMediaUrl = getFullMediaUrl(mediaUrl);

  const handleFollow = async (e) => {
    e.stopPropagation();
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

  const handleLike = async (e) => {
    e.stopPropagation();
    if (likeLoading) return;
    
    // Optimistic UI update
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);
    setLikeLoading(true);

    try {
      const res = await toggleLike(id);
      if (res.data.status === 'liked') {
         setIsLiked(true);
      } else if (res.data.status === 'unliked') {
         setIsLiked(false);
      }
    } catch (err) {
      console.error('Like error:', err);
      // Revert optimistic update on error
      setIsLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleChat = async (e) => {
    e.stopPropagation();
    try {
      const res = await createDM(userId);
      handleOpenChat(res.data, 'dm');
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  const handleOpenDetail = () => {
    navigate(`/app/posts/${id}`, { state: { background: location } });
  };

  // Determine aspect ratio class
  const aspectRatioClass = aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-square';

  return (
    <div className="bg-white border border-gray-300 rounded-lg w-full max-w-sm mx-auto my-4 overflow-hidden shadow-sm">
      
      {/* User Info Section */}
      <div className="flex items-center p-2">
        <Link to={`/app/profile/${userId}`} className="flex items-center flex-grow">
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
        </Link>
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

      {/* Media Renderer - Now opens Detail Modal directly */}
      {(mediaType === 'image' || mediaType === 'video') ? (
        <div 
            className={`relative w-full bg-gray-200 ${aspectRatioClass} cursor-zoom-in`}
            onClick={handleOpenDetail}
        >
          {mediaType === 'image' && (
            <img
              src={fullMediaUrl || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'}
              alt="Post media"
              className="absolute top-0 left-0 w-full h-full object-cover"
              loading="lazy"
            />
          )}
          {mediaType === 'video' && (
            <video
              src={fullMediaUrl}
              className="absolute top-0 left-0 w-full h-full object-cover"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      ) : (
        /* Text-only Post Style */
        <div 
            onClick={handleOpenDetail}
            className={`relative w-full flex items-center justify-center py-12 px-6 bg-linear-to-br from-blue-50 to-indigo-50 border-y border-gray-100 cursor-pointer hover:opacity-95 transition-opacity`}
        >
           <p className={`text-lg md:text-xl text-gray-800 font-medium italic leading-relaxed w-full text-${textAlignment}`}>
             {caption}
           </p>
        </div>
      )}

      {/* Action Bar */}
      <div className="p-2 flex items-center justify-between">
        <div className="flex space-x-3">
          <button 
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center hover:scale-110 transition-transform ${isLiked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'}`}
          >
            <svg
              className={`w-6 h-6 ${isLiked ? 'fill-current text-red-500' : 'fill-none'}`}
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
          <button 
            onClick={handleOpenDetail}
            className="flex items-center text-gray-700 hover:text-blue-500 hover:scale-110 transition-transform"
          >
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
          <button className="flex items-center text-gray-700 hover:text-purple-500 hover:scale-110 transition-transform">
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
        <button className="text-gray-700 hover:text-green-500 hover:scale-110 transition-transform">
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

      {/* Post Metadata */}
      <div className="px-2 text-sm font-semibold text-gray-800 flex justify-between">
        <span>{likeCount} likes</span>
        <button 
          onClick={handleOpenDetail}
          className="text-gray-500 font-normal hover:underline"
        >
          {commentsCount} comments
        </button>
      </div>

      {/* Caption Block */}
      {(caption && (mediaType === 'image' || mediaType === 'video')) && (
        <div className="px-2 py-1 text-sm text-gray-600">
          <p className={isCaptionExpanded ? '' : 'line-clamp-2'}>
            <span className="font-semibold mr-1">{username}</span>
            {caption}
          </p>
          {caption.length > 100 && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsCaptionExpanded(!isCaptionExpanded); }}
              className="text-gray-500 hover:underline text-xs mt-1"
            >
              {isCaptionExpanded ? 'less' : 'more'}
            </button>
          )}
        </div>
      )}

      {/* Post Metadata (Timestamp) */}
      <div className="px-2 py-1 text-xs text-gray-400 mb-2">
        {timestamp}
      </div>
    </div>
  );
};

export default PostCard;

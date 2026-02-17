import React, { useState } from 'react';

const PostCard = ({
  mediaType,
  mediaUrl,
  aspectRatio, // '1:1' or '4:5'
  caption,
  timestamp,
  likeCount,
  isLiked,
  isSaved,
  username,
  userProfilePic,
  isFollowing,
  userBio, // New prop
}) => {
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);

  // Determine aspect ratio class
  const aspectRatioClass = aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-square';

  return (
    <div className="bg-white border border-gray-300 rounded-lg max-w-sm mx-auto my-4 overflow-hidden">
      {/* User Info Section */}
      <div className="flex items-center p-2">
        <img
          src={userProfilePic}
          alt={`${username}'s profile`}
          className="w-10 h-10 rounded-full mr-2 object-cover"
        />
        <div className="flex-grow">
          <div className="font-semibold text-gray-800 text-lg underline">{username}</div>
          {userBio && (
            <p className="text-gray-500 pr-3 line-clamp-2 text-[50px] ">
              {userBio.length > 80 ? userBio.substring(0, 77) + '...' : userBio}
            </p>
          )}
        </div>
        <button className="text-blue-500 text-sm font-semibold">
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* Media Renderer */}
      <div className={`relative w-full bg-gray-200 ${aspectRatioClass}`}>
        {mediaType === 'image' && (
          <img
            src={mediaUrl}
            alt="Post media"
            className="absolute top-0 left-0 w-full h-full object-cover"
            loading="lazy" // Compatible with lazy loading
          />
        )}
        {mediaType === 'video' && (
          <video
            src={mediaUrl}
            controls
            className="absolute top-0 left-0 w-full h-full object-cover"
            preload="metadata" // Compatible with preloading
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

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
      {caption && (
        <div className="px-2 py-1 text-sm text-gray-600">
          <p className={isCaptionExpanded ? '' : 'line-clamp-2'}>
            <span className="font-semibold mr-1">username</span> {/* Placeholder username */}
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

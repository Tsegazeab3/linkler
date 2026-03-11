import React, { useState } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { followUser, unfollowUser, createDM, toggleLike } from '../services/api';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
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
  userBio,
}) => {
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followLoading, setFollowLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(initialIsLiked || false);
  const [likeCount, setLikeCount] = useState(initialLikeCount || 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const { handleOpenChat } = useOutletContext();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine aspect ratio class
  const aspectRatioClass = aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-square';

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
      // Backend might return slightly different format, but we trust optimistic update
      // and only correct if backend says otherwise.
      if (res.data.status === 'liked' || res.data.is_liked === true) {
        setIsLiked(true);
      } else if (res.data.status === 'unliked' || res.data.is_liked === false) {
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

  const handleOpenDetail = () => {
    navigate(`/app/posts/${id}`, { state: { background: location } });
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg w-full max-w-sm mx-auto my-4 overflow-hidden shadow-sm">
      {/* User Info Section */}
      <CardHeader className="flex flex-row items-center p-3 space-y-0">
        <Avatar className="w-10 h-10 mr-3 border border-border cursor-pointer" onClick={() => navigate(`/app/profile/${userId}`)}>
          <AvatarImage src={userProfilePic} alt={`${username}'s profile`} className="object-cover" />
          <AvatarFallback>{username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-grow min-w-0">
          <div className="font-semibold text-sm md:text-base truncate leading-tight cursor-pointer" onClick={() => navigate(`/app/profile/${userId}`)}>{username}</div>
          {userBio && (
            <p className="text-muted-foreground truncate text-xs mt-0.5">
              {userBio}
            </p>
          )}
        </div>
        {user?.id !== userId && (
          <button 
            onClick={handleFollow} 
            disabled={followLoading}
            className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${isFollowing ? 'bg-gray-100 text-gray-800' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </CardHeader>

      {/* Media Renderer */}
      <CardContent className="p-0">
        {mediaUrl ? (
          <div className={`relative w-full bg-muted ${aspectRatioClass} cursor-zoom-in`} onClick={handleOpenDetail}>
            {mediaType === 'image' && (
              <img
                src={mediaUrl}
                alt="Post media"
                className="absolute top-0 left-0 w-full h-full object-cover"
                loading="lazy"
              />
            )}
            {mediaType === 'video' && (
              <video
                src={mediaUrl}
                className="absolute top-0 left-0 w-full h-full object-cover"
                preload="metadata"
              />
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
      </CardContent>

      {/* Action Bar */}
      <div className="p-2 flex items-center justify-between">
        <div className="flex space-x-3">
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center hover:scale-110 transition-transform ${isLiked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'}`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center text-gray-700 hover:text-blue-500 hover:scale-110 transition-transform"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <button className="flex items-center text-gray-700 hover:text-purple-500 hover:scale-110 transition-transform">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
        <button className="text-gray-700 hover:text-green-500 hover:scale-110 transition-transform">
          <Bookmark className={`w-6 h-6 ${isSaved ? 'text-green-500 fill-current' : ''}`} />
        </button>
      </div>

      {/* Caption & Metadata */}
      <div className="px-3 pb-3">
        {likeCount > 0 && (
          <p className="text-sm font-bold mb-1">{likeCount} likes</p>
        )}
        {(caption && mediaUrl) && (
          <div className="text-sm text-foreground/90 w-full mb-1">
            <p className={isCaptionExpanded ? '' : 'line-clamp-2'}>
              <span className="font-bold mr-1.5 hover:underline cursor-pointer" onClick={() => navigate(`/app/profile/${userId}`)}>{username}</span>
              {caption}
            </p>
            {caption.length > 80 && (
              <button
                onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                className="text-primary hover:text-primary/80 text-xs mt-1 font-bold transition-colors"
              >
                {isCaptionExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}
        <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">
          {timestamp}
        </div>
      </div>
      
      {/* Comment Section Placeholder - Implementation of CommentSection.jsx is missing from codebase */}
      {/* {showComments && <CommentSection postId={id} />} */}
    </div>
  );
};

export default PostCard;

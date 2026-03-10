import React, { useState } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { followUser, unfollowUser, createDM, toggleLike, toggleSave } from '../services/api';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Heart, MessageCircle, Send, Bookmark, Share2 } from "lucide-react";
import CommentSection from './CommentSection';

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
  
  const { handleOpenChat } = useOutletContext();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthor = user?.id === userId || user?.pk === userId;

  const { handleOpenChat } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleOpenDetail = () => {
    navigate(`/app/posts/${id}`, { state: { background: location } });
  };

  // Determine aspect ratio class
  const aspectRatioClass = aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-square';

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
      </div>

      {/* Media Renderer */}
      <CardContent className="p-0">
        <div className={`relative w-full bg-muted ${aspectRatioClass} cursor-zoom-in`} onClick={handleOpenDetail}>
          {mediaUrl ? (
            <>
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
            </>
          ) : (
            /* Text-only Post Style */
            <div className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
               <p className="text-lg md:text-xl text-gray-800 font-medium italic text-center leading-relaxed">
                 {caption}
               </p>
            </div>
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
              <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full transition-colors ${showComments ? 'text-blue-500 bg-blue-50' : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-50'}`}
              onClick={handleComment}
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

        {(caption && mediaUrl) && (
          <div className="text-sm text-foreground/90 w-full px-0.5 mb-1">
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

        {showComments && <CommentSection postId={id} />}

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

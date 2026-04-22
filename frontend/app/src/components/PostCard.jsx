import React, { useState } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { followUser, unfollowUser, createDM, toggleLike, toggleSave } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  images = [], // New prop for multiple images
  aspectRatio, // '1:1' or '4:5'
  caption,
  timestamp,
  likeCount,
  isLiked,
  isSaved,
  username,
  userId,
  userProfilePic,
  isFollowing: initialIsFollowing,
  userBio,
}) => {
  const { user } = useAuth();
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followLoading, setFollowLoading] = useState(false);

  // Interaction State
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [likes, setLikes] = useState(likeCount);
  const [showComments, setShowComments] = useState(false);

  const { handleOpenChat } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();

  const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(username);
        setIsFollowing(false);
        toast.info(`Unfollowed ${username}`);
      } else {
        await followUser(username);
        setIsFollowing(true);
        toast.success(`Following ${username}`);
      }
    } catch (err) {
      console.error('Follow error:', err);
      toast.error("Follow action failed");
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
      toast.error("Failed to start chat");
    }
  };

  const handleLike = async () => {
    // Optimistic Update
    const previousLiked = liked;
    const previousLikes = likes;

    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);

    try {
      const res = await toggleLike(id);
      setLiked(res.data.is_liked);
      setLikes(res.data.likes_count);
    } catch (err) {
      console.error('Like error:', err);
      // Rollback
      setLiked(previousLiked);
      setLikes(previousLikes);
      toast.error("Failed to update like");
    }
  };

  const handleSave = async () => {
    const previousSaved = saved;
    setSaved(!saved);

    try {
      const res = await toggleSave(id);
      setSaved(res.data.is_saved);
      toast.success(res.data.is_saved ? "Post saved" : "Post removed from saves");
    } catch (err) {
      console.error('Save error:', err);
      setSaved(previousSaved);
      toast.error("Failed to update save status");
    }
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const handleShare = () => {
    const url = window.location.origin + `/posts/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard", {
      description: "Share this post with your friends!"
    });
  };

  const handleOpenDetail = () => {
    navigate(`/app/posts/${id}`, { state: { background: location } });
  };

  // Determine aspect ratio class
  const aspectRatioClass = aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-square';

  const renderMedia = () => {
    if (images && images.length > 0) {
      return (
        <div className={`grid gap-0.5 w-full ${aspectRatioClass} cursor-zoom-in`} onClick={handleOpenDetail}>
          {images.length === 1 ? (
            <img src={getMediaUrl(images[0].image)} className="w-full h-full object-cover" loading="lazy" alt="" />
          ) : images.length === 2 ? (
            <div className="grid grid-cols-2 gap-0.5 h-full w-full">
               <img src={getMediaUrl(images[0].image)} className="w-full h-full object-cover" loading="lazy" alt="" />
               <img src={getMediaUrl(images[1].image)} className="w-full h-full object-cover" loading="lazy" alt="" />
            </div>
          ) : (
            /* Compartmentalized layout: One big on side, others small */
            <div className="flex h-full w-full gap-0.5">
               <div className="w-2/3 h-full">
                  <img src={getMediaUrl(images[0].image)} className="w-full h-full object-cover" loading="lazy" alt="" />
               </div>
               <div className="w-1/3 flex flex-col gap-0.5 h-full">
                  <div className="h-1/2 w-full relative">
                    <img src={getMediaUrl(images[1].image)} className="w-full h-full object-cover" loading="lazy" alt="" />
                  </div>
                  <div className="h-1/2 w-full relative">
                    <img src={getMediaUrl(images[2].image)} className="w-full h-full object-cover" loading="lazy" alt="" />
                    {images.length > 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">
                        +{images.length - 3}
                      </div>
                    )}
                  </div>
               </div>
            </div>
          )}
        </div>
      );
    }

    if (mediaUrl) {
      return (
        <div className={`relative w-full bg-muted ${aspectRatioClass} cursor-zoom-in`} onClick={handleOpenDetail}>
           {mediaType === 'image' && (
              <img
                src={getMediaUrl(mediaUrl)}
                alt="Post media"
                className="absolute top-0 left-0 w-full h-full object-cover"
                loading="lazy"
              />
            )}
            {mediaType === 'video' && (
              <video
                src={getMediaUrl(mediaUrl)}
                className="absolute top-0 left-0 w-full h-full object-cover"
                preload="metadata"
              />
            )}
        </div>
      );
    }

    if (caption) {
        /* Text-only Post Style */
        return (
          <div className={`relative w-full bg-gradient-to-br from-brand-light to-accent-indigo/10 ${aspectRatioClass} cursor-zoom-in`} onClick={handleOpenDetail}>
            <div className="absolute inset-0 flex items-center justify-center p-8">
               <p className="text-lg md:text-xl text-ui-text-main font-medium italic text-center leading-relaxed">
                 {caption}
               </p>
            </div>
          </div>
        );
    }

    /* Fallback for truly empty posts */
    return (
        <div className={`relative w-full bg-ui-bg-alt flex flex-col items-center justify-center gap-2 ${aspectRatioClass}`}>
            <Share2 className="w-8 h-8 text-ui-muted opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest text-ui-muted opacity-40">No Content Shared</p>
        </div>
    );
  };

  return (
    <Card className="w-full max-w-sm mx-auto my-4 overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
      {/* User Info Section */}
      <CardHeader className="flex flex-row items-center p-3 space-y-0">
        <Avatar className="w-10 h-10 mr-3 border border-border cursor-pointer" onClick={() => navigate(`/app/profile/${username}`)}>
          <AvatarImage src={getMediaUrl(userProfilePic)} alt={`${username}'s profile`} className="object-cover" />
          <AvatarFallback>{username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
          <div className="flex-grow min-w-0">
          <div className="font-semibold text-sm md:text-base truncate leading-tight cursor-pointer" onClick={() => navigate(`/app/profile/${username}`)}>{username}</div>
          {userBio && (
            <p className="text-muted-foreground truncate text-xs mt-0.5 cursor-pointer" onClick={() => navigate(`/app/profile/${username}`)}>
              {userBio}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleChat}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary transition-colors"
            title="Start Chat"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          {user?.id !== userId && (
            <Button
              variant={isFollowing ? "secondary" : "default"}
              size="sm"
              onClick={handleFollow}
              disabled={followLoading}
              className="h-8 text-xs font-bold rounded-full px-4 transition-all"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Media Renderer */}
      <CardContent className="p-0">
        {renderMedia()}
      </CardContent>

      {/* Action Bar & Metadata */}
      <CardFooter className="flex flex-col items-start p-4 pt-2 gap-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex space-x-1 -ml-2">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full transition-colors ${liked ? 'text-like hover:text-error-hover hover:bg-error-light' : 'text-muted-foreground hover:text-like'}`}
              onClick={handleLike}
            >
              <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full transition-colors ${showComments ? 'text-comment bg-brand-light' : 'text-muted-foreground hover:text-comment hover:bg-brand-light'}`}
              onClick={handleComment}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full text-muted-foreground hover:text-accent-indigo hover:bg-accent-indigo/10 transition-colors`}
              onClick={handleShare}
            >
              <Share2 className="w-6 h-6" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full -mr-2 transition-colors ${saved ? 'text-save hover:text-success-hover hover:bg-success-light' : 'text-muted-foreground hover:text-save'}`}
            onClick={handleSave}
          >
            <Bookmark className={`w-6 h-6 ${saved ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <div className="text-sm font-semibold text-foreground px-0.5">
          {likes} likes
        </div>

        {(caption && mediaUrl) && (
          <div className="text-sm text-foreground/90 w-full px-0.5 mb-1">
            <p className={isCaptionExpanded ? '' : 'line-clamp-2'}>
              <span className="font-bold mr-1.5 hover:underline cursor-pointer" onClick={() => navigate(`/app/profile/${username}`)}>{username}</span>
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

        <div className="text-[11px] text-muted-foreground mt-1 tracking-wide uppercase px-0.5">
          {timestamp}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;

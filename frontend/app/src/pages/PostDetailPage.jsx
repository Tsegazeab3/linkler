import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, addComment, toggleLike, followUser, unfollowUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Heart, MessageCircle, Send, X, Maximize2, Minimize2, Loader2 } from "lucide-react";

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [show, setShow] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Custom Zoom State
  const [scale, setScale] = useState(1);
  const [startDistance, setStartDistance] = useState(0);
  const [lastScale, setLastScale] = useState(1);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setTimeout(() => setShow(true), 10);
    document.body.style.overflow = 'hidden';

    // Block native touch pinch-zoom globally
    const preventTouchZoom = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    // Block native trackpad pinch-zoom globally (ctrl + wheel)
    const preventWheelZoom = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', preventTouchZoom, { passive: false });
    document.addEventListener('touchmove', preventTouchZoom, { passive: false });
    document.addEventListener('wheel', preventWheelZoom, { passive: false });

    getPost(postId)
      .then(res => {
        setPost(res.data);
        setIsFollowing(res.data.author?.is_following || false);
      })
      .catch(err => {
        console.error('Error fetching post:', err);
        toast.error("Failed to load post");
      })
      .finally(() => setLoading(false));

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('touchstart', preventTouchZoom);
      document.removeEventListener('touchmove', preventTouchZoom);
      document.removeEventListener('wheel', preventWheelZoom);
    };
  }, [postId]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => navigate(-1), 200);
  };

  const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isExpanded) {
          setIsExpanded(false);
          setScale(1);
          setLastScale(1);
          setOffset({ x: 0, y: 0 });
        } else {
          handleClose();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const getDistance = (touches) => {
    return Math.hypot(
      touches[0].pageX - touches[1].pageX,
      touches[0].pageY - touches[1].pageY
    );
  };

  const handleTouchStart = (e) => {
    if (!isExpanded) return;
    if (e.touches.length === 2) {
      setStartDistance(getDistance(e.touches));
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
    }
  };

  const handleTouchMove = (e) => {
    if (!isExpanded) return;
    if (e.touches.length === 2 && startDistance > 0) {
      const currentDistance = getDistance(e.touches);
      const newScale = Math.min(Math.max(lastScale * (currentDistance / startDistance), 1), 4);
      setScale(newScale);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      setOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    if (!isExpanded) return;
    setLastScale(scale);
    setStartDistance(0);
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    if (!isExpanded) return;
    if (e.ctrlKey) {
      const delta = e.deltaY * -0.01;
      const newScale = Math.min(Math.max(scale + delta, 1), 4);
      setScale(newScale);
      setLastScale(newScale);
    }
  };

  const handleMouseDown = (e) => {
    if (!isExpanded || scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (!post?.images || post.images.length === 0) return;
    setActiveImageIndex((prev) => (prev + 1) % post.images.length);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (!post?.images || post.images.length === 0) return;
    setActiveImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleMediaClick = (e) => {
    if (!isExpanded) {
      setIsExpanded(true);
      setScale(1.1);
      setLastScale(1.1);
    }
  };

  const handleDoubleClick = (e) => {
    if (isExpanded) {
      setIsExpanded(false);
      setScale(1);
      setLastScale(1);
      setOffset({ x: 0, y: 0 });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await addComment(postId, newComment);
      setPost({
        ...post,
        post_comments: [res.data, ...(post.post_comments || [])],
        comments_count: (post.comments_count || 0) + 1
      });
      setNewComment('');
      toast.success("Comment added");
    } catch (err) {
      console.error('Comment error:', err);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollow = async () => {
    if (!post?.author?.id) return;
    try {
      if (isFollowing) {
        await unfollowUser(post.author.username);
        setIsFollowing(false);
        toast.info(`Unfollowed ${post.author.username}`);
      } else {
        await followUser(post.author.username);
        setIsFollowing(true);
        toast.success(`Following ${post.author.username}`);
      }
    } catch (err) {
      console.error('Follow error:', err);
      toast.error("Action failed");
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    
    const wasLiked = post.is_liked;
    setPost(prev => ({
        ...prev,
        is_liked: !wasLiked,
        likes_count: wasLiked ? Math.max(0, prev.likes_count - 1) : prev.likes_count + 1
    }));

    try {
      const res = await toggleLike(postId);
      setPost(prev => ({ 
        ...prev, 
        is_liked: res.data.is_liked,
        likes_count: res.data.likes_count
      }));
    } catch (err) {
      console.error('Like error:', err);
      setPost(prev => ({
          ...prev,
          is_liked: wasLiked,
          likes_count: wasLiked ? prev.likes_count + 1 : Math.max(0, prev.likes_count - 1)
      }));
    }
  };

  if (loading) return null;

  const content = (
    <div 
      className={`fixed inset-0 z-[10000] flex items-center justify-center transition-all duration-300 ${show ? 'opacity-100 backdrop-blur-lg' : 'opacity-0'} bg-black/90`}
      onClick={handleClose}
      style={{ touchAction: 'pan-y' }}
    >
      <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-[10002] flex space-x-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleClose} 
          className="h-10 w-10 lg:h-12 lg:w-12 bg-black/50 lg:bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-black/70 lg:hover:bg-white/20 transition-colors"
        >
          <X className="h-5 w-5 lg:h-6 lg:w-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} 
          className="h-10 w-10 lg:h-12 lg:w-12 bg-black/50 lg:bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-black/70 lg:hover:bg-white/20 transition-colors"
        >
          {isExpanded ? <Minimize2 className="h-5 w-5 lg:h-6 lg:w-6" /> : <Maximize2 className="h-5 w-5 lg:h-6 lg:w-6" />}
        </Button>
      </div>

      <div 
        className={`w-full h-full lg:w-[1000px] lg:h-[85vh] flex flex-col lg:flex-row bg-ui-white lg:rounded-3xl lg:shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        
        <div 
            className={`bg-ui-bg flex items-center justify-center relative overflow-hidden touch-none transition-all duration-500 ease-in-out ${isExpanded ? 'h-full lg:h-auto lg:w-full' : 'h-[40vh] shrink-0 lg:h-auto lg:w-[600px] lg:flex-grow'}`}
            style={{ cursor: isExpanded ? (scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-out') : 'zoom-in' }}
            onClick={handleMediaClick}
            onDoubleClick={handleDoubleClick}
        >
          {((post.images && post.images.length > 0) || post.media_file) ? (
            <div 
                className="w-full h-full flex items-center justify-center min-w-full min-h-full"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {post.media_type === 'video' ? (
                    <video src={getMediaUrl(post.media_file)} controls className="max-h-full w-full object-contain" />
                ) : (
                    <>
                        <img 
                            src={post.images && post.images.length > 0 ? getMediaUrl(post.images[activeImageIndex].image) : getMediaUrl(post.media_file)} 
                            alt="Post" 
                            style={{ 
                                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                            }}
                            className="max-h-full max-w-full object-contain mx-auto my-auto" 
                            draggable="false"
                        />
                        
                        {post.images && post.images.length > 1 && !isExpanded && (
                            <>
                                <button 
                                    onClick={prevImage}
                                    className="absolute left-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors z-10"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button 
                                    onClick={nextImage}
                                    className="absolute right-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors z-10"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                                <div className="absolute bottom-4 flex gap-1.5 z-10">
                                    {post.images.map((_, i) => (
                                        <div key={i} className={`h-1.5 rounded-full transition-all ${i === activeImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-gradient-to-br from-brand-light to-accent-indigo/10 gap-4">
              {post.caption ? (
                <p className={`text-2xl text-ui-text-main font-medium italic text-center leading-relaxed`}>
                  {post.caption}
                </p>
              ) : (
                <>
                  <Share2 className="w-16 h-16 text-ui-muted opacity-20" />
                  <p className="text-sm font-black uppercase tracking-[0.4em] text-ui-muted opacity-40">No Content Shared</p>
                </>
              )}
            </div>
          )}
        </div>

        <div 
            className={`bg-ui-white lg:border-l border-ui-border flex flex-col transition-all duration-500 overflow-hidden ${isExpanded ? 'h-0 lg:h-auto lg:w-0 opacity-0' : 'h-auto flex-grow lg:w-[450px] opacity-100'}`}
        >
          <div className="flex items-center p-4 border-b border-ui-border shrink-0">
            <Avatar className="h-10 w-10 mr-3 border border-ui-border shadow-sm">
                <AvatarImage src={getMediaUrl(post.author?.profile_picture)} className="object-cover" />
                <AvatarFallback>{post.author?.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-grow min-w-0">
              <p className="font-bold text-sm text-ui-text-main truncate cursor-pointer" onClick={() => navigate(`/app/profile/${post.author?.username}`)}>{post.author?.username}</p>
              <p className="text-xs text-ui-muted truncate line-clamp-1 cursor-pointer" onClick={() => navigate(`/app/profile/${post.author?.username}`)}>{post.author?.bio || ''}</p>
            </div>
            {user?.id !== post.author?.id && (
              <Button 
                variant={isFollowing ? "secondary" : "outline"} 
                size="sm" 
                onClick={handleFollow}
                className="h-8 text-xs font-bold rounded-full px-4"
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>

          <div className="flex-grow overflow-y-auto no-scrollbar p-4 space-y-6">
            {post.caption && (
               <div className="flex space-x-3 mb-2">
                 <Avatar className="h-8 w-8 border border-ui-border/30 shadow-sm flex-shrink-0">
                    <AvatarImage src={getMediaUrl(post.author?.profile_picture)} className="object-cover" />
                    <AvatarFallback>{post.author?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                 </Avatar>
                 <div className="text-sm">
                    <p><span className="font-bold mr-2 text-ui-text-main cursor-pointer" onClick={() => navigate(`/app/profile/${post.author?.username}`)}>{post.author?.username}</span><span className="text-ui-text-secondary">{post.caption}</span></p>
                    <p className="text-[10px] text-ui-muted mt-1 uppercase tracking-tighter">{new Date(post.created_at).toLocaleDateString()}</p>
                 </div>
               </div>
            )}
            
            <div className="space-y-5">
                {post.post_comments?.map(comment => (
                <div key={comment.id} className="flex space-x-3 animate-in fade-in slide-in-from-left-2 duration-300">
                    <Avatar className="h-8 w-8 border border-ui-border/30 shadow-sm flex-shrink-0">
                        <AvatarImage src={getMediaUrl(comment.author?.profile_picture)} className="object-cover" />
                        <AvatarFallback>{comment.author?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <div className="bg-ui-bg-alt/50 p-3 rounded-2xl rounded-tl-none border border-ui-border/50">
                            <p className="text-sm">
                                <span className="font-bold mr-2 text-ui-text-main cursor-pointer" onClick={() => navigate(`/app/profile/${comment.author?.username}`)}>{comment.author?.username}</span>
                                <span className="text-ui-text-secondary">{comment.text}</span>
                            </p>
                        </div>
                        <p className="text-[9px] text-ui-muted mt-1 ml-1 font-medium">{new Date(comment.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                ))}
            </div>
          </div>

          <div className="p-4 border-t border-ui-border bg-ui-white shrink-0">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleLike}
                    className={`rounded-full transition-colors ${post.is_liked ? 'text-like hover:text-error-hover' : 'text-ui-muted hover:text-like'}`}
                  >
                    <Heart className={`h-6 w-6 ${post.is_liked ? 'fill-current' : ''}`} />
                  </Button>
                  <span className="text-xs font-bold text-ui-text-main">{post.likes_count || 0} likes</span>
               </div>
            </div>
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-grow text-sm bg-ui-bg-alt/50 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-brand/20 text-ui-text-main"
                disabled={isSubmitting}
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="sm"
                disabled={isSubmitting || !newComment.trim()} 
                className="text-brand font-bold hover:bg-transparent"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.getElementById('modal-root') || document.body);
};

export default PostDetailPage;
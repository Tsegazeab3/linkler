import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, createComment, followUser, unfollowUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
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

    // Add listeners with passive: false to allow preventDefault
    document.addEventListener('touchstart', preventTouchZoom, { passive: false });
    document.addEventListener('touchmove', preventTouchZoom, { passive: false });
    document.addEventListener('wheel', preventWheelZoom, { passive: false });

    getPost(postId)
      .then(res => {
        setPost(res.data);
        setIsFollowing(res.data.author?.is_following || false);
      })
      .catch(err => console.error('Error fetching post:', err))
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
      const res = await createComment(postId, newComment);
      setPost({
        ...post,
        comments: [...(post.comments || []), res.data],
        comments_count: (post.comments_count || 0) + 1
      });
      setNewComment('');
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollow = async () => {
    if (!post?.author?.id) return;
    try {
      if (isFollowing) {
        await unfollowUser(post.author.id);
        setIsFollowing(false);
      } else {
        await followUser(post.author.id);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isSubmitting) return; // Reusing isSubmitting for simplicity or create likeLoading
    
    // Optimistic UI update
    const wasLiked = post.is_liked;
    setPost(prev => ({
        ...prev,
        is_liked: !wasLiked,
        likes_count: wasLiked ? Math.max(0, prev.likes_count - 1) : prev.likes_count + 1
    }));

    try {
      const res = await toggleLike(postId);
      if (res.data.status === 'liked') {
          setPost(prev => ({ ...prev, is_liked: true }));
      } else {
          setPost(prev => ({ ...prev, is_liked: false }));
      }
    } catch (err) {
      console.error('Like error:', err);
      // Revert
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
      style={{ touchAction: 'pan-y' }} // Let native scroll work but isolate zoom
    >
      {/* UI: Close button & Mode Toggle (Fixed, Never Zooms) */}
      <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-[10002] flex space-x-3">
        <button onClick={handleClose} className="w-10 h-10 lg:w-12 lg:h-12 bg-black/50 lg:bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/70 lg:hover:bg-white/20 transition-colors">
            ✕
        </button>
        <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="w-10 h-10 lg:w-12 lg:h-12 bg-black/50 lg:bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/70 lg:hover:bg-white/20 transition-colors">
            {isExpanded ? '💬' : '⛶'}
        </button>
      </div>

      <div 
        className={`w-full h-full lg:w-[1000px] lg:h-[85vh] flex flex-col lg:flex-row bg-white lg:rounded-3xl lg:shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Media Zone: custom pinch zoom */}
        <div 
            className={`bg-black flex items-center justify-center relative overflow-hidden touch-none transition-all duration-500 ease-in-out ${isExpanded ? 'h-full lg:h-auto lg:w-full' : 'h-[30vh] shrink-0 lg:h-auto lg:w-[600px] lg:flex-grow'}`}
            style={{ cursor: isExpanded ? (scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-out') : 'zoom-in' }}
            onClick={handleMediaClick}
            onDoubleClick={handleDoubleClick}
        >
          {post.media_file ? (
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
                    <video src={post.media_file} controls className="max-h-full w-full object-contain" />
                ) : (
                    <img 
                        src={post.media_file} 
                        alt="Post" 
                        style={{ 
                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                        }}
                        className="max-h-full max-w-full object-contain mx-auto my-auto" 
                        draggable="false"
                    />
                )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-12 bg-linear-to-br from-indigo-50 to-blue-50">
              <p className={`text-2xl text-gray-800 font-medium italic text-${post.text_alignment || 'center'}`}>
                {post.caption}
              </p>
            </div>
          )}
        </div>

        {/* Static Pane: never zooms, stays same size */}
        <div 
            className={`bg-white lg:border-l border-gray-100 flex flex-col transition-all duration-500 overflow-hidden ${isExpanded ? 'h-0 lg:h-auto lg:w-0 opacity-0' : 'h-auto flex-grow lg:w-[450px] opacity-100'}`}
        >
          {/* Header */}
          <div className="flex items-center p-4 border-b shrink-0">
            <img
              src={post.author?.profile_picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'}
              className="w-10 h-10 rounded-full mr-3 object-cover border"
              alt={post.author?.username}
            />
            <div className="flex-grow min-w-0">
              <p className="font-bold text-sm truncate">{post.author?.username}</p>
              <p className="text-xs text-gray-500 truncate line-clamp-1">{post.author?.bio || ''}</p>
            </div>
            {user?.id !== post.author?.id && (
              <button onClick={handleFollow} className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors ${isFollowing ? 'text-gray-400 border-gray-100' : 'text-blue-500 border-blue-500 hover:bg-blue-50'}`}>
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {/* Comments List */}
          <div className="flex-grow overflow-y-auto no-scrollbar p-4 space-y-6">
            {post.media_file && post.caption && (
               <div className="flex space-x-3 mb-2">
                 <img src={post.author?.profile_picture} className="w-8 h-8 rounded-full border flex-shrink-0" />
                 <div className="text-sm">
                    <p><span className="font-bold mr-2">{post.author?.username}</span>{post.caption}</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">{new Date(post.created_at).toLocaleDateString()}</p>
                 </div>
               </div>
            )}
            
            <div className="space-y-5">
                {post.comments?.map(comment => (
                <div key={comment.id} className="flex space-x-3">
                    <img src={comment.author?.profile_picture} className="w-8 h-8 rounded-full border flex-shrink-0" />
                    <div>
                        <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none">
                            <p className="text-sm">
                                <span className="font-bold mr-2">{comment.author?.username}</span>
                                {comment.text}
                            </p>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-1 ml-1 font-medium">{new Date(comment.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-white shrink-0">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-3">
                  <button 
                    onClick={handleLike}
                    className={`flex items-center hover:scale-110 transition-transform ${post.is_liked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'}`}
                  >
                    <svg
                      className={`w-6 h-6 ${post.is_liked ? 'fill-current text-red-500' : 'fill-none'}`}
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
                  <span className="text-xs font-bold text-gray-800">{post.likes_count || 0} likes</span>
               </div>
            </div>
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-grow text-sm p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20"
                disabled={isSubmitting}
              />
              <button type="submit" disabled={isSubmitting || !newComment.trim()} className="text-blue-500 font-bold px-2 disabled:opacity-30">
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.getElementById('modal-root') || document.body);
};

export default PostDetailPage;

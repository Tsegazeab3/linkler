import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getComments, addComment } from '../services/api';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const navigate = (path) => {
    // Custom navigate if needed, but we use Link
  };

  const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  const fetchComments = async () => {
    try {
      const res = await getComments(postId);
      const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await addComment(postId, newComment);
      setComments([res.data, ...comments]);
      setNewComment("");
      toast.success("Comment added");
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  return (
    <div className="mt-2 pt-2 px-0.5 space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 px-3 py-2 bg-ui-bg-alt rounded-xl border border-ui-border shadow-sm focus-within:bg-ui-soft-bg transition-colors">
        <form onSubmit={handleAddComment} className="flex flex-grow items-center gap-2">
          <Input
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-grow bg-transparent border-none shadow-none focus-visible:ring-0 h-8 text-sm placeholder:text-ui-muted"
            disabled={isSubmitting}
          />
          <Button 
            type="submit" 
            size="icon" 
            variant="ghost" 
            disabled={!newComment.trim() || isSubmitting}
            className="h-8 w-8 text-brand hover:text-brand-hover hover:bg-transparent transition-all"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 fill-brand/10" />}
          </Button>
        </form>
      </div>

      <div className="max-h-56 overflow-y-auto space-y-5 px-1 pb-2 scrollbar-hide">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div 
              key={comment.id} 
              className="flex gap-3 text-sm animate-in fade-in slide-in-from-left-2 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Link to={`/app/profile/${comment.author?.username}`}>
                <Avatar className="h-9 w-9 border border-ui-border shadow-sm hover:opacity-80 transition-opacity">
                  <AvatarImage src={getMediaUrl(comment.author?.profile_picture)} className="object-cover" />
                  <AvatarFallback className="text-[10px] bg-ui-bg-alt text-ui-muted">{comment.author?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-grow">
                <div className="flex items-baseline gap-2">
                  <Link to={`/app/profile/${comment.author?.username}`} className="font-bold text-ui-text-main text-[13px] hover:text-brand transition-colors">
                    {comment.author?.username}
                  </Link>
                  <span className="text-[9px] text-ui-muted font-medium uppercase tracking-tighter opacity-70">
                    {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-ui-text-secondary leading-relaxed text-[13px] mt-0.5">{comment.text}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 text-center space-y-2 animate-in zoom-in-95 duration-500">
            <div className="inline-flex p-3 rounded-full bg-ui-bg-alt text-ui-muted">
                <MessageCircle className="h-6 w-6" />
            </div>
            <p className="text-xs text-ui-muted font-medium italic">No comments yet. Start the conversation!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;

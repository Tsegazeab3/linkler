import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const ReviewModal = ({ isOpen, onClose, onSubmit, title = "Leave a Review" }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(rating, comment);
      setComment('');
      setRating(5);
      onClose();
    } catch (err) {
      console.error('Submit review error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic tracking-tight text-ui-text-main">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[10px] text-ui-muted uppercase tracking-wider font-bold">
            Tell the community about your experience.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-muted italic">Your Rating</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-4xl transition-all duration-300 ${
                    star <= rating ? 'text-warning scale-110' : 'text-ui-muted opacity-30 hover:opacity-50'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-brand mt-1">
              {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
            </span>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-muted italic ml-1">Your Experience</span>
            <Textarea
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] rounded-2xl border-ui-border bg-ui-bg-alt focus-visible:ring-brand/20 resize-none p-4 font-medium"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || !comment.trim()}
            className="w-full h-14 rounded-2xl font-black italic text-lg shadow-lg shadow-brand/20 animate-in fade-in slide-in-from-bottom-2"
          >
            {submitting ? 'Submitting...' : 'Post Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;

import React, { useState } from 'react';
import { createPost } from '../services/api';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MAX_CAPTION_LENGTH = 500;

const PostDetails = ({ file, fileType, onBack, postMode, onSuccess }) => {
  const [caption, setCaption] = useState('');
  const [audience, setAudience] = useState('public');
  const [disableComments, setDisableComments] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (status) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('audience', audience);
    // Django expects 'true' or 'false' for BooleanField from FormData
    formData.append('allow_comments', !disableComments); 
    formData.append('status', status);

    if (postMode === 'media' && file) {
      formData.append('media_file', file);
      formData.append('media_type', fileType);
      formData.append('aspect_ratio', aspectRatio);
    }

    createPost(formData)
      .then(response => {
        console.log('Post created successfully:', response.data);
        toast.success("Post Created", {
          description: "Your post has been shared successfully!"
        });
        onSuccess(); // Close the modal on success
      })
      .catch(err => {
        console.error('Error creating post:', err.response ? err.response.data : err);
        const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create post. Please try again.';
        toast.error("Error", {
          description: errorMsg,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handlePost = () => handleSubmit('published');
  const handleSaveDraft = () => handleSubmit('draft');

  const captionLengthColor = caption.length > MAX_CAPTION_LENGTH ? 'text-error' : 'text-ui-muted';
  const detailsWidth = postMode === 'media' ? 'md:w-1/2' : 'w-full max-w-2xl mx-auto';

  return (
    <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0">
      {/* Media Preview */}
      {postMode === 'media' && (
        <div className="md:w-1/2">
          <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-ui-bg-alt">
            {fileType === 'image' ? (
              <img src={URL.createObjectURL(file)} alt="Preview" className="absolute top-0 left-0 w-full h-full object-cover" />
            ) : (
              <video src={URL.createObjectURL(file)} controls className="absolute top-0 left-0 w-full h-full object-cover" />
            )}
          </div>
        </div>
      )}

      {/* Details Column */}
      <div className={`${detailsWidth} flex flex-col space-y-6`}>
        <div className="flex-grow space-y-6">
          {/* Caption Input */}
          <div className="space-y-2">
            <Label htmlFor="caption" className="text-sm font-semibold">
              {postMode === 'media' ? 'Caption' : 'Your Text Post'}
            </Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[120px] resize-none focus-visible:ring-primary"
              placeholder={postMode === 'media' ? 'Write a caption...' : "What's on your mind?"}
              disabled={loading}
            />
            <div className="flex justify-end">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${caption.length > MAX_CAPTION_LENGTH ? 'bg-error-light text-error' : 'bg-ui-bg-alt text-ui-muted'}`}>
                {caption.length} / {MAX_CAPTION_LENGTH}
              </span>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 gap-6 pt-2">
            <div className="space-y-2">
              <Label htmlFor="audience" className="text-sm font-semibold">Audience</Label>
              <Select value={audience} onValueChange={setAudience} disabled={loading}>
                <SelectTrigger id="audience" className="w-full">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="followers">Followers</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 bg-muted/30">
              <Checkbox 
                id="disable-comments" 
                checked={disableComments} 
                onCheckedChange={setDisableComments} 
                disabled={loading}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="disable-comments"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Disable comments
                </Label>
                <p className="text-xs text-muted-foreground">
                  Prevent others from commenting on this post.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-6 mt-2 border-t border-border/50">
          <Button variant="ghost" onClick={onBack} disabled={loading} className="px-6">
            Back
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={handleSaveDraft} disabled={loading}>
            {loading ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button onClick={handlePost} disabled={loading} className="px-8 font-bold">
            {loading ? 'Posting...' : 'Share Post'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;

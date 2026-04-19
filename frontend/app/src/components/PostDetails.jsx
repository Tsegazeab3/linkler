import React, { useState } from 'react';
import { createPost } from '../services/api';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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

const PostDetails = ({ files, fileType, onBack, postMode, onSuccess }) => {
  const [caption, setCaption] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
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
    formData.append('country', country);
    formData.append('region', region);
    formData.append('audience', audience);
    // Django expects 'true' or 'false' for BooleanField from FormData
    formData.append('allow_comments', !disableComments); 
    formData.append('status', status);

    if (postMode === 'media' && files && files.length > 0) {
      if (fileType === 'video') {
        formData.append('media_file', files[0]);
      } else {
        files.forEach(file => {
          formData.append('images', file);
        });
        // Also set the first one as main media_file for legacy compatibility
        formData.append('media_file', files[0]);
      }
      formData.append('media_type', fileType);
      formData.append('aspect_ratio', aspectRatio);
    }

    createPost(formData)
      .then(response => {
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
          {fileType === 'image' ? (
            <div className={`grid gap-2 ${files.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {Array.from(files).slice(0, 4).map((file, idx) => (
                <div key={idx} className={`relative overflow-hidden rounded-lg bg-ui-bg-alt ${idx === 0 && files.length > 2 ? 'row-span-2 col-span-1 h-full' : 'aspect-square'}`}>
                  <img src={URL.createObjectURL(file)} alt="Preview" className="absolute top-0 left-0 w-full h-full object-cover" />
                  {idx === 3 && files.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                      +{files.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-ui-bg-alt">
               <video src={URL.createObjectURL(files[0])} controls className="absolute top-0 left-0 w-full h-full object-cover" />
            </div>
          )}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-semibold">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Japan"
                className="focus-visible:ring-primary"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region" className="text-sm font-semibold">Region</Label>
              <Select value={region} onValueChange={setRegion} disabled={loading}>
                <SelectTrigger id="region" className="w-full">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa">Africa</SelectItem>
                  <SelectItem value="Asia">Asia</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="North America">North America</SelectItem>
                  <SelectItem value="South America">South America</SelectItem>
                  <SelectItem value="Oceania">Oceania</SelectItem>
                  <SelectItem value="Middle East">Middle East</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="friends">Friends</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-ui-border/50 bg-ui-bg-alt/30">
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
                <p className="text-xs text-ui-muted">
                  Prevent others from commenting on this post.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-6 mt-2 border-t border-ui-border/50">
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

import React, { useState } from 'react';
import { createPost } from '../services/api';

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
        alert('Post created successfully!');
        onSuccess(); // Close the modal on success
      })
      .catch(err => {
        console.error('Error creating post:', err.response ? err.response.data : err);
        setError('Failed to create post. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handlePost = () => handleSubmit('published');
  const handleSaveDraft = () => handleSubmit('draft');

  const captionLengthColor = caption.length > MAX_CAPTION_LENGTH ? 'text-red-500' : 'text-gray-400';
  const detailsWidth = postMode === 'media' ? 'md:w-1/2' : 'w-full max-w-2xl mx-auto';

  return (
    <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0">
      {/* Media Preview */}
      {postMode === 'media' && (
        <div className="md:w-1/2">
          <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-gray-100">
            {fileType === 'image' ? (
              <img src={URL.createObjectURL(file)} alt="Preview" className="absolute top-0 left-0 w-full h-full object-cover" />
            ) : (
              <video src={URL.createObjectURL(file)} controls className="absolute top-0 left-0 w-full h-full object-cover" />
            )}
          </div>
        </div>
      )}

      {/* Details Column */}
      <div className={`${detailsWidth} flex flex-col`}>
        <div className="flex-grow space-y-4">
          {/* Caption Input */}
          <div>
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <span>{postMode === 'media' ? 'Caption' : 'Your Text Post'}</span>
            </label>
            <textarea
              id="caption"
              rows={postMode === 'media' ? 4 : 8}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#3b82f6] focus:border-[#3b82f6] resize-none"
              placeholder={postMode === 'media' ? 'Write a caption...' : 'What&apos;s on your mind?'}
              disabled={loading}
            />
            <p className={`text-xs text-right mt-1 ${captionLengthColor}`}>{caption.length} / {MAX_CAPTION_LENGTH}</p>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div>
              <label htmlFor="audience" className="block text-sm font-medium text-gray-700">Audience</label>
              <select id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} disabled={loading} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#3b82f6] focus:border-[#3b82f6] sm:text-sm rounded-md">
                <option value="public">Public</option>
                <option value="followers">Followers</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="flex items-center">
              <input id="disable-comments" type="checkbox" checked={disableComments} onChange={(e) => setDisableComments(e.target.checked)} disabled={loading} className="h-4 w-4 text-[#3b82f6] focus:ring-[#3b82f6] border-gray-300 rounded" />
              <label htmlFor="disable-comments" className="ml-2 block text-sm text-gray-900">Disable comments</label>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="text-sm text-red-500 text-center my-2">{error}</p>}

        {/* Action Buttons */}
        <div className="flex justify-end items-center space-x-4 pt-4 mt-4 border-t border-gray-200">
          <button onClick={onBack} disabled={loading} className="py-2 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-md transition duration-200 disabled:opacity-50">
            Back
          </button>
          <button onClick={handleSaveDraft} disabled={loading} className="py-2 px-4 text-sm font-semibold border border-gray-600 text-gray-600 rounded-md hover:bg-gray-50 transition duration-200 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button onClick={handlePost} disabled={loading} className="py-2 px-6 bg-[#3b82f6] text-white rounded-md font-semibold hover:bg-[#3b82f6]/90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;

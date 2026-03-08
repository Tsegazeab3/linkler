import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { getPost, updatePost, deletePost } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const MAX_CAPTION_LENGTH = 500;

const EditPostModal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [postData, setPostData] = useState({
    caption: '',
    audience: 'public',
    allow_comments: true,
    text_alignment: 'center',
    media_type: null,
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setShow(true);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Fetch the post
    getPost(id)
      .then(res => {
        const post = res.data;
        setPostData({
          caption: post.caption || '',
          audience: post.audience || 'public',
          allow_comments: post.allow_comments !== false,
          text_alignment: post.text_alignment || 'center',
          media_type: post.media_type || (post.media_file ? 'media' : 'text'),
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching post:', err);
        setError('Failed to load post data.');
        setLoading(false);
      });

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [id]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      navigate(-1);
    }, 200);
  };

  const handleUpdate = () => {
    setSaving(true);
    const formData = new FormData();
    formData.append('caption', postData.caption);
    formData.append('audience', postData.audience);
    formData.append('allow_comments', postData.allow_comments);
    
    if (postData.media_type === 'text') {
      formData.append('text_alignment', postData.text_alignment);
    }

    updatePost(id, formData)
      .then(() => {
        showNotification('Post updated successfully!', 'success');
        handleClose();
      })
      .catch(err => {
        console.error('Error updating post:', err);
        showNotification('Failed to update post.', 'error');
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      setSaving(true);
      deletePost(id)
        .then(() => {
          showNotification('Post deleted successfully!', 'success');
          handleClose();
        })
        .catch(err => {
          console.error('Error deleting post:', err);
          showNotification('Failed to delete post.', 'error');
          setSaving(false);
        });
    }
  };

  const isTextOnly = postData.media_type === 'text';

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 bg-white/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div
        className={`bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md transition-all duration-200 relative ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#3b82f6]">Edit Post</h1>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b82f6]"></div>
          </div>
        ) : (
          <div className="space-y-4 flex flex-col">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
              <textarea
                rows={4}
                value={postData.caption}
                onChange={(e) => setPostData({ ...postData, caption: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#3b82f6] focus:border-[#3b82f6] resize-none"
                placeholder="Write a caption..."
                disabled={saving}
              />
              <p className={`text-xs text-right mt-1 ${postData.caption.length > MAX_CAPTION_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                {postData.caption.length} / {MAX_CAPTION_LENGTH}
              </p>
            </div>

            {isTextOnly && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
                <div className="flex space-x-4">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      onClick={() => setPostData({ ...postData, text_alignment: align })}
                      className={`px-4 py-2 text-sm font-medium rounded-md border ${postData.text_alignment === align ? 'bg-[#3b82f6] text-white border-[#3b82f6]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Audience</label>
                <select
                  value={postData.audience}
                  onChange={(e) => setPostData({ ...postData, audience: e.target.value })}
                  disabled={saving}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#3b82f6] focus:border-[#3b82f6] sm:text-sm rounded-md"
                >
                  <option value="public">Public</option>
                  <option value="followers">Followers</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={!postData.allow_comments}
                  onChange={(e) => setPostData({ ...postData, allow_comments: !e.target.checked })}
                  disabled={saving}
                  className="h-4 w-4 text-[#3b82f6] focus:ring-[#3b82f6] border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Disable comments</label>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={handleDelete}
                disabled={saving}
                className="py-2 px-4 text-sm font-semibold text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition duration-200"
              >
                Delete
              </button>
              <div className="space-x-3">
                <button
                  onClick={handleClose}
                  disabled={saving}
                  className="py-2 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-md transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving || postData.caption.length > MAX_CAPTION_LENGTH}
                  className="py-2 px-6 bg-[#3b82f6] text-white rounded-md font-semibold hover:bg-[#3b82f6]/90 transition duration-200 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default EditPostModal;
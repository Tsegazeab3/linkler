import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import MediaSelection from './MediaSelection';
import PostDetails from './PostDetails';

const CreatePostModal = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [postMode, setPostMode] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileType, setFileType] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect for enter animation and body cleanup
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setShow(true); // Trigger the "enter" animation

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleFileSelect = (files, type) => {
    setSelectedFiles(files);
    setFileType(type);
    setPostMode('media');
  };

  const handleTextOnly = () => {
    setPostMode('text');
  };

  const handleBack = () => {
    setSelectedFiles([]);
    setFileType(null);
    setPostMode(null);
  };

  const handleClose = () => {
    setShow(false); // Trigger the "leave" animation
    setTimeout(() => {
      navigate(-1); // Navigate back after the animation
    }, 200); // Should match the duration of the transition
  };

  const getTitle = () => {
    if (postMode) return 'Finalize Your Post';
    return 'Create a New Post';
  };

  const getSubtitle = () => {
    if (postMode === 'media') return 'Add a caption and share your media.';
    if (postMode === 'text') return 'Write your post and share with your followers.';
    return 'Select media or start a text-only post.';
  };

  const containerWidth = postMode ? 'max-w-5xl' : 'max-w-md';

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 bg-ui-white/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div
        className={`bg-ui-white p-6 md:p-8 rounded-lg shadow-xl w-full ${containerWidth} transition-all duration-200 relative ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} border border-ui-border/50`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-ui-muted hover:text-ui-text-main z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-ui-text-main">
            {getTitle()}
          </h1>
          <p className="text-ui-text-secondary mt-2 text-sm">
            {getSubtitle()}
          </p>
        </div>

        {postMode ? (
          <PostDetails
            files={selectedFiles}
            fileType={fileType}
            onBack={handleBack}
            postMode={postMode}
            onSuccess={handleClose} // Pass the close handler
          />
        ) : (
          <MediaSelection
            onFileSelect={handleFileSelect}
            onTextOnly={handleTextOnly}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default CreatePostModal;

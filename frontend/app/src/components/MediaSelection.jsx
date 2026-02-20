import React, { useRef } from 'react';

const MediaSelection = ({ onFileSelect, onTextOnly, isMobile }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const type = file.type.startsWith('image') ? 'image' : 'video';
      onFileSelect(file, type);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current.setAttribute('capture', 'camera');
    fileInputRef.current.click();
  };

  const handleGalleryClick = () => {
    fileInputRef.current.removeAttribute('capture');
    fileInputRef.current.click();
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (file) {
      const type = file.type.startsWith('image') ? 'image' : 'video';
      onFileSelect(file, type);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <input
        type="file"
        accept="image/*,video/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {isMobile ? (
        // Mobile UI
        <div className="flex flex-col space-y-4">
          <button onClick={handleCameraClick} className="w-full py-3 px-4 bg-[#3b82f6] text-white rounded-md text-lg font-semibold hover:bg-[#3b82f6]/90 transition duration-200 flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span>Open Camera</span>
          </button>
          <button onClick={handleGalleryClick} className="w-full py-3 px-4 border-2 border-gray-400 text-gray-600 rounded-md text-lg font-semibold hover:bg-gray-50 transition duration-200 flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>Select from Gallery</span>
          </button>
        </div>
      ) : (
        // Desktop UI
        <div className="border-2 border-dashed border-gray-400 rounded-lg p-12 text-center cursor-pointer hover:border-[#3b82f6] transition duration-200 group" onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}>
          <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-[#3b82f6]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <p className="mb-2 text-xl font-semibold">Drag & Drop photos or videos</p>
            <p className="text-sm">or click to browse files</p>
          </div>
        </div>
      )}

      {/* Separator and Text-Only Option */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-2 text-sm text-gray-500">OR</span>
        </div>
      </div>

      <button
        onClick={onTextOnly}
        className="w-full text-center text-[#3b82f6] font-semibold hover:underline"
      >
        Write a text-only post
      </button>
    </div>
  );
};

export default MediaSelection;
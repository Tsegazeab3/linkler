import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, UploadCloud } from "lucide-react";

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
    <div className="max-w-md mx-auto space-y-6">
      <input
        type="file"
        accept="image/*,video/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {isMobile ? (
        // Mobile UI
        <div className="grid gap-4">
          <Button
            onClick={handleCameraClick}
            size="lg"
            className="h-14 text-lg font-semibold shadow-md active:scale-95 transition-all"
          >
            <Camera className="mr-2 h-6 w-6" />
            Open Camera
          </Button>
          <Button
            onClick={handleGalleryClick}
            variant="outline"
            size="lg"
            className="h-14 text-lg font-semibold border-2 hover:bg-muted active:scale-95 transition-all"
          >
            <ImageIcon className="mr-2 h-6 w-6" />
            Select from Gallery
          </Button>
        </div>
      ) : (
        // Desktop UI
        <div
          className="relative group cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-brand to-accent-indigo rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-ui-border rounded-2xl p-16 bg-ui-white hover:border-brand/50 transition duration-300">
            <div className="p-4 rounded-full bg-brand/5 mb-6 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="h-12 w-12 text-brand" strokeWidth={1.5} />
            </div>
            <p className="mb-2 text-xl font-bold tracking-tight text-ui-text-main">
              Drag & Drop photos or videos
            </p>
            <p className="text-sm text-ui-muted font-medium">
              or click to browse your files
            </p>
          </div>
        </div>
      )}

      {/* Separator and Text-Only Option */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-ui-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest text-ui-muted/60">
          <span className="bg-ui-white px-4">OR</span>
        </div>
      </div>

      <div className="text-center">
        <Button
          variant="link"
          onClick={onTextOnly}
          className="text-primary font-bold text-lg  hover:text-primary/80 hover:underline transition-colors"

        >
          Continue with text only
        </Button>
      </div>
    </div>
  );
};

export default MediaSelection;

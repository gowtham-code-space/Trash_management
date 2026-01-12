import React from "react";
import { X } from "../../../assets/icons/icons";

function ImageViewerModal({ isOpen, imageUrl, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl w-full max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-2 bg-white/10 rounded-full
                  hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                  transition-all duration-200 ease-in-out"
        >
          <X size={24} defaultColor="#ffffff" />
        </button>
        
        <img
          src={imageUrl}
          alt="Full size"
          className="w-full h-full object-contain rounded-large"
        />
      </div>
    </div>
  );
}

export default ImageViewerModal;
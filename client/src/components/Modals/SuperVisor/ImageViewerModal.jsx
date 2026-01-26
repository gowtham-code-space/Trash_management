import React from "react";
import { X } from "../../../assets/icons/icons";

function ImageViewerModal({ isOpen, imageUrl, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl w-full h-auto flex flex-col items-center justify-center animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-6 -right-3 sm:-top-6 sm:-right-3 z-10 p-3 bg-white rounded-full shadow-lg
                  hover:bg-secondary hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50
                  transition-all duration-200 ease-in-out group"
        >
          <X size={20} defaultColor="#145B47" />
        </button>
        
        {/* Image Container */}
        <div className="relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-white">
          <img
            src={imageUrl}
            alt="Full size"
            className="w-full h-auto max-h-[85vh] object-contain"
          />
          
          {/* Image Info Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-4">
            <p className="text-xs text-white font-medium text-center">Click outside to close</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageViewerModal;
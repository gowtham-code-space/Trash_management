import React, { useState } from "react";
import { Star, Check, Add } from "../../../assets/icons/icons";
import ToastNotification from "../../../components/Notification/ToastNotification";

function FeedbackModal({ collector, onClose }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    function handleSubmit() {
        if (rating === 0) {
        ToastNotification("Please select a star rating", "warning");
        return;
        }
        setLoading(true);
        // Simulation of API call
        setTimeout(function() {
        setLoading(false);
        ToastNotification("Feedback submitted successfully!", "success");
        onClose();
        }, 1500);
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={onClose}
        />

        {/* Modal Card */}
        <div className="relative bg-white border border-secondary rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center">
            
            {/* Profile Image */}
            <div className="relative mb-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-primaryLight shadow-md">
                <img src={collector.avatar} alt="TrashMan" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-success text-white p-1 rounded-lg border-2 border-white shadow-sm">
                <Check size={14} isPressed={false} isDarkTheme={true} />
            </div>
            </div>

            {/* Collector Details */}
            <div className="text-center mb-6">
            <h2 className="text-base font-bold text-black uppercase tracking-tight">{collector.name}</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {collector.id}</p>
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map(function(num) {
                return (
                <button 
                    key={num}
                    onClick={function() { setRating(num); }}
                    className="transition-transform active:scale-75 hover:scale-110"
                >
                    <Star 
                    size={28} 
                    isPressed={num <= rating} 
                    isDarkTheme={false} 
                    OnpressColor="#F2C94C" 
                    />
                </button>
                );
            })}
            </div>

            {/* Comment Area */}
            <div className="w-full mb-6">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                Share your experience
            </label>
            <textarea 
                rows="3"
                value={comment}
                onChange={function(e) { setComment(e.target.value); }}
                placeholder="Help us improve our service..."
                className="w-full p-3 bg-background border border-secondary rounded-lg text-xs focus:border-primaryLight focus:outline-none transition-colors resize-none placeholder:italic"
            />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 w-full">
            <button 
                onClick={onClose}
                className="py-3 bg-background border border-secondary rounded-lg text-xs font-bold text-gray-500 hover:bg-secondary transition-all active:scale-95"
            >
                Cancel
            </button>
            <button 
                onClick={handleSubmit}
                disabled={loading}
                className="py-3 bg-primaryLight text-white rounded-lg text-xs font-bold shadow-lg shadow-primaryLight/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {loading ? "Sending..." : (
                <>
                    Submit
                    <Add size={14} isPressed={false} isDarkTheme={true} />
                </>
                )}
            </button>
            </div>
        </div>
        </div>
    );
}

export default FeedbackModal;
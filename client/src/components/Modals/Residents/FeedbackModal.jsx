import React, { useState } from "react";
import { Star, Check, Add, X } from "../../../assets/icons/icons";
import ToastNotification from "../../../components/Notification/ToastNotification";
import ThemeStore from "../../../store/ThemeStore";

function FeedbackModal({ collector, onClose }) {
    const { isDarkTheme } = ThemeStore();
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
        <div className={isDarkTheme ? "dark" : ""}>
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div 
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={onClose}
        />

        <div className="relative bg-white border border-secondary rounded-veryLarge p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-medium bg-background hover:bg-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
            >
                <X size={18} defaultColor="#316F5D" />
            </button>

            <div className="flex flex-col items-center">
            <div className="relative mb-6">
                <div className="w-28 h-28 rounded-veryLarge overflow-hidden border-4 border-primaryLight shadow-xl">
                    <img src={collector.avatar} alt="Waste Collector" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-success p-2 rounded-large shadow-lg">
                    <Check size={18} isPressed={false} isDarkTheme={true} />
                </div>
            </div>

            <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-primary uppercase tracking-tight">{collector.name}</h2>
                <p className="text-sm text-secondaryDark mt-2 bg-secondary px-4 py-1 rounded-large inline-block">ID: {collector.id}</p>
            </div>

            <div className="w-full mb-8">
                <label className="text-sm font-bold text-secondaryDark uppercase tracking-wide mb-4 block text-center">
                    Rate Your Experience
                </label>
                <div className="flex items-center justify-center gap-3 bg-background rounded-veryLarge p-4">
                {[1, 2, 3, 4, 5].map(function(num) {
                    return (
                    <button 
                        key={num}
                        onClick={function() { setRating(num); }}
                        className="p-2 hover:scale-[1.15] active:scale-[0.95] focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-medium transition-all duration-200 ease-in-out"
                    >
                        <Star 
                        size={36} 
                        isPressed={num <= rating} 
                        isDarkTheme={false} 
                        OnpressColor="#F2C94C" 
                        />
                    </button>
                    );
                })}
                </div>
            </div>

            <div className="w-full mb-8">
                <label className="text-sm font-bold text-secondaryDark uppercase tracking-wide mb-3 block">
                    Share Your Feedback
                </label>
                <textarea 
                    rows="5"
                    value={comment}
                    onChange={function(e) { setComment(e.target.value); }}
                    placeholder="Tell us about your experience with the waste collection service..."
                    className="w-full p-4 bg-background border-2 border-secondary rounded-large text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primaryLight transition-all duration-200 ease-in-out resize-none placeholder:text-secondaryDark/50"
                />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                    onClick={onClose}
                    className="py-4 bg-background border-2 border-secondary rounded-large text-sm font-bold text-secondaryDark hover:bg-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSubmit}
                    disabled={loading || rating === 0}
                    className="py-4 bg-primary text-white rounded-large text-sm font-bold shadow-lg hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Submitting..." : (
                    <>
                        Submit Feedback
                        <Check size={18} isPressed={false} isDarkTheme={true} />
                    </>
                    )}
                </button>
            </div>
            </div>
        </div>
        </div>
        </div>
    );
}

export default FeedbackModal;
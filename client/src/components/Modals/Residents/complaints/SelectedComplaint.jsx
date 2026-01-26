import React from 'react';
import { X } from '../../../../assets/icons/icons';
import ToastNotification from '../../../Notification/ToastNotification';

function SelectedComplaint({ isOpen, onClose, complaint }) {
  if (!isOpen || !complaint) return null;

  function handleYesCorrect() {
    ToastNotification('Thank you for confirming the complaint', 'success');
    onClose();
  }

  function handleNoGone() {
    ToastNotification('Thank you for your feedback', 'success');
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-medium md:rounded-large w-full max-w-lg overflow-hidden animate-in zoom-in slide-in-from-bottom-2 duration-300 shadow-2xl max-h-[95vh] md:max-h-none overflow-y-auto">
        
        {/* Header with Image */}
        <div className="relative h-40 md:h-48 bg-linear-to-br from-primary to-primaryLight overflow-hidden">
          <img
            src={complaint.image}
            alt={complaint.type}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 md:top-4 md:right-4 p-1.5 md:p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 hover:scale-[1.1] active:scale-[0.95] shadow-lg"
          >
            <X size={18} defaultColor="#145B47" className="md:w-5 md:h-5" />
          </button>

          {/* Status Badge */}
          <div className="absolute top-3 left-3 md:top-4 md:left-4">
            <span className="px-2.5 py-1 md:px-3 md:py-1.5 bg-warning/90 backdrop-blur-sm text-primary text-[10px] md:text-xs font-bold rounded-small md:rounded-medium shadow-lg">
              {complaint.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Complaint Info */}
          <div className="mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-bold text-primary mb-1.5 md:mb-2">{complaint.type}</h3>
            <p className="text-xs md:text-sm text-primary/60 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primaryLight rounded-full" />
              Reported {complaint.reportedTime} by {complaint.reportedBy}
            </p>
          </div>

          {/* Verification Section */}
          <div className="bg-secondary rounded-medium md:rounded-large p-4 md:p-5 mb-4 md:mb-6">
            <h4 className="text-xs md:text-sm font-bold text-primary mb-1.5 md:mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-primaryLight rounded-full animate-pulse" />
              Is this information correct?
            </h4>
            <p className="text-xs md:text-sm text-primary/70 mb-3 md:mb-4">
              Confirm that the trash is still present and the location is accurate.
            </p>

            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <button
                onClick={handleYesCorrect}
                className="bg-success text-white py-3 md:py-3.5 px-3 md:px-4 rounded-small md:rounded-medium font-bold text-xs md:text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-success/30 shadow-lg hover:shadow-xl"
              >
                Yes, it's correct
              </button>
              <button
                onClick={handleNoGone}
                className="bg-error text-white py-3 md:py-3.5 px-3 md:px-4 rounded-small md:rounded-medium font-bold text-xs md:text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-error/30 shadow-lg hover:shadow-xl"
              >
                No, it's gone
              </button>
            </div>
          </div>

          {/* Community Votes */}
          <div className="flex items-center justify-between pt-4 md:pt-5 border-t border-primary/10 gap-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center -space-x-2">
                <img 
                  src="https://i.pravatar.cc/32?img=1" 
                  alt="voter" 
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white shadow-md" 
                />
                <img 
                  src="https://i.pravatar.cc/32?img=2" 
                  alt="voter" 
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white shadow-md" 
                />
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white shadow-md bg-primaryLight flex items-center justify-center">
                  <span className="text-[10px] md:text-xs font-bold text-white">+{complaint.votes.yes + complaint.votes.no - 2}</span>
                </div>
              </div>
              <span className="text-[10px] md:text-xs font-medium text-primary/60">Community</span>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <div className="text-right">
                <span className="text-[10px] md:text-xs text-primary/50 block">Yes</span>
                <span className="text-xs md:text-sm font-bold text-success">{complaint.votes.yes}</span>
              </div>
              <div className="w-px h-6 md:h-8 bg-primary/10" />
              <div className="text-right">
                <span className="text-[10px] md:text-xs text-primary/50 block">No</span>
                <span className="text-xs md:text-sm font-bold text-error">{complaint.votes.no}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectedComplaint;
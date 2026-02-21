import React from 'react';
import { Location } from '../../../assets/icons/icons';
import ToastNotification from '../../../components/Notification/ToastNotification';

function ComplaintCard({ complaint, onClick }) {

  return (
    <div
      onClick={() => {ToastNotification('Showing location', 'info'), onClick(complaint)}}
      className="flex gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-medium border border-primary/10 cursor-pointer transition-all duration-200 hover:scale-[0.99] hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <img
        src={complaint.image}
        alt={complaint.type}
        className="w-16 h-16 md:w-20 md:h-20 rounded-small md:rounded-medium object-cover"
      />
      
      <div className="flex-1 flex flex-col gap-1.5 md:gap-2 min-w-0">
        <div className="flex items-start justify-between gap-2 md:gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-semibold text-primary truncate">{complaint.type}</h3>
            <p className="text-xs md:text-sm text-primary/60 truncate">
              Reported {complaint.reportedTime} by {complaint.reportedBy}
            </p>
          </div>
          <span className="px-2 md:px-3 py-1 bg-warning/20 text-primary text-[10px] md:text-xs font-medium rounded-small whitespace-nowrap ">
            {complaint.status}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-primaryLight px-1 md:px-2 py-1">
            <Location size={14} defaultColor="#1E8E54" className="md:w-4 md:h-4 " />
            <span className="hidden sm:inline">Show Location</span>
            <span className="sm:hidden">Location</span>
          </div>
          
          <span className={`text-[10px] md:text-xs md:font-medium font-bold ${complaint.votedByUser ? 'text-success' : 'text-error'}`}>
            {complaint.votedByUser ? 'Voted' : 'Not Voted'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ComplaintCard;
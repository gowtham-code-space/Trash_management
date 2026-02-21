import { X } from '../../../../assets/icons/icons';
import Pagination from '../../../../utils/Pagination';
import ComplaintCard from '../../../Cards/Residents/ComplaintCard';

function AllComplaints({ isOpen, onClose, complaints, onSelectComplaint }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-background rounded-large w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300 shadow-xl">
        <div className="sticky top-0 bg-primary text-white p-6 flex items-center justify-between">
          <h2 className="text-base md:text-xl font-semibold">All Complaints</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 hover:scale-[0.99] active:scale-[0.98]"
          >
            <X size={24} defaultColor="#ffffff" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
          <Pagination
            data={complaints}
            itemsPerPage={5}
            renderItem={function(complaint) {
              return (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  onClick={onSelectComplaint}
                />
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default AllComplaints;
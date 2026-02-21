import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import ToastNotification from '../../components/Notification/ToastNotification';
import AllComplaints from '../../components/Modals/Residents/complaints/AllComplaints';
import SelectedComplaint from '../../components/Modals/Residents/complaints/SelectedComplaint';
import { Expand } from '../../assets/icons/icons';
import ThemeStore from '../../store/ThemeStore';

const mockComplaints = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=400',
    type: 'Mixed Waste',
    location: { lat: 37.7749, lon: -122.4194, address: 'Near School Entrance' },
    status: 'Pending',
    reportedBy: 'Priya',
    reportedTime: '12 min ago',
    votes: { yes: 23, no: 4 },
    votedByUser: false
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400',
    type: 'Plastic Waste',
    location: { lat: 37.7849, lon: -122.4294, address: 'Park Avenue' },
    status: 'Pending',
    reportedBy: 'John',
    reportedTime: '1 hour ago',
    votes: { yes: 15, no: 2 },
    votedByUser: true
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400',
    type: 'Organic Waste',
    location: { lat: 37.7649, lon: -122.4394, address: 'Main Street' },
    status: 'Pending',
    reportedBy: 'Sarah',
    reportedTime: '3 hours ago',
    votes: { yes: 8, no: 1 },
    votedByUser: false
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=400',
    type: 'Electronic Waste',
    location: { lat: 37.7549, lon: -122.4494, address: 'Tech Plaza' },
    status: 'Pending',
    reportedBy: 'Mike',
    reportedTime: '5 hours ago',
    votes: { yes: 12, no: 3 },
    votedByUser: false
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1583624369574-7b2d06c7e925?w=400',
    type: 'Glass Waste',
    location: { lat: 37.7449, lon: -122.4594, address: 'Beach Road' },
    status: 'Pending',
    reportedBy: 'Emma',
    reportedTime: '8 hours ago',
    votes: { yes: 6, no: 0 },
    votedByUser: true
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1628863353691-0071c8c1874c?w=400',
    type: 'Paper Waste',
    location: { lat: 37.7349, lon: -122.4694, address: 'Library Street' },
    status: 'Pending',
    reportedBy: 'David',
    reportedTime: '10 hours ago',
    votes: { yes: 19, no: 5 },
    votedByUser: false
  }
];

function Map() {
  const [showAllComplaints, setShowAllComplaints] = useState(false);
  const [showSelectedComplaint, setShowSelectedComplaint] = useState(false);
  const [showPreviewCard, setShowPreviewCard] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const { isDarkTheme } = ThemeStore();

  function handleViewComplaints() {
    setShowAllComplaints(true);
  }

  function handleSelectComplaint(complaint) {
    setSelectedComplaint(complaint);
    setShowAllComplaints(false);
    setShowPreviewCard(true);
  }

  function handleExpandPreview() {
    setShowPreviewCard(false);
    setShowSelectedComplaint(true);
  }

  function handleCloseSelectedComplaint() {
    setShowSelectedComplaint(false);
    setShowPreviewCard(false);
    setSelectedComplaint(null);
  }

  return (
    <div className={isDarkTheme ? "dark" : ""}>
    <div className="w-full h-[calc(100vh-168px)] md:h-[calc(100vh-112px)] bg-background relative overflow-hidden">
      {/* Info Banner */}
      <div className="bg-primary text-white mb-3 md:mb-4 px-3 md:px-4 py-2.5 md:py-3 rounded-medium shadow-lg flex items-start animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-white flex items-center justify-center mr-2 mt-0.5">
          <span className="text-[10px] md:text-xs font-bold">i</span>
        </div>
        <p className="text-xs md:text-sm leading-relaxed">
          Help your city verify if reported issues are still present. Your vote keeps the map accurate.
        </p>
      </div>

      {/* Map Container with Buttons Overlay */}
      <div className="relative w-full h-[calc(100%-90px)] md:h-[calc(100%-72px)] rounded-medium overflow-hidden shadow-md">
        {/* Map Image */}
        <img
          src="https://tile.openstreetmap.org/14/4824/6156.png"
          alt="Map"
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Container for Buttons */}
        <div className="absolute inset-0 pointer-events-none">
          {/* View Complaints Button - Bottom Left */}
          <button
            onClick={() => handleViewComplaints()}
            className={`${isDarkTheme ? "bg-primary text-white" : "bg-white text-primary"} pointer-events-auto absolute bottom-4 left-4 md:bottom-6 md:left-6 px-4 py-2.5 md:px-4 md:py-3 rounded-large shadow-lg font-semibold text-xs md:text-sm hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20`}
          >
            <span className="flex items-center gap-2">
              <span className="hidden sm:inline">View Complaints</span>
              <span className="sm:hidden">Complaints</span>
              {mockComplaints.length > 0 && (
                <span className="w-5 h-5 md:w-6 md:h-6 z-10 absolute -top-2 -right-2 bg-error text-white text-[10px] md:text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                  {mockComplaints.length}
                </span>
              )}
            </span>
          </button>

          {/* Preview Card - Bottom Right */}
          {showPreviewCard && selectedComplaint && (
            <div 
              onClick={handleExpandPreview}
              className={`${isDarkTheme ? "bg-primary text-white": "bg-white text-primary"} pointer-events-auto absolute bottom-4 right-4 md:bottom-6 md:right-6 rounded-large shadow-xl p-2.5 md:p-3 flex items-center gap-2 md:gap-3 cursor-pointer hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 animate-in slide-in-from-right-4 fade-in w-[calc(100vw-120px)] max-w-44 md:max-w-[320px]`}
            >
              <img
                src={selectedComplaint.image}
                alt={selectedComplaint.type}
                className="w-12 h-12 md:w-16 md:h-16 rounded-medium object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs md:text-sm font-semibold truncate">{selectedComplaint.type}</h4>
                <p className="text-[10px] md:text-xs truncate">{selectedComplaint.reportedTime}</p>
              </div>
              <div className="p-1.5 md:p-2 bg-secondary rounded-medium">
                <Expand size={14} defaultColor={`${isDarkTheme? "white":"#145B47"}`}/>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AllComplaints
        isOpen={showAllComplaints}
        onClose={() => setShowAllComplaints(false)}
        complaints={mockComplaints}
        onSelectComplaint={handleSelectComplaint}
      />

      <SelectedComplaint
        isOpen={showSelectedComplaint}
        onClose={handleCloseSelectedComplaint}
        complaint={selectedComplaint}
      />
      
      <ToastContainer />
    </div>
    </div>
  );
}

export default Map;
import React, { useState } from "react";
import ThemeStore from "../../../store/ThemeStore";
import Pagination from "../../../utils/Pagination";
import { Certificate, Task, Star, Check, QR } from "../../../assets/icons/icons";
import { useNavigate } from "react-router-dom";
// Mock data for quiz history
const quizHistory = [
  {
    id: 1,
    title: "Hazardous Waste Safety",
    completedTime: "Completed 2 hours ago",
    score: null,
    status: "Passed"
  },
  {
    id: 2,
    title: "Route Optimization Basics",
    completedTime: "Completed yesterday",
    score: "75%",
    status: "Passed"
  },
  {
    id: 3,
    title: "Emergency Protocols",
    completedTime: "Failed 3 days ago",
    score: "45%",
    status: "Retake"
  },
  {
    id: 4,
    title: "Vehicle Maintenance Standards",
    completedTime: "Completed 5 days ago",
    score: "92%",
    status: "Passed"
  },
  {
    id: 5,
    title: "Customer Service Excellence",
    completedTime: "Completed 1 week ago",
    score: "88%",
    status: "Passed"
  },
  {
    id: 6,
    title: "Safety Equipment Usage",
    completedTime: "Completed 2 weeks ago",
    score: "95%",
    status: "Passed"
  }
];

// Mock certificates data with images
const certificates = [
  { 
    id: 1, 
    title: "Hazardous Waste Certification", 
    date: "Jan 2026", 
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop"
  },
  { 
    id: 2, 
    title: "Route Optimization Expert", 
    date: "Dec 2025", 
    image: "https://images.unsplash.com/photo-1590930267836-9fc8c34d7bb0?w=400&h=300&fit=crop"
  },
  { 
    id: 3, 
    title: "Emergency Response", 
    date: "Nov 2025", 
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=300&fit=crop"
  },
  { 
    id: 4, 
    title: "Safety Champion", 
    date: "Oct 2025", 
    image: "https://images.unsplash.com/photo-1586076544947-576eab5fd665?w=400&h=300&fit=crop"
  },
  { 
    id: 5, 
    title: "Advanced Protocols", 
    date: "Sep 2025", 
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop"
  }
];

function Quiz() {
  const navigate = useNavigate();
  const { isDarkTheme } = ThemeStore();
  const [hoveredCert, setHoveredCert] = useState(null);

  const getIconColor = function(status) {
    if (status === "Passed") return "#1E8E54";
    if (status === "Retake") return "#E75A4C";
    return "#F2C94C";
  };

  const getIconBg = function(status) {
    if (status === "Passed") return isDarkTheme ? "bg-primaryLight/20" : "bg-secondary";
    if (status === "Retake") return isDarkTheme ? "bg-[#E75A4C]/20" : "bg-[#FFF5F5]";
    return isDarkTheme ? "bg-[#F2C94C]/20" : "bg-[#FFFBF0]";
  };

  return (
    <div className={`min-h-screen ${isDarkTheme ? "bg-darkBackground" : "bg-background"}`}>
      {/* Header Card - Primary Green */}
      <div className="p-6 rounded-large mb-6 bg-primary">
        <h3 className="text-base font-semibold text-white mb-2">
          Ready to test your knowledge?
        </h3>
        
        <p className="text-sm text-white/90 mb-4">
          Take the new "Advanced Recycling Protocols" quiz to earn your monthly badge.
        </p>
        <button onClick={()=>navigate("/take-quiz")} className="text:xs md:text-base bg-primaryLight p-2 px-3 rounded-medium text-white font-medium">Start quiz</button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-large ${isDarkTheme ? "bg-darkSurface border border-darkBorder" : "bg-white border border-gray-100"}`}>
          <div className={`w-10 h-10 rounded-medium flex items-center justify-center mb-2 ${isDarkTheme ? "bg-primaryLight/20" : "bg-secondary"}`}>
            <Task size={20} defaultColor={isDarkTheme ? "#1E8E54" : "#145B47"} isDarkTheme={isDarkTheme} />
          </div>
          <p className={`text-xl font-semibold ${isDarkTheme ? "text-darkTextPrimary" : "text-gray-900"}`}>12</p>
          <p className={`text-xs ${isDarkTheme ? "text-darkTextSecondary" : "text-gray-500"}`}>Quizzes Taken</p>
        </div>

        <div className={`p-4 rounded-large ${isDarkTheme ? "bg-darkSurface border border-darkBorder" : "bg-white border border-gray-100"}`}>
          <div className={`w-10 h-10 rounded-medium flex items-center justify-center mb-2 ${isDarkTheme ? "bg-primaryLight/20" : "bg-secondary"}`}>
            <Star size={20} defaultColor={isDarkTheme ? "#1E8E54" : "#145B47"} isDarkTheme={isDarkTheme} />
          </div>
          <p className={`text-xl font-semibold ${isDarkTheme ? "text-darkTextPrimary" : "text-gray-900"}`}>85%</p>
          <p className={`text-xs ${isDarkTheme ? "text-darkTextSecondary" : "text-gray-500"}`}>Avg. Score</p>
        </div>

        <div className={`p-4 rounded-large ${isDarkTheme ? "bg-darkSurface border border-darkBorder" : "bg-white border border-gray-100"}`}>
          <div className={`w-10 h-10 rounded-medium flex items-center justify-center mb-2 ${isDarkTheme ? "bg-primaryLight/20" : "bg-secondary"}`}>
            <Certificate size={20} defaultColor={isDarkTheme ? "#1E8E54" : "#145B47"} isDarkTheme={isDarkTheme} />
          </div>
          <p className={`text-xl font-semibold ${isDarkTheme ? "text-darkTextPrimary" : "text-gray-900"}`}>4</p>
          <p className={`text-xs ${isDarkTheme ? "text-darkTextSecondary" : "text-gray-500"}`}>Certificates</p>
        </div>
      </div>

      {/* Quiz History Section */}
      <div className={`p-6 rounded-large mb-6 ${isDarkTheme ? "bg-darkSurface border border-darkBorder" : "bg-white border border-gray-100"}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-semibold ${isDarkTheme ? "text-darkTextPrimary" : "text-gray-900"}`}>
            Recent Quiz History
          </h2>
          <button
            className={`text-sm font-medium hover:underline
                      ${isDarkTheme ? "text-primaryLight" : "text-primary"}
                      hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out
                      focus:outline-none focus:ring-2 focus:ring-primary/20`}
          >
            View All
          </button>
        </div>

        <Pagination
          data={quizHistory}
          itemsPerPage={5}
          renderItem={function(item) {
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-medium mb-3
                          ${isDarkTheme ? "bg-darkBackground hover:bg-darkSurfaceHover" : "bg-gray-50 hover:bg-gray-100"}
                          hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out cursor-pointer`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-medium flex items-center justify-center ${getIconBg(item.status)}`}>
                    {item.status === "Passed" ? (
                      <Check size={20} defaultColor={getIconColor(item.status)} />
                    ) : (
                      <Task size={20} defaultColor={getIconColor(item.status)} />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkTheme ? "text-darkTextPrimary" : "text-gray-900"}`}>
                      {item.title}
                    </p>
                    <p className={`text-xs ${isDarkTheme ? "text-darkTextSecondary" : "text-gray-500"}`}>
                      {item.completedTime}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {item.score && (
                    <p className={`text-sm font-semibold ${isDarkTheme ? "text-darkTextPrimary" : "text-gray-900"}`}>
                      {item.score}
                    </p>
                  )}
                  <p className={`text-xs ${item.status === "Passed" ? "text-[#1E8E54]" : "text-error"}`}>
                    {item.status}
                  </p>
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* Certificates Horizontal Scroll */}
      <div className={`p-6 rounded-large ${isDarkTheme ? "bg-darkSurface border border-darkBorder" : "bg-white border border-gray-100"}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDarkTheme ? "text-darkTextPrimary" : "text-gray-900"}`}>
          My Certificates
        </h2>
        
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {certificates.map(function(cert) {
            return (
              <div
                key={cert.id}
                className="relative min-w-50 h-35 rounded-large overflow-hidden cursor-pointer
                          hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out"
                onMouseEnter={() => setHoveredCert(cert.id)}
                onMouseLeave={() => setHoveredCert(null)}
              >
                <img 
                  src={cert.image} 
                  alt={cert.title}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute bottom-0 left-0 right-0  p-3">
                  <p className="text-xs font-medium text-white">
                    {cert.title}
                  </p>
                  <p className="text-xs text-white/70">
                    {cert.date}
                  </p>
                </div>

                {hoveredCert === cert.id && (
                  <div className="absolute inset-0 rounded-large flex items-center justify-center bg-primary/70 
                                  animate-in fade-in duration-200">
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-medium text-sm font-medium
                                bg-primary text-white
                                hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out
                                focus:outline-none focus:ring-2 focus:ring-white/20"
                    >
                      <Certificate size={18} defaultColor="#fff" />
                      View Certificate
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default Quiz;
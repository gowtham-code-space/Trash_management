import React, { useState, useEffect } from "react";
import ThemeStore from "../../../store/ThemeStore";
import Pagination from "../../../utils/Pagination";
import ReviewQuizModal from "../../../components/Modals/Quiz/ReviewQuizModal";
import ShowCertificateModal from "../../../components/Modals/Quiz/ShowCertificateModal";
import { Certificate, Task, Star, Check, QR } from "../../../assets/icons/icons";
import { useNavigate } from "react-router-dom";
import { getQuizStats, getQuizHistory, startQuiz, getQuizReview, getCertificateUrl } from "../../../services/features/quizService";
import ToastNotification from "../../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";

function Quiz() {
  const navigate = useNavigate();
  const { isDarkTheme } = ThemeStore();
  const [hoveredCert, setHoveredCert] = useState(null);
  const [stats, setStats] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedQuizReview, setSelectedQuizReview] = useState(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Fetch quiz data on mount
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setIsLoading(true);
        const [statsResponse, historyResponse] = await Promise.all([
          getQuizStats(),
          getQuizHistory(1, 10)
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        if (historyResponse.success) {
          setQuizHistory(historyResponse.data.history || []);
          
          // Extract certificates from passed quizzes
          const passedQuizzes = (historyResponse.data.history || [])
            .filter(q => q.is_pass && q.certificate_url)
            .map((q, index) => ({
              id: q.quiz_id,
              title: `Quiz Certificate #${q.quiz_id}`,
              date: new Date(q.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
              image: q.certificate_url,
              quiz_id: q.quiz_id
            }));
          setCertificates(passedQuizzes);
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        ToastNotification('Failed to load quiz data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  const handleStartQuiz = async () => {
    try {
      setIsStarting(true);
      const response = await startQuiz();

      if (response.success) {
        navigate("/take-quiz", { state: { quizData: response.data } });
      } else if (response.hasIncomplete) {
        ToastNotification('Resuming your incomplete quiz...', 'info');
        navigate("/take-quiz", { state: { resumeQuizId: response.incompleteQuizId } });
      } else {
        ToastNotification(response.message || 'Failed to start quiz', 'error');
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      ToastNotification('Failed to start quiz', 'error');
    } finally {
      setIsStarting(false);
    }
  };

  const formatQuizHistory = (quiz) => {
    let completedTime;

    if (!quiz.has_completed) {
      completedTime = 'In Progress';
    } else {
      const quizDate = quiz.completed_at ? new Date(quiz.completed_at) : new Date(quiz.created_at);
      const now = new Date();
      const diffMs = now - quizDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) {
        completedTime = 'Completed just now';
      } else if (diffMins < 60) {
        completedTime = `Completed ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        completedTime = `Completed ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffDays === 1) {
        completedTime = 'Completed yesterday';
      } else if (diffDays < 7) {
        completedTime = `Completed ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        completedTime = `Completed ${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else {
        completedTime = quizDate.toLocaleDateString();
      }
    }

    return {
      id: quiz.quiz_id,
      title: `Quiz #${quiz.quiz_id}`,
      completedTime: completedTime,
      score: quiz.has_completed ? `${quiz.score}/${quiz.total_score}` : null,
      percentage: quiz.has_completed ? `${Math.round((quiz.score / quiz.total_score) * 100)}%` : null,
      status: !quiz.has_completed ? 'Resume' : quiz.is_pass ? 'Passed' : 'Failed'
    };
  };

  const getIconColor = function(status) {
    if (status === "Passed") return "#1E8E54";
    if (status === "Failed") return "#E75A4C";
    if (status === "Resume") return "#F2C94C";
    return "#F2C94C";
  };

  const getIconBg = function(status) {
    if (status === "Passed") return isDarkTheme ? "bg-primaryLight/20" : "bg-secondary";
    if (status === "Failed") return isDarkTheme ? "bg-[#E75A4C]/20" : "bg-[#FFF5F5]";
    return isDarkTheme ? "bg-[#F2C94C]/20" : "bg-[#FFFBF0]";
  };

  const handleViewQuizReview = async function(quizId) {
    try {
      setIsLoadingReview(true);
      const response = await getQuizReview(quizId);

      if (response.success) {
        setSelectedQuizReview(response.data);
        setShowReviewModal(true);
      } else {
        ToastNotification(response.message || 'Failed to load quiz review', 'error');
      }
    } catch (error) {
      console.error('Error loading quiz review:', error);
      ToastNotification('Failed to load quiz review', 'error');
    } finally {
      setIsLoadingReview(false);
    }
  };

  const handleViewCertificate = function(quizId) {
    const certificate = certificates.find(c => c.quiz_id === quizId);
    if (certificate) {
      setSelectedCertificate(certificate);
      setShowCertModal(true);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkTheme ? "bg-darkBackground" : "bg-background"} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className={isDarkTheme ? "text-darkTextSecondary" : "text-gray-500"}>Loading quiz data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkTheme ? "bg-darkBackground" : "bg-background"}`}>
      {/* Header Card - Primary Green */}
      <ToastContainer/>
      <div className="p-6 rounded-large mb-6 bg-primary">
        <h3 className="text-base font-semibold text-white mb-2">
          Ready to test your knowledge?
        </h3>
        
        <p className="text-sm text-white/90 mb-4">
          Take the quiz to test your knowledge and earn certificates.
        </p>
        <button 
          onClick={handleStartQuiz} 
          disabled={isStarting}
          className="text:xs md:text-base bg-primaryLight p-2 px-3 rounded-medium text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isStarting ? 'Starting...' : 'Start Quiz'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-large ${isDarkTheme ? "bg-darkSurface border border-darkBorder" : "bg-white border border-gray-100"}`}>
          <div className={`w-10 h-10 rounded-medium flex items-center justify-center mb-2 ${isDarkTheme ? "bg-primaryLight/20" : "bg-secondary"}`}>
            <Task size={20} defaultColor={isDarkTheme ? "#1E8E54" : "#145B47"} isDarkTheme={isDarkTheme} />
          </div>
          <p className={`text-xl font-semibold ${isDarkTheme ? "text-darkTextPrimary" : "text-gray-900"}`}>
            {stats?.total_attempts || 0}
          </p>
          <p className={`text-xs ${isDarkTheme ? "text-darkTextSecondary" : "text-gray-500"}`}>Quizzes Taken</p>
        </div>

        <div className={`p-4 rounded-large ${isDarkTheme ? "bg-darkSurface border border-darkBorder" : "bg-white border border-gray-100"}`}>
          <div className={`w-10 h-10 rounded-medium flex items-center justify-center mb-2 ${isDarkTheme ? "bg-primaryLight/20" : "bg-secondary"}`}>
            <Star size={20} defaultColor={isDarkTheme ? "#1E8E54" : "#145B47"} isDarkTheme={isDarkTheme} />
          </div>
          <p className={`text-xl font-semibold ${isDarkTheme ? "text-darkTextPrimary" : "text-gray-900"}`}>
            {stats?.average_score || 0}
          </p>
          <p className={`text-xs ${isDarkTheme ? "text-darkTextSecondary" : "text-gray-500"}`}>Avg. Score</p>
        </div>

        <div className={`p-4 rounded-large ${isDarkTheme ? "bg-darkSurface border border-darkBorder" : "bg-white border border-gray-100"}`}>
          <div className={`w-10 h-10 rounded-medium flex items-center justify-center mb-2 ${isDarkTheme ? "bg-primaryLight/20" : "bg-secondary"}`}>
            <Certificate size={20} defaultColor={isDarkTheme ? "#1E8E54" : "#145B47"} isDarkTheme={isDarkTheme} />
          </div>
          <p className={`text-xl font-semibold ${isDarkTheme ? "text-darkTextPrimary" : "text-gray-900"}`}>
            {stats?.passed_attempts || 0}
          </p>
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
          data={quizHistory.map(formatQuizHistory)}
          itemsPerPage={5}
          renderItem={function(item) {
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-medium mb-3
                          ${isDarkTheme ? "bg-darkBackground hover:bg-darkSurfaceHover" : "bg-gray-50 hover:bg-gray-100"}
                          hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out cursor-pointer`}
                onClick={function() {
                  if (item.status === 'Resume') {
                    navigate("/take-quiz", { state: { resumeQuizId: item.id } });
                  } else {
                    handleViewQuizReview(item.id);
                  }
                }}
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
                  <p className={`text-sm font-semibold ${
                    item.status === "Passed" ? "text-primaryLight" : 
                    item.status === "Failed" ? "text-error" : 
                    "text-warning"
                  }`}>
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
                onClick={(e) => {
                        e.stopPropagation();
                        handleViewCertificate(cert.quiz_id);
                      }}
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
              </div>
            );
          })}
        </div>
      </div>

      {showReviewModal && selectedQuizReview && (
        <ReviewQuizModal
          isOpen={showReviewModal}
          quizData={selectedQuizReview}
          onClose={function() {
            setShowReviewModal(false);
            setSelectedQuizReview(null);
          }}
        />
      )}

      {/* Certificate Modal */}
      <ShowCertificateModal 
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        certificateUrl={selectedCertificate?.image}
        quizId={selectedCertificate?.quiz_id}
      />

    </div>
  );
}

export default Quiz;
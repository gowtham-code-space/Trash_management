import React, { useState, useEffect } from "react";
import ThemeStore from "../../../store/ThemeStore";
import Pagination from "../../../utils/Pagination";
import ReviewQuizModal from "../../../components/Modals/Quiz/ReviewQuizModal";
import ShowCertificateModal from "../../../components/Modals/Quiz/ShowCertificateModal";
import DateRangePicker from "../../../components/Modals/Calendar/DateRangePicker";
import { Certificate, Task, Star, Check, QR, Calendar } from "../../../assets/icons/icons";
import { useNavigate } from "react-router-dom";
import { getQuizStats, getQuizHistory, startQuiz, getQuizReview, getCertificateUrl } from "../../../services/features/quizService";
import ToastNotification from "../../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";
import { SkeletonLine, SkeletonCard, SkeletonBlock, SkeletonButton } from "../../../components/skeleton";

function Quiz() {
  const navigate = useNavigate();
  const { isDarkTheme } = ThemeStore();
  const [hoveredCert, setHoveredCert] = useState(null);
  const [stats, setStats] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedQuizReview, setSelectedQuizReview] = useState(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  
  const [dateFilter, setDateFilter] = useState(null);
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const isFirstLoad = !stats;
        
        if (isFirstLoad) {
          setIsLoading(true);
        } else {
          setIsLoadingHistory(true);
        }
        
        let startDate = null;
        let endDate = null;
        let filterType = null;
        
        const formatUTCDateTime = (date) => {
          return date.toISOString().replace('T', ' ').substring(0, 19);
        };
        
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);
        
        if (dateFilter === 'today') {
          startDate = formatUTCDateTime(todayStart);
          endDate = formatUTCDateTime(todayEnd);
          filterType = 'custom';
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(todayStart);
          weekAgo.setDate(weekAgo.getDate() - 7);
          startDate = formatUTCDateTime(weekAgo);
          endDate = formatUTCDateTime(todayEnd);
          filterType = 'custom';
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(todayStart);
          monthAgo.setDate(monthAgo.getDate() - 30);
          startDate = formatUTCDateTime(monthAgo);
          endDate = formatUTCDateTime(todayEnd);
          filterType = 'custom';
        } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
          const startOfDay = new Date(customStartDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(customEndDate);
          endOfDay.setHours(23, 59, 59, 999);
          startDate = formatUTCDateTime(startOfDay);
          endDate = formatUTCDateTime(endOfDay);
          filterType = 'custom';
        }
        
        if (isFirstLoad) {
          const [statsResponse, historyResponse] = await Promise.all([
            getQuizStats(),
            getQuizHistory(currentPage, itemsPerPage, filterType, startDate, endDate)
          ]);

          if (statsResponse.success) {
            setStats(statsResponse.data);
          }

          if (historyResponse.success) {
            setQuizHistory(historyResponse.data.history || []);
            setTotalItems(historyResponse.data.pagination?.total_items || 0);
            
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
        } else {
          const historyResponse = await getQuizHistory(currentPage, itemsPerPage, filterType, startDate, endDate);
          
          if (historyResponse.success) {
            setQuizHistory(historyResponse.data.history || []);
            setTotalItems(historyResponse.data.pagination?.total_items || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        ToastNotification('Failed to load quiz data', 'error');
      } finally {
        setIsLoading(false);
        setIsLoadingHistory(false);
      }
    };

    fetchQuizData();
  }, [currentPage, dateFilter, customStartDate, customEndDate]);

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

  const handlePageChange = function(page) {
    setCurrentPage(page);
  };

  const handleDateFilterChange = function(filter) {
    setDateFilter(filter);
    setCurrentPage(1);
    if (filter !== 'custom') {
      setShowDatePicker(false);
      setCustomStartDate(null);
      setCustomEndDate(null);
    } else {
      setShowDatePicker(!showDatePicker);
    }
  };

  const handleCustomRangeApply = function(startDate, endDate) {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setDateFilter('custom');
    setCurrentPage(1);
    setShowDatePicker(false);
  };

  const formatDateRange = function() {
    if (!customStartDate || !customEndDate) return '';
    const options = { month: 'short', day: 'numeric' };
    return `${customStartDate.toLocaleDateString('en-US', options)} - ${customEndDate.toLocaleDateString('en-US', options)}`;
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkTheme ? "bg-darkBackground" : "bg-background"}`}>
        <div className="p-6 rounded-large mb-6 bg-primary">
          <SkeletonLine variant="medium" width="3/4" />
          <div className="mt-2 mb-4">
            <SkeletonLine variant="small" width="1/2" />
          </div>
          <SkeletonButton variant="medium" width="fit" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className={`p-4 rounded-large ${isDarkTheme ? "bg-darkSurface border border-darkBorder" : "bg-white border border-gray-100"}`}>
              <SkeletonBlock variant="small" height="small" />
              <div className="mt-2">
                <SkeletonLine variant="large" width="1/2" />
              </div>
              <div className="mt-1">
                <SkeletonLine variant="small" width="3/4" />
              </div>
            </div>
          ))}
        </div>

        <div className={`p-6 rounded-large mb-6 ${isDarkTheme ? "bg-darkSurface border border-darkBorder" : "bg-white border border-gray-100"}`}>
          <div className="flex justify-between items-center mb-4">
            <SkeletonLine variant="large" width="1/3" />
            <SkeletonLine variant="small" width="1/4" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`p-4 rounded-medium ${isDarkTheme ? "bg-darkBackground" : "bg-gray-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SkeletonBlock variant="small" height="small" />
                    <div>
                      <SkeletonLine variant="medium" width="1/2" />
                      <div className="mt-1">
                        <SkeletonLine variant="small" width="1/3" />
                      </div>
                    </div>
                  </div>
                  <SkeletonLine variant="small" width="1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-large ${isDarkTheme ? "bg-darkSurface border border-darkBorder" : "bg-white border border-gray-100"}`}>
          <SkeletonLine variant="large" width="1/3" />
          <div className="flex gap-4 overflow-x-auto pb-2 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="min-w-50">
                <SkeletonBlock variant="medium" height="xlarge" />
              </div>
            ))}
          </div>
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
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => handleDateFilterChange(null)}
            className={`px-3 py-1.5 rounded-medium text-xs font-medium hover:scale-[0.99] active:scale-[0.99] transition-all ${
              dateFilter === null
                ? "bg-primary text-white"
                : isDarkTheme ? "bg-darkBackground text-darkTextPrimary border border-darkBorder" : "bg-background text-secondaryDark border border-secondary"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleDateFilterChange('today')}
            className={`px-3 py-1.5 rounded-medium text-xs font-medium hover:scale-[0.99] active:scale-[0.99] transition-all ${
              dateFilter === 'today'
                ? "bg-primary text-white"
                : isDarkTheme ? "bg-darkBackground text-darkTextPrimary border border-darkBorder" : "bg-background text-secondaryDark border border-secondary"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => handleDateFilterChange('week')}
            className={`px-3 py-1.5 rounded-medium text-xs font-medium hover:scale-[0.99] active:scale-[0.99] transition-all ${
              dateFilter === 'week'
                ? "bg-primary text-white"
                : isDarkTheme ? "bg-darkBackground text-darkTextPrimary border border-darkBorder" : "bg-background text-secondaryDark border border-secondary"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => handleDateFilterChange('month')}
            className={`px-3 py-1.5 rounded-medium text-xs font-medium hover:scale-[0.99] active:scale-[0.99] transition-all ${
              dateFilter === 'month'
                ? "bg-primary text-white"
                : isDarkTheme ? "bg-darkBackground text-darkTextPrimary border border-darkBorder" : "bg-background text-secondaryDark border border-secondary"
            }`}
          >
            This Month
          </button>
          
          <div className="relative">
            <button
              onClick={() => handleDateFilterChange('custom')}
              className={`px-3 py-1.5 rounded-medium text-xs font-medium hover:scale-[0.99] active:scale-[0.99] transition-all flex items-center gap-1.5 ${
                dateFilter === 'custom'
                  ? "bg-primary text-white"
                  : isDarkTheme ? "bg-darkBackground text-darkTextPrimary border border-darkBorder" : "bg-background text-secondaryDark border border-secondary"
              }`}
            >
              <Calendar size={14} defaultColor={dateFilter === 'custom' ? '#FFFFFF' : isDarkTheme ? '#B7D6C9' : '#316F5D'} />
              {dateFilter === 'custom' && customStartDate && customEndDate ? formatDateRange() : 'Custom Range'}
            </button>

            {showDatePicker && (
              <DateRangePicker
                onApply={handleCustomRangeApply}
                onClose={() => setShowDatePicker(false)}
                isDarkTheme={isDarkTheme}
              />
            )}
          </div>
        </div>

        {isLoadingHistory ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`p-4 rounded-medium ${isDarkTheme ? "bg-darkBackground" : "bg-gray-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SkeletonBlock variant="small" height="small" />
                    <div>
                      <SkeletonLine variant="medium" width="1/2" />
                      <div className="mt-1">
                        <SkeletonLine variant="small" width="1/3" />
                      </div>
                    </div>
                  </div>
                  <SkeletonLine variant="small" width="1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : quizHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className={`w-16 h-16 rounded-large flex items-center justify-center mb-4 ${
              isDarkTheme ? "bg-darkBackground" : "bg-secondary"
            }`}>
              <Task size={32} defaultColor={isDarkTheme ? "#1E8E54" : "#145B47"} isDarkTheme={isDarkTheme} />
            </div>
            <p className={`text-base font-semibold mb-1 ${isDarkTheme ? "text-darkTextPrimary" : "text-gray-900"}`}>
              No Quiz Record Found
            </p>
            <p className={`text-sm ${isDarkTheme ? "text-darkTextSecondary" : "text-gray-500"}`}>
              {dateFilter ? 'Try adjusting your filters' : 'Start taking quizzes to see your history'}
            </p>
          </div>
        ) : (
          <Pagination
          data={quizHistory.map(formatQuizHistory)}
          itemsPerPage={itemsPerPage}
          serverSide={true}
          totalItems={totalItems}
          currentPage={currentPage}
          onPageChange={handlePageChange}
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
        )}
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
import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { 
  QR, 
  Mobile, 
  RightArrow, 
  Check, 
  QRScanner 
} from "../../../assets/icons/icons";
import ToastNotification from "../../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";
import FeedBackModal from "../../../components/Modals/Residents/FeedbackModal";
import ThemeStore from "../../../store/ThemeStore";

// Mock Collector Data declared at component top level
const mockTrashMan = {
  id: "TM-2025-08",
  name: "Suresh Raina",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh",
  rating: 4.8
};

function SubmitFeedBack() {
  const [verifyMethod, setVerifyMethod] = useState("QR"); // QR or OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showModal, setShowModal] = useState(false);
  const [stream, setStream] = useState(null);
  const { isDarkTheme } = ThemeStore();
  const { t } = useTranslation(["pages", "common"]);
  
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const videoRef = useRef(null);

  function handleOtpInput(index, value) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  }

  function handleBackspace(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  }

  function handleVerifySuccess() {
    const code = otp.join("");
    if (verifyMethod === "OTP" && code.length < 6) {
      ToastNotification(t('pages:common.submit_feedback.toast_enter_full_otp'), "warning");
      return;
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsScanning(false);
    }

    ToastNotification(t('pages:common.submit_feedback.toast_verification_success'), "success");
    setTimeout(function() {
      setShowModal(true);
    }, 600);
  }

  async function startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      ToastNotification(t('pages:common.submit_feedback.toast_camera_activated'), "info");
      
      setTimeout(function() {
        handleVerifySuccess();
      }, 4000);
      
    } catch (error) {
      console.error("Camera access error:", error);
      ToastNotification(t('pages:common.submit_feedback.toast_camera_error'), "error");
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }

  React.useEffect(function() {
    if (verifyMethod === "QR") {
      startCamera();
    } else {
      stopCamera();
    }
    
    return function() {
      stopCamera();
    };
  }, [verifyMethod]);

  return (
    <div className={isDarkTheme ? "dark" : ""}>
    <div className="min-h-screen bg-background p-4 md:p-6 animate-in fade-in duration-500">
      <div className="max-w-xl mx-auto">
        
        {/* Verification Section */}
        <div className="bg-white border border-secondary rounded-veryLarge p-6 md:p-8 shadow-sm">
          <header className="text-center mb-8">
            <h1 className="text-xl font-bold text-primary uppercase tracking-wide">{t('pages:common.submit_feedback.heading')}</h1>
            <p className="text-sm text-secondaryDark mt-2">{t('pages:common.submit_feedback.subheading')}</p>
          </header>

          {/* Toggle Switch */}
          <div className="flex bg-background p-1.5 rounded-large border border-secondary mb-8">
            <button 
              onClick={() => setVerifyMethod("QR")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-medium text-sm font-bold hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out ${verifyMethod === "QR" ? "bg-white text-primary shadow-sm" : "text-secondaryDark"}`}
            >
              <QR size={20} isPressed={verifyMethod === "QR"} />
              {t('pages:common.submit_feedback.tab_scan_qr')}
            </button>
            <button 
              onClick={() => { setVerifyMethod("OTP"); stopCamera(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-medium text-sm font-bold hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out ${verifyMethod === "OTP" ? "bg-white text-primary shadow-sm" : "text-secondaryDark"}`}
            >
              <Mobile size={20} isPressed={verifyMethod === "OTP"} />
              {t('pages:common.submit_feedback.tab_enter_otp')}
            </button>
          </div>

          {/* Interaction Area */}
          <div className="flex flex-col items-center justify-center py-6">
            {verifyMethod === "QR" ? (
              <div className="animate-in zoom-in-95 duration-500 text-center w-full">
                <div className="space-y-6">
                  <div className="w-full max-w-sm mx-auto aspect-square rounded-veryLarge bg-primary/5 relative overflow-hidden">
                    <video 
                      ref={videoRef}
                      className="w-full h-full object-cover rounded-veryLarge"
                      autoPlay
                      playsInline
                    />
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-success shadow-[0_0_20px_rgba(30,142,84,0.8)] animate-scan" />
                    </div>
                    <div className="qr-scanner-corners" />
                    <div className="qr-scanner-corners-bottom" />
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-primary/80 to-transparent p-4">
                      <p className="text-sm font-bold text-white text-center">{t('pages:common.submit_feedback.position_qr')}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-primary">{t('pages:common.submit_feedback.camera_active')}</p>
                    <p className="text-xs text-secondaryDark">{t('pages:common.submit_feedback.align_qr')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full animate-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <p className="text-sm font-bold text-primary text-center mb-4">{t('pages:common.submit_feedback.enter_otp_heading')}</p>
                  <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
                    {otp.map(function(digit, index) {
                      return (
                        <input
                          key={index}
                          ref={otpRefs[index]}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpInput(index, e.target.value)}
                          onKeyDown={(e) => handleBackspace(index, e)}
                          className="w-full aspect-square text-center text-xl font-bold bg-background border-2 border-secondary rounded-large text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:scale-[1.05] hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out"
                        />
                      );
                    })}
                  </div>
                </div>
                <button 
                  onClick={handleVerifySuccess}
                  disabled={otp.join("").length !== 6}
                  className="w-full bg-primary text-white py-4 rounded-veryLarge font-bold text-sm flex items-center justify-center gap-2 hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('pages:common.submit_feedback.verify_continue')}
                  <RightArrow size={18} isPressed={false} isDarkTheme={true} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info Card */}
        <div className="mt-6 p-5 bg-secondary rounded-veryLarge border border-primary/10 flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            <Check size={20} isPressed={true} isDarkTheme={false} />
          </div>
          <p className="text-sm text-secondaryDark leading-relaxed">
            {t('pages:common.submit_feedback.footer_text')}
          </p>
        </div>
      </div>

      {showModal && (
        <FeedBackModal 
          collector={mockTrashMan} 
          onClose={() => setShowModal(false)} 
        />
      )}
      <ToastContainer/>
    </div>
    </div>
  );
}

export default SubmitFeedBack;
import React, { useState, useRef } from "react";
import { 
  QR, 
  Mobile, 
  RightArrow, 
  Check, 
  QRScanner 
} from "../../assets/icons/icons";
import ToastNotification from "../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";
import FeedBackModal from "../../components/Modals/Residents/FeedbackModal";
import ThemeStore from "../../store/ThemeStore";

// Mock Collector Data declared at component top level
const mockTrashMan = {
  id: "TM-2025-08",
  name: "Suresh Raina",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh",
  rating: 4.8
};

function Feedback() {
  const [verifyMethod, setVerifyMethod] = useState("QR"); // QR or OTP
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [showModal, setShowModal] = useState(false);
  const { isDarkTheme } = ThemeStore();
  
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];
  const cameraInputRef = useRef(null);

  function handleOtpInput(index, value) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 3) {
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
    if (verifyMethod === "OTP" && code.length < 4) {
      ToastNotification("Please enter the full 4-digit OTP", "warning");
      return;
    }

    ToastNotification("Verification Successful!", "success");
    setTimeout(function() {
      setShowModal(true);
    }, 600);
  }

  function handleCameraAccess() {
    ToastNotification("Accessing camera...", "info");
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  }

  function onCameraCapture(e) {
    const file = e.target.files[0];
    if (file) {
      ToastNotification("Scanning QR Code from image...", "info");
      // Simulate scanning delay
      setTimeout(function() {
        handleVerifySuccess();
      }, 1500);
    }
  }

  return (
    <div className={isDarkTheme ? "dark" : ""}>
    <div className="min-h-screen bg-background p-4 md:p-6 animate-in fade-in duration-500">
      <div className="max-w-xl mx-auto">
        
        {/* Verification Section */}
        <div className="bg-white border border-secondary rounded-veryLarge p-6 shadow-sm">
          <header className="text-center mb-8">
            <h1 className="text-lg font-bold text-primary uppercase tracking-widest">Collector Verification</h1>
            <p className="text-xs text-gray-400 mt-1 font-medium">Verify your waste collection to provide feedback</p>
          </header>

          {/* Toggle Switch */}
          <div className="flex bg-background p-1 rounded-large border border-secondary mb-10">
            <button 
              onClick={() => setVerifyMethod("QR")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-medium text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 ${verifyMethod === "QR" ? "bg-white text-primary shadow-sm" : "text-gray-400"}`}
            >
              <QR size={18} isPressed={verifyMethod === "QR"} />
              Scan QR
            </button>
            <button 
              onClick={() => setVerifyMethod("OTP")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-medium text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 ${verifyMethod === "OTP" ? "bg-white text-primary shadow-sm" : "text-gray-400"}`}
            >
              <Mobile size={18} isPressed={verifyMethod === "OTP"} />
              OTP Code
            </button>
          </div>

          {/* Interaction Area */}
          <div className="flex flex-col items-center justify-center py-6">
            {verifyMethod === "QR" ? (
              <div className="animate-in zoom-in-95 duration-500 text-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  ref={cameraInputRef} 
                  onChange={(e) => onCameraCapture(e)} 
                  className="hidden" 
                />

                <div 
                  onClick={() => handleCameraAccess()}
                  className="w-48 h-48 border-2 border-dashed border-primaryLight rounded-veryLarge bg-secondary/30 flex items-center justify-center cursor-pointer group relative overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <QRScanner size={64} isPressed={false} isDarkTheme={false} />
                  <div className="absolute inset-0 bg-primaryLight/5 group-hover:bg-primaryLight/10 transition-colors" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primaryLight shadow-[0_0_15px_#1E8E54] animate-bounce" />
                </div>
                
                <div className="mt-6 space-y-1">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">Position QR within frame</p>
                  <p className="text-xs text-gray-400 font-medium italic">Tap the box to open camera</p>
                </div>
              </div>
            ) : (
              <div className="w-full animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-center gap-3 mb-8">
                  {otp.map(function(digit, index) {
                    return (
                      <input
                        key={index}
                        ref={otpRefs[index]}
                        type="text"
                        value={digit}
                        placeholder="•"
                        onChange={(e) => handleOtpInput(index, e.target.value)}
                        onKeyDown={(e) => handleBackspace(index, e)}
                        className="w-12 h-14 text-center text-xl font-bold bg-background border border-secondary rounded-large focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[1.02] transition-all duration-200"
                      />
                    );
                  })}
                </div>
                <button 
                  onClick={() => handleVerifySuccess()}
                  className="w-full bg-primary text-white py-4 rounded-veryLarge font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  Verify Collector
                  <RightArrow size={16} isPressed={false} isDarkTheme={true} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info Card */}
        <div className="mt-6 p-4 bg-secondary rounded-veryLarge border border-primary/5 flex items-start gap-3">
          <div className="mt-0.5">
            <Check size={18} isPressed={true} isDarkTheme={false} />
          </div>
          <p className="text-xs text-primary font-medium leading-relaxed italic">
            Your verification helps us track waste collection efficiency and reward our hard-working city teams for a cleaner environment.
          </p>
        </div>
      </div>

      {showModal && (
        <FeedBackModal 
          collector={mockTrashMan} 
          onClose={() => setShowModal(false)} 
        />
      )}
      <ToastContainer position="bottom-center" />
    </div>
    </div>
  );
}

export default Feedback;
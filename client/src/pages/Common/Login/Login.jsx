import React, { useState } from "react";
import { Settings, Mobile, Email } from "../../../assets/icons/icons";
import ToastNotification from "../../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";
import OtpVerificationModal from "../../../components/Modals/Login/OtpVerificationModal";
import { useNavigate } from "react-router-dom";
import { requestOtp } from "../../../services/features/authService";

//Themeprovider
import ThemeStore from "../../../store/ThemeStore";

function Login() {
  const {isDarkTheme , toggleTheme} = ThemeStore();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("SMS");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState("");
  const [showNewUser, setShowNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handlePhoneInput(value) {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 10) {
      setPhoneNumber(cleaned);
      if (showNewUser) setShowNewUser(false);
    }
  }

  async function handleSendOtp() {
    if (isLoading) return;

    if (selectedMethod === "SMS") {
      ToastNotification("OTP via phone is under construction", "info");
      return;
    }

    let identifier = "";
    
    if (selectedMethod === "SMS") {
      if (!phoneNumber || phoneNumber.length !== 10) {
        ToastNotification("Please enter a valid 10-digit phone number", "error");
        return;
      }
      identifier = phoneNumber;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput || !emailRegex.test(emailInput)) {
        ToastNotification("Please enter a valid email address", "error");
        return;
      }
      identifier = emailInput;
    }

    try {
      setIsLoading(true);
      setShowNewUser(false);

      const response = await requestOtp({
        email: identifier,
        isSignup: false
      });

      if (response.data.shouldRedirect === 'signup') {
        ToastNotification(response.message || "Account not found. Please sign up first.", "error");
        setShowNewUser(true);
        setTimeout(() => {
          navigate("/signup");
        }, 2000);
        return;
      }

      setUserIdentifier(identifier);
      ToastNotification(response.message || `OTP sent to ${identifier}`, "success");
      setShowOtpModal(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to send OTP";
      ToastNotification(errorMsg, "error");
      
      if (errorMsg.includes("not found") || errorMsg.includes("sign up")) {
        setShowNewUser(true);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={isDarkTheme ? "dark" : ""}>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-10 w-full max-w-md">
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-secondary p-3 rounded-xl">
            <Settings isPressed={false} isDarkTheme={isDarkTheme} />
          </div>
        </div>
        {/* Titles */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-black mb-3">Welcome Back</h1>
          <p className="text-sm text-gray-400 px-8">
            {selectedMethod === "SMS" ? "Enter your mobile number to access your dashboard." : "Enter your email address to access your dashboard."}
          </p>
        </div>

        {/* Method Toggle */}
        <div className="bg-secondary p-1 rounded-lg flex mb-8">
          <button
            onClick={function() { setSelectedMethod("SMS"); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:cursor-pointer ${
              selectedMethod === "SMS" ? "bg-white text-black shadow-sm" : "text-gray-400"
            }`}
          >
            <Mobile isPressed={selectedMethod === "SMS"} isDarkTheme={isDarkTheme} />
            SMS
          </button>
          <button
            onClick={function() { setSelectedMethod("Gmail"); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:cursor-pointer ${
              selectedMethod === "Gmail" ? "bg-white text-black shadow-sm" : "text-gray-400"
            }`}
          >
            <Email isPressed={selectedMethod === "Gmail"} isDarkTheme={isDarkTheme} />
            Gmail
          </button>
        </div>

        {/* Input Field */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-black mb-2">
            {selectedMethod === "SMS" ? "Mobile Number" : "Email Address"}
          </label>
          {selectedMethod === "SMS" ? (
            <div className="flex bg-background border border-gray-100 rounded-lg overflow-hidden focus-within:border-primary transition-colors">
              <span className="px-4 py-4 text-gray-400 border-r border-gray-100 text-base font-medium">
                +91
              </span>
              <input
                type="text"
                value={phoneNumber}
                onChange={function(e) { handlePhoneInput(e.target.value); }}
                placeholder="98765 43210"
                className="w-full px-4 py-4 bg-transparent outline-none text-base font-medium placeholder:text-gray-300"
              />
            </div>
          ) : (
            <input
              type="email"
              value={emailInput}
              onChange={function(e) { setEmailInput(e.target.value); if (showNewUser) setShowNewUser(false); }}
              placeholder="yourname@gmail.com"
              className="w-full px-4 py-4 bg-background border border-gray-100 rounded-lg outline-none text-base font-medium placeholder:text-gray-300 focus-within:border-primary transition-colors"
            />
          )}
          {showNewUser && (
            <p className="text-xs text-error mt-2 font-medium">User not found. Redirecting to signup...</p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleSendOtp}
          disabled={isLoading}
          className={`w-full font-medium py-3 rounded-lg mb-6 transition-all duration-200 ${
            isLoading
              ? 'bg-primary text-white cursor-not-allowed'
              : 'bg-primaryLight text-white hover:bg-primary hover:cursor-pointer active:scale-[0.98]'
          }`}
        >
          {isLoading ? "Sending..." : "Send Secure OTP"}
        </button>
      </div>

      {showOtpModal && (
        <OtpVerificationModal
          identifier={userIdentifier}
          method={selectedMethod}
          isLogin={true}
          onClose={function() { setShowOtpModal(false); }}
          onSuccess={function() {
            navigate("/");
          }}
        />
      )}

      <ToastContainer/>
      </div>
    </div>
  );
}

export default Login;
import React, { useState, useEffect, useRef } from "react";
import { Certificate, Email } from "../../../assets/icons/icons";
import ToastNotification from "../../Notification/ToastNotification";
import { api } from "../../../services/apiMethods";
import { saveAccessToken } from "../../../services/session";

function OtpVerificationModal({ identifier, method, isLogin, onClose, onVerified, onSuccess }) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Auto-focus the first input field on mount
    useEffect(function() {
        if (inputRefs[0].current) {
            inputRefs[0].current.focus();
        }
    }, []);

    // Timer Logic
    useEffect(function() {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(function() {
                setTimer(function(prev) { return prev - 1; });
            }, 1000);
        } else {
            setCanResend(true);
            if (interval) clearInterval(interval);
        }
        return function() { if (interval) clearInterval(interval); };
    }, [timer]);

    function handleOtpChange(index, value) {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
        inputRefs[index + 1].current.focus();
        }
    }

    function handleKeyDown(index, e) {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs[index - 1].current.focus();
        }
    }

    async function handleVerify() {
        if (isVerifying) return;

        const fullOtp = otp.join("");
        if (fullOtp.length < 6) {
            ToastNotification("Please enter complete 6-digit OTP", "warning");
            return;
        }

        try {
            setIsVerifying(true);

            const response = await api.post("/auth/verify-otp", {
                email: identifier,
                otp_code: fullOtp
            });

            ToastNotification(response.message || "Verification successful", "success");
            
            // Save access token
            if (response.data.accessToken) {
                saveAccessToken(response.data.accessToken);
            }

            // Call appropriate callback
            if (onVerified) {
                onVerified(response.data);
            }
            
            // Always call onSuccess if provided (navigation for login)
            if (onSuccess) {
                setTimeout(() => {
                    onSuccess(response.data);
                }, 800);
            }

        } catch (error) {
            console.error("Error verifying OTP:", error);
            const errorMsg = error.response?.data?.message || error.message || "Invalid OTP code";
            ToastNotification(errorMsg, "error");
            setOtp(["", "", "", "", "", ""]);
            if (inputRefs[0].current) {
                inputRefs[0].current.focus();
            }
        } finally {
            setIsVerifying(false);
        }
    }

    async function handleResend() {
        if (!canResend) return;

        try {
            const response = await api.post("/auth/request-otp", {
                email: identifier,
                isSignup: !isLogin
            });

            setTimer(60);
            setCanResend(false);
            setOtp(["", "", "", "", "", ""]);
            ToastNotification(response.message || "A new OTP has been sent", "success");
        } catch (error) {
            console.error("Error resending OTP:", error);
            ToastNotification(error.response?.data?.message || "Failed to resend OTP", "error");
        }
    }

    return (
        <div>
        <div 
            onClick={onClose}
            className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-200 ease-in-out"
        >
            {/* Modal Content */}
            <div 
            onClick={function(e) { e.stopPropagation(); }}
            className="bg-white rounded-veryLarge shadow-2xl p-10 w-full max-w-md transition-all duration-200 ease-in-out"
            >
            {/* Header Icon */}
            <div className="flex justify-center mb-6">
                <div className="bg-secondary p-4 rounded-veryLarge transition-all duration-200 ease-in-out">
                <Certificate isPressed={false} />
                </div>
            </div>

            {/* Titles */}
            <div className="text-center mb-10">
                <h1 className="text-xl font-bold text-black mb-3">Verify Identity</h1>
                <p className="text-sm text-gray-400 px-6 leading-relaxed">
                    Enter the 6-digit code sent to<br />
                    <span className="text-secondaryDark font-bold">{identifier}</span>
                </p>
            </div>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-3 mb-10">
                {otp.map(function(digit, index) {
                return (
                    <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    value={digit}
                    placeholder="-"
                    onChange={function(e) { handleOtpChange(index, e.target.value); }}
                    onKeyDown={function(e) { handleKeyDown(index, e); }}
                    className="w-12 h-14 text-center text-xl font-bold border border-secondary rounded-large shadow-sm outline-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out placeholder:text-gray-200 bg-secondary/30 text-black"
                    />
                );
                })}
            </div>

            {/* Verify Button */}
            <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full bg-primaryLight text-white font-bold py-3 rounded-large mb-8 hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isVerifying ? "Verifying..." : "Verify & Proceed"}
            </button>

            {/* Footer Actions */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm font-medium text-gray-400">
                {canResend ? (
                    <button 
                    onClick={handleResend}
                    className="text-primary font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
                    >
                    Resend Now
                    </button>
                ) : (
                    <span className="flex items-center gap-1">
                    Resend in <span className="text-secondaryDark font-bold tabular-nums">00:{timer < 10 ? `0${timer}` : timer}</span>
                    </span>
                )}
                </div>
                <button
                onClick={onClose}
                className="text-sm font-medium text-primary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
                >
                Change
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}

export default OtpVerificationModal;
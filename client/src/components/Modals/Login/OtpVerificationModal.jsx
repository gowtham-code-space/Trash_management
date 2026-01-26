import React, { useState, useEffect, useRef } from "react";
import { Certificate } from "../../../assets/icons/icons";
import ToastNotification from "../../Notification/ToastNotification";

function OtpVerificationModal({ phoneNumber, method, userEmail, onClose }) {
const [otp, setOtp] = useState(["", "", "", ""]);
const [timer, setTimer] = useState(24);
const [canResend, setCanResend] = useState(false);
const inputRefs = [useRef(), useRef(), useRef(), useRef()];

// Auto-focus the first input field on mount
useEffect(function() {
if (inputRefs[0].current) {
    inputRefs[0].current.focus();
}
}, []);

// 24s Timer Logic
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
if (value && index < 3) {
    inputRefs[index + 1].current.focus();
}
}

function handleKeyDown(index, e) {
if (e.key === "Backspace" && !otp[index] && index > 0) {
    inputRefs[index - 1].current.focus();
}
}

function handleVerify() {
const fullOtp = otp.join("");
if (fullOtp.length < 4) {
    ToastNotification("Please enter complete 4-digit OTP", "warning");
    return;
}

if (fullOtp === "1234") {
    ToastNotification("Verification successful", "success");
    // Logic for successful login would proceed here
} else {
    ToastNotification("Invalid OTP code", "error");
    setOtp(["", "", "", ""]);
    inputRefs[0].current.focus();
}
}

function handleResend() {
if (!canResend) return;
setTimer(24);
setCanResend(false);
setOtp(["", "", "", ""]);
ToastNotification("A new OTP has been sent", "success");
}

return (
/* Outer Backdrop - handles onClose on click */
<div 
    onClick={onClose}
    className="fixed inset-0 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300 flex items-center justify-center p-4 z-50 transition-all"
>
    {/* Modal Content - e.stopPropagation prevents closing when clicking inside */}
    <div 
    onClick={function(e) { e.stopPropagation(); }}
    className="bg-white rounded-xl shadow-2xl p-10 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100"
    >
    {/* Header Icon */}
    <div className="flex justify-center mb-6">
        <div className="bg-secondary p-4 rounded-2xl">
        <Certificate isPressed={false} isDarkTheme={false} />
        </div>
    </div>

    {/* Titles */}
    <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-black mb-3">Verify Identity</h1>
        <p className="text-sm text-gray-400 px-6 leading-relaxed">
        Enter the 4-digit code sent to<br />
        <span className="text-gray-600 font-bold">
            {method === "SMS" ? `+91 ${phoneNumber}` : userEmail}
        </span>
        </p>
    </div>

    {/* OTP Inputs */}
    <div className="flex justify-center gap-4 mb-10">
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
            className="w-14 h-16 text-center text-xl font-bold border border-gray-100 rounded-lg shadow-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-gray-200 bg-gray-50/30"
            />
        );
        })}
    </div>

    {/* Action Button */}
    <button
        onClick={handleVerify}
        className="w-full bg-primaryLight text-white font-bold py-3 rounded-lg mb-8 hover:bg-primary active:scale-[0.97] transition-all duration-200 shadow-lg shadow-primary/10"
    >
        Verify & Proceed
    </button>

    {/* Footer Actions */}
    <div className="flex items-center justify-between px-2">
        <div className="text-sm font-medium text-gray-400">
        {canResend ? (
            <button 
            onClick={handleResend}
            className="text-primary font-medium hover:text-primaryLight transition-colors"
            >
            Resend Now
            </button>
        ) : (
            <span className="flex items-center gap-1">
            Resend in <span className="text-gray-600 font-bold tabular-nums">00:{timer < 10 ? `0${timer}` : timer}</span>
            </span>
        )}
        </div>
        <button
        onClick={onClose}
        className="text-sm font-medium text-primary hover:text-primaryLight transition-colors"
        >
        Change Number
        </button>
    </div>
    </div>
</div>
);
}

export default OtpVerificationModal;
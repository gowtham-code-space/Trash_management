import React, { useState, useRef, useEffect } from "react";
import { X, Check ,Mobile ,Email } from "../../../assets/icons/icons";

function UpdateContactInfo({ type, value, onClose, onConfirm }) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null)
    ];

    useEffect(function () {
        if (inputRefs[0].current) {
        inputRefs[0].current.focus();
        }
    }, []);

    function handleOtpChange(index, value) {
        if (value.length > 1) {
        value = value.slice(-1);
        }

        if (!/^\d*$/.test(value)) {
        return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
        inputRefs[index + 1].current.focus();
        }
    }

    function handleKeyDown(index, e) {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs[index - 1].current.focus();
        }
    }

    function handlePaste(e) {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pastedData)) {
        return;
        }

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length && i < 6; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        const nextEmptyIndex = newOtp.findIndex(function (val) {
            return val === "";
        });
        if (nextEmptyIndex !== -1) {
            inputRefs[nextEmptyIndex].current.focus();
        } else {
            inputRefs[5].current.focus();
    }
    }

    function handleConfirm() {
        const otpValue = otp.join("");
        if (!otpValue || otpValue.length < 6) {
            return;
        }
        onConfirm();
    }

    const otpValue = otp.join("");
    const isComplete = otpValue.length === 6;

    return (
        <div onClick={onClose} className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div onClick={(e)=>e.stopPropagation()} className="bg-white rounded-veryLarge shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-secondary">
            <div>
                <h3 className="text-lg font-bold text-primary">Verify Your Contact</h3>
                <p className="text-xs text-secondaryDark/60 mt-1">
                We sent a verification code
                </p>
            </div>
            <button
                onClick={onClose}
                className="w-9 h-9 rounded-medium flex items-center justify-center hover:bg-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
            >
                <X size={18} defaultColor="#316F5D" />
            </button>
            </div>

            <div className="p-6 space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-large p-4">
                <div className="flex items-start gap-3">
                <div className=" w-12 h-12 bg-primaryLight rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">
                    {type === "phone" ? <Mobile defaultColor="white"/> : <Email defaultColor="white"/>}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-secondaryDark/80 mb-1">
                    Code sent to {type === "phone" ? "phone number" : "email address"}
                    </p>
                    <p className="text-sm font-bold text-primary break-all">{value}</p>
                </div>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-secondaryDark mb-3 block">
                Enter Verification Code
                </label>
                <div className="flex gap-2 justify-between">
                {otp.map(function (digit, index) {
                    return (
                    <input
                        key={index}
                        ref={inputRefs[index]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={function (e) {
                        handleOtpChange(index, e.target.value);
                        }}
                        onKeyDown={function (e) {
                        handleKeyDown(index, e);
                        }}
                        onPaste={handlePaste}
                        className="w-12 h-14 bg-background border-2 border-secondary rounded-large text-center text-lg font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:scale-[1.02] transition-all duration-200 ease-in-out"
                    />
                    );
                })}
                </div>
                <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-secondaryDark/60">Didn't receive code?</p>
                <button className="text-xs font-bold text-primary hover:underline focus:outline-none focus:underline transition-all">
                    Resend OTP
                </button>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                onClick={onClose}
                className="flex-1 bg-secondary text-primary py-3.5 rounded-large text-sm font-bold hover:bg-secondary/80 hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                >
                Cancel
                </button>
                <button
                onClick={handleConfirm}
                disabled={!isComplete}
                className={`flex-1 py-3.5 rounded-large text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ease-in-out ${
                    isComplete
                    ? "bg-primary text-white hover:bg-primaryLight hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    : "bg-secondary text-secondaryDark/40 cursor-not-allowed"
                }`}
                >
                <Check size={16} isDarkTheme={isComplete} defaultColor={isComplete ? "#fff" : "#316F5D"} />
                Verify & Continue
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}

export default UpdateContactInfo;
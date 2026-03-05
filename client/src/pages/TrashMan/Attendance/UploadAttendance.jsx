import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
    Camera, 
    Location, 
    Add,
    Check,
} from "../../../assets/icons/icons";
import ToastNotification from "../../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";
import ThemeStore from "../../../store/ThemeStore";
import AttendanceHistory from "./AttendanceHistory";
import AttendanceSubmittedModal from "../../../components/Modals/TrashMan/AttendanceSubmittedModal";

function UploadAttendance() {
    const { t } = useTranslation(["pages", "common"]);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const { isDarkTheme } = ThemeStore();

    const [selectedImage, setSelectedImage] = useState(null);
    const [geoTag, setGeoTag] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmittedModalOpen, setIsSubmittedModalOpen] = useState(false);
    const [submittedWorkerData, setSubmittedWorkerData] = useState(null);

    function openCamera() {
        ToastNotification(t('pages:trashman.attendance.toast_opening_camera'), "info");
        setTimeout(function() {
            if (cameraInputRef.current) {
                cameraInputRef.current.click();
            }
        }, 10);
    }

    function handleCameraCapture(e) {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            detectLocation();
            ToastNotification(t('pages:trashman.attendance.toast_photo_captured'), "success");
        }
        e.target.value = null;
    }

    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
            detectLocation();
            ToastNotification(t('pages:trashman.attendance.toast_image_uploaded'), "success");
        }
    }

    function detectLocation() {
        ToastNotification(t('pages:trashman.attendance.toast_detecting_gps'), "info");
        setTimeout(function() {
            setGeoTag("24, Main Street, San Francisco, CA • 37.7749° N, 122.4194° W");
            ToastNotification(t('pages:trashman.attendance.toast_location_detected'), "success");
        }, 1500);
    }

    function handleSubmit() {
        if (!selectedImage) {
            ToastNotification(t('pages:trashman.attendance.toast_capture_photo'), "error");
            return;
        }
        if (!geoTag) {
            ToastNotification(t('pages:trashman.attendance.toast_wait_location'), "error");
            return;
        }

        setIsSubmitting(true);
        setTimeout(function() {
            setIsSubmitting(false);
            ToastNotification(t('pages:trashman.attendance.toast_submitted_success'), "success");
            
            // Set worker data for the modal
            const workerData = {
                image: selectedImage,
                name: "Current User",
                date: new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                }),
                time: new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            };
            setSubmittedWorkerData(workerData);
            
            setTimeout(function() {
                setIsSubmittedModalOpen(true);
            }, 500);
        }, 1000);
    }

    function handleCloseSubmittedModal() {
        setIsSubmittedModalOpen(false);
        // Reset form after closing modal
        setSelectedImage(null);
        setGeoTag("");
    }

    function handleDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                setSelectedImage(URL.createObjectURL(file));
                detectLocation();
                ToastNotification(t('pages:trashman.attendance.toast_image_uploaded'), "success");
            } else {
                ToastNotification(t('pages:trashman.attendance.toast_drop_image'), "error");
            }
        }
    }

    const instructions = [
        t('pages:trashman.attendance.instruction_1'),
        t('pages:trashman.attendance.instruction_2'),
        t('pages:trashman.attendance.instruction_3'),
        t('pages:trashman.attendance.instruction_4'),
        t('pages:trashman.attendance.instruction_5'),
        t('pages:trashman.attendance.instruction_6'),
        t('pages:trashman.attendance.instruction_7'),
        t('pages:trashman.attendance.instruction_8')
    ];

    return (
        <div className={isDarkTheme ? "dark" : ""}>
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT SECTION: Photo Upload */}
                <div className="lg:col-span-7 bg-white border border-secondary rounded-veryLarge p-5 shadow-sm space-y-5">
                    <div className="border-b border-secondary pb-4">
                        <h1 className="text-lg font-bold text-primary">{t('pages:trashman.attendance.upload_heading')}</h1>
                        <p className="text-xs text-gray-500 mt-1 font-medium">{t('pages:trashman.attendance.upload_subtitle')}</p>
                    </div>

                    <div 
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative group border-2 border-dashed rounded-veryLarge h-80 flex flex-col items-center justify-center bg-background/50 hover:bg-secondary/20 transition-all duration-200 ${
                            isDragging ? 'border-primary bg-primary/10' : 'border-primaryLight'
                        }`}
                    >
                        {selectedImage ? (
                            <div className="relative w-full h-full">
                                <img src={selectedImage} alt="Attendance Photo" className="w-full h-full object-cover rounded-large" />
                                
                                {geoTag && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-3 flex items-center gap-2 text-white">
                                        <Location size={16} isDarkTheme={true} />
                                        <span className="text-xs font-medium">{geoTag}</span>
                                    </div>
                                )}

                                <button 
                                    onClick={openCamera}
                                    className="absolute bottom-4 right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-lg"
                                >
                                    <Camera size={20} isPressed={false} isDarkTheme={true} />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={openCamera}
                                className="text-center space-y-4 w-full h-full flex flex-col items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                            >
                                <div className="mx-auto w-14 h-14 bg-white rounded-full flex items-center justify-center text-secondaryDark shadow-sm group-hover:scale-110 transition-transform duration-200">
                                    <Camera size={24} isPressed={false} isDarkTheme={false} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-primary">{t('pages:trashman.attendance.click_to_capture')}</p>
                                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">{t('pages:trashman.attendance.or_drag_drop')}</p>
                                </div>
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                        />
                        <input 
                            type="file" 
                            ref={cameraInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            capture="user" 
                            onChange={handleCameraCapture}
                        />
                        
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            className="bg-primaryLight text-white py-3 rounded-veryLarge text-xs font-bold flex items-center justify-center gap-2 hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-sm shadow-primaryLight/20"
                        >
                            <Add size={16} isPressed={false} isDarkTheme={true} />
                            {t('pages:trashman.attendance.upload_image_btn')}
                        </button>
                        <button 
                            onClick={openCamera}
                            className="bg-primary text-white py-3 rounded-veryLarge text-xs font-bold flex items-center justify-center gap-2 hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-sm shadow-primary/20"
                        >
                            <Camera size={16} isPressed={false} isDarkTheme={true} />
                            {t('pages:trashman.attendance.capture_selfie_btn')}
                        </button>
                    </div>
                </div>

                {/* RIGHT SECTION: Instructions & Submit */}
                <div className="lg:col-span-5 space-y-5">
                    
                    {/* Instructions Section */}
                    <div className="bg-white border border-secondary rounded-veryLarge p-5 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-secondary pb-3">
                            <Check size={18} defaultColor="#145B47" />
                            <h2 className="text-sm font-bold text-primary uppercase tracking-wide">{t('pages:trashman.attendance.instructions_heading')}</h2>
                        </div>
                        
                        <ol className="space-y-3">
                            {instructions.map(function(instruction, index) {
                                return (
                                    <li key={index} className="flex items-start gap-3 text-xs text-gray-700 leading-relaxed">
                                        <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                            {index + 1}
                                        </span>
                                        <span className="pt-0.5 font-medium">{instruction}</span>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>

                    {/* Warning Note */}
                    <div className="bg-error/5 border-2 border-error/20 rounded-veryLarge p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-error rounded-full flex items-center justify-center shrink-0">
                                <Add size={18} isDarkTheme={true} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-error mb-2">{t('pages:trashman.attendance.important_warning')}</h3>
                                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                    {t('pages:trashman.attendance.warning_message')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedImage}
                        className="w-full bg-primary text-white py-4 rounded-veryLarge font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            t('common:submitting')
                        ) : (
                            <>
                                <Check size={18} isDarkTheme={true} />
                                {t('pages:trashman.attendance.submit_attendance_btn')}
                            </>
                        )}
                    </button>
                </div>

                </div>

                {/* Attendance History Card - Full Width Below */}
                <div className="mt-6">
                    <AttendanceHistory isDarkTheme={isDarkTheme} />
                </div>
            </div>

            {/* Attendance Submitted Modal */}
            <AttendanceSubmittedModal 
                isOpen={isSubmittedModalOpen} 
                onClose={handleCloseSubmittedModal}
                isDarkTheme={isDarkTheme}
                workerData={submittedWorkerData}
            />

            <ToastContainer />
        </div>
        </div>
    );
}

export default UploadAttendance;
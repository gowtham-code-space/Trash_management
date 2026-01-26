import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Camera, 
    Trash, 
    Location, 
    RightArrow, 
    DownArrow, 
    Add,
    Check
} from "../../assets/icons/icons";
import ToastNotification from "../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";
import ReportSubmittedModal from "../../components/Modals/Residents/ReportSubmittedModal";
import ThemeStore from "../../store/ThemeStore";

// Mock data at component top level
const trashTypes = [
    'GARBAGE_PILE',
    'OVERFLOWING_BIN',
    'UNCOLLECTED_WASTE',
    'CONSTRUCTION_DEBRIS',
    'PLASTIC_WASTE',
    'DEAD_ANIMAL',
    'SEWAGE_WASTE',
    'BURNING_WASTE',
    'ILLEGAL_DUMPING',
    'WATER_BODY_DUMPING',
    'ROADSIDE_LITTER',
    'MARKET_WASTE',
    'PUBLIC_PLACE_ISSUE',
    'COMMERCIAL_VIOLATION',
    'OTHERS'
];

function ReportTrash() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const { isDarkTheme } = ThemeStore();

    const [selectedImage, setSelectedImage] = useState(null);
    const [locationText, setLocationText] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    function openCamera() {
        ToastNotification("Opening camera...", "info");
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
            ToastNotification("Photo captured successfully", "success");
        }
        e.target.value = null;
    }

    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
            ToastNotification("Image uploaded successfully", "success");
        }
    }

    function handleDetectLocation() {
        ToastNotification("Detecting GPS coordinates...", "info");
        setTimeout(function() {
            setLocationText("24, Main Street, San Francisco, CA");
            ToastNotification("Location detected", "success");
        }, 1500);
    }

    function handleSubmit() {
        if (!selectedImage) {
            ToastNotification("Please provide a photo as evidence", "error");
            return;
        }
        if (!selectedType) {
            ToastNotification("Please select a trash type", "error");
            return;
        }
        if(!locationText){
            ToastNotification("Please set your location", "error");
            return;
        }

        setIsSubmitting(true);
        setTimeout(function() {
            setIsSubmitting(false);
            setShowModal(true);
        }, 1000);
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
                ToastNotification("Image uploaded successfully", "success");
            } else {
                ToastNotification("Please drop an image file", "error");
            }
        }
    }

    return (
        <div className={isDarkTheme ? "dark" : ""}>
        <div className="min-h-screen bg-background animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT SECTION: Image Evidence */}
                <div className="lg:col-span-7 bg-white border border-secondary rounded-veryLarge p-5 shadow-sm space-y-5">
                    <div className="border-b border-secondary pb-4">
                        <h1 className="text-lg font-bold text-primary">Upload evidence</h1>
                        <p className="text-xs text-gray-500 mt-1 font-medium">A clear photo helps city teams respond faster.</p>
                    </div>

                    <div 
                        onDragEnter={(e) => handleDragEnter(e)}
                        onDragOver={(e) => handleDragOver(e)}
                        onDragLeave={(e) => handleDragLeave(e)}
                        onDrop={(e) => handleDrop(e)}
                        className={`relative group border-2 border-dashed rounded-veryLarge h-80 flex flex-col items-center justify-center bg-background/50 hover:bg-secondary/20 transition-all duration-200 ${
                            isDragging ? 'border-primary bg-primary/10' : 'border-primaryLight'
                        }`}
                    >
                        {selectedImage ? (
                            <div className="relative w-full h-full">
                                <img src={selectedImage} alt="Evidence" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => openCamera()}
                                    className="absolute bottom-4 right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center hover:scale-[1.1] active:scale-[0.9] transition-all duration-200 shadow-lg"
                                >
                                    <Camera size={20} isPressed={false} isDarkTheme={true} />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => openCamera()}
                                className="text-center space-y-4 w-full h-full flex flex-col items-center justify-center focus:outline-none group"
                            >
                                <div className="mx-auto w-14 h-14 bg-white rounded-full flex items-center justify-center text-secondaryDark shadow-sm group-hover:scale-110 transition-transform duration-200">
                                    <Camera size={24} isPressed={false} isDarkTheme={false} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-primary">Click to capture photo</p>
                                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">or drag & drop image</p>
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
                            onChange={(e) => handleFileUpload(e)} 
                        />
                        <input 
                            type="file" 
                            ref={cameraInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            capture="environment" 
                            onChange={(e) => handleCameraCapture(e)}
                        />
                        
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            className="bg-primaryLight text-white py-3 rounded-veryLarge text-xs font-bold flex items-center justify-center gap-2 hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 shadow-sm shadow-primaryLight/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <Add size={16} isPressed={false} isDarkTheme={true} />
                            Upload image
                        </button>
                        <button 
                            onClick={() => openCamera()}
                            className="bg-primary text-white py-3 rounded-veryLarge text-xs font-bold flex items-center justify-center gap-2 hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 shadow-sm shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <Camera size={16} isPressed={false} isDarkTheme={true} />
                            Capture photo
                        </button>
                    </div>
                </div>

                {/* RIGHT SECTION: Form Details */}
                <div className="lg:col-span-5 space-y-5">
                    
                    {/* Location Section */}
                    <div className="bg-white border border-secondary rounded-veryLarge p-5 shadow-sm space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Location</label>
                        
                        <button 
                            onClick={() => handleDetectLocation()}
                            className="w-full flex items-center justify-between p-3 bg-background border border-secondary rounded-large hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 group"
                        >
                            <div className="flex items-center gap-3">
                                <Location size={18} isPressed={false} isDarkTheme={false} />
                                <span className="text-sm font-medium text-primary">Auto-detect my location</span>
                            </div>
                            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                        </button>

                        <input 
                            type="text" 
                            value={locationText}
                            onChange={(e) => setLocationText(e.target.value)}
                            placeholder="Or search / enter address..."
                            className="w-full p-3 bg-background border border-secondary rounded-large text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[1.02] transition-all duration-200"
                        />
                    </div>

                    {/* Trash Type Section */}
                    <div className="bg-white border border-secondary rounded-veryLarge p-5 shadow-sm space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trash type</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Trash size={18} isPressed={false} isDarkTheme={false} />
                            </div>
                            <select 
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full p-3 pl-11 bg-background border border-secondary rounded-large text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[1.02] transition-all duration-200 cursor-pointer"
                            >
                                <option value="">Select type</option>
                                {trashTypes.map(function(type) {
                                    return (
                                        <option key={type} value={type}>
                                            {type.toLowerCase().replace(/_/g, ' ')}
                                        </option>
                                    );
                                })}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <DownArrow size={14} isPressed={false} isDarkTheme={false} />
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="bg-white border border-secondary rounded-veryLarge p-5 shadow-sm space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Details</label>
                        <textarea 
                            rows="4"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Describe what you see..."
                            className="w-full p-3 bg-background border border-secondary rounded-large text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[1.02] transition-all duration-200 resize-none"
                        ></textarea>
                    </div>

                    <button 
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting}
                        className="w-full bg-primaryLight text-white py-4 rounded-veryLarge font-bold text-sm shadow-lg shadow-primaryLight/20 hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        {isSubmitting ? "Processing..." : "Submit report"}
                    </button>
                </div>

                </div>
            </div>

            {showModal && <ReportSubmittedModal onClose={() => setShowModal(false)} />}
            <ToastContainer />
        </div>
        </div>
    );
}

export default ReportTrash;
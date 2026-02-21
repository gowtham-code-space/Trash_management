import React from "react";
import ThemeStore from "../../../store/ThemeStore";
import { X, Download } from "../../../assets/icons/icons";
import { downloadCertificate } from "../../../services/features/quizService";
import ToastNotification from "../../Notification/ToastNotification";

function ShowCertificateModal({ isOpen, onClose, certificateUrl, quizId }) {
    const { isDarkTheme } = ThemeStore();

    console.log('ShowCertificateModal render:', { isOpen, certificateUrl, quizId });

    if (!isOpen || !certificateUrl) return null;

    async function handleDownload(e) {
        e.stopPropagation();
        
        try {
            const result = await downloadCertificate(quizId);
            if (!result.success) {
                console.error('Failed to download certificate:', result.error);
                ToastNotification('Failed to download certificate. Please try again.', 'error');
            } else {
                ToastNotification('Certificate downloaded successfully!', 'success');
            }
        } catch (error) {
            console.error('Error downloading certificate:', error);
            ToastNotification('Failed to download certificate. Please try again.', 'error');
        }
    }

    return (
        <div className={isDarkTheme ? "dark" : ""}>
            <div 
                className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-60 animate-in fade-in duration-200"
                onClick={onClose}
            >
                <div 
                    className="bg-white dark:bg-gray-800 rounded-large w-full max-w-3xl p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500 max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-secondaryDark">
                                Certificate of Achievement
                            </h2>
                            <p className="text-sm text-gray-500">
                                Quiz #{quizId}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-medium flex items-center justify-center bg-gray-100 hover:bg-gray-200
                                        hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out
                                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]"
                        >
                            <X size={20} defaultColor="#316F5D" />
                        </button>
                    </div>

                    {/* Certificate Image */}
                    <div className="bg-secondary rounded-large p-4 mb-6 border border-gray-200">
                        <img 
                            src={certificateUrl} 
                            alt="Certificate" 
                            className="w-full h-auto rounded-medium pointer-events-none select-none"
                            draggable="false"
                            onError={(e) => {
                                console.error('Certificate image failed to load:', certificateUrl);
                            }}
                        />
                    </div>

                    {/* Download Button */}
                    <button
                        onClick={handleDownload}
                        className="w-full px-6 py-3 rounded-medium text-sm font-medium bg-primary text-white flex items-center justify-center gap-2
                                    hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out
                                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]"
                    >
                        <Download size={18} defaultColor="#fff" />
                        Download Certificate
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ShowCertificateModal;

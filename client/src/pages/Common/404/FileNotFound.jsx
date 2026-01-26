import React from 'react';
import { useNavigate } from 'react-router-dom';

function FileNotFound() {
    const navigate = useNavigate();

    return (
        <div className="relative w-screen h-screen bg-linear-to-br from-[#3d8b7a] via-[#4a9b88] to-[#2d5f6f] overflow-hidden flex items-center justify-center">
            {/* Decorative circles */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] md:w-[50%] md:h-[50%] lg:w-[60%] lg:h-[60%] bg-[#4a9b88] rounded-full opacity-30 blur-3xl"></div>
            <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] md:w-[60%] md:h-[60%] lg:w-[70%] lg:h-[70%] bg-[#2d5f6f] rounded-full opacity-40 blur-3xl"></div>
            <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] md:w-[30%] md:h-[30%] bg-[#5ab09c] rounded-full opacity-20 blur-2xl"></div>

            {/* Content */}
            <div className="relative z-10 text-center px-6 md:px-12 lg:px-24 max-w-5xl">
                {/* 404 Text */}
                <h1 className="text-[120px] sm:text-[150px] md:text-[180px] lg:text-[220px] font-bold text-white leading-none mb-4 md:mb-6">
                    404
                </h1>

                {/* Page Not Found */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 md:mb-8">
                    Page Not Found
                </h2>

                {/* Description */}
                <p className="text-sm sm:text-base md:text-lg text-white/80 leading-relaxed mb-8 md:mb-10 max-w-3xl mx-auto px-4">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. 
                    Please check the URL or return to the homepage to continue exploring.
                </p>

                {/* Button */}
                <button
                    onClick={() => navigate('/')}
                    className="inline-block px-8 py-3 md:px-10 md:py-4 bg-white text-primary font-bold text-sm md:text-base rounded-full shadow-lg hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-white/30"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}

export default FileNotFound;

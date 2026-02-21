import React, { useState, useEffect } from "react";
import { LeftArrow, RightArrow } from "../assets/icons/icons";

function Pagination({ data, itemsPerPage = 5, renderItem, gridDisplay = false, serverSide = false, totalItems = 0, currentPage = 1, onPageChange }) {
const [localPage, setLocalPage] = useState(1);

const activePage = serverSide ? currentPage : localPage;

const totalPages = serverSide 
    ? Math.ceil(totalItems / itemsPerPage) 
    : Math.ceil(data.length / itemsPerPage);

const startIdx = serverSide 
    ? (currentPage - 1) * itemsPerPage 
    : (localPage - 1) * itemsPerPage;

const endIdx = serverSide 
    ? Math.min(startIdx + itemsPerPage, totalItems) 
    : Math.min(startIdx + itemsPerPage, data.length);

const currentItems = serverSide ? data : data.slice(startIdx, endIdx);

const displayTotal = serverSide ? totalItems : data.length;

useEffect(() => {
    if (!serverSide) {
        setLocalPage(1);
    }
}, [data.length, serverSide]);

function handlePageChange(pageNum) {
    if (pageNum >= 1 && pageNum <= totalPages) {
        if (serverSide && onPageChange) {
            onPageChange(pageNum);
        } else {
            setLocalPage(pageNum);
        }
    }
}

return (
<>
    {/* Render Items */}
    <div className={`${gridDisplay && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"} transition-all animate-in fade-in slide-in-from-bottom-2 duration-500 min-h-100`}>
    {currentItems.map(renderItem)}
    </div>

    {/* Pagination Controls */}
    <div className="flex items-center justify-end mt-6 gap-4 border-t border-secondary pt-4">
    <span className="text-[11px] font-bold text-gray-400">
        Showing {startIdx + 1}-{endIdx} of {displayTotal}
    </span>
    
    <div className="flex items-center gap-1.5">
        <button 
        onClick={() => handlePageChange(activePage - 1)}
        className={`p-1.5 rounded-lg border border-secondary transition-all ${
            activePage === 1 
            ? 'opacity-20 pointer-events-none' 
            : 'hover:bg-background active:scale-90 text-primary'
        }`}
        >
        <LeftArrow size={14} />
        </button>

        <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg text-xs font-bold shadow-sm">
        {activePage}
        </div>

        {activePage < totalPages && (
        <button 
            onClick={() => handlePageChange(activePage + 1)}
            className="w-8 h-8 flex items-center justify-center border border-secondary hover:bg-background rounded-lg text-primary text-xs font-bold transition-all"
        >
            {activePage + 1}
        </button>
        )}

        <button 
        onClick={() => handlePageChange(activePage + 1)}
        className={`p-1.5 rounded-lg border border-secondary transition-all ${
            activePage === totalPages 
            ? 'opacity-20 pointer-events-none' 
            : 'hover:bg-background active:scale-90 text-primary'
        }`}
        >
        <RightArrow size={14} />
        </button>
    </div>
    </div>
</>
);
}

export default Pagination;
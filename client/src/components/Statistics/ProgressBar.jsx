import React from "react";
function ProgressBar({item , defaultColor=null}){

    function getBarColor(stars) {
        if (stars === 5) return "bg-warning";
        if (stars === 4) return "bg-warning/75";
        if (stars === 3) return "bg-warning/50";
        if (stars === 2) return "bg-warning/30";
        return "bg-warning/15";
    }
    return (
    <div key={item.stars} className="flex items-center gap-3">
        <span className="text-sm font-semibold text-secondaryDark w-3 text-center">
            {item.stars}
        </span>
        
        <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
                className={`h-full ${defaultColor ? defaultColor : getBarColor(item.stars)} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${item.percentage}%` }}
            />
        </div>
    </div>
);
}
export default ProgressBar
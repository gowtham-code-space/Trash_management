import React from 'react'
import HeatMap from '../../../../components/Statistics/HeatMap'
import Rating from "../../../../components/Statistics/Rating"
function Environment() {
    const residentFeedbackData = {
        averageRating: 4.8,
        totalReviews: 142,
        ratingBreakdown: [
            { stars: 5, count: 90, percentage: 63 },
            { stars: 4, count: 35, percentage: 25 },
            { stars: 3, count: 10, percentage: 7 },
            { stars: 2, count: 5, percentage: 3 },
            { stars: 1, count: 2, percentage: 2 },
        ],
    };
    const HeatMapData = {
        "2026-01-01": 3,
        "2026-01-02": 7,
        "2026-01-03": 12,
        "2026-01-05": 5,
        "2026-01-08": 18,
        "2026-01-10": 4,
        "2026-01-12": 15,
        "2026-01-15": 9,
        "2026-01-18": 6,
        "2026-01-20": 11,
        "2026-01-22": 2,
        "2026-01-25": 14,
        "2026-01-28": 8,
        "2026-02-03": 10,
        "2026-02-07": 5,
        "2026-02-12": 16,
        "2026-02-15": 3,
        "2026-02-20": 7,
        "2026-02-25": 13,
        "2026-03-05": 9,
        "2026-03-10": 4,
        "2026-03-15": 11,
        "2026-03-20": 6,
        "2026-03-25": 15,
    };
    return (
        <div>
            <HeatMap data={HeatMapData}/>
            <div className='mt-5'>
                <Rating yearDropDown={['2025', '2026']} 
                    monthDropDown={["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]}
                    averageRating={residentFeedbackData.averageRating}
                    totalReviews={residentFeedbackData.totalReviews}
                    ratingBreakdown={residentFeedbackData.ratingBreakdown}/>
            </div>
        </div>
    )
}

export default Environment

import pool from '../../../config/db.js';

export const getIdCardData = async (userId) => {
    try {
        const query = `
            SELECT 
                user_id,
                role_id,
                first_name,
                last_name,
                email,
                phone_number,
                profile_pic,
                created_at,
                district,
                ward_number,
                ward_name,
                street_name,
                house_number
            FROM users
            WHERE user_id = ?
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [userId]);
        conn.release();
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error fetching ID card data:', error);
        throw error;
    }
};

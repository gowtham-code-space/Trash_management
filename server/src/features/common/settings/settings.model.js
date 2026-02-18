import pool from '../../../config/db.js';


export const getUserProfile = async (userId) => {
    try {
        const query = `
            SELECT 
                user_id, 
                role_id, 
                first_name, 
                last_name, 
                phone_number, 
                email, 
                profile_pic,
                district,
                ward_number,
                ward_name,
                street_name,
                house_number,
                preferred_language
            FROM users 
            WHERE user_id = ?
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [userId]);
        conn.release();
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

// Update basic profile info (firstName, lastName, profilePic)
export const updateBasicProfile = async (userId, updateData) => {
    try {
        let query;
        let params;
        
        if (updateData.profilePic !== null) {
            query = `
                UPDATE users 
                SET first_name = ?, 
                    last_name = ?, 
                    profile_pic = ?
                WHERE user_id = ?
            `;
            params = [
                updateData.firstName,
                updateData.lastName,
                updateData.profilePic,
                userId
            ];
        } else {
            query = `
                UPDATE users 
                SET first_name = ?, 
                    last_name = ?
                WHERE user_id = ?
            `;
            params = [
                updateData.firstName,
                updateData.lastName,
                userId
            ];
        }
        
        const conn = await pool.getConnection();
        const [result] = await conn.execute(query, params);
        conn.release();
        
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating basic profile:', error);
        throw error;
    }
};

export const deleteProfilePic = async (userId) => {
    try {
        const query = `UPDATE users SET profile_pic = NULL WHERE user_id = ?`;
        
        const conn = await pool.getConnection();
        const [result] = await conn.execute(query, [userId]);
        conn.release();
        
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error deleting profile pic:', error);
        throw error;
    }
};

export const checkEmailExists = async (email, userId) => {
    try {
        const query = `
            SELECT user_id 
            FROM users 
            WHERE email = ? AND user_id != ?
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [email, userId]);
        conn.release();
        
        return rows.length > 0;
    } catch (error) {
        console.error('Error checking email existence:', error);
        throw error;
    }
};

export const checkPhoneExists = async (phone, userId) => {
    try {
        const query = `
            SELECT user_id 
            FROM users 
            WHERE phone_number = ? AND user_id != ?
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [phone, userId]);
        conn.release();
        
        return rows.length > 0;
    } catch (error) {
        console.error('Error checking phone existence:', error);
        throw error;
    }
};

export const updateUserEmail = async (userId, email) => {
    try {
        const query = `
            UPDATE users 
            SET email = ?
            WHERE user_id = ?
        `;
        
        const conn = await pool.getConnection();
        const [result] = await conn.execute(query, [email, userId]);
        conn.release();
        
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating user email:', error);
        throw error;
    }
};

export const updateUserPhone = async (userId, phone) => {
    try {
        const query = `
            UPDATE users 
            SET phone_number = ?
            WHERE user_id = ?
        `;
        
        const conn = await pool.getConnection();
        const [result] = await conn.execute(query, [phone, userId]);
        conn.release();
        
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating user phone:', error);
        throw error;
    }
};

export const storeSettingsOtp = async (userId, identifier, hashedOtp) => {
    try {
        const query = `
            INSERT INTO auth_otp 
            (user_id, otp_type, identifier, otp_hash, is_used, expires_at, created_at)
            VALUES (?, 'EMAIL', ?, ?, 0, DATE_ADD(NOW(), INTERVAL 10 MINUTE), NOW())
        `;
        
        const conn = await pool.getConnection();
        const [result] = await conn.execute(query, [userId, identifier, hashedOtp]);
        conn.release();
        
        return { otp_id: result.insertId, success: true };
    } catch (error) {
        console.error('Error storing settings OTP:', error);
        throw error;
    }
};
export const getSettingsOtpByIdentifier = async (identifier) => {
    try {
        const query = `
            SELECT * FROM auth_otp 
            WHERE identifier = ? AND is_used = 0 AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [identifier]);
        conn.release();
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error fetching settings OTP:', error);
        throw error;
    }
};

export const markOtpAsUsed = async (otpId) => {
    try {
        const query = `UPDATE auth_otp SET is_used = 1 WHERE otp_id = ?`;
        
        const conn = await pool.getConnection();
        const [result] = await conn.execute(query, [otpId]);
        conn.release();
        
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error marking OTP as used:', error);
        throw error;
    }
};

export const invalidateOldOtps = async (userId) => {
    try {
        const query = `
            UPDATE auth_otp 
            SET is_used = 1 
            WHERE user_id = ? 
            AND is_used = 0 
            AND expires_at > NOW()
        `;
        
        const conn = await pool.getConnection();
        const [result] = await conn.execute(query, [userId]);
        conn.release();
        
        return result.affectedRows;
    } catch (error) {
        console.error('Error invalidating old OTPs:', error);
        throw error;
    }
};

export const getUserAddress = async (userId) => {
    try {
        const query = `
            SELECT 
                district,
                ward_number,
                ward_name,
                street_name,
                house_number,
                last_address_change
            FROM users
            WHERE user_id = ?
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [userId]);
        conn.release();
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error fetching user address:', error);
        throw error;
    }
};

export const updateUserAddress = async (userId, addressData) => {
    try {
        const query = `
            UPDATE users 
            SET district = ?,
                ward_number = ?,
                ward_name = ?,
                street_name = ?,
                house_number = ?,
                last_address_change = NOW()
            WHERE user_id = ?
        `;
        
        const params = [
            addressData.district,
            addressData.ward_number,
            addressData.ward_name,
            addressData.street_name,
            addressData.house_number,
            userId
        ];
        
        const conn = await pool.getConnection();
        const [result] = await conn.execute(query, params);
        conn.release();
        
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating user address:', error);
        throw error;
    }
};

export const getDistrictNameById = async (districtId) => {
    try {
        const query = 'SELECT district_name FROM district WHERE district_id = ?';
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [districtId]);
        conn.release();
        return rows.length > 0 ? rows[0].district_name : null;
    } catch (error) {
        console.error('Error fetching district name:', error);
        throw error;
    }
};

export const getWardDetailsById = async (wardId) => {
    try {
        const query = 'SELECT ward_number, ward_name FROM ward WHERE ward_id = ?';
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [wardId]);
        conn.release();
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error fetching ward details:', error);
        throw error;
    }
};

export const getStreetNameById = async (streetId) => {
    try {
        const query = 'SELECT street_name FROM street WHERE street_id = ?';
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [streetId]);
        conn.release();
        return rows.length > 0 ? rows[0].street_name : null;
    } catch (error) {
        console.error('Error fetching street name:', error);
        throw error;
    }
};

export const getDistrictIdByName = async (districtName) => {
    try {
        const query = 'SELECT district_id FROM district WHERE district_name = ?';
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [districtName]);
        conn.release();
        return rows.length > 0 ? rows[0].district_id : null;
    } catch (error) {
        console.error('Error fetching district id:', error);
        throw error;
    }
};

export const getWardIdByDetails = async (wardNumber, wardName) => {
    try {
        const query = 'SELECT ward_id FROM ward WHERE ward_number = ? AND ward_name = ?';
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [wardNumber, wardName]);
        conn.release();
        return rows.length > 0 ? rows[0].ward_id : null;
    } catch (error) {
        console.error('Error fetching ward id:', error);
        throw error;
    }
};

export const getStreetIdByName = async (streetName) => {
    try {
        const query = 'SELECT street_id FROM street WHERE street_name = ?';
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [streetName]);
        conn.release();
        return rows.length > 0 ? rows[0].street_id : null;
    } catch (error) {
        console.error('Error fetching street id:', error);
        throw error;
    }
};

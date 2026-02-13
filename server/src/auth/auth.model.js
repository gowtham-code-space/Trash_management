import pool from '../config/db.js';

export const storeOtp = async (userId, identifier, hashedOtp) => {
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
        console.error('Error storing OTP:', error);
        throw error;
    }
};

export const getOtpByIdentifier = async (identifier) => {
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
        console.error('Error fetching OTP:', error);
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

export const getUserByIdentifier = async (identifier) => {
    try {
        const query = `
            SELECT u.*, r.role_name 
            FROM users u
            LEFT JOIN role r ON u.role_id = r.role_id
            WHERE u.phone_number = ? OR u.email = ?
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [identifier, identifier]);
        conn.release();
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error fetching user by identifier:', error);
        throw error;
    }
};

export const createUser = async (identifier, identifierType = 'email', roleName = 'RESIDENT') => {
    try {
        // First, get role_id
        const roleQuery = `SELECT role_id FROM role WHERE role_name = ?`;
        const conn = await pool.getConnection();
        const [roleRows] = await conn.execute(roleQuery, [roleName]);
        
        if (roleRows.length === 0) {
            conn.release();
            throw new Error('Role not found');
        }
        
        const role_id = roleRows[0].role_id;
        
        // Create new user with has_completed_signup = 0
        const userQuery = `
            INSERT INTO users 
            (role_id, ${identifierType === 'email' ? 'email' : 'phone_number'}, has_completed_signup, created_at)
            VALUES (?, ?, 0, NOW())
        `;
        
        const [result] = await conn.execute(userQuery, [role_id, identifier]);
        conn.release();
        
        return { user_id: result.insertId, role_id, success: true };
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const getUserById = async (userId) => {
    try {
        const query = `
            SELECT u.*, r.role_name FROM users u
            LEFT JOIN role r ON u.role_id = r.role_id
            WHERE u.user_id = ?
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [userId]);
        conn.release();
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        throw error;
    }
};

export const getOtpById = async (otpId) => {
    try {
        const query = `SELECT * FROM auth_otp WHERE otp_id = ?`;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [otpId]);
        conn.release();
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error fetching OTP by ID:', error);
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

export const completeUserSignup = async (userId, userData) => {
    try {
        const query = `
            UPDATE users 
            SET first_name = ?, 
                last_name = ?, 
                email = ?,
                phone_number = ?,
                district = ?,
                ward_name = ?,
                street_name = ?,
                house_number = ?,
                profile_pic = ?,
                has_completed_signup = 1
            WHERE user_id = ?
        `;
        
        const conn = await pool.getConnection();
        const [result] = await conn.execute(query, [
            userData.firstName,
            userData.lastName,
            userData.email,
            userData.phoneNumber,
            userData.district,
            userData.wardName,
            userData.streetName,
            userData.houseNumber,
            userData.profilePic || null,
            userId
        ]);
        conn.release();
        
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error completing user signup:', error);
        throw error;
    }
};

// Refresh token management
export const storeRefreshTokenHash = async (userId, tokenHash) => {
    try {
        const query = `UPDATE users SET refresh_token_hash = ? WHERE user_id = ?`;
        
        const conn = await pool.getConnection();
        const [result] = await conn.execute(query, [tokenHash, userId]);
        conn.release();
        
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error storing refresh token hash:', error);
        throw error;
    }
};

export const getRefreshTokenHash = async (userId) => {
    try {
        const query = `SELECT refresh_token_hash FROM users WHERE user_id = ?`;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [userId]);
        conn.release();
        
        return rows.length > 0 ? rows[0].refresh_token_hash : null;
    } catch (error) {
        console.error('Error fetching refresh token hash:', error);
        throw error;
    }
};

export const clearRefreshTokenHash = async (userId) => {
    try {
        const query = `UPDATE users SET refresh_token_hash = NULL WHERE user_id = ?`;
        
        const conn = await pool.getConnection();
        const [result] = await conn.execute(query, [userId]);
        conn.release();
        
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error clearing refresh token hash:', error);
        throw error;
    }
};

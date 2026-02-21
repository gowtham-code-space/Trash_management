import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.OTP_ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

export const hashOtp = (otp) => {
    try {
        const iv = crypto.randomBytes(16);
        const key = Buffer.from(ENCRYPTION_KEY, 'hex');
        
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(otp, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        // Format: iv:authTag:encrypted
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Error hashing OTP:', error);
        throw new Error('Failed to hash OTP');
    }
};

export const unhashOtp = (hashedOtp) => {
    try {
        const [ivHex, authTagHex, encrypted] = hashedOtp.split(':');
        
        if (!ivHex || !authTagHex || !encrypted) {
            throw new Error('Invalid OTP format');
        }
        
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const key = Buffer.from(ENCRYPTION_KEY, 'hex');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Error unhashing OTP:', error);
        throw new Error('Failed to unhash OTP');
    }
};

// produces 6 digit (100,000-999,999) range
export const generateOtpCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

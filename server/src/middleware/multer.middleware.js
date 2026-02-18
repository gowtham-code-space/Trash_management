import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import { badRequestResponse } from '../utils/response.js';

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        // Use authenticated user's ID if available, otherwise fallback
        const userId = req.user?.user_id || req.body.userId || 'unknown';
        return {
            folder: `trash_management/${userId}`,
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ quality: 'auto' }]
        };
    }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB limit
    }
});

export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return badRequestResponse(res, 'File size must not exceed 5 MB');
        }
        return badRequestResponse(res, err.message);
    } else if (err) {
        return badRequestResponse(res, err.message || 'File upload failed');
    }
    next();
};

export default upload;

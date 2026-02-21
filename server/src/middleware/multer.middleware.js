import multer from 'multer';
import { badRequestResponse } from '../utils/response.js';

// Configure memory storage for multer
const storage = multer.memoryStorage();

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

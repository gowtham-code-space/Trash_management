import cloudinary from '../config/cloudinary.js';

export const getPublicUrl = (publicId, options = {}) => {
    return cloudinary.url(publicId, {
        secure: true,
        ...options
    });
};

//Get optimized public URL with transformations
export const getOptimizedUrl = (publicId, transformations = {}) => {
    return cloudinary.url(publicId, {
        secure: true,
        quality: 'auto',
        fetch_format: 'auto',
        ...transformations
    });
};

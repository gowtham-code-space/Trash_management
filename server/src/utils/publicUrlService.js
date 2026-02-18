import cloudinary from '../config/cloudinary.js';

export const getPublicUrl = (publicId, options = {}) => {
    return cloudinary.url(publicId, {
        secure: true,
        ...options
    });
};

export const getOptimizedUrl = (publicId, transformations = {}) => {
    return cloudinary.url(publicId, {
        secure: true,
        quality: 'auto',
        fetch_format: 'auto',
        ...transformations
    });
};

export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

export const extractPublicId = (cloudinaryUrl) => {
    if (!cloudinaryUrl) return null;
    const parts = cloudinaryUrl.split('/');
    const fileWithExt = parts[parts.length - 1];
    const publicId = fileWithExt.split('.')[0];
    return publicId;
};

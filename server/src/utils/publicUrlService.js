import cloudinary from '../config/cloudinary.js';

// Save user profile picture to Cloudinary with folder structure: trash_management/(user_id)/user
export const uploadUserProfilePicture = async (buffer, userId) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `trash_management/${userId}/user`,
                resource_type: 'image',
                allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                transformation: [{ quality: 'auto' }]
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        uploadStream.end(buffer);
    });
};

// Save certificate to Cloudinary with folder structure: trash_management/(user_id)/certificates
export const uploadCertificate = async (buffer, certId, userId) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `trash_management/${userId}/certificates`,
                public_id: certId,
                resource_type: 'image',
                format: 'png'
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        uploadStream.end(buffer);
    });
};

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

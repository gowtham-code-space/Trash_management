import express from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware.js';
import upload, { handleMulterError } from '../../../middleware/multer.middleware.js';
import {
    getUserProfileHandler,
    updateBasicProfileHandler,
    requestEmailChangeOtpHandler,
    verifyEmailChangeOtpHandler,
    requestPhoneChangeOtpHandler,
    deleteProfilePicHandler,
    getAddressHandler,
    updateAddressHandler
} from './settings.controller.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/profile', getUserProfileHandler);

router.patch('/profile', upload.single('profilePic'),handleMulterError,updateBasicProfileHandler);
router.delete('/profile-pic', deleteProfilePicHandler);
router.post('/request-email-otp', requestEmailChangeOtpHandler);
router.post('/verify-email-otp', verifyEmailChangeOtpHandler);
router.post('/request-phone-otp', requestPhoneChangeOtpHandler);

router.get('/address', getAddressHandler);
router.patch('/address', updateAddressHandler);

export default router;

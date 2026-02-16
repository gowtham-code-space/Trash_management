import express from 'express';
import { requestOtpHandler, verifyOtpHandler, refreshTokenHandler, logoutHandler, completeSignupHandler, getUserDetailsHandler } from './auth.controller.js';
import upload, { handleMulterError } from '../middleware/multer.middleware.js';

const router = express.Router();

router.post('/request-otp', requestOtpHandler);
router.post('/verify-otp', verifyOtpHandler);
router.post('/complete-signup', upload.single('profilePic'), handleMulterError, completeSignupHandler);
router.post('/refresh', refreshTokenHandler);
router.post('/logout', logoutHandler);
router.get('/user/:userId', getUserDetailsHandler);

export default router;

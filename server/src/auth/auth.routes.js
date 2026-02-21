import express from 'express';
import { requestOtpHandler, verifyOtpHandler, refreshTokenHandler, logoutHandler, completeSignupHandler, getUserDetailsHandler, getDistrictsHandler, getWardsHandler, getStreetsHandler, checkContactHandler } from './auth.controller.js';
import upload, { handleMulterError } from '../middleware/multer.middleware.js';

const router = express.Router();

router.post('/request-otp', requestOtpHandler);
router.post('/verify-otp', verifyOtpHandler);
router.post('/complete-signup', upload.single('profilePic'), handleMulterError, completeSignupHandler);
router.post('/refresh', refreshTokenHandler);
router.post('/logout', logoutHandler);
router.get('/user/:userId', getUserDetailsHandler);

router.get('/districts', getDistrictsHandler);
router.get('/wards/:districtId', getWardsHandler);
router.get('/streets/:wardId', getStreetsHandler);
router.post('/check-contact', checkContactHandler);

export default router;

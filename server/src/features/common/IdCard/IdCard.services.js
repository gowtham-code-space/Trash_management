import * as idCardModel from './IdCard.model.js';

export const getIdCardService = async (userId) => {
    try {
        const userData = await idCardModel.getIdCardData(userId);
        
        if (!userData) {
            throw new Error('User not found');
        }

        if (userData.role_id === 1) {
            throw new Error('ID card not available for residents');
        }

        const employeeId = `#${userData.role_id}/${userData.user_id}`;
        const fullName = `${userData.first_name} ${userData.last_name}`;
        const address = [
            userData.house_number,
            userData.street_name,
            userData.ward_number ? `Ward ${userData.ward_number}` : null,
            userData.ward_name,
            userData.district
        ].filter(Boolean).join(', ');

        const qrData = {
            employeeId,
            userId: userData.user_id,
            roleId: userData.role_id,
            name: fullName
        };

        const idCard = {
            employeeId,
            fullName,
            email: userData.email,
            phoneNumber: userData.phone_number,
            profilePic: userData.profile_pic,
            address: address || 'Not provided',
            cardStatus: 'Active',
            issuedDate: userData.created_at,
            qrCode: Buffer.from(JSON.stringify(qrData)).toString('base64')
        };

        return idCard;
    } catch (error) {
        console.error('Error in getIdCardService:', error);
        throw error;
    }
};

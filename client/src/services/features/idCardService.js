import { api } from '../core/apiMethods';

export const getIdCard = async () => {
    const response = await api.get('/idcard');
    return response.data.idCard;
};

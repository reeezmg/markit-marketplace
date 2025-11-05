import api from './client';

export const getAllProducts = () => api.get('/products');

export const getProductById = (id) => api.get(`/products/${id}`);

export const getAllVariantsOfShop = (id) => api.get(`/products/company/${id}`);

export const getVariantById = (id) => api.get(`/products/variant/${id}`);

export const getAllCategories = (companyId) => api.get(`/products/categories/${companyId}`);

export const getAllShop = (lat,lng) => api.get(`/shops?lat=${lat}&lng=${lng}`);

export const getNearbyShop = (home, shops) =>
  api.post('/shops/nearby-route-shops', {
    home,   // { lat, lng }
    shops,  // [{ lat, lng }, ...]
  });

export const postOrder = (data) => api.post('/order/trynbuy', data);

export const getTryHistory = () => api.get('/history/trynbuy');

export const verifyPayment = (data) => api.post('/razorpay/verify', data);
export const initiatePayment = (data) => api.post('/razorpay/initiate', data);
export const createTrynBuyBill = (data) => api.post('/checkout/trynbuy/bill', data);

export const getProfile = () => api.get('/client')
export const updateProfile = (data) => api.put('/client', data)
export const deleteProfile = () => api.delete('/client')

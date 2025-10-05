import api from './client';

export const getAllProducts = () => api.get('/products');

export const getProductById = (id) => api.get(`/products/${id}`);

export const getAllVariantsOfShop = (id) => api.get(`/products/company/${id}`);

export const getVariantById = (id) => api.get(`/products/variant/${id}`);

export const getAllCategories = (companyId) => api.get(`/products/categories/${companyId}`);

export const getAllShop = (lat,lng) => api.get(`/shops?lat=${lat}&lng=${lng}`);

export const postCheckout = (data) => api.post('/checkout/trynbuy', data);

export const getTryHistory = (data) => api.get('/history/trynbuy', data);


export const getProfile = () => api.get('/client')
export const updateProfile = (data) => api.put('/client', data)
export const deleteProfile = () => api.delete('/client')

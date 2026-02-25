import api from './client';

export const getAllProducts = () => api.get('/products');

export const getProductById = (id) => api.get(`/products/${id}`);

export const getAllVariantsOfShop = (id) => api.get(`/products/company/${id}`);

export const getVariantById = (id) => api.get(`/products/variant/${id}`);

export const getAllCategories = (companyId) => api.get(`/products/categories/${companyId}`);

export const getAllBrands = (companyId) => api.get(`/products/brands/${companyId}`);

export const getAllShop = (lat, lng) => api.get(`/shops?lat=${lat}&lng=${lng}`);

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

export const updateTryNBuyPackingStatus = (id, status) => api.put(`/pack/trynbuy/${id}/packing-status`, { status });

export const getProfile = () => api.get('/client')
export const updateProfile = (data) => api.put('/client', data)
export const deleteProfile = () => api.delete('/client')

// In api.ts - Update fetchCoupons function
export const fetchCoupons = async (companyId: string, clientId?: string, type?: string) => {
  try {
    console.log('Fetching coupons with params:', { companyId, clientId, type });
    
    const response = await api.get('/coupon/findManyCoupon', {
      params: { 
        companyId,
        clientId,
        type 
      }
    });
    
    console.log('FetchCoupons response data:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error fetching coupons:', error);
    return { data: [] };
  }
}

export const validateCoupon = async (data: {
  code: string;
  companyId: string;
  clientId: string;
  orderValue: number;
  billId?: string;
  isMarkit?: boolean;
}) => {
  try {
    const response = await api.post('/coupon/validate', data);
    return response;
  } catch (error: any) {
    // If the server returns an error response, format it consistently
    if (error.response) {
      // Server responded with error status
      return {
        data: {
          valid: false,
          error: error.response.data.error || 'Failed to validate coupon'
        }
      };
    }
    // Network error or other issue
    throw error;
  }
};

import api from './client';

export const getAllProducts = () => api.get('/products');

export const getProductById = (id) => api.get(`/products/${id}`);

export const getAllVariantsOfShop = (id) => api.get(`/products/company/${id}`);

export const getVariantById = (id) => api.get(`/products/variant/${id}`);

export const validateStock = (items: {
  variantId: string;
  size?: string | null;
  quantity: number;
}[]) => api.post('/products/stock/validate', { items });

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
export const createTrynBuyBill = (data) => api.post('/checkout/trynbuy/bill', data);
export const completeTrynBuyCheckout = (data) => api.post('/checkout/trynbuy/complete', data);
export const cancelTrynBuyOrder = (trynbuyId: string) => api.post(`/checkout/trynbuy/${trynbuyId}/cancel`);
export const checkDeliveryConfirmed = (trynbuyId: string) => api.get(`/checkout/trynbuy/${trynbuyId}/delivery-confirmed`);
export const fetchDeliveryStepEvents = (trynbuyId: string) => api.get(`/checkout/trynbuy/${trynbuyId}/step-events`);
export const getWaitingElapsed = (trynbuyId: string) => api.get(`/checkout/trynbuy/${trynbuyId}/waiting-elapsed`);

export const updateTryNBuyPackingStatus = (id, status) => api.put(`/pack/trynbuy/${id}/packing-status`, { status });

export const getProfile = () => api.get('/client')
export const updateProfile = (data) => api.put('/client', data)
export const deleteProfile = () => api.delete('/client')

// In api.ts - Update fetchCoupons function
export const fetchCoupons = async (companyId: string, clientId?: string, type?: string) => {
  try {
    const response = await api.get('/coupon/findManyCoupon', {
      params: { 
        companyId,
        clientId,
        type 
      }
    });
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

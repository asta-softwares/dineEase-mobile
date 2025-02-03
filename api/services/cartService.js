import apiClient from '../client';

export const cartService = {
  createCart: async (cartData) => {
    try {
      const response = await apiClient.post('/carts/', cartData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.response?.data?.detail ||
                          error.message;
      console.error('Error creating cart:', {
        status: error.response?.status,
        message: errorMessage,
        data: error.response?.data
      });
      throw new Error(errorMessage);
    }
  },

  updateCart: async (cartId, cartData) => {
    try {
      const response = await apiClient.patch(`/carts/${cartId}/`, cartData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.response?.data?.detail ||
                          error.message;
      console.error('Error updating cart:', {
        status: error.response?.status,
        message: errorMessage,
        data: error.response?.data
      });
      throw new Error(errorMessage);
    }
  },

  deleteItemCart: async (cartId, itemId) => {
    try {
      const response = await apiClient.delete(`/carts/${cartId}/remove-item/?item_id=${itemId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.response?.data?.detail ||
                          error.message;
      console.error('Error deleting cart item:', {
        status: error.response?.status,
        message: errorMessage,
        data: error.response?.data
      });
      throw new Error(errorMessage);
    }
  },

  deleteCart: async (cartId) => {
    try {
      const response = await apiClient.delete(`/carts/${cartId}/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.response?.data?.detail ||
                          error.message;
      console.error('Error deleting cart:', {
        status: error.response?.status,
        message: errorMessage,
        data: error.response?.data
      });
      throw new Error(errorMessage);
    }
  },

  getCart: async (cartId) => {
    try {
      const response = await apiClient.get(`/carts/${cartId}/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.response?.data?.detail ||
                          error.message;
      console.error('Error getting cart:', {
        status: error.response?.status,
        message: errorMessage,
        data: error.response?.data
      });
      throw new Error(errorMessage);
    }
  }
};

export default cartService;

import apiClient from '../client';
import config from '../config';
import { useUserStore } from '../../stores/userStore';

const authService = {
  register: async (email, phone, password, first_name, last_name, type_of_user) => {
    try {
      const response = await apiClient.post('/register/', {
        email,
        phone,
        password,
        first_name,
        last_name,
        type_of_user,
      });

      const { access, refresh } = response.data;
      useUserStore.getState().setTokens(access, refresh);
      return response.data;
    } catch (error) {
      console.log('Auth service error:', {
        data: error?.response?.data,
        status: error?.response?.status,
        detail: error?.response?.data?.detail
      });
      
      // Handle 401 Unauthorized with specific messages
      if (error?.response?.status === 401) {
        // Pass through the original error response
        throw error;
      }
      
      // Handle validation errors
      if (error?.response?.data && typeof error.response.data === 'object') {
        const validationErrors = Object.entries(error.response.data)
          .map(([field, errors]) => {
            if (Array.isArray(errors)) {
              return `${field}: ${errors[0]}`;
            }
            return null;
          })
          .filter(Boolean)
          .join('\n');
          
        if (validationErrors) {
          throw new Error(validationErrors);
        }
      }
      
      // Handle other errors with detail
      if (error?.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      // Handle network errors
      if (error?.message === 'Network Error') {
        throw new Error('No response from server. Please check your internet connection.');
      }
      
      // Fallback error
      throw new Error(error?.message || 'An unexpected error occurred. Please try again later.');
    }
  },

  login: async (identifier, password) => {
    try {
      const response = await apiClient.post('/token/', {
        username: identifier,
        password: password,
      });

      const { access, refresh } = response.data;
      
      // Store tokens in userStore
      useUserStore.getState().setTokens(access, refresh);
      
      // Load user data after successful login
      const userData = await authService.fetchUser();
      
      return {
        tokens: {
          accessToken: access,
          refreshToken: refresh
        },
        user: userData
      };
    } catch (error) {
      console.log('Auth service error:', {
        data: error?.response?.data,
        status: error?.response?.status,
        detail: error?.response?.data?.detail
      });
      
      // Handle 401 Unauthorized with specific messages
      if (error?.response?.status === 401) {
        // Pass through the original error response
        throw error;
      }
      
      // Handle validation errors
      if (error?.response?.data && typeof error.response.data === 'object') {
        const validationErrors = Object.entries(error.response.data)
          .map(([field, errors]) => {
            if (Array.isArray(errors)) {
              return `${field}: ${errors[0]}`;
            }
            return null;
          })
          .filter(Boolean)
          .join('\n');
          
        if (validationErrors) {
          throw new Error(validationErrors);
        }
      }
      
      // Handle other errors with detail
      if (error?.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      // Handle network errors
      if (error?.message === 'Network Error') {
        throw new Error('No response from server. Please check your internet connection.');
      }
      
      // Fallback error
      throw new Error(error?.message || 'An unexpected error occurred. Please try again later.');
    }
  },

  fetchUser: async () => {
    const authToken = useUserStore.getState().authToken;
    try {
      const response = await apiClient.get('/me/', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const userData = response.data;
      useUserStore.getState().setUser(userData);
      return userData;
    } catch (error) {
      console.log('Auth service error:', {
        data: error?.response?.data,
        status: error?.response?.status,
        detail: error?.response?.data?.detail
      });
      
      // Handle 401 Unauthorized with specific messages
      if (error?.response?.status === 401) {
        // Pass through the original error response
        throw error;
      }
      
      // Handle validation errors
      if (error?.response?.data && typeof error.response.data === 'object') {
        const validationErrors = Object.entries(error.response.data)
          .map(([field, errors]) => {
            if (Array.isArray(errors)) {
              return `${field}: ${errors[0]}`;
            }
            return null;
          })
          .filter(Boolean)
          .join('\n');
          
        if (validationErrors) {
          throw new Error(validationErrors);
        }
      }
      
      // Handle other errors with detail
      if (error?.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      // Handle network errors
      if (error?.message === 'Network Error') {
        throw new Error('No response from server. Please check your internet connection.');
      }
      
      // Fallback error
      throw new Error(error?.message || 'An unexpected error occurred. Please try again later.');
    }
  },

  updateUser: async (userData) => {
    try {
      const authToken = useUserStore.getState().authToken;
      const response = await apiClient.patch('/update-user/', {
        ...userData,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log('Auth service error:', {
        data: error?.response?.data,
        status: error?.response?.status,
        detail: error?.response?.data?.detail
      });
      
      // Handle 401 Unauthorized with specific messages
      if (error?.response?.status === 401) {
        // Pass through the original error response
        throw error;
      }
      
      // Handle validation errors
      if (error?.response?.data && typeof error.response.data === 'object') {
        const validationErrors = Object.entries(error.response.data)
          .map(([field, errors]) => {
            if (Array.isArray(errors)) {
              return `${field}: ${errors[0]}`;
            }
            return null;
          })
          .filter(Boolean)
          .join('\n');
          
        if (validationErrors) {
          throw new Error(validationErrors);
        }
      }
      
      // Handle other errors with detail
      if (error?.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      // Handle network errors
      if (error?.message === 'Network Error') {
        throw new Error('No response from server. Please check your internet connection.');
      }
      
      // Fallback error
      throw new Error(error?.message || 'An unexpected error occurred. Please try again later.');
    }
  },

  updateCoordinates: async (coordinates) => {
    try {
      const authToken = useUserStore.getState().authToken;
      const response = await apiClient.patch('/update-user/', {
        profile: {
          coordinates
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating coordinates:', error);
    }
  },

  verifyEmail: async (email, code) => {
    try {
      const response = await apiClient.post('/verify-code/', {
        email,
        code
      });
      return response.data;
    } catch (error) {
      console.log('Auth service error:', {
        data: error?.response?.data,
        status: error?.response?.status,
        detail: error?.response?.data?.detail
      });
      
      // Pass through the error
      throw error;
    }
  },

  logout: async () => {
    try {
      const authToken = useUserStore.getState().authToken;
      const refreshToken = useUserStore.getState().refreshToken;
      
      // Clear notification token first
      await authService.updateUser({
        profile: { notification_token: "" }
      });

      // Logout from server
      const response = await apiClient.post('/token/logout/', {
        refresh: refreshToken
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Clear user state and storage
      await useUserStore.getState().clearUser();

      return response.data;
    } catch (error) {
      console.log('Auth service error:', {
        data: error?.response?.data,
        status: error?.response?.status,
        detail: error?.response?.data?.detail
      });
      console.error('Error logging out:', error);
      
      // Still clear local data even if server logout fails
      await useUserStore.getState().clearUser();
      return { success: true };
    }
  },

  toggleFavorite: async (type, id) => {
    try {
      const authToken = useUserStore.getState().authToken;
      const response = await apiClient.post('/toggle-favorite/', {
        type,
        id
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Toggle favorite error:', error);
      throw error;
    }
  },
  
  findAccount: async (identifier) => {
    try {
      const response = await apiClient.post('/find-account/', {
        identifier
      });
  
      return response.data;
    } catch (error) {
      console.log('Find account error:', {
        data: error?.response?.data,
        status: error?.response?.status,
        detail: error?.response?.data?.detail
      });
      
      if (error?.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      throw new Error(error?.message || 'An error occurred while finding your account');
    }
  },
  
  resetPassword: async (identifier, code, newPassword) => {
    try {
      const response = await apiClient.post('/forgot-password/', {
        identifier, // Using email returned from findAccount
        code,
        new_password: newPassword,
      });
      
      return response.data;
    } catch (error) {
      console.log('Reset password error:', {
        data: error?.response?.data,
        status: error?.response?.status,
        detail: error?.response?.data?.detail,
      });
      
      if (error?.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      throw new Error(error?.message || 'An error occurred while resetting your password');
    }
  },
  
  resendResetCode: async (identifier) => {
    try {
      const response = await apiClient.post('/resend-reset-code/', {
        identifier // Using email returned from findAccount
      });
      
      return response.data;
    } catch (error) {
      console.log('Resend reset code error:', {
        data: error?.response?.data,
        status: error?.response?.status,
        detail: error?.response?.data?.detail
      });
      
      if (error?.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      throw new Error(error?.message || 'An error occurred while resending the reset code');
    }
  }
};

export default authService;

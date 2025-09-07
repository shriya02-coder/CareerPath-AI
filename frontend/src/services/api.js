import axios from 'axios';

// Use environment-configured backend URL exclusively (no hardcoding)
const BACKEND_BASE = (
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.REACT_APP_BACKEND_URL
) || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_BACKEND_URL) || '';

if (!BACKEND_BASE) {
  // Log a clear warning in console to aid debugging if env var is missing
  // Note: Do not hardcode fallback URLs
  // eslint-disable-next-line no-console
  console.warn('REACT_APP_BACKEND_URL is not set. API requests will likely fail.');
}

// All backend routes are prefixed with '/api' per ingress rules
const API_BASE = `${BACKEND_BASE}/api`;

// Create axios instance with env-based URL
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Enhanced error handling
apiClient.interceptors.response.use(
  (response) => {
    // eslint-disable-next-line no-console
    console.log('✅ API Success:', response.config.url, response.data);
    return response;
  },
  (error) => {
    // eslint-disable-next-line no-console
    console.error('❌ API Error:', error.config?.url, error.message);
    if (error.response) {
      // eslint-disable-next-line no-console
      console.error('❌ Response Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // eslint-disable-next-line no-console
      console.error('❌ No Response Received:', error.request);
    }
    return Promise.reject(error);
  }
);

// Career Identity API
export const identityAPI = {
  generateStatement: async (identityData) => {
    try {
      const response = await apiClient.post('/identity/generate', identityData);
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Error generating identity statement:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to connect to AI service');
    }
  }
};

// Careers API
export const careersAPI = {
  getCareers: async (search = '', category = '', limit = 50) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (limit) params.append('limit', limit.toString());
      
      const response = await apiClient.get(`/careers?${params.toString()}`);
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching careers:', error);
      throw error;
    }
  },

  getCareerById: async (careerId) => {
    try {
      const response = await apiClient.get(`/careers/${careerId}`);
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching career details:', error);
      throw error;
    }
  },

  getCareerCategories: async () => {
    try {
      const response = await apiClient.get('/careers/categories');
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching career categories:', error);
      throw error;
    }
  },

  getRecommendations: async (userProfile) => {
    try {
      const response = await apiClient.post('/careers/recommend', {
        userProfile: userProfile
      });
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting career recommendations:', error);
      throw error;
    }
  }
};

// Resume Assistant API
export const resumeAPI = {
  optimizeResume: async (resumeData) => {
    try {
      const response = await apiClient.post('/resume/optimize', resumeData);
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error optimizing resume:', error);
      throw error;
    }
  },

  generateCoverLetter: async (coverLetterData) => {
    try {
      const response = await apiClient.post('/resume/cover-letter', coverLetterData);
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating cover letter:', error);
      throw error;
    }
  },

  parseResume: async (file) => {
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await apiClient.post('/resume/parse', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error parsing resume:', error);
      throw error;
    }
  }
};

// Health check API
export const healthAPI = {
  checkStatus: async () => {
    try {
      const response = await apiClient.get('/');
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error checking API status:', error);
      throw error;
    }
  }
};

// Export default API client for custom requests
export default apiClient;
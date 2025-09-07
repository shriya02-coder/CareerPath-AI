import axios from 'axios';

// FORCE DIRECT CONNECTION - NO ENVIRONMENT VARIABLES
const API_BASE = 'http://localhost:8001/api';

console.log('🔧 DIRECT API CONNECTION:', API_BASE);

// Create axios instance with direct URL
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
    console.log('✅ API Success:', response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.message);
    if (error.response) {
      console.error('❌ Response Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ No Response Received:', error.request);
    }
    return Promise.reject(error);
  }
);

// Career Identity API
export const identityAPI = {
  generateStatement: async (identityData) => {
    try {
      console.log('🚀 Making API request to:', `${API}/identity/generate`);
      console.log('📊 Request data:', identityData);
      
      const response = await apiClient.post('/identity/generate', identityData);
      console.log('✅ API response received:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error generating identity statement:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('❌ Response error:', error.response.status, error.response.data);
        console.error('❌ Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('❌ Request error - no response received:', error.request);
        console.error('❌ Request URL:', error.config?.url);
        console.error('❌ Request method:', error.config?.method);
      } else {
        console.error('❌ Error message:', error.message);
      }
      
      // Throw a more descriptive error
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
      console.error('Error fetching careers:', error);
      throw error;
    }
  },

  getCareerById: async (careerId) => {
    try {
      const response = await apiClient.get(`/careers/${careerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching career details:', error);
      throw error;
    }
  },

  getCareerCategories: async () => {
    try {
      const response = await apiClient.get('/careers/categories');
      return response.data;
    } catch (error) {
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
      console.error('Error optimizing resume:', error);
      throw error;
    }
  },

  generateCoverLetter: async (coverLetterData) => {
    try {
      const response = await apiClient.post('/resume/cover-letter', coverLetterData);
      return response.data;
    } catch (error) {
      console.error('Error generating cover letter:', error);
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
      console.error('Error checking API status:', error);
      throw error;
    }
  }
};

// Export default API client for custom requests
export default apiClient;
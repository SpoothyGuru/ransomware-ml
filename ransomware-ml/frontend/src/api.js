import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', // FastAPI backend URL
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ransom_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('ransom_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('ransom_token', token);
  } else {
    localStorage.removeItem('ransom_token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('ransom_token');
};

export const clearAuth = () => {
  localStorage.removeItem('ransom_token');
  localStorage.removeItem('user');
};

// Login function
export const login = async (username, password) => {
  try {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 10000, // 10 second timeout
    });
    return response.data;
  } catch (error) {
    // Re-throw with more context
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Server is taking too long to respond.');
    }
    throw error;
  }
};

// AI / Anthropic helper
export const aiComplete = async (prompt, max_tokens = 512, temperature = 0.2) => {
  try {
    const response = await api.post('/ai/complete', {
      prompt,
      max_tokens,
      temperature
    }, {
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('AI request timed out');
    }
    throw error;
  }
};

export default api;


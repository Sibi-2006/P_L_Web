import axios from 'axios';

const api = axios.create({
  baseURL: 'https://p-l-backend.onrender.com/api', // adjust for production
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pnl_user_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

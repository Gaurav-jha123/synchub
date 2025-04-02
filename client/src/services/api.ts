import axios, { InternalAxiosRequestConfig, AxiosRequestConfig as PublicAxiosRequestConfig, AxiosResponse, AxiosError, AxiosHeaders } from 'axios';

const API_URL = 'http://localhost:2000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const headers = new AxiosHeaders(config.headers);
        headers.set('Authorization', `Bearer ${accessToken}`);
        config.headers = headers;
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

// Add a response interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
  
     
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
  
        try {
          const refreshToken = localStorage.getItem('refreshToken');
  
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
  
          
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });
  
          const { accessToken } = response.data;
  
          
          localStorage.setItem('accessToken', accessToken);
  
         
          const headers = new AxiosHeaders(originalRequest.headers);
          headers.set('Authorization', `Bearer ${accessToken}`);
          originalRequest.headers = headers;
          return axios(originalRequest);
        } catch (refreshError) {
            
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
  
      return Promise.reject(error);
    }
  );

export default api;
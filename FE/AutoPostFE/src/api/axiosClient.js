import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3027/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for cookies (accessToken, refreshToken)
});

// Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // We don't need to manually attach accessToken to headers because it's in HTTPOnly Cookies.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized for access token expiry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token
        await axios.post(
          `${axiosClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        // Refresh successful, retry original request
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, user needs to login again
        // But prevent redirect loops if already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    // Format error response consistently
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosClient;

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAuthToken, clearAuth } from '@/utils/cookies';

/**
 * Shared Axios Instance
 * ---------------------
 * Centralized HTTP client configured with DummyJSON API base URL.
 * Automatically handles auth token injection and global response errors.
 */
const api = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Request Interceptor
 * -------------------
 * Before any API request is sent:
 * 1. Checks if an auth token exists in browser cookies.
 * 2. If present, attaches `Authorization: Bearer <token>` to request headers.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * --------------------
 * Handles API responses and centralizes error handling:
 * 1. Suppresses errors caused by explicit Axios request cancellations (e.g., debounced search).
 * 2. Intercepts 401 Unauthorized errors to automatically log out the user and clean tokens.
 * 3. Normalizes error messages into clean, human-readable strings.
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    // Silent rejection for request cancellation to prevent showing error banners on search cancellation
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized (invalid/expired session)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        clearAuth();
        // Redirect to login if not already on login page
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }

    // Extract human-readable message or fallback
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred. Please try again.';

    // Attach custom message to error object for consumption in services/components
    return Promise.reject(new Error(message));
  }
);

export default api;

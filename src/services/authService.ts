import api from '@/lib/axios';
import { LoginCredentials, LoginResponse, User } from '@/types/auth';

/**
 * Auth Service
 * ------------
 * Encapsulates authentication API operations using shared Axios instance.
 */
export const authService = {
  /**
   * Authenticates user with username and password against DummyJSON POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      username: credentials.username,
      password: credentials.password,
      expiresInMins: 1440, // 24 hours
    });
    return response.data;
  },

  /**
   * Fetches current authenticated user data from GET /auth/me
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

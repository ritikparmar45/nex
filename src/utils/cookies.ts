import Cookies from 'js-cookie';
import { User } from '@/types/auth';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const setAuthToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { expires: 7, path: '/' });
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY);
};

export const removeAuthToken = () => {
  Cookies.remove(TOKEN_KEY, { path: '/' });
};

export const setAuthUser = (user: User) => {
  Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7, path: '/' });
};

export const getAuthUser = (): User | null => {
  const userStr = Cookies.get(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const removeAuthUser = () => {
  Cookies.remove(USER_KEY, { path: '/' });
};

export const clearAuth = () => {
  removeAuthToken();
  removeAuthUser();
};

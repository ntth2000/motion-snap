export const API_ENDPOINT = import.meta.env.VITE_API_URL;
export const API = {
  LOGIN: 'auth/login',
  REGISTER: 'auth/register',
  LOGOUT: 'auth/logout',
  REFRESH: 'auth/refresh',
  ME: 'auth/me',
  VIDEOS: '/videos',
  UPLOAD_VIDEO: '/videos/upload',
  STATUS: '/videos/status'
};

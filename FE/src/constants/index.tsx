export const API_ENDPOINT = import.meta.env.VITE_API_URL;

export const API = {
  auth: {
    login: 'auth/login',
    register: 'auth/register',
    logout: 'auth/logout',
    refresh: 'auth/refresh',
    me: 'auth/me',
  },

  apiKey: 'api-keys',

  videos: {
    list: '/videos',
    upload: '/videos/upload',
    status: '/videos/status',

    comments: (videoId: number | string) =>
      `/videos/${videoId}/comments`,
  },

  comments: {
    byId: (commentId: number | string) =>
      `/comments/${commentId}`,
  },

  apiKeys: '/api-keys',
};

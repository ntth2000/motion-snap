export const API_ENDPOINT = import.meta.env.VITE_API_URL;

export const API = {
  auth: {
    login: 'auth/login',
    register: 'auth/register',
    logout: 'auth/logout',
    refresh: 'auth/refresh',
    me: 'auth/me',
  },

  admin: {
    login: 'admin/login',
    stats: 'admin/dashboard',
  },

  apiKey: 'api-keys',

  users: {
    all: '/users/',
    byUsername: (username: string) => `/users/${username}`,
    byId: (userId: number | string) => `/users/${userId}`,
  },

  posts: {
    create: '/posts/',
    list: (query?: string) => query ? `/posts?${query}` : '/posts',
    byId: (postId: number | string) =>
      `/posts/${postId}`,
    comments: (postId: number | string) =>
      `/posts/${postId}/comments`,
    extractPoses: (postId: number | string) =>
      `/posts/extract_poses/${postId}`,
    status: (postId: number | string) =>
      `/posts/status/${postId}`,
    draw3D: (postId: number | string) =>
      `/posts/draw_3d/${postId}`,
    getExtractedPosesById: (postId: number | string) =>
      `/posts/${postId}/extract_poses`,
    getDrawn3DById: (postId: number | string) =>
      `/posts/${postId}/drawn_3d`,
    export: (postId: number | string, type: string) =>
      `/posts/${postId}/export?export_type=${type}`,
    like: (postId: number | string) =>
      `/posts/${postId}/like`,
  },

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
    like: (commentId: number | string) =>
      `/comments/${commentId}/like`,
  },

  apiKeys: '/api-keys',
};


export const STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
}


export const STAGE = {
  INIT: "INIT",
  UPLOADING: "UPLOADING",
  EXTRACTING_FRAMES: "EXTRACTING_FRAMES",
  EXTRACTING_POSES: "EXTRACTING_POSES",
  DRAWING_3D: "DRAWING_3D",
}


export const VIEW_MODE = {
  ORIGINAL_VIDEO: "originalVideo",
  EXTRACTED_POSES: "extractedPoses",
  DRAW_3D: "draw3d",
}
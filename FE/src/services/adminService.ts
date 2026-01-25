import { API } from "../constants";
import axiosInstance from "./_apiBase";

export const adminLogin = async (payload: {
  email: string;
  password: string;
}) => {
  const res = await axiosInstance.post(API.admin.login, payload);
  return res.data;
};


export const getAdminStats = async () => {
  const res = await axiosInstance.get(API.admin.stats, {
    withCredentials: true
  });
  return res.data;
};

export const getUsers = async (params: { page: number; pageSize: number; search?: string }) => {
  const skip = (params.page - 1) * params.pageSize;
  const res = await axiosInstance.get(API.admin.users, {
    params: {
      skip,
      limit: params.pageSize,
      search: params.search
    },
    withCredentials: true
  });
  return res.data;
};

export const getApiKeys = async (params: { page: number; pageSize: number; search?: string }) => {
  const skip = (params.page - 1) * params.pageSize;
  const res = await axiosInstance.get(API.admin.apiKeys, {
    params: {
      skip,
      limit: params.pageSize,
      search: params.search
    },
    withCredentials: true
  });
  return res.data;
};

export const revokeApiKey = async (keyId: number) => {
  const res = await axiosInstance.patch(`${API.admin.apiKeys}/${keyId}/revoke`, {}, {
    withCredentials: true
  });
  return res.data;
};

export const getAdminPosts = async (params: { page: number; pageSize: number; search?: string }) => {
  const skip = (params.page - 1) * params.pageSize;
  const res = await axiosInstance.get('admin/posts', {
    params: {
      skip,
      limit: params.pageSize,
      search: params.search
    },
    withCredentials: true
  });
  return res.data;
};

export const adminDeletePost = async (postId: number) => {
  const res = await axiosInstance.delete(`admin/posts/${postId}`, {
    withCredentials: true
  });
  return res.data;
};


export const deactivateUser = async (userId: number) => {
  const res = await axiosInstance.patch(`admin/users/${userId}/deactivate`, {}, {
    withCredentials: true
  });
  return res.data;
};
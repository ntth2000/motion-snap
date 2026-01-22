import { API } from '../constants';
import axiosInstance from './_apiBase';
interface RegisterParams {
  email: string;
  password: string;
  username: string;
}

interface LoginParams {
  email: string;
  password: string;
}

export const getMe = async () => {
  const res = await axiosInstance.get(API.auth.me, { withCredentials: true });
  return res.data;
};

export const login = async ({ email, password }: LoginParams) => {
  const res = await axiosInstance.post(API.auth.login, {
    email,
    password,
  }, {
    withCredentials: true
  });
  console.log(res)
  return res;
};

export const register = async ({ email, password, username }: RegisterParams) => {
  try {
    const res = await axiosInstance.post(API.auth.register, {
      email,
      password,
      name: username,
    });

    return res.data;
  } catch (error: any) {
    if (error.response && error.response.data?.detail) {
      throw new Error(error.response.data.detail);
    }

    throw new Error('Registration failed. Please try again.');
  }
};

export const logout = async () => {
  try {
    const res = await axiosInstance.post(API.auth.logout, {}, { withCredentials: true });
    return res.data;
  } catch (error: any) {
    if (error.response && error.response.data?.detail) {
      throw new Error(error.response.data.detail);
    }

    throw new Error('Logout failed. Please try again.');
  }
};
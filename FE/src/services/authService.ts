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
  try {
    const res = await axiosInstance.get(API.ME, { withCredentials: true });
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

export const login = async ({ email, password }: LoginParams) => {
  try {
    const res = await axiosInstance.post(API.LOGIN, {
      email,
      password,
    }, {
      withCredentials: true
    });

    return res.data;
  } catch (error: any) {
    throw error;
  }
};

export const register = async ({ email, password, username }: RegisterParams) => {
  try {
    const res = await axiosInstance.post(API.REGISTER, {
      email,
      password,
      username,
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
    const res = await axiosInstance.post(API.LOGOUT, {}, { withCredentials: true });
    return res.data;
  } catch (error: any) {
    if (error.response && error.response.data?.detail) {
      throw new Error(error.response.data.detail);
    }

    throw new Error('Logout failed. Please try again.');
  }
};

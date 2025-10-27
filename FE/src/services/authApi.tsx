import { API } from '../constants';
import axiosInstance from './_apiBase';
export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const res = await axiosInstance.post(API.LOGIN, {
    username: email,
    password,
  });
  console.log('res', res);
};

export const register = async ({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) => {};

export const logout = async () => {
  await axiosInstance.get(API.LOGOUT);
};

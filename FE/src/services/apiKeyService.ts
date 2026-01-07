import { API } from '../constants';
import axiosInstance from './_apiBase';

export const getKey = async () => {
  const res = await axiosInstance.get(API.apiKey, { withCredentials: true });
  return res.data;
};

export const generateKey = async () => {
  const res = await axiosInstance.post(API.apiKey, {}, { withCredentials: true });
  return res.data;
};
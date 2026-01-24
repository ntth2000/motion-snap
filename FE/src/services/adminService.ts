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
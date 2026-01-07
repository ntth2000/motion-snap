import axios from "axios";

import { API_ENDPOINT } from "../constants";

const NO_REFRESH_URLS = [
  'auth/login',
  'auth/register',
  'auth/refresh',
];

const axiosInstance = axios.create({
  baseURL: API_ENDPOINT,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    console.log(err)
    const originalRequest = err.config;
    const requestUrl = originalRequest?.url || '';

    if (NO_REFRESH_URLS.some(url => requestUrl.includes(url))) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_ENDPOINT}/auth/refresh`, {}, { withCredentials: true });
        if (res.status === 200) {
          return axiosInstance(originalRequest);
        }
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);


export default axiosInstance;

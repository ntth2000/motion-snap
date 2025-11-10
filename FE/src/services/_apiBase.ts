import axios from "axios";
import { API_ENDPOINT } from "../constants";

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
    const originalRequest = err.config;

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

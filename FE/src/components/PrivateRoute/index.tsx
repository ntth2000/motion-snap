import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axiosInstance from "../../services/_apiBase";
import { API } from "../../constants";

const PrivateRoute = ({ Component }: { Component: any }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axiosInstance.get(API.ME, { withCredentials: true });
        setIsAuthenticated(true);
      } catch (err: any) {
        if (err.response?.status === 401) {
          try {
            const refreshRes = await axiosInstance.post(API.REFRESH, {}, { withCredentials: true });
            if (refreshRes.status === 200) {
              setIsAuthenticated(true);
              return;
            }
          } catch (refreshErr) {
            console.error("Refresh token failed:", refreshErr);
          }
        }
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Component /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;

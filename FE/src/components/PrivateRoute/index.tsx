// src/components/PrivateRoute.tsx
import { Spin } from "antd";
import { Navigate,Outlet } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div><Spin /></div>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;

// src/components/PrivateRoute.tsx
import { Spin } from "antd";
import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

interface PrivateRouteProps {
  allowedRoles: string[];
};

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) return <div><Spin /></div>;

  if (user && user.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;

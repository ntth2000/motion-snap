// src/components/PrivateRoute.tsx
import { Spin } from "antd";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

interface PrivateRouteProps {
  allowedRoles: string[];
};

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div><Spin /></div>;

  if (!isAuthenticated && location.pathname.includes('admin')) return <Navigate to="/admin/login" state={{ from: location }} replace />;

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;

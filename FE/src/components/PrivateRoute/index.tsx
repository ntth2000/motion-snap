// src/components/PrivateRoute.tsx
import { Spin } from "antd";
import { Outlet } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

interface PrivateRouteProps {
  allowedRoles: string[];
};

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth(true);
  console.log(">>>>>", user, isAuthenticated, loading);

  if (loading) return <div><Spin /></div>;

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  // if (!allowedRoles.includes(user!.role)) {
  //   return <Navigate to="/" replace />;
  // }

  return <Outlet />;
};

export default PrivateRoute;

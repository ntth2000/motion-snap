import { Outlet, Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Spin } from "antd";

const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div><Spin /></div>;

  if (isAuthenticated) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default PublicRoute;

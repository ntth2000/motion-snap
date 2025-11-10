import { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
const useAuth = (requireAuth = false, restrictWhenAuth = false) => {
  const { user, isAuthenticated, loading, logout, login } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !isAuthenticated) {
      navigate("/login", { state: { from: location }, replace: true });
    }

    if (restrictWhenAuth && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [loading, isAuthenticated, requireAuth, restrictWhenAuth, navigate, location]);

  return { user, isAuthenticated, loading, logout, login };
};

export default useAuth;

import { useContext } from "react";

import { AuthContext } from "../context/AuthContext";
const useAuth = () => {
  const { user, isAuthenticated, loading, logout, login } = useContext(AuthContext)!;

  return { user, isAuthenticated, loading, logout, login };
};

export default useAuth;

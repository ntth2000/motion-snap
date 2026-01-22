import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import { getMe, login as loginAxios, logout as logoutAxios } from '../services/authService'
import type { IUser } from "../types";

interface AuthContextType {
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  isAuthenticated: boolean;
  loading: boolean;
  fetchUser: () => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: any
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const logout = async () => {
    try {
      await logoutAxios()
    } catch (err) {
      console.error("Logout failed", err);
    }

    setUser(null);
    setLoading(false);
  };

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMe()
      setUser(res);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async ({ email, password }: { email: string; password: string }) => {
    const res = await loginAxios({ email, password });
    setUser(res.data);
    return res.data;
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        loading,
        fetchUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

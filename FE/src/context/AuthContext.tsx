import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getMe, logout as logoutAxios, login as loginAxios } from '../services/authService'

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  loading: boolean;
  fetchUser: () => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: any
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const logout = async () => {
    try {
      // Gọi API backend để logout (nếu có)
      await logoutAxios()
    } catch (err) {
      console.error("Logout failed", err);
    }

    // Reset toàn bộ auth state
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
    console.log("fetch user:")
    fetchUser();
  }, []);

  const login = async ({ email, password }: { email: string; password: string }) => {
    try {
      await loginAxios({ email, password })
      const res = await getMe()
      setUser(res)
    } catch (err) {
      throw (err)
    }

    setLoading(false);
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

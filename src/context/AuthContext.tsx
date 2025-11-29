import React, { createContext, useContext, useEffect, useState } from "react";
import authService, { LoginPayload } from "../services/authService";

type AuthContextType = {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem("user_id"));

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem("user_id", userId);
    } else {
      localStorage.removeItem("user_id");
    }
  }, [userId]);

  const login = async (payload: LoginPayload) => {
    const resp = await authService.login(payload);
    if (resp?.token) {
      setToken(resp.token);
      setUserId(resp.user_id ?? null);
    } else {
      throw new Error("Invalid login response");
    }
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
  };

  const value: AuthContextType = {
    token,
    userId,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;

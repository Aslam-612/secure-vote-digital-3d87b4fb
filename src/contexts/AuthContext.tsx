import React, { createContext, useContext, useState } from "react";
import { adminLogin, sendOtp, verifyOtp } from "@/lib/api";

interface User {
  name: string;
  mobile?: string;
  username?: string;
  hasVoted?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  requestOtp: (mobile: string) => Promise<any>;
  loginWithOtp: (mobile: string, otp: string) => Promise<any>;
  adminSignIn: (username: string, password: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("evoting_user") || "null")
  );
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("evoting_token")
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(
    localStorage.getItem("evoting_role") === "ADMIN"
  );

  const requestOtp = async (mobile: string) => {
    const result = await sendOtp(mobile);
    return result;
  };

  const loginWithOtp = async (mobile: string, otp: string) => {
    const result = await verifyOtp(mobile, otp);
    if (result.status === "SUCCESS") {
      setToken(result.token);
      setUser({
        name: result.voterName,
        mobile,
        hasVoted: result.hasVoted,
      });
      setIsAdmin(false);
      localStorage.setItem("evoting_token", result.token);
      localStorage.setItem("evoting_role", "VOTER");
      localStorage.setItem(
        "evoting_user",
        JSON.stringify({
          name: result.voterName,
          mobile,
          hasVoted: result.hasVoted,
        })
      );
    }
    return result;
  };

  const adminSignIn = async (username: string, password: string) => {
    const result = await adminLogin(username, password);
    if (result.status === "SUCCESS") {
      setToken(result.token);
      setUser({ name: "Admin", username });
      setIsAdmin(true);
      localStorage.setItem("evoting_token", result.token);
      localStorage.setItem("evoting_role", "ADMIN");
      localStorage.setItem(
        "evoting_user",
        JSON.stringify({ name: "Admin", username })
      );
    }
    return result;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem("evoting_token");
    localStorage.removeItem("evoting_role");
    localStorage.removeItem("evoting_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        requestOtp,
        loginWithOtp,
        adminSignIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
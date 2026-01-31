import { createContext, useContext, useState, useEffect } from "react";
import api from "../Config/api";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch (error) {
        console.log("Not authenticated");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const register = async (userData) => {
    try {
      const { data } = await api.post("/auth/register", userData);
      setUser(data.user);
      return { success: true, message: data.message, user: data.user };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const login = async (userData) => {
    try {
      const { data } = await api.post("/auth/login", userData);
      setUser(data.user);
      return { success: true, message: data.message, user: data.user };
    } catch (error) {
      console.log("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, register, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

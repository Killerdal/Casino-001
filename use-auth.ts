import { useContext, useCallback } from "react";
import { AuthContext } from "@/context/auth-context";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout, 
    signup, 
    checkAuth 
  } = context;

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    signup,
    checkAuth,
  };
};

export default useAuth;


import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { AuthUser, AuthContextType } from "./auth/types";
import { MOCK_USERS } from "./auth/mockData";
import { sendOtp as sendOtpUtil, verifyOtp as verifyOtpUtil } from "./auth/authUtils";

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("docuvault_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("docuvault_user");
      }
    }
    setIsLoading(false);
  }, []);

  // Send OTP
  const sendOtp = async (phone: string): Promise<boolean> => {
    return sendOtpUtil(phone);
  };

  // Verify OTP
  const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
    return verifyOtpUtil(phone, otp);
  };

  // Login with phone and OTP
  const login = async (phone: string, otp: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Verify OTP
      const isVerified = await verifyOtp(phone, otp);
      if (!isVerified) {
        return false;
      }
      
      // Find user by phone
      const foundUser = MOCK_USERS.find((u) => u.phone === phone);
      
      if (!foundUser) {
        toast.error("User not found. Please register first.");
        return false;
      }
      
      // Set user in state and localStorage
      setUser(foundUser);
      localStorage.setItem("docuvault_user", JSON.stringify(foundUser));
      toast.success("Login successful!");
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register new user
  const register = async (userData: Omit<AuthUser, "id">): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check if user already exists with the same phone
      const userExists = MOCK_USERS.some((u) => u.phone === userData.phone);
      
      if (userExists) {
        toast.error("A user with this phone number already exists.");
        return false;
      }
      
      // Generate ID (would be done by the backend in a real app)
      const newUser: AuthUser = {
        ...userData,
        id: Math.random().toString(36).substring(2, 11),
      };
      
      // In a real app, this would call an API to create the user
      // For demo, we'll just pretend it worked
      MOCK_USERS.push(newUser);
      
      // Set user in state and localStorage
      setUser(newUser);
      localStorage.setItem("docuvault_user", JSON.stringify(newUser));
      
      toast.success("Registration successful!");
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("docuvault_user");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        sendOtp,
        verifyOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

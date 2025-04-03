
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

// Define types
type AuthUser = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<AuthUser, "id">) => Promise<boolean>;
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
};

// Mock user database for demo purposes
const MOCK_USERS: AuthUser[] = [
  {
    id: "1",
    name: "Test User",
    phone: "1234567890",
    email: "test@example.com",
    age: 30,
  },
];

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

  // Send OTP (mock implementation)
  const sendOtp = async (phone: string): Promise<boolean> => {
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Check if user exists
      const userExists = MOCK_USERS.some((u) => u.phone === phone);
      
      // In a real app, this would send an actual OTP via SMS
      // For demo purposes, the OTP is always "123456"
      console.log("OTP sent to", phone, "- Use '123456' for testing");
      toast.success("OTP sent successfully! (Use '123456' for testing)");
      
      // For demo: pretend we've sent an OTP
      localStorage.setItem("docuvault_pending_phone", phone);
      return true;
    } catch (error) {
      console.error("Failed to send OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
      return false;
    }
  };

  // Verify OTP (mock implementation)
  const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // For demo: only "123456" is valid
      const isValid = otp === "123456";
      
      if (!isValid) {
        toast.error("Invalid OTP. Please try again.");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      toast.error("Failed to verify OTP. Please try again.");
      return false;
    }
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

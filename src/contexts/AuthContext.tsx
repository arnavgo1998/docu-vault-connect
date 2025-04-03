
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { AuthUser, AuthContextType } from "./auth/types";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { sendOtp, verifyOtp } from "./auth/authUtils";

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Check for logged in user in local storage (for our mock implementation)
    const storedUser = localStorage.getItem("docuvault_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Found stored user:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("docuvault_user");
      }
    } else {
      console.log("No stored user found");
    }
    
    setIsLoading(false);
  }, []);

  // Register with phone and optional details
  const register = async (userData: Omit<AuthUser, "id">): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      console.log("Registering user with data:", userData);
      
      // In our mock implementation, we just store the user data in localStorage
      // The actual verification happens in verifyOtp function
      const newUser: AuthUser = {
        id: `user_${Date.now()}`,
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        age: userData.age
      };
      
      // Store user for later (will be used after OTP verification)
      localStorage.setItem("docuvault_pending_user", JSON.stringify(newUser));
      
      console.log("User registration prepared:", newUser);
      toast({
        title: "Verification needed",
        description: "We'll send a verification code to your phone"
      });
      
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Error",
        description: "Registration failed. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      localStorage.removeItem("docuvault_user");
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully."
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Error",
        description: "Logout failed. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
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

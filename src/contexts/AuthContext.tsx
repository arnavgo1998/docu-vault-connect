
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { AuthUser, AuthContextType } from "./auth/types";
import { sendOtp, verifyOtp } from "./auth/authUtils";
import { supabase } from "@/integrations/supabase/client";

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // Check if we have a locally stored user
        const storedUserJson = localStorage.getItem("docuvault_user");
        if (storedUserJson) {
          try {
            const storedUser = JSON.parse(storedUserJson);
            console.log("Found stored user data:", storedUser);
            
            // Verify that the user still exists in Supabase
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', storedUser.id)
              .maybeSingle();
              
            if (error) {
              console.error("Error verifying user:", error);
              localStorage.removeItem("docuvault_user");
            } else if (data) {
              console.log("User verified in database:", data);
              setUser({
                id: data.id,
                name: data.name || '',
                phone: data.phone || '',
                email: data.email || undefined,
                age: data.age || undefined
              });
            } else {
              console.log("User not found in database");
              localStorage.removeItem("docuvault_user");
            }
          } catch (e) {
            console.error("Error parsing stored user:", e);
            localStorage.removeItem("docuvault_user");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        toast.error("Failed to initialize authentication");
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // Register with phone and optional details
  const register = async (userData: Omit<AuthUser, 'id'>): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Basic validation
      if (!userData.name || !userData.phone) {
        toast.error("Name and phone number are required");
        return false;
      }
      
      console.log("Registering user with data:", userData);
      
      // Store pending registration data temporarily in session storage (not localStorage)
      // This is only temporary until OTP verification completes
      sessionStorage.setItem("docuvault_pending_user", JSON.stringify(userData));
      
      console.log("User registration prepared");
      toast("Verification needed", {
        description: "We'll send a verification code to your phone"
      });
      
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
  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem("docuvault_user");
      setUser(null);
      toast.success("Logged out successfully");
      
      // Navigate to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
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

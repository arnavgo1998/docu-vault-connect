
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
        // First try to get user from localStorage
        const storedUser = localStorage.getItem("docuvault_user");
        
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log("Found stored user:", parsedUser);
            
            // Verify user exists in Supabase if possible
            try {
              const { data: profiles, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('phone', parsedUser.phone);
                
              if (error) {
                console.error("Error fetching profile:", error);
              }
                
              if (profiles && profiles.length > 0) {
                const profile = profiles[0];
                // Use Supabase data if available
                console.log("Found profile in Supabase:", profile);
                setUser({
                  id: profile.id,
                  name: profile.name || parsedUser.name,
                  phone: profile.phone || parsedUser.phone,
                  email: profile.email,
                  age: profile.age
                });
              } else {
                // User not found in Supabase, try to create it
                console.log("User not found in Supabase, creating profile...");
                
                const { error: insertError } = await supabase
                  .from('profiles')
                  .insert([{
                    id: parsedUser.id,
                    name: parsedUser.name,
                    phone: parsedUser.phone,
                    email: parsedUser.email,
                    age: parsedUser.age
                  }]);
                  
                if (insertError) {
                  console.error("Failed to create profile in Supabase:", insertError);
                  setUser(parsedUser); // Use localStorage data as fallback
                } else {
                  console.log("Profile created successfully in Supabase");
                  setUser(parsedUser);
                }
              }
            } catch (error) {
              // If Supabase query fails, use localStorage data
              console.error("Failed to verify user in Supabase:", error);
              setUser(parsedUser);
            }
          } catch (error) {
            console.error("Failed to parse stored user:", error);
            localStorage.removeItem("docuvault_user");
          }
        } else {
          console.log("No stored user found");
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
  const register = async (userData: AuthUser): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      console.log("Registering user with data:", userData);
      
      // Store user for later (will be used after OTP verification)
      localStorage.setItem("docuvault_pending_user", JSON.stringify(userData));
      
      console.log("User registration prepared:", userData);
      toast("Verification needed", {
        description: "We'll send a verification code to your phone"
      });
      
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      toast("Error", {
        description: "Registration failed. Please try again."
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
      toast("Logged out", {
        description: "You have been logged out successfully."
      });
      // Force reload only when logging out since we want to clear auth state
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      toast("Error", {
        description: "Logout failed. Please try again."
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

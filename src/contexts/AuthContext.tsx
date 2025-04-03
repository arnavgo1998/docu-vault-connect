
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
        // First set up the auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state changed:", event, session?.user?.id);

            if (session && session.user) {
              // Get user profile from Supabase
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

              if (error) {
                console.error("Error fetching profile:", error);
                setUser(null);
              } else if (profile) {
                console.log("Found profile in Supabase:", profile);
                setUser({
                  id: profile.id,
                  name: profile.name || '',
                  phone: profile.phone || '',
                  email: profile.email,
                  age: profile.age
                });
              } else {
                console.log("No profile found for authenticated user");
                setUser(null);
              }
            } else {
              setUser(null);
            }
          }
        );

        // Then check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          // User is authenticated, get their profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (error) {
            console.error("Error fetching profile:", error);
          } else if (profile) {
            console.log("Found profile in Supabase:", profile);
            setUser({
              id: profile.id,
              name: profile.name || '',
              phone: profile.phone || '',
              email: profile.email,
              age: profile.age
            });
          } else {
            console.log("No profile found in Supabase");
          }
        }

        setIsLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
        toast.error("Failed to initialize authentication");
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
      
      // Store pending registration data temporarily in session storage (not localStorage)
      // This is only temporary until OTP verification completes
      sessionStorage.setItem("docuvault_pending_user", JSON.stringify(userData));
      
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
      // Clear Supabase auth session
      await supabase.auth.signOut();
      setUser(null);
      toast("Logged out", {
        description: "You have been logged out successfully."
      });
      // Just navigate instead of reloading
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

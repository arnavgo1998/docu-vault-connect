
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { AuthUser, AuthContextType } from "./auth/types";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from Supabase
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);
        
        // If session exists, fetch user profile
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setSupabaseUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
      } else if (data) {
        setUser({
          id: data.id,
          name: data.name || 'User',
          phone: data.phone || '',
          email: data.email,
          age: data.age
        });
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP via Supabase phone auth (Note: this is placeholder as Supabase doesn't have built-in phone auth)
  const sendOtp = async (phone: string): Promise<boolean> => {
    try {
      // In a real implementation, this would use Supabase Auth with a phone provider
      // For now, we'll just mock this
      toast({
        title: "OTP sent",
        description: "Use '123456' for testing purposes"
      });
      return true;
    } catch (error) {
      console.error("Failed to send OTP:", error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Verify OTP (placeholder implementation)
  const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
    try {
      // Mock verification
      const isValid = otp === "123456";
      if (!isValid) {
        toast({
          title: "Invalid OTP",
          description: "Please try again with the correct code.",
          variant: "destructive"
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Login with email and password
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!"
      });
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register new user
  const register = async (userData: Omit<AuthUser, "id"> & { password: string }): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email || '',
        password: userData.password,
        phone: userData.phone,
        options: {
          data: {
            name: userData.name,
            age: userData.age
          }
        }
      });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      // Update profile with additional info
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            name: userData.name,
            phone: userData.phone,
            email: userData.email,
            age: userData.age
          });
        
        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
      }
      
      toast({
        title: "Registration successful",
        description: "Your account has been created!"
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
      await supabase.auth.signOut();
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

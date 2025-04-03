
import { toast } from "sonner";
import { AuthUser } from "./types";
import { supabase } from "@/integrations/supabase/client";

// Send OTP (implementation using mock system)
export const sendOtp = async (phone: string): Promise<boolean> => {
  try {
    // For demo purposes, we'll use a mock implementation
    // In a real app, this would use a 3rd party SMS service
    
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // In a real app, this would send an actual OTP via SMS
    // For demo purposes, the OTP is always "123456"
    console.log("OTP sent to", phone, "- Use '123456' for testing");
    toast.success("OTP sent successfully! (Use '123456' for testing)");
    
    // Store phone number in session storage temporarily (not localStorage)
    sessionStorage.setItem("docuvault_pending_phone", phone);
    return true;
  } catch (error) {
    console.error("Failed to send OTP:", error);
    toast.error("Failed to send OTP. Please try again.");
    return false;
  }
};

// Verify OTP and handle sign-in or registration
export const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
  try {
    console.log("Verifying OTP for phone:", phone);
    
    // Mock API call with minimal delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // For demo: only "123456" is valid
    const isValid = otp === "123456";
    
    if (!isValid) {
      toast.error("Invalid OTP. Please try again.");
      return false;
    }
    
    // Get the pending user if we're in a registration flow
    const pendingUserJson = sessionStorage.getItem("docuvault_pending_user");
    
    if (pendingUserJson) {
      // We're in a registration flow - create a new user profile directly
      try {
        const pendingUser = JSON.parse(pendingUserJson);
        console.log("Creating new user from pending data:", pendingUser);
        
        // Make sure the user we're creating has all required fields
        if (!pendingUser.name || !pendingUser.phone) {
          toast.error("Missing required user information");
          return false;
        }
        
        // First check if user with this phone already exists
        const { data: existingProfiles, error: lookupError } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone', pendingUser.phone);
          
        if (lookupError) {
          console.error("Failed to check for existing profile:", lookupError);
          toast.error("Failed to check for existing user. Please try again.");
          return false;
        }
        
        if (existingProfiles && existingProfiles.length > 0) {
          console.log("User with this phone already exists:", existingProfiles[0]);
          toast.error("An account with this phone number already exists. Please log in instead.");
          return false;
        }
        
        // Create profile record
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert([{
            name: pendingUser.name,
            phone: pendingUser.phone,
            email: pendingUser.email || null,
            age: pendingUser.age || null
          }])
          .select()
          .single();
          
        if (profileError) {
          console.error("Failed to create profile:", profileError);
          toast.error("Failed to create user profile. Please try again.");
          return false;
        }
        
        console.log("Profile created successfully:", profile);
        
        // Clean up session storage
        sessionStorage.removeItem("docuvault_pending_user");
        sessionStorage.removeItem("docuvault_pending_phone");
        
        // Store user data in localStorage for session management
        localStorage.setItem("docuvault_user", JSON.stringify(profile));
        
        toast.success("Account created successfully!");
        return true;
      } catch (error) {
        console.error("Registration error:", error);
        toast.error("Registration failed. Please try again.");
        return false;
      }
    } else {
      // We're in a login flow - find the existing user
      try {
        console.log("Looking for existing user with phone:", phone);
        
        // Try to find user in Supabase
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone', phone);
          
        if (error) {
          console.error("Failed to fetch user from Supabase:", error);
          toast.error("Failed to find user account");
          return false;
        }
        
        if (profiles && profiles.length > 0) {
          // User found - log them in
          console.log("Found user in Supabase:", profiles[0]);
          
          // Store user data in localStorage for session management
          localStorage.setItem("docuvault_user", JSON.stringify(profiles[0]));
          
          // Clean up session storage
          sessionStorage.removeItem("docuvault_pending_phone");
          
          toast.success("Welcome back!");
          return true;
        } else {
          // No existing user - inform the user they need to register first
          toast.error("Account not found. Please register first.");
          return false;
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Login failed. Please try again.");
        return false;
      }
    }
  } catch (error) {
    console.error("Failed to verify OTP:", error);
    toast.error("Failed to verify OTP. Please try again.");
    return false;
  }
};

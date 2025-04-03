import { toast } from "sonner";
import { AuthUser } from "./types";
import { supabase } from "@/integrations/supabase/client";

// Array to store mock users for the demo when not using Supabase
export const MOCK_USERS: AuthUser[] = [
  {
    id: "1",
    name: "Test User",
    phone: "1234567890",
    email: "test@example.com",
    age: 30,
  },
];

// Send OTP (implementation using mock system)
export const sendOtp = async (phone: string): Promise<boolean> => {
  try {
    // For demo purposes, we'll use a mock implementation
    // In a real app, this would use Supabase Auth with a phone provider or a 3rd party SMS service
    
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 300)); // Reduced delay time further
    
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

// Verify OTP and handle sign-in or registration
export const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
  try {
    // Mock API call with minimal delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // For demo: only "123456" is valid
    const isValid = otp === "123456";
    
    if (!isValid) {
      toast.error("Invalid OTP. Please try again.");
      return false;
    }
    
    // Get the pending user if we're in a registration flow
    const pendingUserJson = localStorage.getItem("docuvault_pending_user");
    
    if (pendingUserJson) {
      // We're in a registration flow - create a new user
      const pendingUser = JSON.parse(pendingUserJson);
      console.log("Creating new user from pending data:", pendingUser);
      
      // Make sure the user we're creating has all required fields
      if (!pendingUser.name || !pendingUser.phone) {
        toast.error("Missing required user information");
        return false;
      }
      
      // Save the new user to localStorage (for our mock auth system)
      localStorage.setItem("docuvault_user", JSON.stringify(pendingUser));
      
      // Try to save to Supabase if available
      try {
        // Check if user already exists in Supabase by phone
        const { data: existingProfiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone', pendingUser.phone);
          
        if (existingProfiles && existingProfiles.length > 0) {
          // Update existing profile
          const { error } = await supabase
            .from('profiles')
            .update({
              name: pendingUser.name,
              email: pendingUser.email,
              age: pendingUser.age
            })
            .eq('phone', pendingUser.phone);
            
          if (error) {
            console.error("Failed to update profile in Supabase:", error);
          } else {
            console.log("Profile updated successfully in Supabase");
          }
        } else {
          // Create new profile
          const { error } = await supabase
            .from('profiles')
            .insert([{
              id: pendingUser.id,
              name: pendingUser.name,
              phone: pendingUser.phone,
              email: pendingUser.email,
              age: pendingUser.age
            }]);
            
          if (error) {
            console.error("Failed to create profile in Supabase:", error);
          } else {
            console.log("Profile created successfully in Supabase");
          }
        }
      } catch (error) {
        console.error("Failed to save user to Supabase:", error);
        // Continue with local storage approach as fallback
      }
      
      // Clean up
      localStorage.removeItem("docuvault_pending_user");
      localStorage.removeItem("docuvault_pending_phone");
      
      toast.success("Account created successfully!");
      return true;
    } else {
      // We're in a login flow - find the existing user
      let existingUser = null;
      
      // Try to find user in Supabase first
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone', phone);
          
        if (profiles && profiles.length > 0) {
          existingUser = profiles[0];
          console.log("Found user in Supabase:", existingUser);
        }
      } catch (error) {
        console.error("Failed to fetch user from Supabase:", error);
        // Fall back to localStorage
      }
      
      // If not found in Supabase, check localStorage
      if (!existingUser) {
        const storedUserJson = localStorage.getItem("docuvault_user");
        if (storedUserJson) {
          try {
            const storedUser = JSON.parse(storedUserJson);
            if (storedUser.phone === phone) {
              existingUser = storedUser;
              console.log("Found user in localStorage:", existingUser);
            }
          } catch (error) {
            console.error("Failed to parse stored user:", error);
          }
        }
      }
      
      if (existingUser) {
        // Existing user - sign in
        console.log("Logging in existing user:", existingUser);
        localStorage.setItem("docuvault_user", JSON.stringify(existingUser));
        localStorage.removeItem("docuvault_pending_phone");
        toast.success("Welcome back!");
        return true;
      } else {
        // No existing user - inform the user they need to register first
        toast.error("Account not found. Please register first.");
        return false;
      }
    }
  } catch (error) {
    console.error("Failed to verify OTP:", error);
    toast.error("Failed to verify OTP. Please try again.");
    return false;
  }
};

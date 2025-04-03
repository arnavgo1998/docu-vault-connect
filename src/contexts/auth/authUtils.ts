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
    console.log("Verifying OTP for phone:", phone);
    
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
      try {
        const pendingUser = JSON.parse(pendingUserJson);
        console.log("Creating new user from pending data:", pendingUser);
        
        // Make sure the user we're creating has all required fields
        if (!pendingUser.name || !pendingUser.phone) {
          toast.error("Missing required user information");
          return false;
        }
        
        // Try to create or update profile in Supabase
        const { data: existingProfiles, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone', pendingUser.phone);
          
        console.log("Checked for existing profile:", existingProfiles);
        
        if (fetchError) {
          console.error("Error checking for existing profile:", fetchError);
        }
          
        let userId = pendingUser.id;
        
        if (existingProfiles && existingProfiles.length > 0) {
          // Update existing profile
          console.log("Existing profile found, updating:", existingProfiles[0]);
          userId = existingProfiles[0].id;
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              name: pendingUser.name,
              email: pendingUser.email,
              age: pendingUser.age
            })
            .eq('id', userId);
            
          if (updateError) {
            console.error("Failed to update profile in Supabase:", updateError);
            // Continue with localStorage as fallback
          } else {
            console.log("Profile updated successfully in Supabase");
          }
        } else {
          // Create new profile with proper UUID
          console.log("No existing profile found, creating new profile with ID:", userId);
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: userId,
              name: pendingUser.name,
              phone: pendingUser.phone,
              email: pendingUser.email,
              age: pendingUser.age
            }]);
            
          if (insertError) {
            console.error("Failed to create profile in Supabase:", insertError);
            // Continue with localStorage as fallback
          } else {
            console.log("Profile created successfully in Supabase");
          }
        }
        
        // Save the user with the finalized ID
        const finalUser = {
          ...pendingUser,
          id: userId
        };
        localStorage.setItem("docuvault_user", JSON.stringify(finalUser));
        
        // Clean up
        localStorage.removeItem("docuvault_pending_user");
        localStorage.removeItem("docuvault_pending_phone");
        
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
        let existingUser = null;
        
        // Try to find user in Supabase first
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone', phone);
          
        if (error) {
          console.error("Failed to fetch user from Supabase:", error);
          // Fall back to localStorage
        }
        
        if (profiles && profiles.length > 0) {
          existingUser = profiles[0];
          console.log("Found user in Supabase:", existingUser);
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

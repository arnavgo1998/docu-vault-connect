import { toast } from "sonner";
import { AuthUser } from "./types";
import { MOCK_USERS } from "./mockData";
import { supabase } from "@/integrations/supabase/client";

// Send OTP (implementation using Supabase)
export const sendOtp = async (phone: string): Promise<boolean> => {
  try {
    // For demo purposes, we'll use a mock implementation
    // In a real app, this would use Supabase Auth with a phone provider or a 3rd party SMS service
    
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

// Verify OTP and handle sign-in or registration
export const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
  try {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // For demo: only "123456" is valid
    const isValid = otp === "123456";
    
    if (!isValid) {
      toast.error("Invalid OTP. Please try again.");
      return false;
    }
    
    // Check if user exists in mock data
    const existingUser = MOCK_USERS.find(u => u.phone === phone);
    
    if (existingUser) {
      // Existing user - sign in
      localStorage.setItem("docuvault_user", JSON.stringify(existingUser));
      toast.success("Welcome back!");
    } else {
      // New user - create account
      const newUser = {
        id: `user_${Date.now()}`,
        name: `User ${phone.slice(-4)}`, // Generate a name based on last 4 digits
        phone: phone,
      };
      
      // Store the new user
      MOCK_USERS.push(newUser);
      localStorage.setItem("docuvault_user", JSON.stringify(newUser));
      toast.success("Account created successfully!");
    }
    
    return true;
  } catch (error) {
    console.error("Failed to verify OTP:", error);
    toast.error("Failed to verify OTP. Please try again.");
    return false;
  }
};

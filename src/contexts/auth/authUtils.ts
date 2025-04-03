
import { toast } from "sonner";
import { AuthUser } from "./types";
import { MOCK_USERS } from "./mockData";

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
      
      // Save the new user
      localStorage.setItem("docuvault_user", JSON.stringify(pendingUser));
      localStorage.removeItem("docuvault_pending_user");
      localStorage.removeItem("docuvault_pending_phone");
      
      // Add to our mock database for future logins
      const existingUserIndex = MOCK_USERS.findIndex(u => u.phone === pendingUser.phone);
      if (existingUserIndex >= 0) {
        // Update existing user
        MOCK_USERS[existingUserIndex] = pendingUser;
      } else {
        // Add new user
        MOCK_USERS.push(pendingUser);
      }
      
      toast.success("Account created successfully!");
      return true;
    } else {
      // We're in a login flow - find the existing user
      const existingUser = MOCK_USERS.find(u => u.phone === phone);
      
      if (existingUser) {
        // Existing user - sign in
        console.log("Logging in existing user:", existingUser);
        localStorage.setItem("docuvault_user", JSON.stringify(existingUser));
        localStorage.removeItem("docuvault_pending_phone");
        toast.success("Welcome back!");
        return true;
      } else {
        // No such user
        toast.error("User not found. Please register first.");
        return false;
      }
    }
  } catch (error) {
    console.error("Failed to verify OTP:", error);
    toast.error("Failed to verify OTP. Please try again.");
    return false;
  }
};

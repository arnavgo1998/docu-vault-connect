
import { toast } from "sonner";
import { AuthUser } from "./types";
import { MOCK_USERS } from "./mockData";

// Send OTP (mock implementation)
export const sendOtp = async (phone: string): Promise<boolean> => {
  try {
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

// Verify OTP (mock implementation)
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
    
    return true;
  } catch (error) {
    console.error("Failed to verify OTP:", error);
    toast.error("Failed to verify OTP. Please try again.");
    return false;
  }
};

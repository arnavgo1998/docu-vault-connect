
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/layout/Layout";
import AuthHeader from "../components/auth/AuthHeader";
import RegistrationDetailsForm from "../components/auth/RegistrationDetailsForm";
import OtpVerificationForm from "../components/auth/OtpVerificationForm";
import { useToast } from "@/hooks/use-toast";

const Register: React.FC = () => {
  const [step, setStep] = useState<"details" | "verify">("details");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    age: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSendOtp = async () => {
    setIsSubmitting(true);
    
    try {
      // First register the user data to prepare for OTP verification
      const userData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
      };
      
      console.log("Registering user with data:", userData);
      
      // Call register to store the pending user
      const registered = await register(userData);
      
      if (!registered) {
        setIsSubmitting(false);
        return;
      }
      
      // Then send OTP
      const success = await sendOtp(formData.phone);
      
      if (success) {
        setStep("verify");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleVerifyAndRegister = async (otp: string) => {
    setIsSubmitting(true);
    
    try {
      const isVerified = await verifyOtp(formData.phone, otp);
      
      if (isVerified) {
        // Navigate to home page upon successful verification
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Verification failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <AuthHeader 
            title="Create an account" 
            subtitle="Sign up to store and manage your documents" 
          />
          
          {step === "details" ? (
            <RegistrationDetailsForm
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSendOtp}
              isSubmitting={isSubmitting}
              onNavigateToLogin={() => navigate("/login")}
            />
          ) : (
            <OtpVerificationForm
              onVerify={handleVerifyAndRegister}
              onBack={() => setStep("details")}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Register;

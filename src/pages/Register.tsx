
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/layout/Layout";
import AuthHeader from "../components/auth/AuthHeader";
import RegistrationDetailsForm from "../components/auth/RegistrationDetailsForm";
import OtpVerificationForm from "../components/auth/OtpVerificationForm";
import { v4 as uuidv4 } from 'uuid';

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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSendOtp = async () => {
    setIsSubmitting(true);
    
    // First register the user data to prepare for OTP verification
    const userData = {
      id: uuidv4(), // Generate a proper UUID for Supabase
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
    setIsSubmitting(false);
    
    if (success) {
      setStep("verify");
    }
  };
  
  const handleVerifyAndRegister = async (otp: string) => {
    setIsSubmitting(true);
    const isVerified = await verifyOtp(formData.phone, otp);
    setIsSubmitting(false);
    
    if (isVerified) {
      // Use navigate instead of reloading the page for registration
      navigate("/", { replace: true });
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

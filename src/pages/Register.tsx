import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/layout/Layout";
import { FileText, Loader2 } from "lucide-react";

const Register: React.FC = () => {
  const [step, setStep] = useState<"details" | "verify">("details");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    age: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) return;
    
    setIsSubmitting(true);
    const success = await sendOtp(formData.phone);
    setIsSubmitting(false);
    
    if (success) {
      setStep("verify");
    }
  };
  
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) return;
    
    setIsSubmitting(true);
    
    // Verify OTP
    const isVerified = await verifyOtp(formData.phone, otp);
    
    if (isVerified) {
      // Register user
      const userData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        password: formData.password || "default123",
      };
      
      const success = await register(userData);
      
      if (success) {
        navigate("/");
      }
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="flex flex-col items-center">
              <div className="bg-docuvault-primary/10 p-3 rounded-full">
                <FileText className="h-8 w-8 text-docuvault-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create an account</h1>
              <p className="text-gray-500 text-center mt-1">
                Sign up to store and manage your documents
              </p>
            </div>
          </div>
          
          {step === "details" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Age (Optional)</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min={1}
                  max={120}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-docuvault-primary hover:bg-docuvault-primary/90"
                disabled={isSubmitting || !formData.name || !formData.phone || !formData.password}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-docuvault-primary hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP sent to your phone"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  For demo, use: 123456
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-docuvault-primary hover:bg-docuvault-primary/90"
                disabled={isSubmitting || !otp}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
              
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="text-sm text-docuvault-primary hover:underline"
                >
                  Change details
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Register;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/layout/Layout";
import { FileText, Loader2 } from "lucide-react";

const Login: React.FC = () => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, sendOtp } = useAuth();
  const navigate = useNavigate();
  
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone) return;
    
    setIsSubmitting(true);
    const success = await sendOtp(phone);
    setIsSubmitting(false);
    
    if (success) {
      setStep("otp");
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !otp) return;
    
    setIsSubmitting(true);
    const success = await login(phone, otp);
    setIsSubmitting(false);
    
    if (success) {
      navigate("/");
    }
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
              <h1 className="text-2xl font-bold mt-2">Welcome back</h1>
              <p className="text-gray-500 text-center mt-1">
                Sign in to access your documents
              </p>
            </div>
          </div>
          
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  For demo, use: 1234567890
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-docuvault-primary hover:bg-docuvault-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="text-docuvault-primary hover:underline"
                  >
                    Register
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Sign In"
                )}
              </Button>
              
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="text-sm text-docuvault-primary hover:underline"
                >
                  Change phone number
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Login;

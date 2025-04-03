
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OtpVerificationFormProps {
  onVerify: (otp: string) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

const OtpVerificationForm: React.FC<OtpVerificationFormProps> = ({
  onVerify,
  onBack,
  isSubmitting
}) => {
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      toast.error("Please enter verification code");
      return;
    }
    
    await onVerify(otp);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      
      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Change details
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-docuvault-primary hover:bg-docuvault-primary/90"
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
      </div>
    </form>
  );
};

export default OtpVerificationForm;

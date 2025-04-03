
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RegistrationFormData {
  name: string;
  phone: string;
  email: string;
  age: string;
}

interface RegistrationDetailsFormProps {
  formData: RegistrationFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  onNavigateToLogin: () => void;
}

const RegistrationDetailsForm: React.FC<RegistrationDetailsFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  isSubmitting,
  onNavigateToLogin
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error("Name and phone number are required");
      return;
    }
    
    await onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={onInputChange}
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
          onChange={onInputChange}
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
          onChange={onInputChange}
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
          onChange={onInputChange}
          min={1}
          max={120}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-docuvault-primary hover:bg-docuvault-primary/90"
        disabled={isSubmitting || !formData.name || !formData.phone}
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
      
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="text-docuvault-primary hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
};

export default RegistrationDetailsForm;

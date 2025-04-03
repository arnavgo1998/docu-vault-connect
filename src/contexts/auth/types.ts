
import { User } from '@supabase/supabase-js';

// Define authentication types
export type AuthUser = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
};

export type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<AuthUser, "id"> & { password: string }) => Promise<boolean>;
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
};


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
  logout: () => void;
  register: (userData: Omit<AuthUser, 'id'>) => Promise<boolean>;
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
};

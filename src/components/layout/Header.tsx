
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { FileText, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  
  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";
  
  const handleLogout = () => {
    logout();
    navigate("/login");
    setOpen(false);
  };
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2" onClick={() => navigate("/")} role="button">
          <FileText className="h-7 w-7 text-docuvault-primary" />
          <span className="font-semibold text-xl text-docuvault-dark">DocuVault</span>
        </div>
        
        <div className="flex items-center">
          {isAuthenticated ? (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <div className="py-4 mb-4 border-b">
                    <p className="text-sm text-muted-foreground">Signed in as</p>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.phone}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={() => {
                        navigate("/");
                        setOpen(false);
                      }}
                    >
                      Dashboard
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={() => {
                        navigate("/profile");
                        setOpen(false);
                      }}
                    >
                      Profile
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={() => {
                        navigate("/shared");
                        setOpen(false);
                      }}
                    >
                      Shared Documents
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-destructive hover:text-destructive" 
                      onClick={handleLogout}
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <>
              {!isLoginPage && !isRegisterPage && (
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/login")}
                  className="text-docuvault-primary"
                >
                  Sign in
                </Button>
              )}
              {!isRegisterPage && !isLoginPage && (
                <Button 
                  onClick={() => navigate("/register")}
                  className="bg-docuvault-primary hover:bg-docuvault-primary/90"
                >
                  Register
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

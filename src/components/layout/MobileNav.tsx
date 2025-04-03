
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, FileText, Share2, User } from "lucide-react";

const MobileNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="grid grid-cols-4 h-16">
        <button
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive("/") ? "text-docuvault-primary" : "text-gray-500"
          }`}
          onClick={() => navigate("/")}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </button>
        
        <button
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive("/documents") ? "text-docuvault-primary" : "text-gray-500"
          }`}
          onClick={() => navigate("/documents")}
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs">Docs</span>
        </button>
        
        <button
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive("/shared") ? "text-docuvault-primary" : "text-gray-500"
          }`}
          onClick={() => navigate("/shared")}
        >
          <Share2 className="h-5 w-5" />
          <span className="text-xs">Shared</span>
        </button>
        
        <button
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive("/profile") ? "text-docuvault-primary" : "text-gray-500"
          }`}
          onClick={() => navigate("/profile")}
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNav;

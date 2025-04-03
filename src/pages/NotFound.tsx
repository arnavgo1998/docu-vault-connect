
import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="bg-docuvault-primary/10 p-4 rounded-full inline-flex mb-6">
          <FileText className="h-12 w-12 text-docuvault-primary" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Page Not Found</h1>
        
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          
          <Button 
            onClick={() => navigate("/")}
            className="bg-docuvault-primary hover:bg-docuvault-primary/90"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

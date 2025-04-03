
import React from "react";
import { FileText } from "lucide-react";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="flex justify-center mb-6">
      <div className="flex flex-col items-center">
        <div className="bg-docuvault-primary/10 p-3 rounded-full">
          <FileText className="h-8 w-8 text-docuvault-primary" />
        </div>
        <h1 className="text-2xl font-bold mt-2">{title}</h1>
        <p className="text-gray-500 text-center mt-1">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default AuthHeader;


import React from "react";
import { Loader2, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface UploadProgressProps {
  progress: number;
  processingInfo: boolean;
  uploadError: string | null;
  onRetry: () => void;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ 
  progress, 
  processingInfo, 
  uploadError, 
  onRetry 
}) => {
  return (
    <div className="py-4">
      {uploadError ? (
        <div className="text-center space-y-4">
          <div className="inline-block p-3 bg-red-100 rounded-full">
            <Upload className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-red-600">Upload Failed</h3>
          <p className="text-sm text-red-500">{uploadError}</p>
          <Button onClick={onRetry}>Try Again</Button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="font-medium text-center mb-2">
              {progress < 70 
                ? "Uploading document..." 
                : processingInfo
                  ? "Processing document..." 
                  : "Upload complete!"}
            </p>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-docuvault-primary" />
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            {progress < 70 
              ? "Please wait while we upload your document..."
              : processingInfo
                ? "We're analyzing your document to extract policy information..."
                : "Processing complete!"}
          </div>
        </>
      )}
    </div>
  );
};

export default UploadProgress;

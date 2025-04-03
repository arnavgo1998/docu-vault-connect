
import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DropZoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  uploadError: string | null;
}

const DropZone: React.FC<DropZoneProps> = ({ file, onFileChange, uploadError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  return (
    <>
      <div 
        className={`border-2 border-dashed ${uploadError ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center">
          <div className={`${uploadError ? 'bg-red-100' : 'bg-docuvault-primary/10'} p-3 rounded-full mb-3`}>
            <Upload className={`h-6 w-6 ${uploadError ? 'text-red-500' : 'text-docuvault-primary'}`} />
          </div>
          {uploadError ? (
            <>
              <p className="font-medium mb-1 text-red-600">Upload Failed</p>
              <p className="text-sm text-red-500 mb-3">{uploadError}</p>
              <p className="text-xs text-gray-400">Click to try again</p>
            </>
          ) : (
            <>
              <p className="font-medium mb-1">Click to select a file</p>
              <p className="text-sm text-gray-500 mb-3">or drag and drop</p>
              <p className="text-xs text-gray-400">Supported formats: PDF, JPG, PNG</p>
              <p className="text-xs text-gray-400 mt-1">Maximum size: 10MB</p>
            </>
          )}
        </div>
        <Input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      
      {file && !uploadError && (
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="flex items-center">
            <div className="mr-3">
              <div className="bg-docuvault-primary/10 p-2 rounded-full">
                <Upload className="h-4 w-4 text-docuvault-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => onFileChange(null)}
            >
              Change
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default DropZone;

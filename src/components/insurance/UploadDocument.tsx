
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";
import { useInsurance } from "../../contexts/InsuranceContext";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UploadDocumentProps {
  onSuccess?: () => void;
}

const UploadDocument: React.FC<UploadDocumentProps> = ({ onSuccess }) => {
  const { uploadDocument, extractDocumentInfo } = useInsurance();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingInfo, setProcessingInfo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!file || !user) return;
    
    setIsUploading(true);
    setProgress(10);
    
    try {
      // First, upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      setProgress(50);
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);
      
      const fileUrl = publicUrlData.publicUrl;
      
      setProgress(70);
      setProcessingInfo(true);
      
      // Extract document info
      const docInfo = await extractDocumentInfo(file);
      
      setProgress(90);
      
      // Use the uploadDocument function to store document metadata
      const success = await uploadDocument(file, {
        file_url: fileUrl,
        ...docInfo
      });
      
      if (success) {
        setProgress(100);
        toast({
          title: "Upload successful",
          description: "Your document has been uploaded."
        });
        
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 500);
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your document.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {!isUploading ? (
        <>
          <div 
            className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center">
              <div className="bg-docuvault-primary/10 p-3 rounded-full mb-3">
                <Upload className="h-6 w-6 text-docuvault-primary" />
              </div>
              <p className="font-medium mb-1">Click to select a file</p>
              <p className="text-sm text-gray-500 mb-3">or drag and drop</p>
              <p className="text-xs text-gray-400">Supported formats: PDF, JPG, PNG</p>
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          
          {file && (
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
                  onClick={() => setFile(null)}
                >
                  Change
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={onSuccess}
            >
              Cancel
            </Button>
            <Button 
              disabled={!file}
              onClick={handleUpload}
            >
              Upload Document
            </Button>
          </div>
        </>
      ) : (
        <div className="py-4">
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
        </div>
      )}
    </div>
  );
};

export default UploadDocument;

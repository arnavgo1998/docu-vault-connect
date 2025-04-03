
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";
import { useInsurance } from "../../contexts/InsuranceContext";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface UploadDocumentProps {
  onSuccess?: () => void;
}

const UploadDocument: React.FC<UploadDocumentProps> = ({ onSuccess }) => {
  const { uploadDocument, extractDocumentInfo } = useInsurance();
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingInfo, setProcessingInfo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadError(null); // Reset any previous errors
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setUploadError(null); // Reset any previous errors
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleUpload = async () => {
    if (!file || !user) {
      toast({
        title: "Error",
        description: "Please select a file and ensure you're logged in",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file type
    const validTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!validTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, JPG, or PNG file",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setProgress(10);
    setUploadError(null);
    
    try {
      // Create a safe filename to avoid special characters issues
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // First, upload file to Supabase Storage
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error(`Storage error: ${uploadError.message}`);
      }

      setProgress(50);
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded file");
      }
      
      const fileUrl = publicUrlData.publicUrl;
      console.log("File uploaded, public URL:", fileUrl);
      
      setProgress(70);
      setProcessingInfo(true);
      
      // Extract document info
      const docInfo = await extractDocumentInfo(file);
      
      setProgress(90);
      
      // Use the uploadDocument function to store document metadata
      const success = await uploadDocument(file, {
        fileUrl: fileUrl,
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
      } else {
        throw new Error("Failed to record document metadata");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage = error instanceof Error ? error.message : "There was a problem uploading your document.";
      setUploadError(errorMessage);
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Reset the upload state to allow the user to try again
      setIsUploading(false);
      setProgress(0);
      setProcessingInfo(false);
    } finally {
      if (!uploadError) {
        setIsUploading(false);
      }
    }
  };
  
  const handleRetry = () => {
    setIsUploading(false);
    setProgress(0);
    setProcessingInfo(false);
    setUploadError(null);
  };
  
  return (
    <div className="space-y-4">
      {!isUploading ? (
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
          {uploadError ? (
            <div className="text-center space-y-4">
              <div className="inline-block p-3 bg-red-100 rounded-full">
                <Upload className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-red-600">Upload Failed</h3>
              <p className="text-sm text-red-500">{uploadError}</p>
              <Button onClick={handleRetry}>Try Again</Button>
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
      )}
    </div>
  );
};

export default UploadDocument;

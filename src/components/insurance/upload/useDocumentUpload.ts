
import { useState } from "react";
import { useInsurance } from "@/contexts/InsuranceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { validateFile, uploadFileToStorage } from "./uploadUtils";

export const useDocumentUpload = (onSuccess?: () => void) => {
  const { uploadDocument, extractDocumentInfo } = useInsurance();
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingInfo, setProcessingInfo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
    setUploadError(null); // Reset any previous errors
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }
    
    if (!user || !user.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload documents",
        variant: "destructive"
      });
      return;
    }
    
    // Validate the file
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setProgress(10);
    setUploadError(null);
    
    try {
      // Upload the file to storage
      setProgress(30);
      console.log("Starting file upload for user:", user.id);
      const { fileUrl, error } = await uploadFileToStorage(file, user.id);
      
      if (error) {
        throw new Error(error);
      }
      
      setProgress(50);
      
      // Extract document info
      setProgress(70);
      setProcessingInfo(true);
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
    } finally {
      if (uploadError) {
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
  
  return {
    file,
    isUploading,
    progress,
    processingInfo,
    uploadError,
    handleFileChange,
    handleUpload,
    handleRetry
  };
};

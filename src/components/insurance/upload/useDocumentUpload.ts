
import { useState } from "react";
import { useInsurance } from "@/contexts/InsuranceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { validateFile, uploadFileToStorage, storeDocumentMetadata } from "./uploadUtils";

export const useDocumentUpload = (onSuccess?: () => void) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingInfo, setProcessingInfo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const extractDocumentInfo = async (file: File) => {
    // In a real app, this would send the file to a backend API for OCR/AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const fileName = file.name.toLowerCase();
    
    if (fileName.includes("health")) {
      return {
        type: "Health",
        policyNumber: "H-" + Math.random().toString().substring(2, 10),
        provider: "BlueCross BlueShield",
        premium: "$250/month",
        dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      };
    } else if (fileName.includes("auto")) {
      return {
        type: "Auto",
        policyNumber: "A-" + Math.random().toString().substring(2, 10),
        provider: "Geico",
        premium: "$125/month",
        dueDate: new Date(Date.now() + 45*24*60*60*1000).toISOString().split('T')[0],
      };
    } else if (fileName.includes("life")) {
      return {
        type: "Life",
        policyNumber: "L-" + Math.random().toString().substring(2, 10),
        provider: "MetLife",
        premium: "$75/month",
        dueDate: new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0],
      };
    } else if (fileName.includes("home")) {
      return {
        type: "Home",
        policyNumber: "H-" + Math.random().toString().substring(2, 10),
        provider: "State Farm",
        premium: "$150/month",
        dueDate: new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0],
      };
    } else {
      return {
        type: "General",
        policyNumber: "G-" + Math.random().toString().substring(2, 10),
        provider: "Unknown Provider",
        premium: "Unknown",
        dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      };
    }
  };
  
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
      
      if (!fileUrl) {
        throw new Error("No file URL returned after upload");
      }
      
      setProgress(50);
      
      // Extract document info
      setProgress(70);
      setProcessingInfo(true);
      const docInfo = await extractDocumentInfo(file);
      
      setProgress(90);
      
      // Create document metadata
      const documentData = {
        owner_id: user.id,
        name: `${docInfo.type} Insurance`,  // Create a name based on the type
        type: docInfo.type || "General",
        provider: docInfo.provider || "Unknown Provider",
        policy_number: docInfo.policyNumber || '',
        premium_amount: docInfo.premium || '',
        end_date: docInfo.dueDate || '',
        file_url: fileUrl,
        file_type: file.type,
        file_size: file.size,
        upload_date: new Date().toISOString(),
        shared: false
      };
      
      // Store document metadata
      const { success, error: metadataError } = await storeDocumentMetadata(documentData);
      
      if (!success) {
        throw new Error(metadataError || "Failed to record document metadata");
      }
      
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
      setIsUploading(false);
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

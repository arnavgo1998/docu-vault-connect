
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Validates the file before upload
export const validateFile = (file: File) => {
  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds the 10MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`
    };
  }
  
  // Check file type
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/heic',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not supported. Please upload a PDF, JPG, PNG, HEIC, or Word document.`
    };
  }
  
  return { valid: true, error: null };
};

// Uploads the file to Supabase storage
export const uploadFileToStorage = async (file: File, userId: string) => {
  try {
    // Create a unique filename with the original extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${uuidv4().substring(0, 8)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    console.log("Uploading with userID:", userId);
    console.log("File path:", filePath);
    
    // Check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'documents');
    
    // Create the bucket if it doesn't exist
    if (!bucketExists) {
      console.log("Documents bucket not found, creating one...");
      try {
        await supabase.storage.createBucket('documents', {
          public: true,
          fileSizeLimit: 10485760, // 10MB in bytes
        });
      } catch (err) {
        console.error("Error creating bucket:", err);
        // Continue even if bucket creation fails (it might already exist)
      }
    }
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) {
      console.error("Error uploading file:", error);
      return { fileUrl: null, error: error.message };
    }
    
    // Get the public URL - FIX: Use getPublicUrl method instead of accessing storageUrl directly
    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
      
    const fileUrl = publicUrlData.publicUrl;
    return { fileUrl, error: null };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { 
      fileUrl: null, 
      error: error instanceof Error ? error.message : "Unknown error during file upload" 
    };
  }
};


import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Validate file type
  const validTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
  const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  if (!validTypes.includes(fileExtension)) {
    return {
      valid: false,
      error: "Please upload a PDF, JPG, or PNG file"
    };
  }
  
  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Maximum file size is 10MB"
    };
  }
  
  return { valid: true };
};

export const uploadFileToStorage = async (file: File, userId: string): Promise<{ fileUrl: string; error?: string }> => {
  try {
    // Create a safe filename to avoid special characters issues
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Log the user ID and file path to help with debugging
    console.log("Uploading with userID:", userId);
    console.log("File path:", fileName);
    
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
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error("Failed to get public URL for uploaded file");
    }
    
    return { fileUrl: publicUrlData.publicUrl };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "There was a problem uploading your document.";
    return { fileUrl: "", error: errorMessage };
  }
};

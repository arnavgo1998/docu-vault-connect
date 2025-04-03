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
    if (!userId) {
      console.error("Missing user ID for file upload");
      return { fileUrl: "", error: "Authentication required. Please log in." };
    }

    // Create a safe filename to avoid special characters issues
    const fileExt = file.name.split('.').pop();
    // Make sure userId is the first part of the path to comply with RLS policies
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Log the user ID and file path to help with debugging
    console.log("Uploading with userID:", userId);
    console.log("File path:", fileName);
    
    // Check if user is authenticated in Supabase
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error("No active Supabase session found");
      
      // Try to get user from local storage as fallback for development
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        // If still no user, we need to upload the file with the public key only
        // and rely on our RLS policies to allow the upload
        console.warn("Using development auth approach. In production, users must be authenticated with Supabase Auth.");
        
        // For development, upload without custom headers, we'll rely on RLS policies
        const { data: fileData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          throw new Error(`Storage error: ${uploadError.message}`);
        }
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);
          
        if (!publicUrlData || !publicUrlData.publicUrl) {
          throw new Error("Failed to get public URL for uploaded file");
        }
        
        return { fileUrl: publicUrlData.publicUrl };
      }
    }
    
    // Standard upload with proper auth
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
    console.error("File upload failed:", errorMessage);
    return { fileUrl: "", error: errorMessage };
  }
};

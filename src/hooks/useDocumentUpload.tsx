
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InsuranceDocument } from "@/types/insurance";
import { extractDocumentInfo as extractInfo } from "@/utils/documentUtils";

export const useDocumentUpload = (loadUserData: () => Promise<void>) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Extract information from a document using OCR/AI
  const extractDocumentInfo = async (file: File): Promise<Partial<InsuranceDocument>> => {
    return extractInfo(file);
  };

  // Upload a new document
  const uploadDocument = async (file: File, details?: Partial<InsuranceDocument>): Promise<boolean> => {
    try {
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to upload documents.",
          variant: "destructive"
        });
        return false;
      }
      
      setIsLoading(true);
      
      // Extract info from the document if not provided
      let docInfo: Partial<InsuranceDocument> = details || {};
      if (!details || Object.keys(details).length === 0) {
        docInfo = await extractDocumentInfo(file);
      }

      // Prepare the document data with required fields
      const documentData = {
        owner_id: user.data.user.id,
        name: docInfo.name || `${docInfo.type || 'General'} Insurance`,
        type: docInfo.type || "General",
        provider: docInfo.provider || "Unknown Provider",
        policy_number: docInfo.policyNumber || '',
        premium_amount: docInfo.premium || '',
        file_url: docInfo.fileUrl || '',
        file_type: file.type,
        file_size: file.size,
        upload_date: new Date().toISOString(),
        shared: false
      };

      console.log("Inserting document with data:", documentData);
      
      // Create document record in Supabase
      const { data, error } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();
        
      if (error) {
        console.error("Failed to upload document:", error);
        throw error;
      }
      
      // Refresh the user data
      await loadUserData();
      
      toast({
        title: "Document uploaded successfully",
        description: "Your document has been uploaded."
      });
      
      return true;
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast({
        title: "Failed to upload document",
        description: "There was an error uploading your document.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadDocument,
    extractDocumentInfo,
    isLoading
  };
};

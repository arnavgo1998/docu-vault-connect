
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InsuranceDocument } from "@/types/insurance";
import { transformDocument } from "@/utils/documentUtils";

export const useDocumentOperations = (loadUserData: () => Promise<void>) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Update an existing document
  const updateDocument = async (id: string, updates: Partial<InsuranceDocument>): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Map our frontend model to the database model
      const dbUpdates: any = {
        name: updates.name,
        type: updates.type,
        provider: updates.provider,
        policy_number: updates.policyNumber,
        premium_amount: updates.premium,
        end_date: updates.dueDate
      };
      
      // Only include keys with values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key] === undefined) {
          delete dbUpdates[key];
        }
      });
      
      // Update the document in Supabase
      const { error } = await supabase
        .from('documents')
        .update(dbUpdates)
        .eq('id', id);
        
      if (error) throw error;
      
      // Record the edit in document_edits
      const { error: editError } = await supabase
        .from('document_edits')
        .insert({
          document_id: id,
          editor_id: (await supabase.auth.getUser()).data.user?.id,
          edit_type: 'update',
          new_value: dbUpdates
        });
        
      if (editError) console.error("Failed to record edit:", editError);
      
      // Refresh the data
      await loadUserData();
      
      toast({
        title: "Document updated successfully",
        description: "Your document has been updated."
      });
      
      return true;
    } catch (error) {
      console.error("Failed to update document:", error);
      toast({
        title: "Failed to update document",
        description: "There was an error updating your document.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a document
  const deleteDocument = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Find the document to get the file URL
      const { data: doc, error: fetchError } = await supabase
        .from('documents')
        .select('file_url')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Delete the document from Supabase
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // If the document has a file in storage, delete it
      if (doc && doc.file_url) {
        // Extract the path from the URL
        const url = new URL(doc.file_url);
        const path = url.pathname.split('/').slice(2).join('/');
        
        if (path) {
          const { error: storageError } = await supabase.storage
            .from('documents')
            .remove([path]);
            
          if (storageError) console.error("Failed to delete file from storage:", storageError);
        }
      }
      
      // Refresh the data
      await loadUserData();
      
      toast({
        title: "Document deleted successfully",
        description: "Your document has been deleted."
      });
      
      return true;
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast({
        title: "Failed to delete document",
        description: "There was an error deleting your document.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateDocument,
    deleteDocument,
    isLoading
  };
};

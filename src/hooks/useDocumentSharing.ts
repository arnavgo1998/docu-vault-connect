
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SharedAccess } from "@/types/insurance";

export const useDocumentSharing = (loadUserData: () => Promise<void>) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [myInviteCode, setMyInviteCode] = useState<string | null>(null);
  const [usersWithAccess, setUsersWithAccess] = useState<SharedAccess[]>([]);

  // Generate a sharing invite code
  const generateInviteCode = async (): Promise<string> => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setMyInviteCode(code);
    return code;
  };

  // Share access to a document using invite code
  const shareAccess = async (documentId: string, inviteCode: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Find the target user with the invite code
      // In a real implementation, we would have a table of invite codes
      // For now, we'll use a simplified approach
      
      // Check if the invite code is valid (this would be a DB lookup in a real app)
      if (!inviteCode) {
        toast({
          title: "Invalid invite code",
          description: "The provided invite code is not valid.",
          variant: "destructive"
        });
        return false;
      }
      
      const user = await supabase.auth.getUser();
      
      // Share the document
      const { data, error } = await supabase
        .from('shared_documents')
        .insert({
          document_id: documentId,
          shared_with_id: user.data.user?.id || '',
          shared_by_id: user.data.user?.id || '' // This should be the owner of the invite code in a real app
        });
        
      if (error) throw error;
      
      // Update the document to mark it as shared
      const { error: updateError } = await supabase
        .from('documents')
        .update({ shared: true })
        .eq('id', documentId);
        
      if (updateError) throw updateError;
      
      // Refresh the data
      await loadUserData();
      
      toast({
        title: "Document shared successfully",
        description: "Access has been granted to the document."
      });
      
      return true;
    } catch (error) {
      console.error("Failed to share document:", error);
      toast({
        title: "Failed to share document",
        description: "There was an error sharing the document.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke access for a user
  const revokeAccess = async (userId: string, documentId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Remove the shared_documents entry
      const { error } = await supabase
        .from('shared_documents')
        .delete()
        .match({ 
          shared_with_id: userId,
          document_id: documentId
        });
        
      if (error) throw error;
      
      // Check if anyone else has access to this document
      const { data: remainingShares, error: countError } = await supabase
        .from('shared_documents')
        .select('id')
        .eq('document_id', documentId);
        
      if (countError) throw countError;
      
      // If no one has access to this document anymore, mark it as not shared
      if (remainingShares.length === 0) {
        const { error: updateError } = await supabase
          .from('documents')
          .update({ shared: false })
          .eq('id', documentId);
          
        if (updateError) throw updateError;
      }
      
      // Refresh the data
      await loadUserData();
      
      toast({
        title: "Access revoked successfully",
        description: "Access to the document has been removed."
      });
      
      return true;
    } catch (error) {
      console.error("Failed to revoke access:", error);
      toast({
        title: "Failed to revoke access",
        description: "There was an error revoking access.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    myInviteCode,
    usersWithAccess,
    setUsersWithAccess,
    generateInviteCode,
    shareAccess,
    revokeAccess,
    isLoading
  };
};

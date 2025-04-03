
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { InsuranceDocument, SharedAccess, InsuranceContextType } from "@/types/insurance";
import { transformDocument } from "@/utils/documentUtils";
import { useDocumentOperations } from "@/hooks/useDocumentOperations";
import { useDocumentSharing } from "@/hooks/useDocumentSharing";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";

// Create the context
const InsuranceContext = createContext<InsuranceContextType | undefined>(undefined);

// Provider component
export const InsuranceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myDocuments, setMyDocuments] = useState<InsuranceDocument[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<InsuranceDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Clear data when user logs out
      setMyDocuments([]);
      setSharedWithMe([]);
    }
  }, [user]);

  // Load user data from Supabase
  const loadUserData = async () => {
    setIsLoading(true);
    
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Load user's documents
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('*, profiles!documents_owner_id_fkey(name)')
        .eq('owner_id', user.id);
      
      if (documentsError) throw documentsError;

      // Load documents shared with user
      const { data: sharedDocs, error: sharedError } = await supabase
        .from('shared_documents')
        .select(`
          documents(*, profiles!documents_owner_id_fkey(name)),
          shared_at
        `)
        .eq('shared_with_id', user.id);
      
      if (sharedError) throw sharedError;

      // Load users who have access to my documents
      const { data: accessData, error: accessError } = await supabase
        .from('shared_documents')
        .select(`
          document_id,
          shared_with_id,
          profiles!shared_documents_shared_with_id_fkey(name),
          shared_at
        `)
        .eq('shared_by_id', user.id);
      
      if (accessError) throw accessError;
      
      // Transform documents data to match InsuranceDocument type
      const transformedDocs = documents.map(transformDocument);
      
      // Transform shared documents
      const transformedShared = sharedDocs.map((shared: any): InsuranceDocument => {
        const doc = shared.documents;
        return transformDocument(doc);
      });
      
      // Transform access data
      const transformedAccess = accessData.map((access: any): SharedAccess => ({
        documentId: access.document_id,
        userId: access.shared_with_id,
        userName: access.profiles.name,
        accessGrantedDate: access.shared_at
      }));
      
      setMyDocuments(transformedDocs);
      setSharedWithMe(transformedShared);
      sharing.setUsersWithAccess(transformedAccess);
      
      // Generate invite code if none exists
      if (!sharing.myInviteCode) {
        sharing.generateInviteCode();
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
      toast({
        title: "Failed to load data",
        description: "There was an error loading your documents.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize our hooks
  const operations = useDocumentOperations(loadUserData);
  const sharing = useDocumentSharing(loadUserData);
  const upload = useDocumentUpload(loadUserData);

  // Merge loading states from all hooks
  const combinedIsLoading = isLoading || operations.isLoading || sharing.isLoading || upload.isLoading;

  return (
    <InsuranceContext.Provider
      value={{
        myDocuments,
        sharedWithMe,
        shareAccess: sharing.shareAccess,
        revokeAccess: sharing.revokeAccess,
        uploadDocument: upload.uploadDocument,
        extractDocumentInfo: upload.extractDocumentInfo,
        updateDocument: operations.updateDocument,
        deleteDocument: operations.deleteDocument,
        generateInviteCode: sharing.generateInviteCode,
        usersWithAccess: sharing.usersWithAccess,
        myInviteCode: sharing.myInviteCode,
        isLoading: combinedIsLoading,
      }}
    >
      {children}
    </InsuranceContext.Provider>
  );
};

// Hook for easy access to the context
export const useInsurance = () => {
  const context = useContext(InsuranceContext);
  if (context === undefined) {
    throw new Error("useInsurance must be used within an InsuranceProvider");
  }
  return context;
};

// Re-export types from the dedicated type file
export type { InsuranceType, InsuranceDocument, SharedAccess, InviteCode } from "@/types/insurance";

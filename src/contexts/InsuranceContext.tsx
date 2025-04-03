
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { Document } from "@/types/document";

// Define types
export type InsuranceType = "Health" | "Auto" | "Life" | "Home" | "General" | "Other";

export type InsuranceDocument = {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  type: InsuranceType;
  policyNumber: string;
  provider: string;
  premium: string;
  dueDate: string;
  uploadDate: string;
  fileUrl: string;
  shared: boolean;
  fileType?: string;
  fileSize?: number;
};

export type SharedAccess = {
  documentId: string;
  userId: string;
  userName: string;
  accessGrantedDate: string;
};

export type InviteCode = {
  code: string;
  ownerId: string;
  ownerName: string;
  created: string;
  expires: string;
};

type InsuranceContextType = {
  myDocuments: InsuranceDocument[];
  sharedWithMe: InsuranceDocument[];
  shareAccess: (documentId: string, inviteCode: string) => Promise<boolean>;
  revokeAccess: (userId: string, documentId: string) => Promise<boolean>;
  uploadDocument: (file: File, details?: Partial<InsuranceDocument>) => Promise<boolean>;
  extractDocumentInfo: (file: File) => Promise<Partial<InsuranceDocument>>;
  updateDocument: (id: string, updates: Partial<InsuranceDocument>) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;
  generateInviteCode: () => Promise<string>;
  usersWithAccess: SharedAccess[];
  myInviteCode: string | null;
  isLoading: boolean;
};

// Create the context
const InsuranceContext = createContext<InsuranceContextType | undefined>(undefined);

// Provider component
export const InsuranceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myDocuments, setMyDocuments] = useState<InsuranceDocument[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<InsuranceDocument[]>([]);
  const [usersWithAccess, setUsersWithAccess] = useState<SharedAccess[]>([]);
  const [myInviteCode, setMyInviteCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Clear data when user logs out
      setMyDocuments([]);
      setSharedWithMe([]);
      setUsersWithAccess([]);
      setMyInviteCode(null);
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
      const transformedDocs = documents.map((doc: any): InsuranceDocument => ({
        id: doc.id,
        ownerId: doc.owner_id,
        ownerName: doc.profiles.name,
        name: doc.name,
        type: doc.type as InsuranceType,
        policyNumber: doc.policy_number || '',
        provider: doc.provider,
        premium: doc.premium_amount || '',
        dueDate: doc.end_date || '',
        uploadDate: doc.upload_date || new Date().toISOString(),
        fileUrl: doc.file_url || '',
        shared: doc.shared || false,
        fileType: doc.file_type,
        fileSize: doc.file_size
      }));
      
      // Transform shared documents
      const transformedShared = sharedDocs.map((shared: any): InsuranceDocument => {
        const doc = shared.documents;
        return {
          id: doc.id,
          ownerId: doc.owner_id,
          ownerName: doc.profiles.name,
          name: doc.name,
          type: doc.type as InsuranceType,
          policyNumber: doc.policy_number || '',
          provider: doc.provider,
          premium: doc.premium_amount || '',
          dueDate: doc.end_date || '',
          uploadDate: doc.upload_date || new Date().toISOString(),
          fileUrl: doc.file_url || '',
          shared: true,
          fileType: doc.file_type,
          fileSize: doc.file_size
        };
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
      setUsersWithAccess(transformedAccess);
      
      // Generate invite code if none exists
      if (!myInviteCode) {
        generateInviteCode();
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
      
      // Share the document
      const { data, error } = await supabase
        .from('shared_documents')
        .insert({
          document_id: documentId,
          shared_with_id: user?.id || '',
          shared_by_id: user?.id || '' // This should be the owner of the invite code in a real app
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

  // Upload a new document
  const uploadDocument = async (file: File, details?: Partial<InsuranceDocument>): Promise<boolean> => {
    try {
      if (!user) {
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
        owner_id: user.id,
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

  // Extract information from a document using OCR/AI
  const extractDocumentInfo = async (file: File): Promise<Partial<InsuranceDocument>> => {
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
          editor_id: user?.id,
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

  return (
    <InsuranceContext.Provider
      value={{
        myDocuments,
        sharedWithMe,
        shareAccess,
        revokeAccess,
        uploadDocument,
        extractDocumentInfo,
        updateDocument,
        deleteDocument,
        generateInviteCode,
        usersWithAccess,
        myInviteCode,
        isLoading,
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

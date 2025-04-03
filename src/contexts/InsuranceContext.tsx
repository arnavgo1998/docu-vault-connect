
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

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

  // Load user data
  const loadUserData = () => {
    setIsLoading(true);
    
    // Load user's documents and shared documents from localStorage
    if (user) {
      // Get documents owned by the user from localStorage
      const storedDocs = localStorage.getItem("docuvault_my_documents");
      if (storedDocs) {
        try {
          const parsedDocs = JSON.parse(storedDocs);
          // Filter to only show documents owned by the current user
          setMyDocuments(parsedDocs.filter((doc: InsuranceDocument) => doc.ownerId === user.id));
        } catch (e) {
          console.error("Failed to parse stored documents:", e);
          setMyDocuments([]);
        }
      } else {
        setMyDocuments([]);
      }
      
      // Get shared documents
      const storedShared = localStorage.getItem("docuvault_shared_documents");
      if (storedShared) {
        try {
          const parsedShared = JSON.parse(storedShared);
          // Only include documents that are explicitly shared with the current user
          setSharedWithMe(parsedShared.filter((doc: InsuranceDocument) => 
            doc.ownerId !== user.id // Not owned by current user
          ));
        } catch (e) {
          console.error("Failed to parse stored shared documents:", e);
          setSharedWithMe([]);
        }
      } else {
        setSharedWithMe([]);
      }
      
      // Get access data
      const storedAccess = localStorage.getItem("docuvault_shared_access");
      if (storedAccess) {
        try {
          const parsedAccess = JSON.parse(storedAccess);
          // Only include access records related to the current user's documents
          setUsersWithAccess(parsedAccess.filter((access: SharedAccess) => {
            // Check if the document is owned by the current user
            const isDocumentOwner = myDocuments.some(doc => 
              doc.ownerId === user.id && doc.id === access.documentId
            );
            return isDocumentOwner;
          }));
        } catch (e) {
          console.error("Failed to parse stored access data:", e);
          setUsersWithAccess([]);
        }
      } else {
        setUsersWithAccess([]);
      }
      
      // Get or generate invite code
      const storedCode = localStorage.getItem("docuvault_invite_code");
      if (storedCode) {
        setMyInviteCode(storedCode);
      } else {
        // Generate a random code
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        localStorage.setItem("docuvault_invite_code", code);
        setMyInviteCode(code);
      }
    }
    
    setIsLoading(false);
  };

  // Generate a sharing invite code
  const generateInviteCode = async (): Promise<string> => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    localStorage.setItem("docuvault_invite_code", code);
    setMyInviteCode(code);
    return code;
  };

  // Share access to a document using invite code
  const shareAccess = async (documentId: string, inviteCode: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if the invite code is valid
      if (inviteCode !== myInviteCode) {
        toast.error("Invalid invite code");
        return false;
      }
      
      // Grant access
      const newAccess: SharedAccess = {
        documentId,
        userId: user?.id || "", // Use current user's ID
        userName: user?.name || "", // Use current user's name
        accessGrantedDate: new Date().toISOString(),
      };
      
      // Update state and localStorage
      const updatedAccess = [...usersWithAccess, newAccess];
      setUsersWithAccess(updatedAccess);
      localStorage.setItem("docuvault_shared_access", JSON.stringify(updatedAccess));
      
      // Mark document as shared
      const updatedDocs = myDocuments.map(doc => 
        doc.id === documentId ? { ...doc, shared: true } : doc
      );
      setMyDocuments(updatedDocs);
      localStorage.setItem("docuvault_my_documents", JSON.stringify(updatedDocs));
      
      toast.success("Document shared successfully");
      return true;
    } catch (error) {
      console.error("Failed to share document:", error);
      toast.error("Failed to share document");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke access for a user
  const revokeAccess = async (userId: string, documentId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Remove access
      const updatedAccess = usersWithAccess.filter(
        access => !(access.userId === userId && access.documentId === documentId)
      );
      
      // Update state and localStorage
      setUsersWithAccess(updatedAccess);
      localStorage.setItem("docuvault_shared_access", JSON.stringify(updatedAccess));
      
      // If no one has access to this document anymore, mark it as not shared
      const isStillShared = updatedAccess.some(access => access.documentId === documentId);
      if (!isStillShared) {
        const updatedDocs = myDocuments.map(doc => 
          doc.id === documentId ? { ...doc, shared: false } : doc
        );
        setMyDocuments(updatedDocs);
        localStorage.setItem("docuvault_my_documents", JSON.stringify(updatedDocs));
      }
      
      toast.success("Access revoked successfully");
      return true;
    } catch (error) {
      console.error("Failed to revoke access:", error);
      toast.error("Failed to revoke access");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Upload a new document
  const uploadDocument = async (file: File, details?: Partial<InsuranceDocument>): Promise<boolean> => {
    try {
      if (!user) {
        toast.error("You must be logged in to upload documents");
        return false;
      }
      
      setIsLoading(true);
      
      // Extract info from the document if not provided
      let docInfo: Partial<InsuranceDocument> = details || {};
      if (!details || Object.keys(details).length === 0) {
        docInfo = await extractDocumentInfo(file);
      }
      
      // Create a new document
      const newDoc: InsuranceDocument = {
        id: Math.random().toString(36).substring(2, 11),
        ownerId: user.id,
        ownerName: user.name,
        name: `${docInfo.type || 'General'} Insurance`,
        type: (docInfo.type as InsuranceType) || "General",
        policyNumber: docInfo.policyNumber || `P-${Math.random().toString().substring(2, 10)}`,
        provider: docInfo.provider || "Unknown Provider",
        premium: docInfo.premium || "Unknown",
        dueDate: docInfo.dueDate || new Date().toISOString().split('T')[0],
        uploadDate: new Date().toISOString(),
        fileUrl: URL.createObjectURL(file), // In a real app, this would be a server URL
        shared: false,
        fileType: file.type,
        fileSize: file.size
      };
      
      // Update state and localStorage
      const updatedDocs = [...myDocuments, newDoc];
      setMyDocuments(updatedDocs);
      localStorage.setItem("docuvault_my_documents", JSON.stringify(updatedDocs));
      
      toast.success("Document uploaded successfully");
      return true;
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast.error("Failed to upload document");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Extract information from a document using OCR/AI (mock implementation)
  const extractDocumentInfo = async (file: File): Promise<Partial<InsuranceDocument>> => {
    // In a real app, this would send the file to a backend API for OCR/AI processing
    await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced processing time
    
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
      
      // Update document
      const updatedDocs = myDocuments.map(doc => 
        doc.id === id ? { ...doc, ...updates } : doc
      );
      
      // Update state and localStorage
      setMyDocuments(updatedDocs);
      localStorage.setItem("docuvault_my_documents", JSON.stringify(updatedDocs));
      
      toast.success("Document updated successfully");
      return true;
    } catch (error) {
      console.error("Failed to update document:", error);
      toast.error("Failed to update document");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a document
  const deleteDocument = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Delete document
      const updatedDocs = myDocuments.filter(doc => doc.id !== id);
      
      // Also remove any access grants for this document
      const updatedAccess = usersWithAccess.filter(access => access.documentId !== id);
      
      // Update state and localStorage
      setMyDocuments(updatedDocs);
      setUsersWithAccess(updatedAccess);
      localStorage.setItem("docuvault_my_documents", JSON.stringify(updatedDocs));
      localStorage.setItem("docuvault_shared_access", JSON.stringify(updatedAccess));
      
      toast.success("Document deleted successfully");
      return true;
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document");
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

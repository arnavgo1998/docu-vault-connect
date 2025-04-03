
// Define insurance document types
export type InsuranceType = "Health" | "Auto" | "Life" | "Home" | "General" | "Other";

export interface InsuranceDocument {
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
}

export interface SharedAccess {
  documentId: string;
  userId: string;
  userName: string;
  accessGrantedDate: string;
}

export interface InviteCode {
  code: string;
  ownerId: string;
  ownerName: string;
  created: string;
  expires: string;
}

export interface InsuranceContextType {
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
}

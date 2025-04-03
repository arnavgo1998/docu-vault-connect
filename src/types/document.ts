
export interface Document {
  id: string;
  name: string;
  description?: string;
  type: string;
  provider: string;
  policyNumber: string;
  coverageAmount: string;
  premiumAmount: string;
  startDate: string;
  endDate: string;
  uploadDate: string;
  ownerId: string;
  ownerName: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
}

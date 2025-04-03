
import { InsuranceDocument, InsuranceType } from "@/types/insurance";

export const extractDocumentInfo = async (file: File): Promise<Partial<InsuranceDocument>> => {
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

// Transform data from Supabase to our frontend model
export const transformDocument = (doc: any): InsuranceDocument => ({
  id: doc.id,
  ownerId: doc.owner_id,
  ownerName: doc.profiles?.name || "Unknown",
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
});

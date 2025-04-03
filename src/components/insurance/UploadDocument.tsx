
import React from "react";
import { Button } from "@/components/ui/button";
import { useDocumentUpload } from "./upload/useDocumentUpload";
import DropZone from "./upload/DropZone";
import UploadProgress from "./upload/UploadProgress";

interface UploadDocumentProps {
  onSuccess?: () => void;
}

const UploadDocument: React.FC<UploadDocumentProps> = ({ onSuccess }) => {
  const {
    file,
    isUploading,
    progress,
    processingInfo,
    uploadError,
    handleFileChange,
    handleUpload,
    handleRetry
  } = useDocumentUpload(onSuccess);
  
  return (
    <div className="space-y-4">
      {!isUploading ? (
        <>
          <DropZone 
            file={file} 
            onFileChange={handleFileChange}
            uploadError={uploadError}
          />
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={onSuccess}
            >
              Cancel
            </Button>
            <Button 
              disabled={!file}
              onClick={handleUpload}
            >
              Upload Document
            </Button>
          </div>
        </>
      ) : (
        <UploadProgress
          progress={progress}
          processingInfo={processingInfo}
          uploadError={uploadError}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
};

export default UploadDocument;

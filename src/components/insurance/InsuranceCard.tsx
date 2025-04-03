
import React, { useState } from "react";
import { InsuranceDocument } from "../../contexts/InsuranceContext";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, FileText, MoreVertical, Pencil, Share2, Trash2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditDocument from "./EditDocument";
import { useInsurance } from "../../contexts/InsuranceContext";
import { useAuth } from "../../contexts/AuthContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface InsuranceCardProps {
  document: InsuranceDocument;
  isShared?: boolean;
  onShare?: (documentId: string) => void;
}

const getCardColor = (type: string): string => {
  switch (type) {
    case "Health":
      return "bg-blue-500";
    case "Auto":
      return "bg-green-500";
    case "Life":
      return "bg-purple-500";
    case "Home":
      return "bg-amber-500";
    default:
      return "bg-gray-500";
  }
};

const InsuranceCard: React.FC<InsuranceCardProps> = ({ document, isShared = false, onShare }) => {
  const { user } = useAuth();
  const { updateDocument, deleteDocument } = useInsurance();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isOwner = document.ownerId === user?.id;
  const cardColor = getCardColor(document.type);
  const formattedDueDate = document.dueDate ? format(new Date(document.dueDate), 'MMM dd, yyyy') : 'N/A';
  
  const handleDelete = async () => {
    await deleteDocument(document.id);
    setIsDeleting(false);
  };
  
  return (
    <>
      <Card className="insurance-card overflow-hidden card-hover">
        <div className={`insurance-card-top ${cardColor}`} />
        
        <CardHeader className="pt-6 pb-2">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="mb-1">
              {document.type}
            </Badge>
            
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onShare && onShare(document.id)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Document
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setIsDeleting(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <h3 className="font-semibold text-lg line-clamp-1">{document.name}</h3>
          <div className="text-sm text-gray-500">
            {document.provider}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 pb-2">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Policy Number:</span>
              <span className="font-medium">{document.policyNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Premium:</span>
              <span className="font-medium">{document.premium}</span>
            </div>
            {isShared && (
              <div className="flex justify-between">
                <span className="text-gray-500">Owner:</span>
                <span className="font-medium">{document.ownerName}</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-2 border-t flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500">
            <CalendarClock className="h-3 w-3 mr-1" />
            <span>Due: {formattedDueDate}</span>
          </div>
          <Button variant="ghost" size="sm">
            <FileText className="h-4 w-4 mr-1" />
            View
          </Button>
        </CardFooter>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document Details</DialogTitle>
          </DialogHeader>
          <EditDocument 
            document={document} 
            onSave={(updatedDoc) => {
              updateDocument(document.id, updatedDoc);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your document. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InsuranceCard;

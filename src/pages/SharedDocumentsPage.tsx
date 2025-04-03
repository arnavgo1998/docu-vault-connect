
import React, { useState } from "react";
import Layout from "../components/layout/Layout";
import { useInsurance } from "../contexts/InsuranceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Loader2, Search, UserPlus } from "lucide-react";
import InsuranceCard from "../components/insurance/InsuranceCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SharedDocumentsPage: React.FC = () => {
  const { sharedWithMe, isLoading, shareAccess } = useInsurance();
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  
  const filteredDocuments = sharedWithMe.filter((doc) => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleJoinWithCode = async () => {
    if (!inviteCode || !documentId) return;
    
    setIsJoining(true);
    await shareAccess(documentId, inviteCode);
    setIsJoining(false);
    setJoinDialogOpen(false);
    setInviteCode("");
    setDocumentId("");
  };
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shared With Me</h1>
        <p className="text-gray-500 mt-1">Documents shared with you by others</p>
      </div>
      
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Info</AlertTitle>
        <AlertDescription>
          You can only view documents shared with you. Contact the owner to request edits.
        </AlertDescription>
      </Alert>
      
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search shared documents..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline"
            onClick={() => setJoinDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add With Code
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-docuvault-primary" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          {searchQuery ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No matching documents</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search</p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No shared documents</h3>
              <p className="text-gray-500 mb-4">You don't have any documents shared with you yet</p>
              <Button variant="outline" onClick={() => setJoinDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add With Code
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <InsuranceCard 
              key={doc.id} 
              document={doc} 
              isShared={true}
            />
          ))}
        </div>
      )}
      
      {/* Join with Code Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Document with Code</DialogTitle>
            <DialogDescription>
              Enter a document ID and invite code to access shared documents
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="documentId">Document ID</Label>
              <Input
                id="documentId"
                placeholder="Enter document ID"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                For demo, use: doc1
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full"
              onClick={handleJoinWithCode}
              disabled={isJoining || !inviteCode || !documentId}
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Add Document"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SharedDocumentsPage;

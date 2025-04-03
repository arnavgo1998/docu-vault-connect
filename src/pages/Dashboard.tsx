
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useAuth } from "../contexts/AuthContext";
import { useInsurance } from "../contexts/InsuranceContext";
import {
  FileText,
  Plus,
  Share,
  Upload,
  User,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import InsuranceCard from "../components/insurance/InsuranceCard";
import { Badge } from "@/components/ui/badge";
import UploadDocument from "../components/insurance/UploadDocument";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { myDocuments, sharedWithMe, isLoading, myInviteCode, generateInviteCode, shareAccess } = useInsurance();
  const navigate = useNavigate();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [documentIdToShare, setDocumentIdToShare] = useState<string | null>(null);
  
  const handleJoinWithCode = async () => {
    if (!joinCodeInput || !documentIdToShare) return;
    
    setIsJoining(true);
    await shareAccess(documentIdToShare, joinCodeInput);
    setIsJoining(false);
    setInviteDialogOpen(false);
    setJoinCodeInput("");
    setDocumentIdToShare(null);
  };
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-500 mt-1">Manage your insurance documents securely</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-1 border-gray-200"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Upload className="h-5 w-5 text-docuvault-primary" />
                <span className="text-sm font-medium">Upload Document</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-1 border-gray-200"
                onClick={() => navigate("/shared")}
              >
                <Share className="h-5 w-5 text-docuvault-primary" />
                <span className="text-sm font-medium">Shared Documents</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-1 border-gray-200"
                onClick={() => navigate("/documents")}
              >
                <FileText className="h-5 w-5 text-docuvault-primary" />
                <span className="text-sm font-medium">All Documents</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-1 border-gray-200"
                onClick={() => navigate("/profile")}
              >
                <User className="h-5 w-5 text-docuvault-primary" />
                <span className="text-sm font-medium">Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Your Sharing Code</CardTitle>
            <CardDescription>
              Share this code with others to give them access to your documents
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="bg-gray-100 p-4 rounded-md text-center">
              <p className="text-xl font-mono font-bold tracking-wider text-docuvault-secondary">
                {myInviteCode || "Generating..."}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={generateInviteCode}
            >
              Generate New Code
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">My Documents</h2>
          <Button 
            variant="outline" 
            size="sm"
            className="text-docuvault-primary"
            onClick={() => navigate("/documents")}
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-docuvault-primary" />
          </div>
        ) : myDocuments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No documents yet</h3>
            <p className="text-gray-500 mb-4">Upload your first insurance document to get started</p>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myDocuments.slice(0, 3).map((doc) => (
              <InsuranceCard 
                key={doc.id} 
                document={doc} 
                onShare={(id) => {
                  setDocumentIdToShare(id);
                  setInviteDialogOpen(true);
                }}
              />
            ))}
            {myDocuments.length > 3 && (
              <div 
                className="flex items-center justify-center h-full min-h-[200px] border border-dashed border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate("/documents")}
              >
                <div className="text-center p-4">
                  <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">View {myDocuments.length - 3} more documents</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Shared With Me</h2>
          <Button 
            variant="outline" 
            size="sm"
            className="text-docuvault-primary"
            onClick={() => navigate("/shared")}
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-docuvault-primary" />
          </div>
        ) : sharedWithMe.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Share className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No shared documents</h3>
            <p className="text-gray-500 mb-4">You don't have any documents shared with you yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sharedWithMe.slice(0, 3).map((doc) => (
              <InsuranceCard 
                key={doc.id} 
                document={doc} 
                isShared={true}
              />
            ))}
            {sharedWithMe.length > 3 && (
              <div 
                className="flex items-center justify-center h-full min-h-[200px] border border-dashed border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate("/shared")}
              >
                <div className="text-center p-4">
                  <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">View {sharedWithMe.length - 3} more documents</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-docuvault-primary mr-2" />
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        
        <div className="space-y-3">
          {myDocuments.length === 0 && sharedWithMe.length === 0 ? (
            <p className="text-gray-500 py-2">No recent activity to show</p>
          ) : (
            <>
              {[...myDocuments, ...sharedWithMe]
                .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
                .slice(0, 5)
                .map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          {doc.ownerId === user?.id ? "You uploaded" : `${doc.ownerName} shared`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-3">
                        {doc.type}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
      
      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Insurance Document</DialogTitle>
          </DialogHeader>
          <UploadDocument onSuccess={() => setUploadDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Share Document Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Enter Invite Code</Label>
              <Input
                id="inviteCode"
                placeholder="Enter the invite code"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full"
              onClick={handleJoinWithCode}
              disabled={isJoining || !joinCodeInput}
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                "Share Document"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Dashboard;

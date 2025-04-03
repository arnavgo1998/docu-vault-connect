import React, { useState } from "react";
import Layout from "../components/layout/Layout";
import { useAuth } from "../contexts/AuthContext";
import { useInsurance } from "../contexts/InsuranceContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogOut, User, Users, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { myInviteCode, usersWithAccess, revokeAccess, generateInviteCode } = useInsurance();
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const [showAccessManagement, setShowAccessManagement] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ userId: string; documentId: string } | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  const handleRevokeAccess = async () => {
    if (!selectedUser) return;
    
    setIsRevoking(true);
    await revokeAccess(selectedUser.userId, selectedUser.documentId);
    setIsRevoking(false);
    setSelectedUser(null);
  };
  
  const handleGenerateNewCode = async () => {
    setIsGeneratingCode(true);
    await generateInviteCode();
    setIsGeneratingCode(false);
  };
  
  if (!user) return null;
  
  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500 mt-1">Manage your account and access settings</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your personal details and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-xl bg-docuvault-primary text-white">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-gray-500">{user.phone}</p>
                  {user.email && <p className="text-gray-500">{user.email}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={user.name} disabled />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={user.phone} disabled />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input id="email" value={user.email || ''} disabled />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">Age (Optional)</Label>
                  <Input id="age" value={user.age || ''} disabled />
                </div>
              </div>
              
              <div className="pt-4 border-t flex justify-end">
                <Button 
                  variant="outline"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setIsConfirmingLogout(true)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Sharing Code</CardTitle>
                <CardDescription>
                  Others can access your shared documents with this code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-md text-center mb-4">
                  <p className="text-xl font-mono font-bold tracking-wider text-docuvault-secondary">
                    {myInviteCode || "Loading..."}
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleGenerateNewCode}
                  disabled={isGeneratingCode}
                >
                  {isGeneratingCode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate New Code"
                  )}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Access Management</CardTitle>
                <CardDescription>
                  Manage who has access to your documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {usersWithAccess.length === 0 ? (
                  <div className="text-center py-4">
                    <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No shared access yet</p>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowAccessManagement(true)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Access ({usersWithAccess.length})
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Logout Confirmation Dialog */}
      <AlertDialog open={isConfirmingLogout} onOpenChange={setIsConfirmingLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign in again to access your documents
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Access Management Dialog */}
      <Dialog open={showAccessManagement} onOpenChange={setShowAccessManagement}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Access</DialogTitle>
            <DialogDescription>
              Control who has access to your shared documents
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {usersWithAccess.map((access) => (
                <div 
                  key={`${access.userId}-${access.documentId}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback className="text-sm">
                        {access.userName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{access.userName}</p>
                      <p className="text-xs text-gray-500">
                        Since {new Date(access.accessGrantedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setSelectedUser({ 
                      userId: access.userId, 
                      documentId: access.documentId 
                    })}
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAccessManagement(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Revoke Access Confirmation */}
      <AlertDialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Access?</AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent this user from accessing your shared document. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRevokeAccess}
              className="bg-destructive text-destructive-foreground"
              disabled={isRevoking}
            >
              {isRevoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke Access"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ProfilePage;

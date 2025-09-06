
"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Shield, 
  Heart, 
  History, 
  Edit, 
  Save, 
  Camera, 
  Lock, 
  Trash2,
  Mail,
  Loader2,
  List,
  Podcast,
  AlertTriangle,
  HelpCircle,
  Clock,
  Palette,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { useTheme } from 'next-themes';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toastErrorWithCopy } from '@/components/ui/sonner';

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette/> Appearance</CardTitle>
            <CardDescription>Choose how PodDB Pro looks to you.</CardDescription>
        </CardHeader>
        <CardContent>
             <ToggleGroup type="single" value={theme} onValueChange={(value) => {if (value) setTheme(value)}} className="grid grid-cols-3">
                <ToggleGroupItem value="light" aria-label="Light mode" className="flex flex-col h-auto py-2 gap-1">
                <Sun className="h-5 w-5" /> Light
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" aria-label="Dark mode" className="flex flex-col h-auto py-2 gap-1">
                <Moon className="h-5 w-5" /> Dark
                </ToggleGroupItem>
                <ToggleGroupItem value="system" aria-label="System default" className="flex flex-col h-auto py-2 gap-1">
                <Laptop className="h-5 w-5" /> System
                </ToggleGroupItem>
            </ToggleGroup>
        </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Editable fields
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  
  // Contribution data
  const [contributions, setContributions] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);

  // Verification Form State
  const [verifyTargetType, setVerifyTargetType] = useState<'podcasts' | 'people'>('podcasts');
  const [verifyTargetId, setVerifyTargetId] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [submittingVerification, setSubmittingVerification] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchContributions();
      fetchVerificationRequests();
    } else {
      router.push('/auth');
    }
  }, [user, router]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
            *,
            people:people_id ( id, full_name, is_verified )
        `)
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setProfile(data);
      setDisplayName((data as any)?.display_name || '');
      setBio((data as any)?.bio || '');
    } catch (error: any) {
      toastErrorWithCopy("Error fetching profile", error.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchContributions = async () => {
    if (!user) return;
    try {
        const { data, error } = await supabase
            .from('podcasts')
            .select('id, title, cover_image_url, submission_status, is_verified, slug')
            .eq('submitted_by', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        setContributions(data || []);
    } catch (error: any) {
        toastErrorWithCopy("Error fetching contributions", error);
    }
  };

  const fetchVerificationRequests = async () => {
    if (!user) return;
    try {
        const { data, error } = await supabase.rpc('get_user_verification_requests', { p_user_id: user.id } as any);
        if (error) throw error;
        setVerificationRequests(data || []);
    } catch(error: any) {
        toastErrorWithCopy("Error fetching verification requests", error);
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          display_name: displayName,
          bio: bio,
        } as any)
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success("Profile updated", {
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      fetchProfile(); // Refetch profile data
    } catch (error: any) {
      toastErrorWithCopy("Error updating profile", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;
    
    setLoading(true);
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({ avatar_url: publicUrl } as any)
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      toast.success("Avatar updated successfully");
      fetchProfile(); // Refresh profile
    } catch (error: any) {
      toastErrorWithCopy("Error uploading avatar", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("Password Reset Email Sent", {
            description: "Please check your inbox for a link to reset your password.",
        });
    } catch (error: any) {
        toastErrorWithCopy("Error sending password reset email", error);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
        const response = await fetch('/api/delete-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to delete account');
        }
        toast.success("Account Deleted", {
            description: "Your account has been permanently deleted.",
        });
        await signOut();
        router.push('/');
    } catch (error: any) {
        toastErrorWithCopy("Error deleting account", error);
    } finally {
        setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !verifyTargetId) {
        toast.error("Error", { description: "Please select an item to verify." });
        return;
    }
    setSubmittingVerification(true);
    try {
        const { error } = await (supabase as any).from('verification_requests').insert({
            user_id: user.id,
            target_table: verifyTargetType,
            target_id: verifyTargetId,
            notes: verificationNotes
        } as any);
        if (error) throw error;
        toast.success("Success", { description: "Your verification request has been submitted." });
        setVerifyTargetId('');
        setVerificationNotes('');
        fetchVerificationRequests();
    } catch (error: any) {
        toastErrorWithCopy("Error", { description: `Failed to submit request: ${error.message}`});
    } finally {
        setSubmittingVerification(false);
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'approved': return 'success';
        case 'pending': return 'warning';
        case 'rejected': return 'destructive';
        default: return 'secondary';
    }
  };


  if (loading && !profile) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return null; // The useEffect hook will redirect
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">My Profile</h1>
            <p className="text-muted-foreground text-lg">
              Manage your personal information and see your activity
            </p>
          </div>
        </div>
      </div>
      
      {/* Profile Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                <AvatarImage src={profile?.avatar_url || '/placeholder.svg'} alt={profile?.display_name || 'User'} />
                <AvatarFallback className="text-3xl">
                  {displayName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary-hover">
                <Camera className="h-4 w-4" />
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold">{displayName || 'New User'}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="mt-2 text-sm">{bio || 'No bio provided.'}</p>
            </div>
            
            <Button variant={isEditing ? "destructive" : "outline"} onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : <><Edit className="mr-2 h-4 w-4" /> Edit Profile</>}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview">
            <List className="mr-2 h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="contributions">
            <History className="mr-2 h-4 w-4" /> Contributions
          </TabsTrigger>
          <TabsTrigger value="verification">
            <VerifiedBadge className="mr-2 h-4 w-4" /> Verification
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>View and manage your personal details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} readOnly={!isEditing} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} readOnly={!isEditing} placeholder="Tell us about yourself" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input id="email" value={user?.email || ''} readOnly className="pl-10 bg-muted" />
                        </div>
                    </div>
                    {isEditing && (
                        <div className="flex justify-end">
                        <Button onClick={handleUpdateProfile} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                        </div>
                    )}
                    </CardContent>
                </Card>
                <ThemeSwitcher />
            </div>
        </TabsContent>

        {/* Contributions Tab */}
        <TabsContent value="contributions">
          <Card>
            <CardHeader>
              <CardTitle>My Contributions</CardTitle>
              <CardDescription>Track all your contributions and their approval status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">View Your Contribution History</h3>
                <p className="text-muted-foreground mb-4">
                  See all your contributions, their status, and admin feedback in one place.
                </p>
                <Button asChild>
                  <Link href="/contribution-history">View Contribution History</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification">
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Apply for Verification</CardTitle>
                        <CardDescription>Verify your identity or the authenticity of your podcast.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <form onSubmit={handleVerificationSubmit} className="space-y-6">
                           <div className="space-y-2">
                                <Label>What would you like to verify?</Label>
                                <Select value={verifyTargetType} onValueChange={(v: any) => { setVerifyTargetType(v); setVerifyTargetId(''); }}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="podcasts">One of my Podcasts</SelectItem>
                                        <SelectItem value="people">My Creator Profile</SelectItem>
                                    </SelectContent>
                                </Select>
                           </div>
                           <div className="space-y-2">
                                <Label>Select the item to verify</Label>
                                <Select value={verifyTargetId} onValueChange={setVerifyTargetId} required>
                                    <SelectTrigger><SelectValue placeholder="Select an item..." /></SelectTrigger>
                                    <SelectContent>
                                        {verifyTargetType === 'podcasts' && contributions.filter(c => !c.is_verified).map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                        ))}
                                         {verifyTargetType === 'people' && profile?.people && !profile.people.is_verified && (
                                            <SelectItem value={profile.people.id}>{profile.people.full_name}</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                           </div>
                           <div className="space-y-2">
                                <Label htmlFor="notes">Notes for the Review Team</Label>
                                <Textarea id="notes" value={verificationNotes} onChange={(e) => setVerificationNotes(e.target.value)} placeholder="Provide any links or information to help us verify your identity (e.g., official website, social media profiles)." />
                           </div>
                           <div className="text-xs text-muted-foreground">
                               By submitting, you agree to our <Link href="/help/verification" className="underline">Verification Policy</Link>.
                           </div>
                           <Button type="submit" disabled={submittingVerification} className="w-full">
                                {submittingVerification ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <VerifiedBadge className="mr-2 h-4 w-4" />}
                                Submit Request
                           </Button>
                       </form>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Your Verification Requests</CardTitle>
                        <CardDescription>Track the status of your submitted requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {verificationRequests.length > 0 ? (
                             <div className="space-y-3">
                                {verificationRequests.map(req => (
                                    <div key={req.request_id} className="p-3 border rounded-md">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">{req.target_name}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{req.target_table.slice(0, -1)}</p>
                                            </div>
                                            <Badge variant={req.status === 'approved' ? 'success' : req.status === 'pending' ? 'secondary' : 'destructive'}>{req.status}</Badge>
                                        </div>
                                        {req.status === 'rejected' && req.rejection_reason && (
                                            <p className="text-xs text-destructive mt-2">Reason: {req.rejection_reason}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Clock className="h-3 w-3"/> Submitted on {new Date(req.requested_at).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-8 text-muted-foreground">
                                <HelpCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                <p>You have no pending or past verification requests.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>



        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password and account security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Change Password</h3>
                  <p className="text-sm text-muted-foreground">It&apos;s a good idea to use a strong password that you&apos;re not using elsewhere.</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline"><Lock className="mr-2 h-4 w-4" /> Change Password</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Change Password</AlertDialogTitle>
                      <AlertDialogDescription>
                        A password reset link will be sent to your email address: <strong>{user.email}</strong>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handlePasswordReset}>Send Reset Link</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-destructive">Delete Account</h3>
                  <p className="text-sm text-destructive/80">Permanently delete your account and all of your content.</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                       Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-destructive" /> Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account, profile, and contributions.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteAccount}>
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

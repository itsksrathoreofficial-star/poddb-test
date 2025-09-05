import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Podcast, FileClock, Users, UserCheck, MessageSquare, MapPin, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast, toastErrorWithCopy } from '@/components/ui/sonner';
import { updatePodcastStatusAction, approveContribution, rejectContribution } from '@/app/actions/admin';
import ReviewsTab from './ReviewsTab';
import VerificationsTab from './VerificationsTab';
// import LocationRequestsTab from './LocationRequestsTab'; // Temporarily disabled

interface OverviewTabProps {
    allPodcasts: any[];
    pendingPodcasts: any[];
    users: any[];
    verificationRequests: any[];
    isPending: boolean;
    startTransition: React.TransitionStartFunction;
    fetchPendingPodcasts: () => void;
    fetchAllPodcasts: () => void;
    fetchVerificationRequests: () => void;
    user: any;
}

export default function OverviewTab({
    allPodcasts,
    pendingPodcasts,
    users,
    verificationRequests,
    isPending,
    startTransition,
    fetchPendingPodcasts,
    fetchAllPodcasts,
    fetchVerificationRequests,
    user
}: OverviewTabProps) {

    const handlePodcastApproval = async (podcastId: string, status: 'approved' | 'rejected') => {
        startTransition(async () => {
            const result = await updatePodcastStatusAction(podcastId, status, user?.id);
            if (result.success) {
                toast.success(`Podcast ${status} successfully!`);
                fetchPendingPodcasts();
                fetchAllPodcasts();
            } else {
                toastErrorWithCopy(`Failed to ${status} podcast`, result.error);
            }
        });
    };

    const handleContributionApproval = async (contributionId: string, status: 'approved' | 'rejected') => {
        startTransition(async () => {
            try {
                if (status === 'approved') {
                    await approveContribution(contributionId, user?.id);
                    toast.success('Contribution approved successfully!');
                } else {
                    await rejectContribution(contributionId, 'No reason provided', user?.id);
                    toast.success('Contribution rejected successfully!');
                }
                fetchPendingPodcasts();
            } catch (error: any) {
                toastErrorWithCopy(`Failed to ${status} contribution`, error.message);
            }
        });
    };
    
    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Podcasts</CardTitle>
                        <Podcast className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{allPodcasts.length}</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
                        <FileClock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{pendingPodcasts.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{users.length}</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Verification Requests</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{verificationRequests.filter(v => v.status === 'pending').length}</div></CardContent>
                </Card>
            </div>

            {/* Pending Items Management */}
            <Tabs defaultValue="submissions" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="submissions" className="flex items-center gap-2">
                        <FileClock className="h-4 w-4" />
                        Submissions
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Reviews
                    </TabsTrigger>
                    <TabsTrigger value="verifications" className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Verifications
                    </TabsTrigger>
                    <TabsTrigger value="locations" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Locations
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="submissions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Submissions</CardTitle>
                            <CardDescription>Review and approve new podcast submissions and contributions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Submitted By</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingPodcasts.length > 0 ? pendingPodcasts.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.title || `${item.target_table} #${item.target_id}`}</TableCell>
                                            <TableCell>{item.display_name} ({item.email})</TableCell>
                                            <TableCell>
                                                <Badge variant={item.type === 'update' ? 'secondary' : 'default'}>
                                                    {item.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="space-x-2">
                                                {item.type === 'update' ? (
                                                    <>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/admin/contributions/preview/${item.id}`}>
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                Preview
                                                            </Link>
                                                        </Button>
                                                        <Button size="sm" variant="success" onClick={() => handleContributionApproval(item.id, 'approved')} disabled={isPending}>Approve</Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleContributionApproval(item.id, 'rejected')} disabled={isPending}>Reject</Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/preview/${item.id}`}>
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                Preview
                                                            </Link>
                                                        </Button>
                                                        <Button size="sm" variant="success" onClick={() => handlePodcastApproval(item.id, 'approved')} disabled={isPending}>Approve</Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handlePodcastApproval(item.id, 'rejected')} disabled={isPending}>Reject</Button>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={4} className="text-center">No pending submissions.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                    <ReviewsTab />
                </TabsContent>

                <TabsContent value="verifications" className="space-y-4">
                    <VerificationsTab 
                        verificationRequests={verificationRequests}
                        isPending={isPending}
                        startTransition={startTransition}
                        fetchVerificationRequests={fetchVerificationRequests}
                        user={user}
                    />
                </TabsContent>

                <TabsContent value="locations" className="space-y-4">
                    <div className="p-6"><h2 className="text-2xl font-bold mb-4">Location Requests</h2><p className="text-muted-foreground">Location requests management is temporarily disabled due to TypeScript compatibility issues.</p></div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

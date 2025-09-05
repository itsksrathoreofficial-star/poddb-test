
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast, toastErrorWithCopy } from '@/components/ui/sonner';
import { handleVerificationAction } from '@/app/actions/admin';


interface VerificationsTabProps {
    verificationRequests: any[];
    isPending: boolean;
    startTransition: React.TransitionStartFunction;
    fetchVerificationRequests: () => void;
    user: any;
}

export default function VerificationsTab({
    verificationRequests,
    isPending,
    startTransition,
    fetchVerificationRequests,
    user
}: VerificationsTabProps) {

    const onVerificationAction = async (requestId: string, status: 'approved' | 'rejected') => {
        startTransition(async () => {
            const result = await handleVerificationAction(requestId, status, user.id);
            if (result.success) {
                toast.success(`Request has been ${status}.`);
                fetchVerificationRequests();
            } else {
                toastErrorWithCopy(`Failed to ${status} request`, result.error);
            }
        });
    };

    return (
        <Card>
            <CardHeader><CardTitle>Verification Requests</CardTitle></CardHeader>
            <CardContent>
               <Table>
                   <TableHeader><TableRow><TableHead>Requestor</TableHead><TableHead>Item to Verify</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                   <TableBody>
                       {verificationRequests.map(req => (
                           <TableRow key={req.request_id}>
                               <TableCell>{req.requestor_name}</TableCell>
                               <TableCell>{req.target_name}</TableCell>
                               <TableCell className="capitalize">{req.target_table?.slice(0, -1)}</TableCell>
                                                               <TableCell><Badge variant={req.status === 'pending' ? 'secondary' : req.status === 'approved' ? 'success' : 'destructive'}>{req.status}</Badge></TableCell>
                               <TableCell className="space-x-2">
                                   {req.status === 'pending' && (
                                     <>
                                        <Button size="sm" variant="success" onClick={() => onVerificationAction(req.request_id, 'approved')} disabled={isPending}>Approve</Button>
                                        <Button size="sm" variant="destructive" onClick={() => onVerificationAction(req.request_id, 'rejected')} disabled={isPending}>Reject</Button>
                                     </>
                                   )}
                               </TableCell>
                           </TableRow>
                       ))}
                   </TableBody>
               </Table>
            </CardContent>
        </Card>
    );
}

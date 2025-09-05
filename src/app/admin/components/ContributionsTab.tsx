"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { approveContribution, rejectContribution, getContributionsAction } from '@/app/actions/admin';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Eye, Check, X } from 'lucide-react';

async function getAllContributions() {
  const result = await getContributionsAction();
  if (result.success) {
    return result.data || [];
  }
  console.error('Error fetching contributions:', result.error);
  return [];
}

export function ContributionsTab() {
  const { user } = useAuth();
  const router = useRouter();
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributions = async () => {
      setLoading(true);
      const data = await getAllContributions();
      setContributions(data);
      setLoading(false);
    };
    fetchContributions();
  }, []);

  const handleApprove = async (id: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to approve contributions.');
      return;
    }
    try {
      await approveContribution(id, user.id);
      setContributions(contributions.filter(c => c.id !== id));
      toast.success('Contribution approved');
    } catch (error: any) {
      toast.error('Failed to approve contribution', { description: error.message });
    }
  };

  const handleReject = async (id: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to reject contributions.');
      return;
    }
    try {
      await rejectContribution(id, 'No reason provided', user.id);
      setContributions(contributions.filter(c => c.id !== id));
      toast.success('Contribution rejected');
    } catch (error: any) {
      toast.error('Failed to reject contribution', { description: error.message });
    }
  };

  const handlePreview = (contributionId: string) => {
    router.push(`/admin/contributions/preview/${contributionId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contributions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contributions.map((contribution) => (
              <TableRow key={contribution.id}>
                <TableCell>{contribution.user_id}</TableCell>
                <TableCell>{contribution.target_table} ({contribution.target_id})</TableCell>
                <TableCell>
                  <Badge variant={contribution.status === 'pending' ? 'secondary' : contribution.status === 'approved' ? 'default' : 'destructive'}>
                    {contribution.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handlePreview(contribution.id)} 
                      size="sm" 
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button 
                      onClick={() => handleApprove(contribution.id)} 
                      size="sm" 
                      className="flex items-center gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleReject(contribution.id)} 
                      size="sm" 
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

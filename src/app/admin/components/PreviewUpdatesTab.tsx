"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { useRouter } from 'next/navigation';
import { 
  Eye, 
  Check, 
  X, 
  Search, 
  RefreshCw, 
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PreviewUpdate {
  id: string;
  user_id: string;
  target_table: string;
  target_id: string;
  original_data: any;
  updated_data: any;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  approved_by?: string;
  rejected_by?: string;
  approved_at?: string;
  rejected_at?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string;
    email: string;
  };
}

export default function PreviewUpdatesTab() {
  const router = useRouter();
  const [previewUpdates, setPreviewUpdates] = useState<PreviewUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchPreviewUpdates();
  }, []);

  const fetchPreviewUpdates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('preview_updates')
        .select(`
          *,
          profiles:user_id (
            display_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPreviewUpdates(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch preview updates', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      // Update preview status directly
      const { error } = await (supabase as any)
        .from('preview_updates')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Update the target table with the new data
      const update = previewUpdates.find(p => p.id === id);
      if (update) {
        // Use dynamic table update
        const { error: updateError } = await (supabase as any)
          .from(update.target_table)
          .update(update.updated_data)
          .eq('id', update.target_id);

        if (updateError) {
          console.error('Error updating target table:', updateError);
          // Don't throw error here, just log it
        }
      }

      setPreviewUpdates(prev => 
        prev.map(p => p.id === id ? { ...p, status: 'approved' as const, approved_at: new Date().toISOString() } : p)
      );
      toast.success('Preview update approved');
    } catch (error: any) {
      toast.error('Failed to approve preview update', { description: error.message });
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      // Update preview status directly
      const { error } = await (supabase as any)
        .from('preview_updates')
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          rejected_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setPreviewUpdates(prev => 
        prev.map(p => p.id === id ? { ...p, status: 'rejected' as const, rejection_reason: reason, rejected_at: new Date().toISOString() } : p)
      );
      toast.success('Preview update rejected');
    } catch (error: any) {
      toast.error('Failed to reject preview update', { description: error.message });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getChangeCount = (update: PreviewUpdate) => {
    const original = update.original_data || {};
    const updated = update.updated_data || {};
    let changes = 0;

    const fieldsToCheck = ['title', 'description', 'categories', 'languages', 'location', 'social_links', 'platform_links'];
    fieldsToCheck.forEach(field => {
      if (JSON.stringify(original[field]) !== JSON.stringify(updated[field])) {
        changes++;
      }
    });

    return changes;
  };

  const filteredUpdates = previewUpdates.filter(update => {
    const matchesSearch = 
      update.target_table.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.target_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || update.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-6 w-6" />
            <span>Preview Updates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by table, ID, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('approved')}
              >
                Approved
              </Button>
              <Button
                variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('rejected')}
              >
                Rejected
              </Button>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUpdates.map((update) => (
                <TableRow key={update.id} className={update.status === 'pending' ? 'bg-yellow-50' : ''}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {update.profiles?.display_name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {update.profiles?.email || update.user_id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {update.target_table}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {update.target_id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-green-600">
                        {getChangeCount(update)} changes
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(update.status)}>
                      {getStatusIcon(update.status)}
                      <span className="ml-1 capitalize">{update.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(update.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/preview-updates/${update.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      {update.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(update.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt('Enter rejection reason:');
                              if (reason) {
                                handleReject(update.id, reason);
                              }
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUpdates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No preview updates found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

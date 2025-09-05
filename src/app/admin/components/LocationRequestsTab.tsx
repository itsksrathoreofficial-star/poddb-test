"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { MapPin, Check, X, Clock, User, Calendar, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type LocationRequest = {
  id: string;
  location_name: string;
  country: string;
  state?: string;
  description?: string;
  proof_files?: string[];
  status: 'pending' | 'approved' | 'rejected';
  submitted_by?: string;
  reviewed_by?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  display_name?: string;
  email?: string;
};

export default function LocationRequestsTab() {
  const [requests, setRequests] = useState<LocationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchLocationRequests();
  }, []);

  const fetchLocationRequests = async () => {
    try {
      setLoading(true);
      // Use RPC function to get location requests with proper security
      const { data, error } = await supabase.rpc('get_location_requests_with_profiles');

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast.error(`Failed to fetch location requests: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setReviewingId(id);
      
      const { error } = await (supabase as any)
        .from('location_requests')
        .update({
          status,
          review_notes: reviewNotes || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Location request ${status} successfully`);
      setReviewNotes('');
      fetchLocationRequests();
    } catch (error: any) {
      toast.error(`Failed to ${status} location request: ${error.message}`);
    } finally {
      setReviewingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="text-green-600"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Location Requests
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading location requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          Location Requests
        </h2>
        <Button onClick={fetchLocationRequests} variant="outline">
          Refresh
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Location Requests</h3>
            <p className="text-muted-foreground">No location requests have been submitted yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {request.location_name}
                    </CardTitle>
                                         <div className="flex items-center gap-4 text-sm text-muted-foreground">
                       <span className="flex items-center gap-1">
                         <User className="h-4 w-4" />
                         {request.display_name || 'Unknown User'}
                       </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(request.created_at)}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Country</Label>
                    <p className="text-sm text-muted-foreground">{request.country}</p>
                  </div>
                  {request.state && (
                    <div>
                      <Label className="text-sm font-medium">State/Province</Label>
                      <p className="text-sm text-muted-foreground">{request.state}</p>
                    </div>
                  )}
                </div>

                {request.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground">{request.description}</p>
                  </div>
                )}

                {request.proof_files && request.proof_files.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Proof Files</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {request.proof_files.map((file, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {file}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {request.review_notes && (
                  <div>
                    <Label className="text-sm font-medium">Review Notes</Label>
                    <p className="text-sm text-muted-foreground">{request.review_notes}</p>
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className="space-y-3 pt-4 border-t">
                    <div>
                      <Label htmlFor={`notes-${request.id}`}>Review Notes (Optional)</Label>
                      <Textarea
                        id={`notes-${request.id}`}
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add notes about your decision..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReview(request.id, 'approved')}
                        disabled={reviewingId === request.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReview(request.id, 'rejected')}
                        disabled={reviewingId === request.id}
                        variant="destructive"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

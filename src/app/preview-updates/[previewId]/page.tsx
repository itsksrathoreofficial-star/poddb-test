"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2, Image as ImageIcon, Youtube, Users, AlertCircle, Save, Globe, ThumbsUp, ThumbsDown, Eye, Edit3, Upload, Plus, X, Search, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getPreviewUpdateAction, approvePreviewUpdateAction, rejectPreviewUpdateAction } from '@/app/actions/preview-updates';

interface FieldChange {
  field: string;
  original: any;
  updated: any;
  hasChanged: boolean;
}

export default function PreviewUpdatePage() {
  const { user } = useAuth();
  const params = useParams();
  const previewId = params.previewId as string;
  const router = useRouter();
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [fieldChanges, setFieldChanges] = useState<FieldChange[]>([]);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchPreviewData();
    } else {
      router.push('/auth');
    }
  }, [user, router, previewId]);

  const fetchPreviewData = async () => {
    if (!previewId) return;
    setLoading(true);
    try {
      const result = await getPreviewUpdateAction(previewId);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      setPreviewData(result.data);
      
      // Calculate field changes
      const changes = calculateFieldChanges(result.data.original_data, result.data.updated_data);
      setFieldChanges(changes);
      
    } catch (error: any) {
      toast.error("Failed to fetch preview data", { description: error.message });
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  const calculateFieldChanges = (original: any, updated: any): FieldChange[] => {
    const changes: FieldChange[] = [];
    const fieldsToCheck = [
      'title', 'description', 'categories', 'languages', 'location',
      'social_links', 'platform_links', 'official_website', 'cover_image_url',
      'team_members', 'episodes'
    ];

    fieldsToCheck.forEach(field => {
      const originalValue = original?.[field];
      const updatedValue = updated?.[field];
      const hasChanged = JSON.stringify(originalValue) !== JSON.stringify(updatedValue);
      
      changes.push({
        field,
        original: originalValue,
        updated: updatedValue,
        hasChanged
      });
    });

    return changes;
  };

  const getChangeIndicator = (hasChanged: boolean) => {
    if (hasChanged) {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600 text-sm font-medium">Changed</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
        <span className="text-gray-500 text-sm">No changes</span>
      </div>
    );
  };

  const handleApprove = async () => {
    if (!user?.id) return;
    setSubmitting(true);
    try {
      const result = await approvePreviewUpdateAction(previewId, user.id);
      if (result.success) {
        toast.success('Preview update approved successfully');
        router.push('/admin');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error('Failed to approve preview update', { description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!user?.id || !rejectionReason.trim()) return;
    setSubmitting(true);
    try {
      const result = await rejectPreviewUpdateAction(previewId, rejectionReason, user.id);
      if (result.success) {
        toast.success('Preview update rejected');
        router.push('/admin');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error('Failed to reject preview update', { description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const renderFieldComparison = (change: FieldChange) => {
    if (!change.hasChanged) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium capitalize">
              {change.field.replace(/_/g, ' ')}
            </Label>
            {getChangeIndicator(false)}
          </div>
          <div className="p-3 bg-muted rounded-md text-sm">
            {typeof change.updated === 'object' 
              ? JSON.stringify(change.updated, null, 2) 
              : String(change.updated || 'Not set')
            }
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium capitalize">
            {change.field.replace(/_/g, ' ')}
          </Label>
          {getChangeIndicator(true)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Original</Label>
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm">
              {typeof change.original === 'object' 
                ? JSON.stringify(change.original, null, 2) 
                : String(change.original || 'Not set')
              }
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Updated</Label>
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
              {typeof change.updated === 'object' 
                ? JSON.stringify(change.updated, null, 2) 
                : String(change.updated || 'Not set')
              }
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderImageComparison = (field: string, originalUrl: string, updatedUrl: string) => {
    const hasChanged = originalUrl !== updatedUrl;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium capitalize">
            {field.replace(/_/g, ' ')}
          </Label>
          {getChangeIndicator(hasChanged)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Original</Label>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {originalUrl ? (
                <img src={originalUrl} alt="Original" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Updated</Label>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {updatedUrl ? (
                <img src={updatedUrl} alt="Updated" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Preview not found</h2>
        <p>The requested preview update could not be found.</p>
        <Button onClick={() => router.push('/admin')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Button>
      </div>
    );
  }

  const hasChanges = fieldChanges.some(change => change.hasChanged);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div ref={topRef} />
      
      {/* Header */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary text-primary-foreground p-3 rounded-lg">
              <RefreshCw className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Preview Update</h1>
              <p className="text-muted-foreground text-lg">
                Review changes for {previewData.updated_data.title || 'Untitled'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant={previewData.status === 'pending' ? 'default' : previewData.status === 'approved' ? 'secondary' : 'destructive'}>
              {previewData.status.toUpperCase()}
            </Badge>
          </div>
        </div>
        
        {/* Summary */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Change Summary</h3>
              <p className="text-sm text-muted-foreground">
                {fieldChanges.filter(c => c.hasChanged).length} fields changed out of {fieldChanges.length} total fields
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 text-sm font-medium">
                {fieldChanges.filter(c => c.hasChanged).length} Changes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex flex-wrap gap-2 mb-8 p-4 bg-muted rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'images', label: 'Images', icon: ImageIcon },
          { id: 'details', label: 'Details', icon: Globe },
          { id: 'social', label: 'Social Links', icon: Globe },
          { id: 'platforms', label: 'Platforms', icon: Youtube },
          { id: 'team', label: 'Team', icon: Users }
        ].map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? 'default' : 'outline'}
            onClick={() => setActiveSection(section.id)}
            className="flex items-center gap-2"
          >
            <section.icon className="h-4 w-4" />
            {section.label}
          </Button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {activeSection === 'overview' && (
          <Card>
            <CardHeader>
              <CardTitle>All Changes Overview</CardTitle>
              <CardDescription>Review all field changes in this update</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fieldChanges.map((change, index) => (
                <div key={index}>
                  {renderFieldComparison(change)}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeSection === 'images' && (
          <Card>
            <CardHeader>
              <CardTitle>Image Changes</CardTitle>
              <CardDescription>Review image updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderImageComparison(
                'cover_image_url',
                previewData.original_data.cover_image_url,
                previewData.updated_data.cover_image_url
              )}
            </CardContent>
          </Card>
        )}

        {activeSection === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
              <CardDescription>Review basic information changes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fieldChanges
                .filter(change => ['title', 'description', 'categories', 'languages', 'location'].includes(change.field))
                .map((change, index) => (
                  <div key={index}>
                    {renderFieldComparison(change)}
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {activeSection === 'social' && (
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Review social media changes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fieldChanges
                .filter(change => ['social_links', 'official_website'].includes(change.field))
                .map((change, index) => (
                  <div key={index}>
                    {renderFieldComparison(change)}
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {activeSection === 'platforms' && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Links</CardTitle>
              <CardDescription>Review platform link changes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fieldChanges
                .filter(change => change.field === 'platform_links')
                .map((change, index) => (
                  <div key={index}>
                    {renderFieldComparison(change)}
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {activeSection === 'team' && (
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Review team member changes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fieldChanges
                .filter(change => change.field === 'team_members')
                .map((change, index) => (
                  <div key={index}>
                    {renderFieldComparison(change)}
                  </div>
                ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8 p-6 bg-muted rounded-lg">
        <Button
          variant="outline"
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Button>
        
        <div className="flex gap-4">
          <Button
            variant="destructive"
            onClick={() => setShowRejectionModal(true)}
            disabled={submitting || previewData.status !== 'pending'}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Reject Changes
          </Button>
          <Button
            onClick={handleApprove}
            disabled={submitting || previewData.status !== 'pending' || !hasChanges}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Approve Changes
          </Button>
        </div>
      </div>

      {/* Rejection Modal */}
      <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Changes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectionModal(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Reject Changes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

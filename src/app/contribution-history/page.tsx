"use client";
import React, { useState, useEffect } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  History, 
  Search, 
  Filter, 
  Loader2, 
  ExternalLink,
  Podcast,
  Clapperboard,
  Users,
  MessageSquare,
  Shield,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';

interface Contribution {
  id: string;
  contribution_type: string;
  target_table: string;
  target_id: string;
  target_title: string;
  target_slug?: string;
  target_image_url?: string;
  status: string;
  admin_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  metadata?: any;
}

export default function ContributionHistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [filteredContributions, setFilteredContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchContributions();
    } else {
      router.push('/auth');
    }
  }, [user, router]);

  useEffect(() => {
    filterContributions();
  }, [contributions, searchTerm, statusFilter, typeFilter]);

  const fetchContributions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_user_contribution_history', {
        p_user_id: user.id
      } as any);

      if (error) throw error;
      setContributions(data || []);
    } catch (error: any) {
      toast.error("Error fetching contribution history", {
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterContributions = () => {
    let filtered = contributions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(contribution =>
        contribution.target_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contribution => contribution.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(contribution => contribution.contribution_type === typeFilter);
    }

    setFilteredContributions(filtered);
  };

  const getContributionIcon = (type: string) => {
    switch (type) {
      case 'podcast':
        return <Podcast className="h-5 w-5" />;
      case 'person':
        return <Users className="h-5 w-5" />;
      case 'review':
        return <MessageSquare className="h-5 w-5" />;
      case 'verification_request':
        return <Shield className="h-5 w-5" />;
      case 'location_request':
        return <MapPin className="h-5 w-5" />;
      default:
        return <History className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'draft':
        return <Eye className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getContributionUrl = (contribution: Contribution) => {
    if (!contribution.target_slug) return null;
    
    switch (contribution.target_table) {
      case 'podcasts':
        return `/podcasts/${contribution.target_slug}`;
      case 'people':
        return `/people/${contribution.target_slug}`;
      default:
        return null;
    }
  };

  const getStatusCounts = () => {
    const counts = {
      all: contributions.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      draft: 0
    };

    contributions.forEach(contribution => {
      counts[contribution.status as keyof typeof counts]++;
    });

    return counts;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // The useEffect hook will redirect
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg">
            <History className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Contribution History</h1>
            <p className="text-muted-foreground text-lg">
              Track all your contributions and their approval status
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{statusCounts.all}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.approved}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{statusCounts.draft}</div>
              <div className="text-sm text-muted-foreground">Draft</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search contributions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
                             <SelectContent>
                 <SelectItem value="all">All Types</SelectItem>
                 <SelectItem value="podcast">Podcasts</SelectItem>
                 <SelectItem value="person">People</SelectItem>
                 <SelectItem value="review">Reviews</SelectItem>
                 <SelectItem value="verification_request">Verification</SelectItem>
                 <SelectItem value="location_request">Locations</SelectItem>
               </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contributions List */}
      {filteredContributions.length > 0 ? (
        <div className="space-y-4">
          {filteredContributions.map((contribution) => {
            const contributionUrl = getContributionUrl(contribution);
            return (
              <Card key={contribution.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      {contribution.target_image_url ? (
                        <Image
                          src={contribution.target_image_url}
                          alt={contribution.target_title}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-15 h-15 bg-muted rounded-lg flex items-center justify-center">
                          {getContributionIcon(contribution.contribution_type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {contribution.target_title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {contribution.contribution_type.replace('_', ' ')}
                            </Badge>
                            <Badge variant={getStatusVariant(contribution.status)} className="text-xs flex items-center gap-1">
                              {getStatusIcon(contribution.status)}
                              {contribution.status}
                            </Badge>
                          </div>
                        </div>
                        
                        {contributionUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={contributionUrl}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>

                      {/* Admin Notes */}
                      {contribution.admin_notes && (
                        <div className="mb-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Admin Notes:</p>
                          <p className="text-sm">{contribution.admin_notes}</p>
                        </div>
                      )}

                      {/* Metadata */}
                      {contribution.metadata && (
                        <div className="mb-3">
                          {contribution.metadata.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {contribution.metadata.description}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Submitted: {new Date(contribution.submitted_at).toLocaleDateString()}
                        </div>
                        {contribution.reviewed_at && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Reviewed: {new Date(contribution.reviewed_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {contributions.length === 0 ? 'No contributions yet' : 'No contributions match your filters'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {contributions.length === 0 
                ? 'Start contributing to PodDB by adding podcasts, episodes, or people.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {contributions.length === 0 && (
              <Button asChild>
                <Link href="/contribute">Start Contributing</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

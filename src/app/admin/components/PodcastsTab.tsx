
import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { toast, toastErrorWithCopy } from '@/components/ui/sonner';
import { generateSingleSeoMetadataAction } from '@/app/actions/admin';
import ComprehensiveSeoDisplay from './ComprehensiveSeoDisplay';

interface PodcastsTabProps {
    allPodcasts: any[];
    fetchAllPodcasts: () => void;
}

export default function PodcastsTab({ allPodcasts, fetchAllPodcasts }: PodcastsTabProps) {
    const [podcastSearchTerm, setPodcastSearchTerm] = useState('');
    const [generatingSeo, setGeneratingSeo] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleGenerateSingleSeo = (podcast: any) => {
        setGeneratingSeo(podcast.id);
        startTransition(async () => {
            const result = await generateSingleSeoMetadataAction(
                podcast.id,
                'podcasts',
                {
                    title: podcast.title,
                    description: podcast.description,
                    contentType: 'podcast',
                    relatedInfo: podcast.categories?.join(', ') || podcast.tags?.join(', ') || '',
                    additionalContext: {
                        categories: podcast.categories || [],
                        tags: podcast.tags || [],
                        language: podcast.language,
                        averageRating: podcast.average_rating,
                        totalViews: podcast.total_views,
                        totalLikes: podcast.total_likes,
                        totalEpisodes: podcast.total_episodes,
                        averageDuration: podcast.average_duration,
                        firstEpisodeDate: podcast.first_episode_date,
                        lastEpisodeDate: podcast.last_episode_date,
                        teamMembers: podcast.team_members,
                        socialLinks: podcast.social_links,
                        platformLinks: podcast.platform_links,
                        officialWebsite: podcast.official_website,
                        youtubePlaylistUrl: podcast.youtube_playlist_url,
                    }
                }
            );
             if (result.success) {
                toast.success(`Successfully generated SEO for ${podcast.title}`);
                fetchAllPodcasts();
            } else {
                toastErrorWithCopy(`Failed to generate SEO for ${podcast.title}`, result.error);
            }
            setGeneratingSeo(null);
        });
    }

    const formatSeoData = (seoData: any) => {
        if (!seoData) return null;
        
        return {
            metaTags: {
                title: seoData.meta_title || 'Not generated',
                description: seoData.meta_description || 'Not generated',
                keywords: seoData.keywords || []
            },
            slug: seoData.slug || 'Not generated',
            faqs: seoData.faqs || [],
            // Enhanced SEO data
            schemaMarkup: seoData.schema_markup || {},
            socialMedia: seoData.social_media || {},
            contentEnhancement: seoData.content_enhancement || {},
            technicalSeo: seoData.technical_seo || {},
            localSeo: seoData.local_seo || {}
        };
    };

    const filteredPodcasts = allPodcasts.filter(p => p.title.toLowerCase().includes(podcastSearchTerm.toLowerCase()));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Podcasts</CardTitle>
                <CardDescription>Review, approve, and manage all podcast submissions.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Input placeholder="Search podcasts..." value={podcastSearchTerm} onChange={e => setPodcastSearchTerm(e.target.value)} />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>SEO Status</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPodcasts.map(podcast => {
                            const seoData = formatSeoData(podcast.seo_metadata);
                            const hasSeo = podcast.seo_metadata && seoData;
                            
                            return (
                                <TableRow key={podcast.id}>
                                    <TableCell className="max-w-xs">
                                        <div className="truncate" title={podcast.title}>
                                            {podcast.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={podcast.submission_status === 'approved' ? 'default' : podcast.submission_status === 'pending' ? 'secondary' : 'destructive'}>
                                            {podcast.submission_status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {hasSeo ? (
                                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                                SEO Generated
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                No SEO
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs text-muted-foreground max-w-32 truncate" title={podcast.slug || 'No slug'}>
                                            {podcast.slug || 'No slug'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="space-x-2">
                                        <Link href={`/podcasts/${podcast.slug || podcast.id}`} target="_blank">
                                            <Button variant="outline" size="sm">View</Button>
                                        </Link>
                                        
                                        {hasSeo && (
                                            <ComprehensiveSeoDisplay
                                                seoData={podcast.seo_metadata}
                                                title={podcast.title}
                                                contentType="podcast"
                                            />
                                        )}
                                        
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleGenerateSingleSeo(podcast)}
                                            disabled={generatingSeo === podcast.id || isPending}
                                        >
                                            {generatingSeo === podcast.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

import React, { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Loader2, 
    Sparkles, 
    RefreshCw, 
    Mic, 
    FileText, 
    User, 
    Search,
    Eye,
    ExternalLink,
    Calendar,
    Clock,
    TrendingUp,
    Users,
    Star
} from 'lucide-react';
import { toast, toastErrorWithCopy } from '@/components/ui/sonner';
import { 
    generateSingleSeoMetadataAction,
    getAllEpisodesAction,
    getAllPeopleAction,
    generateEpisodeSlugsAction
} from '@/app/actions/admin';
import ComprehensiveSeoDisplay from './ComprehensiveSeoDisplay';

interface ContentManagementTabProps {
    allPodcasts: any[];
    fetchAllPodcasts: () => void;
}

export default function ContentManagementTab({ allPodcasts, fetchAllPodcasts }: ContentManagementTabProps) {
    const [activeTab, setActiveTab] = useState('podcasts');
    const [searchTerm, setSearchTerm] = useState('');
    const [generatingSeo, setGeneratingSeo] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    
    // Episodes and People data
    const [allEpisodes, setAllEpisodes] = useState<any[]>([]);
    const [allPeople, setAllPeople] = useState<any[]>([]);
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);
    const [loadingPeople, setLoadingPeople] = useState(false);

    // Fetch episodes data
    const fetchAllEpisodes = async () => {
        setLoadingEpisodes(true);
        startTransition(async () => {
            const result = await getAllEpisodesAction();
            if (result.success && result.data) {
                setAllEpisodes(result.data);
            } else {
                toastErrorWithCopy("Failed to fetch episodes", result.error);
            }
            setLoadingEpisodes(false);
        });
    };

    // Fetch people data
    const fetchAllPeople = async () => {
        setLoadingPeople(true);
        startTransition(async () => {
            const result = await getAllPeopleAction();
            if (result.success && result.data) {
                setAllPeople(result.data);
            } else {
                toastErrorWithCopy("Failed to fetch people", result.error);
            }
            setLoadingPeople(false);
        });
    };

    // Generate episode slugs
    const handleGenerateEpisodeSlugs = async () => {
        startTransition(async () => {
            try {
                const result = await generateEpisodeSlugsAction();
                if (result.success) {
                    toast.success(result.message || 'Episode slugs generated successfully!');
                    // Refresh episodes data
                    fetchAllEpisodes();
                } else {
                    toast.error(result.error || 'Failed to generate episode slugs');
                }
            } catch (error: any) {
                toast.error(`Error generating episode slugs: ${error.message}`);
            }
        });
    };

    // Load data when tab changes
    useEffect(() => {
        if (activeTab === 'episodes' && allEpisodes.length === 0) {
            fetchAllEpisodes();
        } else if (activeTab === 'people' && allPeople.length === 0) {
            fetchAllPeople();
        }
    }, [activeTab, allEpisodes.length, allPeople.length]);

    const handleGenerateSingleSeo = (item: any, type: 'podcasts' | 'episodes' | 'people') => {
        setGeneratingSeo(item.id);
        startTransition(async () => {
            let context: any = {};
            
            if (type === 'podcasts') {
                context = {
                    title: item.title,
                    description: item.description,
                    contentType: 'podcast',
                    relatedInfo: item.categories?.join(', ') || item.tags?.join(', ') || '',
                    additionalContext: {
                        categories: item.categories || [],
                        tags: item.tags || [],
                        language: item.language,
                        averageRating: item.average_rating,
                        totalViews: item.total_views,
                        totalLikes: item.total_likes,
                        totalEpisodes: item.total_episodes,
                        averageDuration: item.average_duration,
                        firstEpisodeDate: item.first_episode_date,
                        lastEpisodeDate: item.last_episode_date,
                        teamMembers: item.team_members,
                        socialLinks: item.social_links,
                        platformLinks: item.platform_links,
                        officialWebsite: item.official_website,
                        youtubePlaylistUrl: item.youtube_playlist_url,
                    }
                };
            } else if (type === 'episodes') {
                context = {
                    title: item.title,
                    description: item.description || '',
                    contentType: 'episode',
                    relatedInfo: `From podcast: ${item.podcasts?.title || 'Unknown'}`,
                    additionalContext: {
                        tags: item.tags || [],
                        episodeNumber: item.episode_number,
                        seasonNumber: item.season_number,
                        duration: item.duration,
                        publishedAt: item.published_at,
                        podcastTitle: item.podcasts?.title,
                        averageRating: item.average_rating,
                        totalViews: item.views,
                        totalLikes: item.likes,
                    }
                };
            } else if (type === 'people') {
                context = {
                    title: item.full_name,
                    description: item.bio || '',
                    contentType: 'person',
                    relatedInfo: item.location || '',
                    additionalContext: {
                        bio: item.bio,
                        birthDate: item.birth_date,
                        location: item.location,
                        photoUrls: item.photo_urls,
                        websiteUrl: item.website_url,
                        totalAppearances: item.total_appearances,
                        isVerified: item.is_verified,
                        averageRating: item.average_rating,
                        socialLinks: item.social_links,
                    }
                };
            }

            const result = await generateSingleSeoMetadataAction(item.id, type, context);
            
            if (result.success) {
                toast.success(`Successfully generated SEO for ${type === 'people' ? item.full_name : item.title}`);
                if (type === 'podcasts') {
                    fetchAllPodcasts();
                } else if (type === 'episodes') {
                    fetchAllEpisodes();
                } else if (type === 'people') {
                    fetchAllPeople();
                }
            } else {
                toastErrorWithCopy(`Failed to generate SEO for ${type === 'people' ? item.full_name : item.title}`, result.error);
            }
            setGeneratingSeo(null);
        });
    };

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
            schemaMarkup: seoData.schema_markup || {},
            socialMedia: seoData.social_media || {},
            contentEnhancement: seoData.content_enhancement || {},
            technicalSeo: seoData.technical_seo || {},
            localSeo: seoData.local_seo || {}
        };
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Filter functions
    const filteredPodcasts = allPodcasts.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const filteredEpisodes = allEpisodes.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.podcasts?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const filteredPeople = allPeople.filter(p => 
        p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.bio && p.bio.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-6 w-6 text-blue-600" />
                        Content Management Dashboard
                    </CardTitle>
                    <CardDescription>
                        Manage podcasts, episodes, and people with comprehensive SEO generation and monitoring
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Search and Tabs */}
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input 
                                    placeholder={`Search ${activeTab}...`} 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button 
                                onClick={() => {
                                    if (activeTab === 'podcasts') fetchAllPodcasts();
                                    else if (activeTab === 'episodes') fetchAllEpisodes();
                                    else if (activeTab === 'people') fetchAllPeople();
                                }}
                                variant="outline"
                                disabled={isPending}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="podcasts" className="flex items-center gap-2">
                                    <Mic className="h-4 w-4" />
                                    Podcasts ({allPodcasts.length})
                                </TabsTrigger>
                                <TabsTrigger value="episodes" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Episodes ({allEpisodes.length})
                                </TabsTrigger>
                                <TabsTrigger value="people" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    People ({allPeople.length})
                                </TabsTrigger>
                            </TabsList>

                            {/* Podcasts Tab */}
                            <TabsContent value="podcasts" className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>SEO Status</TableHead>
                                            <TableHead>Episodes</TableHead>
                                            <TableHead>Views</TableHead>
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
                                                        <div className="truncate font-medium" title={podcast.title}>
                                                            {podcast.title}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {podcast.categories?.join(', ') || 'No categories'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={
                                                            podcast.submission_status === 'approved' ? 'default' : 
                                                            podcast.submission_status === 'pending' ? 'secondary' : 'destructive'
                                                        }>
                                                            {podcast.submission_status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {hasSeo ? (
                                                            <Badge className="bg-green-500 hover:bg-green-600">
                                                                SEO Generated
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">No SEO</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <FileText className="h-3 w-3" />
                                                            {podcast.total_episodes || 0}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <TrendingUp className="h-3 w-3" />
                                                            {podcast.total_views?.toLocaleString() || 0}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="space-x-2">
                                                        <Link href={`/podcasts/${podcast.slug || podcast.id}`} target="_blank">
                                                            <Button variant="outline" size="sm">
                                                                <ExternalLink className="h-4 w-4" />
                                                            </Button>
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
                                                            onClick={() => handleGenerateSingleSeo(podcast, 'podcasts')}
                                                            disabled={generatingSeo === podcast.id || isPending}
                                                        >
                                                            {generatingSeo === podcast.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Sparkles className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TabsContent>

                            {/* Episodes Tab */}
                            <TabsContent value="episodes" className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Episodes Management</h3>
                                    <Button 
                                        onClick={handleGenerateEpisodeSlugs}
                                        disabled={isPending}
                                        className="flex items-center gap-2"
                                    >
                                        {isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-4 w-4" />
                                        )}
                                        Generate Episode Slugs
                                    </Button>
                                </div>
                                {loadingEpisodes ? (
                                    <div className="flex items-center justify-center p-8">
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                        Loading episodes...
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Podcast</TableHead>
                                                <TableHead>SEO Status</TableHead>
                                                <TableHead>Duration</TableHead>
                                                <TableHead>Published</TableHead>
                                                <TableHead>Views</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredEpisodes.map(episode => {
                                                const seoData = formatSeoData(episode.seo_metadata);
                                                const hasSeo = episode.seo_metadata && seoData;
                                                
                                                return (
                                                    <TableRow key={episode.id}>
                                                        <TableCell className="max-w-xs">
                                                            <div className="truncate font-medium" title={episode.title}>
                                                                {episode.title}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Episode {episode.episode_number || 'N/A'}
                                                                {episode.season_number && ` • Season ${episode.season_number}`}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Mic className="h-3 w-3" />
                                                                <span className="text-sm truncate max-w-32" title={episode.podcasts?.title}>
                                                                    {episode.podcasts?.title || 'Unknown'}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {hasSeo ? (
                                                                <Badge className="bg-green-500 hover:bg-green-600">
                                                                    SEO Generated
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="secondary">No SEO</Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatDuration(episode.duration || 0)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {episode.published_at ? formatDate(episode.published_at) : 'Not published'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <TrendingUp className="h-3 w-3" />
                                                                {episode.views?.toLocaleString() || 0}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="space-x-2">
                                                            <Link href={`/episodes/${episode.slug || episode.id}`} target="_blank">
                                                                <Button variant="outline" size="sm">
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            
                                                            {hasSeo && (
                                                                <ComprehensiveSeoDisplay
                                                                    seoData={episode.seo_metadata}
                                                                    title={episode.title}
                                                                    contentType="episode"
                                                                />
                                                            )}
                                                            
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleGenerateSingleSeo(episode, 'episodes')}
                                                                disabled={generatingSeo === episode.id || isPending}
                                                            >
                                                                {generatingSeo === episode.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Sparkles className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                )}
                            </TabsContent>

                            {/* People Tab */}
                            <TabsContent value="people" className="space-y-4">
                                {loadingPeople ? (
                                    <div className="flex items-center justify-center p-8">
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                        Loading people...
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Location</TableHead>
                                                <TableHead>SEO Status</TableHead>
                                                <TableHead>Appearances</TableHead>
                                                <TableHead>Rating</TableHead>
                                                <TableHead>Verified</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredPeople.map(person => {
                                                const seoData = formatSeoData(person.seo_metadata);
                                                const hasSeo = person.seo_metadata && seoData;
                                                
                                                return (
                                                    <TableRow key={person.id}>
                                                        <TableCell className="max-w-xs">
                                                            <div className="truncate font-medium" title={person.full_name}>
                                                                {person.full_name}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground truncate" title={person.bio}>
                                                                {person.bio || 'No bio available'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-sm">
                                                                    {person.location || 'Not specified'}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {hasSeo ? (
                                                                <Badge className="bg-green-500 hover:bg-green-600">
                                                                    SEO Generated
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="secondary">No SEO</Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                {person.total_appearances || 0}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-3 w-3" />
                                                                {person.average_rating ? person.average_rating.toFixed(1) : 'N/A'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {person.is_verified ? (
                                                                <Badge className="bg-blue-500 hover:bg-blue-600">
                                                                    Verified
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="secondary">Not Verified</Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="space-x-2">
                                                            <Link href={`/people/${person.slug || person.id}`} target="_blank">
                                                                <Button variant="outline" size="sm">
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            
                                                            {hasSeo && (
                                                                <ComprehensiveSeoDisplay
                                                                    seoData={person.seo_metadata}
                                                                    title={person.full_name}
                                                                    contentType="person"
                                                                />
                                                            )}
                                                            
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleGenerateSingleSeo(person, 'people')}
                                                                disabled={generatingSeo === person.id || isPending}
                                                            >
                                                                {generatingSeo === person.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Sparkles className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

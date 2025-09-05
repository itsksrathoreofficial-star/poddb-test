"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast, toastErrorWithCopy } from '@/components/ui/sonner';
import { 
    Globe, 
    RefreshCw, 
    Download, 
    Eye, 
    Settings,
    FileText,
    CheckCircle,
    AlertCircle,
    Clock,
    MapPin,
    Users,
    Newspaper,
    Podcast,
    Calendar,
    Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SitemapGeneratorProps {
    isPending: boolean;
    startTransition: React.TransitionStartFunction;
}

interface SitemapUrl {
    url: string;
    lastmod: string;
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
    type: 'page' | 'podcast' | 'episode' | 'person' | 'news' | 'category' | 'seo-page' | 'home-seo-page';
}

export default function SitemapGenerator({ isPending, startTransition }: SitemapGeneratorProps) {
    const [autoGenerate, setAutoGenerate] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [sitemapUrls, setSitemapUrls] = useState<SitemapUrl[]>([]);
    const [sitemapContent, setSitemapContent] = useState('');
    const [lastGenerated, setLastGenerated] = useState<string | null>(null);
    const [baseUrl, setBaseUrl] = useState(process.env.NEXT_PUBLIC_SITE_URL || 'https://poddb.pro');

    // Fetch all content for sitemap generation
    const fetchAllContent = async () => {
        try {
            const [podcastsResult, episodesResult, peopleResult, newsResult, pagesResult, seoCombinationsResult, homeSeoCombinationsResult] = await Promise.all([
                // Fetch all podcasts (no status filter since they don't have status column)
                supabase.from('podcasts').select('id, title, slug, updated_at'),
                // Fetch all episodes with their podcast info
                supabase.from('episodes').select('id, title, slug, updated_at, podcasts!inner(id, title)'),
                // Fetch all people (using full_name instead of name)
                supabase.from('people').select('id, full_name, slug, updated_at'),
                // Fetch published news articles
                supabase.from('news_articles').select('id, title, slug, updated_at, published_at').eq('published', true),
                // Fetch pages content
                supabase.from('pages_content').select('*'),
                // Try to fetch SEO combinations if they exist
                fetch('/api/admin/generate-seo-pages').then(res => res.ok ? res.json() : { combinations: [] }).catch(() => ({ combinations: [] })),
                // Try to fetch home SEO combinations if they exist
                fetch('/api/admin/generate-home-seo-pages').then(res => res.ok ? res.json() : { combinations: [] }).catch(() => ({ combinations: [] }))
            ]);

            const urls: SitemapUrl[] = [];

            // Debug: Log the results and check for errors
            console.log('Sitemap Generation Debug:');
            console.log('Podcasts:', podcastsResult.data?.length || 0, podcastsResult.data, podcastsResult.error);
            console.log('Episodes:', episodesResult.data?.length || 0, episodesResult.data, episodesResult.error);
            console.log('People:', peopleResult.data?.length || 0, peopleResult.data, peopleResult.error);
            console.log('News:', newsResult.data?.length || 0, newsResult.data, newsResult.error);
            console.log('SEO Combinations:', seoCombinationsResult.combinations?.length || 0, seoCombinationsResult);
            console.log('Home SEO Combinations:', homeSeoCombinationsResult.combinations?.length || 0, homeSeoCombinationsResult);

            // Check for errors
            if (podcastsResult.error) {
                console.error('Podcasts query error:', podcastsResult.error);
            }
            if (episodesResult.error) {
                console.error('Episodes query error:', episodesResult.error);
            }
            if (peopleResult.error) {
                console.error('People query error:', peopleResult.error);
            }
            if (newsResult.error) {
                console.error('News query error:', newsResult.error);
            }

            // Static pages - Wikipedia/IMDb style priorities
            const staticPages = [
                { url: '/', priority: 1.0, changefreq: 'daily' as const, type: 'page' as const },
                { url: '/rankings', priority: 0.99, changefreq: 'daily' as const, type: 'page' as const }, // Highest priority for rankings
                { url: '/people', priority: 0.95, changefreq: 'daily' as const, type: 'page' as const }, // Highest priority for people
                { url: '/podcasts', priority: 0.95, changefreq: 'daily' as const, type: 'page' as const }, // Highest priority for podcasts
                { url: '/news', priority: 0.9, changefreq: 'daily' as const, type: 'page' as const }, // High priority for news
                { url: '/episodes', priority: 0.8, changefreq: 'daily' as const, type: 'page' as const },
                { url: '/about', priority: 0.7, changefreq: 'monthly' as const, type: 'page' as const },
                { url: '/contact', priority: 0.6, changefreq: 'monthly' as const, type: 'page' as const },
                { url: '/privacy', priority: 0.5, changefreq: 'yearly' as const, type: 'page' as const },
                { url: '/terms', priority: 0.5, changefreq: 'yearly' as const, type: 'page' as const },
            ];

            staticPages.forEach(page => {
                urls.push({
                    url: page.url,
                    lastmod: new Date().toISOString().split('T')[0],
                    changefreq: page.changefreq,
                    priority: page.priority,
                    type: page.type
                });
            });

            // Podcasts
            if (podcastsResult.data) {
                podcastsResult.data.forEach((podcast: any) => {
                    urls.push({
                        url: `/podcasts/${podcast.slug}`,
                        lastmod: new Date(podcast.updated_at).toISOString().split('T')[0],
                        changefreq: 'daily', // Daily updates for podcasts
                        priority: 0.95, // Highest priority for podcasts
                        type: 'podcast'
                    });
                });
            }

            // Episodes
            if (episodesResult.data) {
                episodesResult.data.forEach((episode: any) => {
                    // Generate slug from title if slug is null
                    const episodeSlug = episode.slug || episode.title
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
                        .replace(/\s+/g, '-') // Replace spaces with hyphens
                        .replace(/-+/g, '-') // Replace multiple hyphens with single
                        .trim();
                    
                    urls.push({
                        url: `/episodes/${episodeSlug}`,
                        lastmod: new Date(episode.updated_at).toISOString().split('T')[0],
                        changefreq: 'daily', // Daily updates for episodes
                        priority: 0.8, // High priority for episodes
                        type: 'episode'
                    });
                });
            }

            // People - HIGHEST PRIORITY (Wikipedia/IMDb style)
            if (peopleResult.data) {
                peopleResult.data.forEach((person: any) => {
                    // Generate slug from full_name if slug is null
                    const personSlug = person.slug || person.full_name
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
                        .replace(/\s+/g, '-') // Replace spaces with hyphens
                        .replace(/-+/g, '-') // Replace multiple hyphens with single
                        .trim();
                    
                    urls.push({
                        url: `/people/${personSlug}`,
                        lastmod: new Date(person.updated_at).toISOString().split('T')[0],
                        changefreq: 'daily', // Daily updates for people pages
                        priority: 0.95, // HIGHEST priority for people pages
                        type: 'person'
                    });
                });
            }

            // News articles - High priority for slug-based articles
            if (newsResult.data) {
                newsResult.data.forEach((article: any) => {
                    urls.push({
                        url: `/news/${article.slug}`,
                        lastmod: new Date(article.published_at || article.updated_at).toISOString().split('T')[0],
                        changefreq: 'daily', // Daily updates for news articles
                        priority: 0.9, // High priority for news articles with slugs
                        type: 'news'
                    });
                });
            }

            // SEO Pages - Add all generated SEO combinations
            if (seoCombinationsResult.combinations && Array.isArray(seoCombinationsResult.combinations)) {
                seoCombinationsResult.combinations.forEach((combo: any) => {
                    urls.push({
                        url: combo.url,
                        lastmod: new Date().toISOString().split('T')[0],
                        changefreq: 'daily', // Daily updates for SEO pages
                        priority: combo.priority || 0.8, // Use the priority from the combination
                        type: 'seo-page'
                    });
                });
            }

            // Home SEO Pages - Add all generated home SEO combinations
            if (homeSeoCombinationsResult.combinations && Array.isArray(homeSeoCombinationsResult.combinations)) {
                homeSeoCombinationsResult.combinations.forEach((combo: any) => {
                    urls.push({
                        url: combo.url,
                        lastmod: new Date().toISOString().split('T')[0],
                        changefreq: 'daily', // Daily updates for home SEO pages
                        priority: combo.priority || 0.9, // Higher priority for home SEO pages
                        type: 'home-seo-page'
                    });
                });
            }

            return urls;
        } catch (error) {
            console.error('Error fetching content for sitemap:', error);
            throw error;
        }
    };

    // Generate XML sitemap
    const generateSitemapXML = (urls: SitemapUrl[]): string => {
        const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        const xmlFooter = '</urlset>';
        
        const urlEntries = urls.map(url => {
            return `  <url>
    <loc>${baseUrl}${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
        }).join('\n');

        return xmlHeader + urlEntries + '\n' + xmlFooter;
    };

    // Generate sitemap
    const handleGenerateSitemap = async () => {
        setIsGenerating(true);
        setGenerationProgress(0);

        try {
            // Simulate progress
            const progressSteps = [
                'Fetching content data...',
                'Processing people pages (highest priority)...',
                'Processing news articles...',
                'Processing podcasts...',
                'Processing episodes...',
                'Adding ranking SEO pages...',
                'Adding home SEO pages...',
                'Generating XML sitemap...',
                'Updating sitemap.xml file...'
            ];

            for (let i = 0; i < progressSteps.length; i++) {
                setGenerationProgress((i + 1) * (100 / progressSteps.length));
                toast.success(progressSteps[i]);
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            const urls = await fetchAllContent();
            const xmlContent = generateSitemapXML(urls);

            setSitemapUrls(urls);
            setSitemapContent(xmlContent);
            setLastGenerated(new Date().toISOString());

            // Save to public/sitemap.xml
            try {
                const response = await fetch('/api/admin/generate-sitemap', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ xmlContent, urls })
                });

                if (response.ok) {
                    toast.success('Sitemap generated and saved successfully!');
                } else {
                    toast.warning('Sitemap generated but could not save to file. You can download it manually.');
                }
            } catch (error) {
                toast.warning('Sitemap generated but could not save to file. You can download it manually.');
            }

        } catch (error: any) {
            toastErrorWithCopy('Failed to generate sitemap', error.message);
        } finally {
            setIsGenerating(false);
            setGenerationProgress(100);
        }
    };

    // Download sitemap
    const handleDownloadSitemap = () => {
        if (!sitemapContent) {
            toast.error('No sitemap content to download');
            return;
        }

        const blob = new Blob([sitemapContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Sitemap downloaded successfully!');
    };

    // Get type icon
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'page': return <FileText className="h-4 w-4" />;
            case 'podcast': return <Podcast className="h-4 w-4" />;
            case 'episode': return <Calendar className="h-4 w-4" />;
            case 'person': return <Users className="h-4 w-4" />;
            case 'news': return <Newspaper className="h-4 w-4" />;
            case 'seo-page': return <Target className="h-4 w-4" />;
            case 'home-seo-page': return <Globe className="h-4 w-4" />;
            default: return <Globe className="h-4 w-4" />;
        }
    };

    // Get type color
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'page': return 'bg-blue-100 text-blue-800';
            case 'podcast': return 'bg-green-100 text-green-800';
            case 'episode': return 'bg-purple-100 text-purple-800';
            case 'person': return 'bg-orange-100 text-orange-800';
            case 'news': return 'bg-red-100 text-red-800';
            case 'seo-page': return 'bg-yellow-100 text-yellow-800';
            case 'home-seo-page': return 'bg-indigo-100 text-indigo-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        Sitemap Generator
                    </CardTitle>
                    <CardDescription>
                        Automatically generate and update your sitemap.xml file with Wikipedia/IMDb style priorities - People pages get highest priority with daily updates
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Sitemap Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Auto-generate sitemap on content changes</Label>
                        <Switch
                            checked={autoGenerate}
                            onCheckedChange={setAutoGenerate}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="base-url">Base URL</Label>
                        <Input
                            id="base-url"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            placeholder="https://poddb.pro"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Generation Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5" />
                        Generate Sitemap
                    </CardTitle>
                    <CardDescription>
                        Generate a fresh sitemap with all your current content
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <Button 
                            onClick={handleGenerateSitemap} 
                            disabled={isGenerating || isPending}
                            className="flex-1"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Globe className="mr-2 h-4 w-4" />
                                    Generate Sitemap
                                </>
                            )}
                        </Button>
                        
                        {sitemapContent && (
                            <Button 
                                onClick={handleDownloadSitemap}
                                variant="outline"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download XML
                            </Button>
                        )}
                    </div>

                    {isGenerating && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Generating sitemap...</span>
                                <span>{Math.round(generationProgress)}%</span>
                            </div>
                            <Progress value={generationProgress} className="w-full" />
                        </div>
                    )}

                    {lastGenerated && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Last generated: {new Date(lastGenerated).toLocaleString()}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Sitemap Preview */}
            {sitemapUrls.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Sitemap Preview
                        </CardTitle>
                        <CardDescription>
                            Preview of your generated sitemap ({sitemapUrls.length} URLs)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* URL Statistics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Regular Content */}
                                <div className="text-center p-3 border rounded-lg bg-blue-50">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium">Static Pages</span>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {sitemapUrls.filter(url => url.type === 'page').length}
                                    </div>
                                </div>

                                <div className="text-center p-3 border rounded-lg bg-green-50">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Podcast className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium">Podcasts</span>
                                    </div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {sitemapUrls.filter(url => url.type === 'podcast').length}
                                    </div>
                                </div>

                                <div className="text-center p-3 border rounded-lg bg-purple-50">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Calendar className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm font-medium">Episodes</span>
                                    </div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {sitemapUrls.filter(url => url.type === 'episode').length}
                                    </div>
                                </div>

                                <div className="text-center p-3 border rounded-lg bg-orange-50">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Users className="h-4 w-4 text-orange-600" />
                                        <span className="text-sm font-medium">People</span>
                                    </div>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {sitemapUrls.filter(url => url.type === 'person').length}
                                    </div>
                                </div>

                                <div className="text-center p-3 border rounded-lg bg-red-50">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Newspaper className="h-4 w-4 text-red-600" />
                                        <span className="text-sm font-medium">News</span>
                                    </div>
                                    <div className="text-2xl font-bold text-red-600">
                                        {sitemapUrls.filter(url => url.type === 'news').length}
                                    </div>
                                </div>

                                {/* SEO Pages - Ranking */}
                                <div className="text-center p-3 border rounded-lg bg-yellow-50">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Target className="h-4 w-4 text-yellow-600" />
                                        <span className="text-sm font-medium">Ranking SEO</span>
                                    </div>
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {sitemapUrls.filter(url => url.type === 'seo-page').length}
                                    </div>
                                    <div className="text-xs text-yellow-600 mt-1">
                                        Categories × Languages × Locations
                                    </div>
                                </div>

                                {/* SEO Pages - Home */}
                                <div className="text-center p-3 border rounded-lg bg-indigo-50">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Globe className="h-4 w-4 text-indigo-600" />
                                        <span className="text-sm font-medium">Home SEO</span>
                                    </div>
                                    <div className="text-2xl font-bold text-indigo-600">
                                        {sitemapUrls.filter(url => url.type === 'home-seo-page').length}
                                    </div>
                                    <div className="text-xs text-indigo-600 mt-1">
                                        Platform Keywords
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="text-center p-3 border rounded-lg bg-gray-50">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Globe className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm font-medium">Total URLs</span>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-600">
                                        {sitemapUrls.length.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        All Content Types
                                    </div>
                                </div>
                            </div>

                            {/* SEO Summary */}
                            {(sitemapUrls.filter(url => url.type === 'seo-page').length > 0 || 
                              sitemapUrls.filter(url => url.type === 'home-seo-page').length > 0) && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                                    <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                        <Target className="h-5 w-5 text-blue-600" />
                                        SEO Pages Summary
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Target className="h-4 w-4 text-yellow-600" />
                                                <span className="font-medium">Ranking SEO Pages</span>
                                            </div>
                                            <span className="text-xl font-bold text-yellow-600">
                                                {sitemapUrls.filter(url => url.type === 'seo-page').length.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-indigo-600" />
                                                <span className="font-medium">Home SEO Pages</span>
                                            </div>
                                            <span className="text-xl font-bold text-indigo-600">
                                                {sitemapUrls.filter(url => url.type === 'home-seo-page').length.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {(sitemapUrls.filter(url => url.type === 'seo-page').length + 
                                              sitemapUrls.filter(url => url.type === 'home-seo-page').length).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-blue-600">Total SEO Pages for Maximum Google Presence</div>
                                    </div>
                                </div>
                            )}

                            {/* URL List */}
                            <div className="max-h-96 overflow-y-auto border rounded-lg">
                                <div className="p-4 space-y-2">
                                    {sitemapUrls.slice(0, 50).map((url, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                            <div className="flex items-center gap-3">
                                                <Badge className={`${getTypeColor(url.type)} text-xs`}>
                                                    {getTypeIcon(url.type)}
                                                    <span className="ml-1 capitalize">{url.type}</span>
                                                </Badge>
                                                <span className="font-mono text-sm">{url.url}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>Priority: {url.priority}</span>
                                                <span>•</span>
                                                <span>{url.changefreq}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {sitemapUrls.length > 50 && (
                                        <div className="text-center text-sm text-muted-foreground py-2">
                                            ... and {sitemapUrls.length - 50} more URLs
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* XML Preview */}
                            <div className="space-y-2">
                                <Label>XML Preview (first 10 URLs)</Label>
                                <Textarea
                                    value={sitemapContent.split('\n').slice(0, 20).join('\n') + '\n...'}
                                    readOnly
                                    rows={10}
                                    className="font-mono text-xs"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

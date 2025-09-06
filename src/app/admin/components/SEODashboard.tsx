"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
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
    Target,
    Plus,
    Trash2,
    Edit,
    Save,
    Zap,
    BarChart3,
    Hash,
    Languages,
    Map
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SEODashboardProps {
    isPending: boolean;
    startTransition: React.TransitionStartFunction;
}

interface PageConfig {
    id: string;
    name: string;
    path: string;
    type: 'main' | 'dynamic' | 'static';
    enabled: boolean;
    priority: number;
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    title: string;
    description: string;
    keywords: string[];
    categories: string[];
    languages: string[];
    locations: string[];
    periods: string[];
    types: string[];
    customTitle?: string;
    customDescription?: string;
}

interface SEOGenerationResult {
    pageId: string;
    pageName: string;
    totalPages: number;
    combinations: any[];
    status: 'idle' | 'generating' | 'completed' | 'error';
    progress: number;
    error?: string;
}

export default function SEODashboard({ isPending, startTransition }: SEODashboardProps) {
    // State management
    const [pages, setPages] = useState<PageConfig[]>([]);
    const [selectedPage, setSelectedPage] = useState<string>('');
    const [generationResults, setGenerationResults] = useState<Record<string, SEOGenerationResult>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);

    // Default page configurations
    const defaultPages: PageConfig[] = [
        {
            id: 'home',
            name: 'Home Page',
            path: '/',
            type: 'main',
            enabled: true,
            priority: 1.0,
            changefreq: 'daily',
            title: 'PodDB Pro - Biggest Podcast Database',
            description: 'Discover the world\'s largest podcast database with thousands of podcasts in all languages and locations.',
            keywords: ['podcast database', 'biggest podcast database', 'podcast platform', 'imdb for podcast'],
            categories: ['Business', 'Education', 'Technology', 'Health', 'Entertainment'],
            languages: ['English', 'Hindi', 'Spanish', 'French', 'German'],
            locations: ['Global', 'India', 'USA', 'UK', 'Canada'],
            periods: ['weekly', 'monthly', 'overall'],
            types: ['podcasts', 'episodes']
        },
        {
            id: 'rankings',
            name: 'Rankings Page',
            path: '/rankings',
            type: 'dynamic',
            enabled: true,
            priority: 0.99,
            changefreq: 'daily',
            title: 'Podcast Rankings - Top Podcasts & Episodes',
            description: 'Discover the top-ranked podcasts and episodes across all categories, languages, and locations.',
            keywords: ['podcast rankings', 'top podcasts', 'best podcasts', 'podcast charts'],
            categories: ['Business', 'Education', 'Technology', 'Health', 'Entertainment', 'News', 'Sports', 'Comedy'],
            languages: ['English', 'Hindi', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Japanese'],
            locations: ['Global', 'India', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France'],
            periods: ['weekly', 'monthly', 'overall'],
            types: ['podcasts', 'episodes']
        },
        {
            id: 'podcasts',
            name: 'Podcasts Page',
            path: '/podcasts',
            type: 'static',
            enabled: true,
            priority: 0.95,
            changefreq: 'daily',
            title: 'All Podcasts - Browse Podcasts by Category',
            description: 'Browse thousands of podcasts across all categories and languages.',
            keywords: ['all podcasts', 'browse podcasts', 'podcast categories'],
            categories: ['Business', 'Education', 'Technology', 'Health', 'Entertainment'],
            languages: ['English', 'Hindi', 'Spanish', 'French', 'German'],
            locations: ['Global', 'India', 'USA', 'UK', 'Canada'],
            periods: [],
            types: []
        }
    ];

    // Initialize pages
    useEffect(() => {
        setPages(defaultPages);
        setSelectedPage('home');
    }, [defaultPages]); // Add defaultPages dependency

    // Get current page config
    const currentPage = pages.find(p => p.id === selectedPage);

    // Update page configuration
    const updatePageConfig = (pageId: string, updates: Partial<PageConfig>) => {
        setPages(prev => prev.map(page => 
            page.id === pageId ? { ...page, ...updates } : page
        ));
    };

    // Add new page
    const addNewPage = () => {
        const newPage: PageConfig = {
            id: `page_${Date.now()}`,
            name: 'New Page',
            path: '/new-page',
            type: 'dynamic',
            enabled: true,
            priority: 0.8,
            changefreq: 'weekly',
            title: 'New Page Title',
            description: 'New page description',
            keywords: [],
            categories: [],
            languages: [],
            locations: [],
            periods: [],
            types: []
        };
        setPages(prev => [...prev, newPage]);
        setSelectedPage(newPage.id);
    };

    // Delete page
    const deletePage = (pageId: string) => {
        if (pages.length <= 1) {
            toast.error('Cannot delete the last page');
            return;
        }
        setPages(prev => prev.filter(page => page.id !== pageId));
        if (selectedPage === pageId) {
            setSelectedPage(pages[0].id);
        }
    };

    // Generate SEO for selected page
    const generateSEOForPage = async (pageId: string) => {
        const page = pages.find(p => p.id === pageId);
        if (!page || !page.enabled) {
            toast.error('Page not found or disabled');
            return;
        }

        setIsGenerating(true);
        setGenerationResults(prev => ({
            ...prev,
            [pageId]: {
                pageId,
                pageName: page.name,
                totalPages: 0,
                combinations: [],
                status: 'generating',
                progress: 0
            }
        }));

        try {
            // Simulate progress
            const progressSteps = [
                'Analyzing page configuration...',
                'Generating SEO combinations...',
                'Creating titles and descriptions...',
                'Setting priorities and frequencies...',
                'Finalizing SEO data...'
            ];

            for (let i = 0; i < progressSteps.length; i++) {
                setGenerationResults(prev => ({
                    ...prev,
                    [pageId]: {
                        ...prev[pageId],
                        progress: (i + 1) * 20
                    }
                }));
                toast.success(progressSteps[i]);
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Generate combinations based on page type
            let combinations: any[] = [];
            
            if (page.type === 'main') {
                // Generate home page variations
                combinations = generateHomePageCombinations(page);
            } else if (page.type === 'dynamic') {
                // Generate dynamic page combinations
                combinations = generateDynamicPageCombinations(page);
            } else {
                // Static page - single combination
                combinations = [{
                    title: page.title,
                    description: page.description,
                    url: page.path,
                    priority: page.priority,
                    changefreq: page.changefreq,
                    type: 'static'
                }];
            }

            setGenerationResults(prev => ({
                ...prev,
                [pageId]: {
                    pageId,
                    pageName: page.name,
                    totalPages: combinations.length,
                    combinations,
                    status: 'completed',
                    progress: 100
                }
            }));

            toast.success(`Successfully generated ${combinations.length} SEO combinations for ${page.name}!`);

        } catch (error: any) {
            setGenerationResults(prev => ({
                ...prev,
                [pageId]: {
                    pageId,
                    pageName: page.name,
                    totalPages: 0,
                    combinations: [],
                    status: 'error',
                    progress: 0,
                    error: error.message
                }
            }));
            toast.error(`Failed to generate SEO for ${page.name}: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    // Generate home page combinations
    const generateHomePageCombinations = (page: PageConfig): any[] => {
        const combinations: any[] = [];
        const baseKeywords = page.keywords;
        const variations = ['Biggest', 'Largest', 'Best', 'Top', 'Ultimate'];

        // Platform variations
        baseKeywords.forEach(keyword => {
            variations.forEach(variation => {
                combinations.push({
                    title: `${variation} ${keyword} - PodDB Pro`,
                    description: `Discover the ${variation.toLowerCase()} ${keyword} with PodDB Pro. Find thousands of podcasts across all categories and languages.`,
                    url: `/?type=platform&keyword=${encodeURIComponent(keyword)}&variation=${encodeURIComponent(variation)}`,
                    priority: 0.9,
                    changefreq: 'daily',
                    type: 'home-seo-page'
                });
            });
        });

        // Category + Language + Location combinations
        page.categories.slice(0, 10).forEach(category => {
            page.languages.slice(0, 5).forEach(language => {
                page.locations.slice(0, 5).forEach(location => {
                    combinations.push({
                        title: `Best ${category} Podcasts in ${language} - ${location}`,
                        description: `Discover the best ${category.toLowerCase()} podcasts in ${language} from ${location}. Browse our comprehensive database.`,
                        url: `/?category=${encodeURIComponent(category)}&language=${encodeURIComponent(language)}&location=${encodeURIComponent(location)}`,
                        priority: 0.8,
                        changefreq: 'daily',
                        type: 'home-seo-page'
                    });
                });
            });
        });

        return combinations;
    };

    // Generate dynamic page combinations
    const generateDynamicPageCombinations = (page: PageConfig): any[] => {
        const combinations: any[] = [];

        // Base combinations
        page.types.forEach(type => {
            page.periods.forEach(period => {
                combinations.push({
                    title: `${page.title} - ${type.charAt(0).toUpperCase() + type.slice(1)} ${period.charAt(0).toUpperCase() + period.slice(1)}`,
                    description: `${page.description} View ${period} rankings for ${type}.`,
                    url: `${page.path}?type=${type}&period=${period}`,
                    priority: page.priority,
                    changefreq: page.changefreq,
                    type: 'seo-page'
                });
            });
        });

        // Category combinations
        page.categories.forEach(category => {
            page.types.forEach(type => {
                page.periods.forEach(period => {
                    combinations.push({
                        title: `Best ${category} ${type.charAt(0).toUpperCase() + type.slice(1)} - ${period.charAt(0).toUpperCase() + period.slice(1)} Rankings`,
                        description: `Discover the top ${category.toLowerCase()} ${type} rankings for ${period}. Updated regularly.`,
                        url: `${page.path}?type=${type}&period=${period}&category=${encodeURIComponent(category)}`,
                        priority: 0.8,
                        changefreq: 'daily',
                        type: 'seo-page'
                    });
                });
            });
        });

        // Language + Location combinations
        page.languages.forEach(language => {
            page.locations.forEach(location => {
                page.types.forEach(type => {
                    page.periods.forEach(period => {
                        combinations.push({
                            title: `Best ${language} ${type.charAt(0).toUpperCase() + type.slice(1)} in ${location} - ${period.charAt(0).toUpperCase() + period.slice(1)}`,
                            description: `Top ${language} ${type} rankings in ${location} for ${period}. Find the best content.`,
                            url: `${page.path}?type=${type}&period=${period}&language=${encodeURIComponent(language)}&location=${encodeURIComponent(location)}`,
                            priority: 0.7,
                            changefreq: 'daily',
                            type: 'seo-page'
                        });
                    });
                });
            });
        });

        return combinations;
    };

    // Preview combinations
    const handlePreview = (pageId: string) => {
        const result = generationResults[pageId];
        if (!result || !result.combinations.length) {
            toast.error('No combinations to preview');
            return;
        }
        setPreviewData(result.combinations.slice(0, 20));
        setShowPreview(true);
    };

    // Download combinations
    const handleDownload = (pageId: string) => {
        const result = generationResults[pageId];
        if (!result || !result.combinations.length) {
            toast.error('No combinations to download');
            return;
        }

        const blob = new Blob([JSON.stringify(result.combinations, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${result.pageName.toLowerCase().replace(/\s+/g, '-')}-seo-combinations.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('SEO combinations downloaded successfully!');
    };

    // Generate all pages
    const generateAllPages = async () => {
        const enabledPages = pages.filter(p => p.enabled);
        if (enabledPages.length === 0) {
            toast.error('No enabled pages to generate');
            return;
        }

        setIsGenerating(true);
        for (const page of enabledPages) {
            await generateSEOForPage(page.id);
        }
        setIsGenerating(false);
        toast.success(`Successfully generated SEO for ${enabledPages.length} pages!`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-600" />
                        SEO Dashboard - Complete Automation
                    </CardTitle>
                    <CardDescription>
                        Configure and generate dynamic SEO for all your pages. Set priorities, categories, languages, and locations for maximum Google presence.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pages List */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Pages
                                </span>
                                <Button size="sm" onClick={addNewPage}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {pages.map(page => (
                                <div
                                    key={page.id}
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                        selectedPage === page.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => setSelectedPage(page.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={page.type === 'main' ? 'default' : page.type === 'dynamic' ? 'secondary' : 'outline'}>
                                                {page.type}
                                            </Badge>
                                            <span className="font-medium">{page.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <Switch
                                                    checked={page.enabled}
                                                    onCheckedChange={(checked) => updatePageConfig(page.id, { enabled: checked })}
                                                />
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deletePage(page.id);
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {page.path} • Priority: {page.priority}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Page Configuration */}
                <div className="lg:col-span-2">
                    {currentPage && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Configure: {currentPage.name}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => generateSEOForPage(currentPage.id)}
                                            disabled={isGenerating || !currentPage.enabled}
                                            size="sm"
                                        >
                                            <Zap className="h-4 w-4 mr-1" />
                                            Generate SEO
                                        </Button>
                                        {generationResults[currentPage.id] && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePreview(currentPage.id)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Preview
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownload(currentPage.id)}
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Download
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="basic" className="space-y-4">
                                    <TabsList>
                                        <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                                        <TabsTrigger value="seo">SEO Content</TabsTrigger>
                                        <TabsTrigger value="filters">Filters & Options</TabsTrigger>
                                        <TabsTrigger value="results">Results</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="basic" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="page-name">Page Name</Label>
                                                <Input
                                                    id="page-name"
                                                    value={currentPage.name}
                                                    onChange={(e) => updatePageConfig(currentPage.id, { name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="page-path">Page Path</Label>
                                                <Input
                                                    id="page-path"
                                                    value={currentPage.path}
                                                    onChange={(e) => updatePageConfig(currentPage.id, { path: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="priority">Priority (0.0 - 1.0)</Label>
                                                <Input
                                                    id="priority"
                                                    type="number"
                                                    min="0"
                                                    max="1"
                                                    step="0.1"
                                                    value={currentPage.priority}
                                                    onChange={(e) => updatePageConfig(currentPage.id, { priority: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="changefreq">Change Frequency</Label>
                                                <Select
                                                    value={currentPage.changefreq}
                                                    onValueChange={(value: any) => updatePageConfig(currentPage.id, { changefreq: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="always">Always</SelectItem>
                                                        <SelectItem value="hourly">Hourly</SelectItem>
                                                        <SelectItem value="daily">Daily</SelectItem>
                                                        <SelectItem value="weekly">Weekly</SelectItem>
                                                        <SelectItem value="monthly">Monthly</SelectItem>
                                                        <SelectItem value="yearly">Yearly</SelectItem>
                                                        <SelectItem value="never">Never</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="seo" className="space-y-4">
                                        <div>
                                            <Label htmlFor="title">Page Title</Label>
                                            <Input
                                                id="title"
                                                value={currentPage.title}
                                                onChange={(e) => updatePageConfig(currentPage.id, { title: e.target.value })}
                                                placeholder="Enter page title"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="description">Page Description</Label>
                                            <Textarea
                                                id="description"
                                                value={currentPage.description}
                                                onChange={(e) => updatePageConfig(currentPage.id, { description: e.target.value })}
                                                placeholder="Enter page description"
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                                            <Textarea
                                                id="keywords"
                                                value={currentPage.keywords.join(', ')}
                                                onChange={(e) => updatePageConfig(currentPage.id, { keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) })}
                                                placeholder="Enter keywords separated by commas"
                                                rows={2}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="filters" className="space-y-4">
                                        <div>
                                            <Label htmlFor="categories">Categories (comma-separated)</Label>
                                            <Textarea
                                                id="categories"
                                                value={currentPage.categories.join(', ')}
                                                onChange={(e) => updatePageConfig(currentPage.id, { categories: e.target.value.split(',').map(c => c.trim()).filter(c => c) })}
                                                placeholder="Enter categories separated by commas"
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="languages">Languages (comma-separated)</Label>
                                            <Textarea
                                                id="languages"
                                                value={currentPage.languages.join(', ')}
                                                onChange={(e) => updatePageConfig(currentPage.id, { languages: e.target.value.split(',').map(l => l.trim()).filter(l => l) })}
                                                placeholder="Enter languages separated by commas"
                                                rows={2}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="locations">Locations (comma-separated)</Label>
                                            <Textarea
                                                id="locations"
                                                value={currentPage.locations.join(', ')}
                                                onChange={(e) => updatePageConfig(currentPage.id, { locations: e.target.value.split(',').map(l => l.trim()).filter(l => l) })}
                                                placeholder="Enter locations separated by commas"
                                                rows={2}
                                            />
                                        </div>
                                        {currentPage.type === 'dynamic' && (
                                            <>
                                                <div>
                                                    <Label htmlFor="periods">Periods (comma-separated)</Label>
                                                    <Textarea
                                                        id="periods"
                                                        value={currentPage.periods.join(', ')}
                                                        onChange={(e) => updatePageConfig(currentPage.id, { periods: e.target.value.split(',').map(p => p.trim()).filter(p => p) })}
                                                        placeholder="Enter periods separated by commas (e.g., weekly, monthly, overall)"
                                                        rows={2}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="types">Types (comma-separated)</Label>
                                                    <Textarea
                                                        id="types"
                                                        value={currentPage.types.join(', ')}
                                                        onChange={(e) => updatePageConfig(currentPage.id, { types: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                                                        placeholder="Enter types separated by commas (e.g., podcasts, episodes)"
                                                        rows={2}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="results" className="space-y-4">
                                        {generationResults[currentPage.id] ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {generationResults[currentPage.id].status === 'completed' && (
                                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                                        )}
                                                        {generationResults[currentPage.id].status === 'generating' && (
                                                            <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                                                        )}
                                                        {generationResults[currentPage.id].status === 'error' && (
                                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                                        )}
                                                        <span className="font-medium">
                                                            {generationResults[currentPage.id].status === 'completed' && 'Generation Complete'}
                                                            {generationResults[currentPage.id].status === 'generating' && 'Generating...'}
                                                            {generationResults[currentPage.id].status === 'error' && 'Generation Failed'}
                                                        </span>
                                                    </div>
                                                    <Badge variant="outline">
                                                        {generationResults[currentPage.id].totalPages.toLocaleString()} pages
                                                    </Badge>
                                                </div>

                                                {generationResults[currentPage.id].status === 'generating' && (
                                                    <Progress value={generationResults[currentPage.id].progress} />
                                                )}

                                                {generationResults[currentPage.id].status === 'error' && (
                                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                                        <p className="text-red-800 text-sm">
                                                            {generationResults[currentPage.id].error}
                                                        </p>
                                                    </div>
                                                )}

                                                {generationResults[currentPage.id].status === 'completed' && (
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div className="text-center p-3 bg-green-50 rounded-lg">
                                                            <div className="text-2xl font-bold text-green-600">
                                                                {generationResults[currentPage.id].totalPages.toLocaleString()}
                                                            </div>
                                                            <div className="text-sm text-green-600">Total Pages</div>
                                                        </div>
                                                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                            <div className="text-2xl font-bold text-blue-600">
                                                                {currentPage.categories.length}
                                                            </div>
                                                            <div className="text-sm text-blue-600">Categories</div>
                                                        </div>
                                                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                                                            <div className="text-2xl font-bold text-purple-600">
                                                                {currentPage.languages.length}
                                                            </div>
                                                            <div className="text-sm text-purple-600">Languages</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <p>No SEO generation results yet.</p>
                                                <p className="text-sm">Click &quot;Generate SEO&quot; to create dynamic pages.</p>
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Generate All Button */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">Generate SEO for All Enabled Pages</h3>
                            <p className="text-sm text-muted-foreground">
                                Generate dynamic SEO combinations for all enabled pages at once.
                            </p>
                        </div>
                        <Button
                            onClick={generateAllPages}
                            disabled={isGenerating}
                            size="lg"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Generating All...
                                </>
                            ) : (
                                <>
                                    <Zap className="mr-2 h-4 w-4" />
                                    Generate All Pages
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Preview Dialog */}
            {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">SEO Pages Preview</h3>
                            <Button variant="outline" onClick={() => setShowPreview(false)}>
                                Close
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {previewData.map((combo, index) => (
                                <Card key={index}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge className="bg-blue-100 text-blue-800">
                                                        Priority {combo.priority}
                                                    </Badge>
                                                </div>
                                                <h4 className="font-semibold mb-1">{combo.title}</h4>
                                                <p className="text-sm text-gray-600 mb-2">{combo.description}</p>
                                                <p className="text-xs text-gray-500">{combo.url}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

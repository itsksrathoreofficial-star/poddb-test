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
    Target,
    Hash,
    Database,
    Search,
    Lightbulb,
    BarChart3,
    ListTodo,
    Zap,
    Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SEOPageGeneratorProps {
    isPending: boolean;
    startTransition: React.TransitionStartFunction;
}

interface SEOCombination {
    type: 'podcasts' | 'episodes';
    period: 'weekly' | 'monthly' | 'overall';
    category?: string;
    language?: string;
    location?: string;
    state?: string;
    url: string;
    priority: number;
    title?: string;
    description?: string;
}

export default function SEOPageGenerator({ isPending, startTransition }: SEOPageGeneratorProps) {
    const [autoGenerate, setAutoGenerate] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [seoCombinations, setSeoCombinations] = useState<SEOCombination[]>([]);
    const [lastGenerated, setLastGenerated] = useState<string | null>(null);
    const [baseUrl, setBaseUrl] = useState(process.env.NEXT_PUBLIC_SITE_URL || 'https://poddb.pro');
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<SEOCombination[]>([]);
    
    // Home SEO states
    const [homeGenerationStatus, setHomeGenerationStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
    const [homeProgress, setHomeProgress] = useState(0);
    const [homeGeneratedCount, setHomeGeneratedCount] = useState(0);
    const [homeTotalCount, setHomeTotalCount] = useState(0);
    const [homeError, setHomeError] = useState<string | null>(null);
    const [homeSeoCombinations, setHomeSeoCombinations] = useState<any[]>([]);
    const [showHomePreview, setShowHomePreview] = useState(false);
    const [homePreviewData, setHomePreviewData] = useState<any[]>([]);

    // Fetch all content for SEO combinations generation
    const fetchAllContent = async () => {
        try {
            const [categoriesResult, languagesResult, locationsResult] = await Promise.all([
                supabase.from('podcasts').select('categories').not('categories', 'is', null),
                supabase.from('podcasts').select('language').not('language', 'is', null),
                supabase.from('podcasts').select('location').not('location', 'is', null)
            ]);

            const categories = Array.from(
                new Set(categoriesResult.data?.flatMap((item: any) => item.categories || []) || [])
            );
            
            const languages = Array.from(
                new Set(languagesResult.data?.map((item: any) => item.language).filter(Boolean) || [])
            );
            
            const locations = Array.from(
                new Set(locationsResult.data?.map((item: any) => item.location).filter(Boolean) || [])
            );

            console.log('SEO Generation Debug:');
            console.log('Categories:', categories.length, categories);
            console.log('Languages:', languages.length, languages);
            console.log('Locations:', locations.length, locations);

            return { categories, languages, locations };
        } catch (error: any) {
            console.error('Error fetching content for SEO generation:', error);
            toastErrorWithCopy('Failed to fetch content', error.message);
            return { categories: [], languages: [], locations: [] };
        }
    };

    // Generate SEO combinations
    const generateSEOCombinations = async (categories: string[], languages: string[], locations: string[]) => {
        const combinations: SEOCombination[] = [];
        const types: ('podcasts' | 'episodes')[] = ['podcasts', 'episodes'];
        const periods: ('weekly' | 'monthly' | 'overall')[] = ['weekly', 'monthly', 'overall'];

        // Base combinations (no filters)
        types.forEach(type => {
            periods.forEach(period => {
                combinations.push({
                    type,
                    period,
                    url: `/rankings?type=${type}&period=${period}`,
                    priority: 0.9
                });
            });
        });

        // Category combinations
        categories.slice(0, 100).forEach(category => {
            types.forEach(type => {
                periods.forEach(period => {
                    combinations.push({
                        type,
                        period,
                        category,
                        url: `/rankings?type=${type}&period=${period}&category=${encodeURIComponent(category)}`,
                        priority: 0.8
                    });
                });
            });
        });

        // Language combinations
        languages.slice(0, 50).forEach(language => {
            types.forEach(type => {
                periods.forEach(period => {
                    combinations.push({
                        type,
                        period,
                        language,
                        url: `/rankings?type=${type}&period=${period}&language=${encodeURIComponent(language)}`,
                        priority: 0.8
                    });
                });
            });
        });

        // Location combinations
        locations.slice(0, 100).forEach(location => {
            types.forEach(type => {
                periods.forEach(period => {
                    combinations.push({
                        type,
                        period,
                        location,
                        url: `/rankings?type=${type}&period=${period}&location=${encodeURIComponent(location)}`,
                        priority: 0.8
                    });
                });
            });
        });

        // Category + Language combinations
        categories.slice(0, 50).forEach(category => {
            languages.slice(0, 20).forEach(language => {
                types.forEach(type => {
                    periods.forEach(period => {
                        combinations.push({
                            type,
                            period,
                            category,
                            language,
                            url: `/rankings?type=${type}&period=${period}&category=${encodeURIComponent(category)}&language=${encodeURIComponent(language)}`,
                            priority: 0.7
                        });
                    });
                });
            });
        });

        // Category + Location combinations
        categories.slice(0, 50).forEach(category => {
            locations.slice(0, 30).forEach(location => {
                types.forEach(type => {
                    periods.forEach(period => {
                        combinations.push({
                            type,
                            period,
                            category,
                            location,
                            url: `/rankings?type=${type}&period=${period}&category=${encodeURIComponent(category)}&location=${encodeURIComponent(location)}`,
                            priority: 0.7
                        });
                    });
                });
            });
        });

        // Language + Location combinations
        languages.slice(0, 20).forEach(language => {
            locations.slice(0, 30).forEach(location => {
                types.forEach(type => {
                    periods.forEach(period => {
                        combinations.push({
                            type,
                            period,
                            language,
                            location,
                            url: `/rankings?type=${type}&period=${period}&language=${encodeURIComponent(language)}&location=${encodeURIComponent(location)}`,
                            priority: 0.7
                        });
                    });
                });
            });
        });

        // Category + Language + Location combinations
        categories.slice(0, 30).forEach(category => {
            languages.slice(0, 15).forEach(language => {
                locations.slice(0, 20).forEach(location => {
                    types.forEach(type => {
                        periods.forEach(period => {
                            combinations.push({
                                type,
                                period,
                                category,
                                language,
                                location,
                                url: `/rankings?type=${type}&period=${period}&category=${encodeURIComponent(category)}&language=${encodeURIComponent(language)}&location=${encodeURIComponent(location)}`,
                                priority: 0.6
                            });
                        });
                    });
                });
            });
        });

        return combinations;
    };

    // Generate Home SEO combinations
    const generateHomeSEOPages = async () => {
        setHomeGenerationStatus('generating');
        setHomeProgress(0);
        setHomeGeneratedCount(0);
        setHomeError(null);

        try {
            const response = await fetch('/api/admin/generate-home-seo-pages');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate home SEO pages');
            }

            setHomeTotalCount(data.total);
            setHomeGeneratedCount(data.total);
            setHomeSeoCombinations(data.combinations || []);
            setHomeProgress(100);
            setHomeGenerationStatus('completed');
            
            toast.success(`Successfully generated ${data.total} home SEO page combinations!`, {
                description: 'Your home page will now rank for thousands of podcast platform keywords.'
            });

        } catch (error: any) {
            console.error('Error generating home SEO pages:', error);
            setHomeError(error.message);
            setHomeGenerationStatus('error');
            
            toast.error('Failed to generate home SEO pages', {
                description: error.message
            });
        }
    };

    // Generate titles and descriptions for combinations
    const generateTitlesAndDescriptions = (combinations: SEOCombination[]) => {
        const titleVariations = {
            best: ['Best', 'Top', 'Leading', 'Premier', 'Elite', 'Outstanding'],
            category: ['Podcasts', 'Shows', 'Series', 'Content', 'Programs'],
            period: {
                weekly: ['This Week', 'Weekly', 'Current Week', 'Latest'],
                monthly: ['This Month', 'Monthly', 'Current Month', 'Latest'],
                overall: ['All Time', 'Overall', 'Ever', 'All-Time', 'Historical']
            }
        };

        return combinations.map(combo => {
            const best = titleVariations.best[Math.floor(Math.random() * titleVariations.best.length)];
            const categoryType = titleVariations.category[Math.floor(Math.random() * titleVariations.category.length)];
            const periodType = titleVariations.period[combo.period][Math.floor(Math.random() * titleVariations.period[combo.period].length)];

            let title = `${best} ${combo.type === 'podcasts' ? categoryType : 'Episodes'}`;
            
            if (combo.category) {
                title += ` in ${combo.category}`;
            }
            
            if (combo.language) {
                title += ` in ${combo.language}`;
            }
            
            if (combo.location) {
                title += ` from ${combo.location}`;
            }
            
            title += ` - ${periodType} Rankings`;

            let description = `Discover the ${combo.period === 'overall' ? 'most popular' : 'top performing'} ${combo.type}`;
            
            if (combo.category) {
                description += ` in the ${combo.category} category`;
            }
            
            if (combo.language) {
                description += ` available in ${combo.language}`;
            }
            
            if (combo.location) {
                description += ` from ${combo.location}`;
            }
            
            description += `. Our ${combo.period} rankings are based on real YouTube engagement data including views, likes, and comments. `;
            description += `Find your next favorite ${combo.type === 'podcasts' ? 'show' : 'episode'} with our comprehensive rankings. Updated daily.`;

            return {
                ...combo,
                title,
                description
            };
        });
    };

    // Generate SEO pages
    const handleGenerateSEOPages = async () => {
        setIsGenerating(true);
        setGenerationProgress(0);

        try {
            // Step 1: Fetch content
            setGenerationProgress(10);
            const { categories, languages, locations } = await fetchAllContent();

            if (categories.length === 0 && languages.length === 0 && locations.length === 0) {
                toast.error('No content found to generate SEO pages');
                return;
            }

            // Step 2: Generate combinations
            setGenerationProgress(30);
            const combinations = await generateSEOCombinations(categories, languages, locations);

            // Step 3: Generate titles and descriptions
            setGenerationProgress(60);
            const combinationsWithContent = generateTitlesAndDescriptions(combinations);

            // Step 4: Save combinations
            setGenerationProgress(80);
            setSeoCombinations(combinationsWithContent);
            setLastGenerated(new Date().toISOString());

            // Step 5: Save to API endpoint
            setGenerationProgress(90);
            try {
                const response = await fetch('/api/admin/generate-seo-pages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ combinations: combinationsWithContent })
                });

                if (response.ok) {
                    toast.success('SEO pages generated and saved successfully!');
                } else {
                    toast.warning('SEO pages generated but could not save to file. You can download them manually.');
                }
            } catch (error) {
                toast.warning('SEO pages generated but could not save to file. You can download them manually.');
            }

        } catch (error: any) {
            toastErrorWithCopy('Failed to generate SEO pages', error.message);
        } finally {
            setIsGenerating(false);
            setGenerationProgress(100);
        }
    };

    // Download SEO combinations
    const handleDownloadSEOCombinations = () => {
        if (!seoCombinations.length) {
            toast.error('No SEO combinations to download');
            return;
        }

        const blob = new Blob([JSON.stringify(seoCombinations, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'seo-combinations.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('SEO combinations downloaded successfully!');
    };

    // Preview SEO combinations
    const handlePreviewSEOCombinations = () => {
        if (!seoCombinations.length) {
            toast.error('No SEO combinations to preview');
            return;
        }

        setPreviewData(seoCombinations.slice(0, 20)); // Show first 20
        setShowPreview(true);
    };

    // Download Home SEO combinations
    const handleDownloadHomeSEOCombinations = () => {
        if (!homeSeoCombinations.length) {
            toast.error('No home SEO combinations to download');
            return;
        }

        const blob = new Blob([JSON.stringify(homeSeoCombinations, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'home-seo-combinations.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Home SEO combinations downloaded successfully!');
    };

    // Preview Home SEO combinations
    const handlePreviewHomeSEOCombinations = () => {
        if (!homeSeoCombinations.length) {
            toast.error('No home SEO combinations to preview');
            return;
        }

        setHomePreviewData(homeSeoCombinations.slice(0, 20)); // Show first 20
        setShowHomePreview(true);
    };

    // Get type icon
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'podcasts': return <Podcast className="h-4 w-4" />;
            case 'episodes': return <FileText className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    // Get priority color
    const getPriorityColor = (priority: number) => {
        if (priority >= 0.9) return 'bg-green-100 text-green-800';
        if (priority >= 0.8) return 'bg-blue-100 text-blue-800';
        if (priority >= 0.7) return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                SEO Page Generator
                            </CardTitle>
                            <CardDescription>
                                Generate thousands of SEO-optimized ranking pages automatically
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                {seoCombinations.length} Pages
                            </Badge>
                            {lastGenerated && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(lastGenerated).toLocaleDateString()}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="baseUrl">Base URL</Label>
                            <Input
                                id="baseUrl"
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                                placeholder="https://poddb.pro"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Auto-generate on content changes</Label>
                            <Switch
                                checked={autoGenerate}
                                onCheckedChange={setAutoGenerate}
                            />
                        </div>
                    </div>

                    {/* Progress */}
                    {isGenerating && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Generating SEO pages...</span>
                                <span>{generationProgress}%</span>
                            </div>
                            <Progress value={generationProgress} className="w-full" />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={handleGenerateSEOPages}
                            disabled={isGenerating || isPending}
                            className="flex items-center gap-2"
                        >
                            {isGenerating ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Zap className="h-4 w-4" />
                            )}
                            {isGenerating ? 'Generating...' : 'Generate SEO Pages'}
                        </Button>

                        {seoCombinations.length > 0 && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handlePreviewSEOCombinations}
                                    className="flex items-center gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    Preview
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleDownloadSEOCombinations}
                                    className="flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Home SEO Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Home Page SEO Generator
                    </CardTitle>
                    <CardDescription>
                        Generate thousands of SEO-optimized home page variations to rank for all podcast platform keywords.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Home SEO Status Display */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {homeGenerationStatus === 'generating' ? (
                                <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                            ) : homeGenerationStatus === 'completed' ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : homeGenerationStatus === 'error' ? (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                                <Zap className="h-5 w-5 text-gray-600" />
                            )}
                            <span className={`font-medium ${
                                homeGenerationStatus === 'generating' ? 'text-blue-600' :
                                homeGenerationStatus === 'completed' ? 'text-green-600' :
                                homeGenerationStatus === 'error' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                                {homeGenerationStatus === 'generating' ? 'Generating Home SEO Pages...' :
                                 homeGenerationStatus === 'completed' ? 'Home SEO Pages Generated Successfully!' :
                                 homeGenerationStatus === 'error' ? 'Generation Failed' : 'Ready to Generate'}
                            </span>
                        </div>
                        {homeGenerationStatus === 'completed' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {homeGeneratedCount.toLocaleString()} pages generated
                            </Badge>
                        )}
                    </div>

                    {/* Home SEO Progress Bar */}
                    {homeGenerationStatus === 'generating' && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Generating home SEO combinations...</span>
                                <span>{homeProgress}%</span>
                            </div>
                            <Progress value={homeProgress} className="w-full" />
                        </div>
                    )}

                    {/* Home SEO Error Display */}
                    {homeError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 text-red-800">
                                <AlertCircle className="h-4 w-4" />
                                <span className="font-medium">Error:</span>
                                <span>{homeError}</span>
                            </div>
                        </div>
                    )}

                    {/* Home SEO Coverage Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <div className="text-2xl font-bold text-blue-600">5,000+</div>
                            <div className="text-sm text-blue-600">SEO Pages</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <Globe className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <div className="text-2xl font-bold text-green-600">50+</div>
                            <div className="text-sm text-green-600">Languages</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <Zap className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                            <div className="text-2xl font-bold text-purple-600">100+</div>
                            <div className="text-sm text-purple-600">Categories</div>
                        </div>
                    </div>

                    {/* Home SEO Actions */}
                    <div className="flex flex-wrap gap-2">
                        <Button 
                            onClick={() => startTransition(() => generateHomeSEOPages())}
                            disabled={isPending || homeGenerationStatus === 'generating'}
                            className="flex items-center gap-2"
                        >
                            {homeGenerationStatus === 'generating' ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Zap className="h-4 w-4" />
                            )}
                            {homeGenerationStatus === 'generating' ? 'Generating...' : 'Generate Home SEO Pages'}
                        </Button>

                        {homeSeoCombinations.length > 0 && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handlePreviewHomeSEOCombinations}
                                    className="flex items-center gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    Preview
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleDownloadHomeSEOCombinations}
                                    className="flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Home SEO Benefits */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Home SEO Benefits:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Rank for &quot;Biggest Podcast Database&quot; and similar keywords</li>
                            <li>• Target &quot;IMDB for Podcasts&quot; and platform-specific searches</li>
                            <li>• Cover all languages and locations worldwide</li>
                            <li>• Generate category-specific landing pages</li>
                            <li>• Improve Google presence with thousands of pages</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Combined Statistics */}
            {(seoCombinations.length > 0 || homeGeneratedCount > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium">Total SEO Pages</p>
                                    <p className="text-2xl font-bold">
                                        {(seoCombinations.length + homeGeneratedCount).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {seoCombinations.length} ranking + {homeGeneratedCount} home
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium">Categories</p>
                                    <p className="text-2xl font-bold">100+</p>
                                    <p className="text-xs text-muted-foreground">All podcast categories</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-purple-500" />
                                <div>
                                    <p className="text-sm font-medium">Languages</p>
                                    <p className="text-2xl font-bold">50+</p>
                                    <p className="text-xs text-muted-foreground">Global coverage</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-orange-500" />
                                <div>
                                    <p className="text-sm font-medium">Locations</p>
                                    <p className="text-2xl font-bold">60+</p>
                                    <p className="text-xs text-muted-foreground">Worldwide coverage</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Preview Dialog */}
            {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Ranking SEO Pages Preview</h3>
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
                                                    {getTypeIcon(combo.type)}
                                                    <Badge className={getPriorityColor(combo.priority)}>
                                                        Priority {combo.priority}
                                                    </Badge>
                                                </div>
                                                <h4 className="font-semibold mb-1">{combo.title}</h4>
                                                <p className="text-sm text-gray-600 mb-2">{combo.description}</p>
                                                <p className="text-xs text-gray-500">{baseUrl}{combo.url}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Home SEO Preview Dialog */}
            {showHomePreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Home SEO Pages Preview</h3>
                            <Button variant="outline" onClick={() => setShowHomePreview(false)}>
                                Close
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {homePreviewData.map((combo, index) => (
                                <Card key={index}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Globe className="h-4 w-4" />
                                                    <Badge className={getPriorityColor(combo.priority)}>
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

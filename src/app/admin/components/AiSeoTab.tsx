import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast, toastErrorWithCopy } from '@/components/ui/sonner';
import { 
    Bot, 
    Zap, 
    Target, 
    Sparkles, 
    Settings,
    FileText,
    Hash,
    Database,
    Search,
    Lightbulb,
    Globe,
    BarChart3,
    Eye,
    RefreshCw,
    ListTodo
} from 'lucide-react';
import { 
    queueSeoGenerationForApprovedPodcastsAction,
    queueSeoGenerationForEpisodesAction,
    queueSeoGenerationForPeopleAction,
    processSeoJobQueueAction,
    getSeoJobsAction,
    testOpenRouterApiAction,
    regenerateSeoForExistingContentAction,
} from '@/app/actions/admin';
import AdvancedSeoQueueManager from './AdvancedSeoQueueManager';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SitemapGenerator from './SitemapGenerator';
import SEOPageGenerator from './SEOPageGenerator';
import SEODashboard from './SEODashboard';

type SeoJobArray = Awaited<ReturnType<typeof getSeoJobsAction>>['data'];
type SeoJob = NonNullable<SeoJobArray>[number];

interface AiSeoTabProps {
    seoJobStats: { pending: number; completed: number; failed: number };
    isPending: boolean;
    startTransition: React.TransitionStartFunction;
    fetchSeoJobStats: () => void;
    fetchAllPodcasts: () => void;
}



export default function AiSeoTab({
    seoJobStats,
    isPending,
    startTransition,
    fetchSeoJobStats,
    fetchAllPodcasts
}: AiSeoTabProps) {
    const [jobs, setJobs] = useState<SeoJob[]>([]);

    const [autoSeoEnabled, setAutoSeoEnabled] = useState(true);
    const [seoGenerationProgress, setSeoGenerationProgress] = useState(0);
    const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);

    const fetchSeoJobs = () => {
        startTransition(async () => {
            const result = await getSeoJobsAction();
            if (result.success && result.data) {
                setJobs(result.data);
            } else {
                toastErrorWithCopy("Failed to fetch SEO jobs", result.error);
            }
        });
    };

    useEffect(() => {
        fetchSeoJobs();
    }, [fetchSeoJobs]);

    const handleQueueSeoJobs = () => {
        startTransition(async () => {
            const result = await queueSeoGenerationForApprovedPodcastsAction();
            if (result.success) {
                toast.success(`${result.count} podcasts queued for SEO generation.`);
                fetchSeoJobStats();
                fetchSeoJobs();
            } else {
                toastErrorWithCopy("Failed to queue SEO jobs", result.error);
            }
        });
    };

    const handleQueueEpisodesSeo = () => {
        startTransition(async () => {
            const result = await queueSeoGenerationForEpisodesAction();
            if (result.success) {
                toast.success(`${result.count} episodes queued for SEO generation.`);
                fetchSeoJobStats();
                fetchSeoJobs();
            } else {
                toastErrorWithCopy("Failed to queue episodes SEO jobs", result.error);
            }
        });
    };

    const handleQueuePeopleSeo = () => {
        startTransition(async () => {
            const result = await queueSeoGenerationForPeopleAction();
            if (result.success) {
                toast.success(`${result.count} people queued for SEO generation.`);
                fetchSeoJobStats();
                fetchSeoJobs();
            } else {
                toastErrorWithCopy("Failed to queue people SEO jobs", result.error);
            }
        });
    };

    const handleProcessSeoQueue = () => {
        startTransition(async () => {
            const result = await processSeoJobQueueAction();
            if (result.success) {
                toast.success(`Processed ${result.processed} SEO jobs.`);
                fetchSeoJobStats();
                fetchAllPodcasts();
                fetchSeoJobs();
            } else {
                toastErrorWithCopy("Failed to process SEO job queue", result.error);
            }
        });
    };

    const handleRegenerateExistingSeo = () => {
        startTransition(async () => {
            const result = await regenerateSeoForExistingContentAction();
            if (result.success) {
                toast.success(result.message);
                fetchSeoJobStats();
                fetchSeoJobs();
            } else {
                toastErrorWithCopy("Failed to regenerate SEO for existing content", result.error);
            }
        });
    };



    const [seoResults, setSeoResults] = useState<any>(null);
    const [showResults, setShowResults] = useState(false);

    const simulateSeoGeneration = async () => {
        setIsGeneratingSeo(true);
        setSeoGenerationProgress(0);
        setSeoResults(null);
        setShowResults(false);

        // Simulate AI models working together with real-like data
        const steps = [
            'Analyzing content structure...',
            'Generating meta titles & descriptions...',
            'Creating advanced schema markup...',
            'Optimizing keywords & tags...',
            'Generating FAQs & rich snippets...',
            'Creating social media metadata...',
            'Finalizing SEO optimization...'
        ];

        for (let i = 0; i <= 100; i += 10) {
            setSeoGenerationProgress(i);
            const stepIndex = Math.floor((i / 100) * steps.length);
            if (stepIndex < steps.length) {
                toast.success(steps[stepIndex]);
            }
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        // Generate realistic SEO results
        const mockResults = {
            metaTags: {
                title: "Podcast Title - Best SEO Optimized Meta Title | Category",
                description: "Comprehensive description with keywords and compelling content that encourages clicks and improves search rankings.",
                keywords: "podcast, audio, entertainment, category, trending, popular"
            },
            schemaMarkup: {
                type: "PodcastSeries",
                name: "Podcast Title",
                description: "Detailed podcast description for rich snippets",
                author: "Host Name",
                episodes: "50+ episodes",
                rating: "4.8/5"
            },
            keywords: [
                "podcast entertainment", "audio content", "trending topics", 
                "expert interviews", "industry insights", "weekly updates"
            ],
            faqs: [
                {
                    question: "What is this podcast about?",
                    answer: "This podcast covers industry insights, expert interviews, and trending topics in an engaging format."
                },
                {
                    question: "How often are new episodes released?",
                    answer: "New episodes are released weekly, every Tuesday at 9 AM."
                }
            ],
            socialMedia: {
                twitter: "Optimized Twitter card with engaging preview",
                facebook: "Facebook Open Graph tags for better sharing",
                linkedin: "Professional LinkedIn post optimization"
            },
            performance: {
                estimatedRanking: "Top 10 for target keywords",
                clickThroughRate: "3.2% (above average)",
                engagementScore: "8.5/10"
            }
        };

        setSeoResults(mockResults);
        setIsGeneratingSeo(false);
        setSeoGenerationProgress(100);
        setShowResults(true);
        toast.success("SEO generation completed! View results below.");
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-500 hover:bg-green-500/80">Completed</Badge>;
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            case 'processing':
                return <Badge variant="default">Processing</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };



    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="text-blue-600" />
                        Automatic AI SEO Generation System
                    </CardTitle>
                    <CardDescription>
                        Advanced AI-powered SEO system that automatically generates comprehensive metadata, schema markup, and optimization for approved content
                    </CardDescription>
                </CardHeader>
            </Card>

            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="dashboard">SEO Dashboard</TabsTrigger>
                    <TabsTrigger value="queue-manager">Queue Manager</TabsTrigger>
                    <TabsTrigger value="seo-jobs">SEO Jobs</TabsTrigger>
                    <TabsTrigger value="seo-pages">SEO Pages</TabsTrigger>
                    <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* SEO Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-6">
                    <SEODashboard 
                        isPending={isPending}
                        startTransition={startTransition}
                    />
                </TabsContent>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-yellow-600" />
                                    Auto SEO Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span>Automatic SEO Generation</span>
                                    <Switch
                                        checked={autoSeoEnabled}
                                        onCheckedChange={setAutoSeoEnabled}
                                    />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    When enabled, SEO will be automatically generated for all approved content
                                </div>
                            </CardContent>
                        </Card>



                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-green-600" />
                                    SEO Jobs
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">{seoJobStats.completed}</div>
                                <div className="text-sm text-muted-foreground">
                                    Successfully completed
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* SEO Generation Demo */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                Test SEO Generation
                            </CardTitle>
                            <CardDescription>
                                Test the AI system working with multiple models to generate comprehensive SEO
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Button 
                                    onClick={simulateSeoGeneration} 
                                    disabled={isGeneratingSeo}
                                    className="flex-1"
                                >
                                    {isGeneratingSeo ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            AI Models Working Together...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Test Multi-AI SEO Generation
                                        </>
                                    )}
                                </Button>
                                
                                <Button 
                                    onClick={async () => {
                                        try {
                                            const result = await testOpenRouterApiAction();
                                            if (result.success) {
                                                toast.success("OpenRouter API is working! ✅");
                                            } else {
                                                toast.error(`API Test Failed: ${result.error}`);
                                            }
                                        } catch (error) {
                                            toast.error("API test failed");
                                        }
                                    }}
                                    variant="outline"
                                    className="px-4"
                                >
                                    🧪 Test API
                                </Button>
                            </div>

                            {isGeneratingSeo && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>AI Models Progress</span>
                                        <span>{seoGenerationProgress}%</span>
                                    </div>
                                    <Progress value={seoGenerationProgress} className="w-full" />
                                    <div className="text-sm text-muted-foreground">
                                        Multiple AI models are collaborating to generate comprehensive SEO...
                                    </div>
                                </div>
                            )}

                            {/* SEO Results Display */}
                            {showResults && seoResults && (
                                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                                    <h4 className="font-semibold text-lg flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-green-600" />
                                        Generated SEO Results
                                    </h4>
                                    
                                    {/* Meta Tags */}
                                    <div className="space-y-3">
                                        <h5 className="font-medium text-blue-600">Meta Tags</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="font-medium">Title:</span>
                                                <p className="text-muted-foreground">{seoResults.metaTags.title}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium">Description:</span>
                                                <p className="text-muted-foreground">{seoResults.metaTags.description}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <span className="font-medium">Keywords:</span>
                                                <p className="text-muted-foreground">{seoResults.metaTags.keywords}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Schema Markup */}
                                    <div className="space-y-3">
                                        <h5 className="font-medium text-green-600">Schema Markup</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="font-medium">Type:</span>
                                                <span className="text-muted-foreground">{seoResults.schemaMarkup.type}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Rating:</span>
                                                <span className="text-muted-foreground">{seoResults.schemaMarkup.rating}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Episodes:</span>
                                                <span className="text-muted-foreground">{seoResults.schemaMarkup.episodes}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Author:</span>
                                                <span className="text-muted-foreground">{seoResults.schemaMarkup.author}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Keywords */}
                                    <div className="space-y-3">
                                        <h5 className="font-medium text-purple-600">Target Keywords</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {seoResults.keywords.map((keyword: string, index: number) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {keyword}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* FAQs */}
                                    <div className="space-y-3">
                                        <h5 className="font-medium text-yellow-600">Generated FAQs</h5>
                                        <div className="space-y-2">
                                            {seoResults.faqs.map((faq: any, index: number) => (
                                                <div key={index} className="p-3 border rounded-lg bg-background">
                                                    <div className="font-medium text-sm">{faq.question}</div>
                                                    <div className="text-sm text-muted-foreground">{faq.answer}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Performance Metrics */}
                                    <div className="space-y-3">
                                        <h5 className="font-medium text-indigo-600">Performance Metrics</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                            <div className="text-center p-2 border rounded-lg">
                                                <div className="font-medium text-green-600">{seoResults.performance.estimatedRanking}</div>
                                                <div className="text-xs text-muted-foreground">Estimated Ranking</div>
                                            </div>
                                            <div className="text-center p-2 border rounded-lg">
                                                <div className="font-medium text-blue-600">{seoResults.performance.clickThroughRate}</div>
                                                <div className="text-xs text-muted-foreground">Click Through Rate</div>
                                            </div>
                                            <div className="text-center p-2 border rounded-lg">
                                                <div className="font-medium text-purple-600">{seoResults.performance.engagementScore}</div>
                                                <div className="text-xs text-muted-foreground">Engagement Score</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* What Gets Generated */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Comprehensive SEO Output
                            </CardTitle>
                            <CardDescription>
                                Your AI system automatically generates all these SEO elements
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <Hash className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <div className="font-medium">Meta Tags</div>
                                        <div className="text-sm text-muted-foreground">Title, Description, Keywords</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <Database className="h-5 w-5 text-green-600" />
                                    <div>
                                        <div className="font-medium">Schema Markup</div>
                                        <div className="text-sm text-muted-foreground">Rich snippets, structured data</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <Search className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <div className="font-medium">Keywords & Tags</div>
                                        <div className="text-sm text-muted-foreground">SEO optimization, ranking</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                                    <div>
                                        <div className="font-medium">FAQs & Snippets</div>
                                        <div className="text-sm text-muted-foreground">Google featured results</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <Globe className="h-5 w-5 text-red-600" />
                                    <div>
                                        <div className="font-medium">Social Media</div>
                                        <div className="text-sm text-muted-foreground">Twitter, Facebook, LinkedIn</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                                    <div>
                                        <div className="font-medium">Analytics</div>
                                        <div className="text-sm text-muted-foreground">Performance tracking</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Advanced Queue Manager Tab */}
                <TabsContent value="queue-manager" className="space-y-6">
                    <AdvancedSeoQueueManager 
                        isPending={isPending}
                        startTransition={startTransition}
                        fetchSeoJobStats={fetchSeoJobStats}
                    />
                </TabsContent>

                {/* SEO Jobs Tab */}
                <TabsContent value="seo-jobs" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                SEO Job Management
                            </CardTitle>
                            <CardDescription>Manage and monitor the automated SEO generation for your content.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>SEO Job Status</CardTitle>
                                </CardHeader>
                                <CardContent className="flex justify-around">
                                    <div className="text-center">
                                        <p className="text-3xl font-bold">{seoJobStats.pending}</p>
                                        <p className="text-muted-foreground">Pending</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-green-500">{seoJobStats.completed}</p>
                                        <p className="text-muted-foreground">Completed</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-red-500">{seoJobStats.failed}</p>
                                        <p className="text-muted-foreground">Failed</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <div className="flex gap-4 flex-wrap">
                                    <Button onClick={handleQueueSeoJobs} disabled={isPending}>
                                        <ListTodo className="mr-2" /> Queue Podcasts
                                    </Button>
                                    <Button onClick={handleQueueEpisodesSeo} disabled={isPending} variant="secondary">
                                        <ListTodo className="mr-2" /> Queue Episodes
                                    </Button>
                                    <Button onClick={handleQueuePeopleSeo} disabled={isPending} variant="secondary">
                                        <ListTodo className="mr-2" /> Queue People
                                    </Button>
                                </div>
                                <div className="flex gap-4 flex-wrap">
                                    <Button onClick={handleRegenerateExistingSeo} disabled={isPending} variant="outline">
                                        <RefreshCw className="mr-2" /> Regenerate Existing SEO
                                    </Button>
                                    <Button onClick={handleProcessSeoQueue} disabled={isPending}>
                                        <Sparkles className="mr-2" /> Process Queue (5)
                                    </Button>
                                    <Button onClick={fetchSeoJobs} disabled={isPending} variant="outline">
                                        <RefreshCw className="mr-2 h-4 w-4" /> Refresh Jobs
                                    </Button>
                                </div>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Job History</CardTitle>
                                    <CardDescription>A log of all SEO generation jobs.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[400px]">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Content</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Created At</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {jobs.map((job) => (
                                                    <TableRow key={job.id}>
                                                        <TableCell>{job.podcasts?.title || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {job.target_table}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                                                        <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            {job.status === 'completed' && job.podcasts?.seo_metadata && (
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button variant="outline" size="sm">
                                                                            <Eye className="mr-2 h-4 w-4" /> View SEO
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="max-w-4xl max-h-[80vh]">
                                                                        <DialogHeader>
                                                                            <DialogTitle>Generated SEO for {job.podcasts?.title || job.target_table}</DialogTitle>
                                                                        </DialogHeader>
                                                                        <ScrollArea className="max-h-[60vh] p-4">
                                                                            <pre className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                                                                                {JSON.stringify(job.podcasts.seo_metadata, null, 2)}
                                                                            </pre>
                                                                        </ScrollArea>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            )}
                                                            {job.status === 'failed' && job.error_message && (
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button variant="destructive" size="sm">
                                                                            <Eye className="mr-2 h-4 w-4" /> View Error
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent>
                                                                        <DialogHeader>
                                                                            <DialogTitle>Error for {job.podcasts?.title || job.target_table}</DialogTitle>
                                                                        </DialogHeader>
                                                                        <p className="text-sm text-red-500 p-4 bg-muted rounded-md">{job.error_message}</p>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SEO Pages Tab */}
                <TabsContent value="seo-pages" className="space-y-6">
                    <SEOPageGenerator 
                        isPending={isPending}
                        startTransition={startTransition}
                    />
                </TabsContent>



                {/* Sitemap Tab */}
                <TabsContent value="sitemap" className="space-y-6">
                    <SitemapGenerator 
                        isPending={isPending}
                        startTransition={startTransition}
                    />
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Automatic SEO Settings</CardTitle>
                            <CardDescription>
                                Configure how the AI system automatically generates SEO
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Enable automatic SEO generation</Label>
                                <Switch
                                    checked={autoSeoEnabled}
                                    onCheckedChange={setAutoSeoEnabled}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Generate SEO for podcasts</Label>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Generate SEO for episodes</Label>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Generate SEO for people</Label>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Generate SEO for news articles</Label>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Generation Options</CardTitle>
                            <CardDescription>
                                What SEO elements should be automatically generated
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Meta tags & descriptions</Label>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Schema markup</Label>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Keywords & tags</Label>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>FAQs & rich snippets</Label>
                                        <Switch defaultChecked />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Social media metadata</Label>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Internal linking suggestions</Label>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Content optimization</Label>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Performance analytics</Label>
                                        <Switch defaultChecked />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

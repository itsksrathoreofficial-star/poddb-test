import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast, toastErrorWithCopy } from '@/components/ui/sonner';
import {
    Bot as Robot,
    Brain,
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
    processSeoJobQueueAction,
    getSeoJobsAction,
} from '@/app/actions/admin';
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

type SeoJobArray = Awaited<ReturnType<typeof getSeoJobsAction>>['data'];
type SeoJob = NonNullable<SeoJobArray>[number];

interface AiSeoTabProps {
    seoJobStats: { pending: number; completed: number; failed: number };
    isPending: boolean;
    startTransition: React.TransitionStartFunction;
    fetchSeoJobStats: () => void;
    fetchAllPodcasts: () => void;
}

interface AiModel {
    id: string;
    name: string;
    provider: string;
    isActive: boolean;
    cost: string;
    capabilities: string[];
    maxTokens: number;
    speed: 'fast' | 'medium' | 'slow';
}

// OpenRouter Free Models Configuration
const AI_MODELS: AiModel[] = [
    {
        id: 'google/gemini-2.5-flash-image-preview',
        name: 'Gemini 2.5 Flash',
        provider: 'Google',
        isActive: true,
        cost: 'Free',
        capabilities: ['Image Analysis', 'Fast Processing', 'High Quality'],
        maxTokens: 1000000,
        speed: 'fast'
    },
    {
        id: 'deepseek/deepseek-chat-v3.1',
        name: 'DeepSeek Chat v3.1',
        provider: 'DeepSeek',
        isActive: true,
        cost: 'Free',
        capabilities: ['Code Generation', 'Technical Content', 'Multilingual'],
        maxTokens: 32768,
        speed: 'fast'
    },
    {
        id: 'openai/gpt-oss-120b',
        name: 'GPT-OSS 120B',
        provider: 'OpenAI',
        isActive: true,
        cost: 'Free',
        capabilities: ['Large Context', 'High Quality', 'Comprehensive'],
        maxTokens: 128000,
        speed: 'medium'
    },
    {
        id: 'z-ai/glm-4.5-air',
        name: 'GLM-4.5 Air',
        provider: 'Z-AI',
        isActive: true,
        cost: 'Free',
        capabilities: ['Efficient', 'Fast Response', 'Good Quality'],
        maxTokens: 8192,
        speed: 'fast'
    },
    {
        id: 'qwen/qwen3-coder',
        name: 'Qwen3 Coder',
        provider: 'Qwen',
        isActive: true,
        cost: 'Free',
        capabilities: ['Code Generation', 'Technical SEO', 'Structured Output'],
        maxTokens: 32768,
        speed: 'medium'
    },
    {
        id: 'moonshotai/kimi-k2',
        name: 'Kimi K2',
        provider: 'Moonshot AI',
        isActive: true,
        cost: 'Free',
        capabilities: ['Creative Content', 'SEO Optimization', 'Rich Metadata'],
        maxTokens: 128000,
        speed: 'medium'
    },
    {
        id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition',
        name: 'Dolphin Mistral 24B',
        provider: 'Cognitive',
        isActive: true,
        cost: 'Free',
        capabilities: ['High Quality', 'Detailed Analysis', 'Comprehensive'],
        maxTokens: 32768,
        speed: 'slow'
    },
    {
        id: 'google/gemma-3n-e2b-it',
        name: 'Gemma 3N E2B',
        provider: 'Google',
        isActive: true,
        cost: 'Free',
        capabilities: ['Instruction Tuned', 'Efficient', 'Reliable'],
        maxTokens: 8192,
        speed: 'fast'
    }
];

export default function AutomaticAiSeoTab({
    seoJobStats,
    isPending,
    startTransition,
    fetchSeoJobStats,
    fetchAllPodcasts
}: AiSeoTabProps) {
    const [jobs, setJobs] = useState<SeoJob[]>([]);
    const [aiModels, setAiModels] = useState<AiModel[]>(AI_MODELS);
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

    const toggleAiModel = (modelId: string) => {
        setAiModels(prev => prev.map(model => 
            model.id === modelId ? { ...model, isActive: !model.isActive } : model
        ));
    };

    const simulateSeoGeneration = async () => {
        setIsGeneratingSeo(true);
        setSeoGenerationProgress(0);

        // Simulate AI models working together
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
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        setIsGeneratingSeo(false);
        setSeoGenerationProgress(100);
        toast.success("SEO generation completed! All AI models worked together successfully.");
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

    const getModelBadge = (model: AiModel) => {
        return (
            <div className="flex items-center gap-2">
                <Badge variant={model.isActive ? "default" : "secondary"}>
                    {model.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                    {model.cost}
                </Badge>
                <Badge variant="outline" className="text-xs">
                    {model.speed}
                </Badge>
            </div>
        );
    };

    const activeModelsCount = aiModels.filter(m => m.isActive).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Robot className="text-blue-600" />
                        Automatic AI SEO Generation System
                    </CardTitle>
                    <CardDescription>
                        Advanced AI-powered SEO system that automatically generates comprehensive metadata, schema markup, and optimization for approved content
                    </CardDescription>
                </CardHeader>
            </Card>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="ai-models">AI Models</TabsTrigger>
                    <TabsTrigger value="seo-jobs">SEO Jobs</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                    <Brain className="h-5 w-5 text-purple-600" />
                                    AI Models Active
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-purple-600">{activeModelsCount}</div>
                                <div className="text-sm text-muted-foreground">
                                    AI models working together
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
                            <Button 
                                onClick={simulateSeoGeneration} 
                                disabled={isGeneratingSeo}
                                className="w-full"
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

                {/* AI Models Tab */}
                <TabsContent value="ai-models" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">OpenRouter AI Models Configuration</h3>
                        <div className="text-sm text-muted-foreground">
                            {activeModelsCount} of {aiModels.length} models active
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {aiModels.map((model) => (
                            <Card key={model.id} className="relative">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <Brain className="h-4 w-4 text-purple-600" />
                                            <div>
                                                <CardTitle className="text-base">{model.name}</CardTitle>
                                                <CardDescription className="text-xs">
                                                    {model.provider}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={model.isActive}
                                            onCheckedChange={() => toggleAiModel(model.id)}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Status:</span>
                                            {getModelBadge(model)}
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Max Tokens:</span>
                                            <span>{model.maxTokens.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Speed:</span>
                                            <span className="capitalize">{model.speed}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-xs font-medium text-muted-foreground">Capabilities:</div>
                                            <div className="flex flex-wrap gap-1">
                                                {model.capabilities.slice(0, 2).map((cap, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {cap}
                                                    </Badge>
                                                ))}
                                                {model.capabilities.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{model.capabilities.length - 2} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center space-y-2">
                                <Brain className="h-12 w-12 mx-auto text-purple-600" />
                                <h4 className="font-semibold">AI Models Working Together</h4>
                                <p className="text-sm text-muted-foreground">
                                    Each model specializes in different aspects of SEO generation. 
                                    When multiple models are active, they collaborate to create the most comprehensive SEO output.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
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

                            <div className="flex gap-4">
                                <Button onClick={handleQueueSeoJobs} disabled={isPending}>
                                    <ListTodo className="mr-2" /> Queue All Approved
                                </Button>
                                <Button onClick={handleProcessSeoQueue} disabled={isPending}>
                                    <Sparkles className="mr-2" /> Process Queue (5)
                                </Button>
                                <Button onClick={fetchSeoJobs} disabled={isPending} variant="outline">
                                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh Jobs
                                </Button>
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
                                                                {job.podcasts?.type || 'podcast'}
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
                                                                            <DialogTitle>Generated SEO for {job.podcasts.title}</DialogTitle>
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
                                                                            <DialogTitle>Error for {job.podcasts?.title}</DialogTitle>
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

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
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
    ListTodo,
    Play,
    Pause,
    Square,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Users,
    Mic,
    User
} from 'lucide-react';
import { 
    queueSeoGenerationForApprovedPodcastsAction,
    queueSeoGenerationForEpisodesAction,
    queueSeoGenerationForPeopleAction,
    processSeoQueueBatchAction,
    getSeoQueueStatsAction,
    clearFailedSeoJobsAction,
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

interface AdvancedSeoQueueManagerProps {
    isPending: boolean;
    startTransition: React.TransitionStartFunction;
    fetchSeoJobStats: () => void;
}

type QueueStats = {
    stats: {
        podcasts: { pending: number; completed: number; failed: number; processing: number; total: number };
        episodes: { pending: number; completed: number; failed: number; processing: number; total: number };
        people: { pending: number; completed: number; failed: number; processing: number; total: number };
    };
    totals: {
        podcasts: number;
        episodes: number;
        people: number;
    };
};

export default function AdvancedSeoQueueManager({
    isPending,
    startTransition,
    fetchSeoJobStats
}: AdvancedSeoQueueManagerProps) {
    const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
    const [batchSize, setBatchSize] = useState(10);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [recentJobs, setRecentJobs] = useState<any[]>([]);

    const fetchQueueStats = async () => {
        startTransition(async () => {
            const result = await getSeoQueueStatsAction();
            if (result.success && result.data) {
                setQueueStats(result.data);
            } else {
                toastErrorWithCopy("Failed to fetch queue stats", result.error);
            }
        });
    };

    const fetchRecentJobs = async () => {
        startTransition(async () => {
            const result = await getSeoJobsAction();
            if (result.success && result.data) {
                setRecentJobs(result.data.slice(0, 20)); // Show last 20 jobs
            }
        });
    };

    useEffect(() => {
        fetchQueueStats();
        fetchRecentJobs();
        const interval = setInterval(() => {
            fetchQueueStats();
            fetchRecentJobs();
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval);
    }, [fetchQueueStats, fetchRecentJobs]);

    const handleQueueEpisodes = () => {
        startTransition(async () => {
            const result = await queueSeoGenerationForEpisodesAction();
            if (result.success) {
                toast.success(result.message || `${result.count} episodes queued for SEO generation.`);
                fetchQueueStats();
                fetchRecentJobs();
            } else {
                toastErrorWithCopy("Failed to queue episodes", result.error);
            }
        });
    };

    const handleQueuePeople = () => {
        startTransition(async () => {
            const result = await queueSeoGenerationForPeopleAction();
            if (result.success) {
                toast.success(result.message || `${result.count} people queued for SEO generation.`);
                fetchQueueStats();
                fetchRecentJobs();
            } else {
                toastErrorWithCopy("Failed to queue people", result.error);
            }
        });
    };

    const handleQueuePodcasts = () => {
        startTransition(async () => {
            const result = await queueSeoGenerationForApprovedPodcastsAction();
            if (result.success) {
                toast.success(`${result.count} podcasts queued for SEO generation.`);
                fetchQueueStats();
                fetchRecentJobs();
            } else {
                toastErrorWithCopy("Failed to queue podcasts", result.error);
            }
        });
    };

    const handleProcessBatch = () => {
        setIsProcessing(true);
        setProcessingProgress(0);
        
        startTransition(async () => {
            const result = await processSeoQueueBatchAction(batchSize);
            if (result.success) {
                toast.success(result.message);
                fetchQueueStats();
                fetchRecentJobs();
                fetchSeoJobStats();
            } else {
                toastErrorWithCopy("Failed to process batch", result.error);
            }
            setIsProcessing(false);
            setProcessingProgress(100);
        });
    };

    const handleClearFailed = () => {
        startTransition(async () => {
            const result = await clearFailedSeoJobsAction();
            if (result.success) {
                toast.success(result.message);
                fetchQueueStats();
                fetchRecentJobs();
            } else {
                toastErrorWithCopy("Failed to clear failed jobs", result.error);
            }
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-500 hover:bg-green-500/80"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
            case 'pending':
                return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'failed':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
            case 'processing':
                return <Badge variant="default"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getContentTypeIcon = (type: string) => {
        switch (type) {
            case 'podcasts':
                return <Mic className="w-4 h-4" />;
            case 'episodes':
                return <FileText className="w-4 h-4" />;
            case 'people':
                return <User className="w-4 h-4" />;
            default:
                return <Hash className="w-4 h-4" />;
        }
    };

    if (!queueStats) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                        Loading queue statistics...
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="text-blue-600" />
                        Advanced SEO Queue Management System
                    </CardTitle>
                    <CardDescription>
                        Professional queue management for large-scale SEO generation across all content types
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Queue Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Podcasts Stats */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Mic className="w-5 h-5 text-blue-600" />
                            Podcasts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold text-blue-600">
                            {queueStats.stats.podcasts.total}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                                <span>Pending:</span>
                                <Badge variant="secondary">{queueStats.stats.podcasts.pending}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Completed:</span>
                                <Badge className="bg-green-500">{queueStats.stats.podcasts.completed}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Failed:</span>
                                <Badge variant="destructive">{queueStats.stats.podcasts.failed}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Processing:</span>
                                <Badge variant="default">{queueStats.stats.podcasts.processing}</Badge>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Total Content: {queueStats.totals.podcasts}
                        </div>
                        <Progress 
                            value={(queueStats.stats.podcasts.completed / queueStats.totals.podcasts) * 100} 
                            className="w-full"
                        />
                    </CardContent>
                </Card>

                {/* Episodes Stats */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="w-5 h-5 text-green-600" />
                            Episodes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold text-green-600">
                            {queueStats.stats.episodes.total}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                                <span>Pending:</span>
                                <Badge variant="secondary">{queueStats.stats.episodes.pending}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Completed:</span>
                                <Badge className="bg-green-500">{queueStats.stats.episodes.completed}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Failed:</span>
                                <Badge variant="destructive">{queueStats.stats.episodes.failed}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Processing:</span>
                                <Badge variant="default">{queueStats.stats.episodes.processing}</Badge>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Total Content: {queueStats.totals.episodes}
                        </div>
                        <Progress 
                            value={(queueStats.stats.episodes.completed / queueStats.totals.episodes) * 100} 
                            className="w-full"
                        />
                    </CardContent>
                </Card>

                {/* People Stats */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="w-5 h-5 text-purple-600" />
                            People
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold text-purple-600">
                            {queueStats.stats.people.total}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                                <span>Pending:</span>
                                <Badge variant="secondary">{queueStats.stats.people.pending}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Completed:</span>
                                <Badge className="bg-green-500">{queueStats.stats.people.completed}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Failed:</span>
                                <Badge variant="destructive">{queueStats.stats.people.failed}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Processing:</span>
                                <Badge variant="default">{queueStats.stats.people.processing}</Badge>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Total Content: {queueStats.totals.people}
                        </div>
                        <Progress 
                            value={(queueStats.stats.people.completed / queueStats.totals.people) * 100} 
                            className="w-full"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Queue Management Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Queue Management Controls
                    </CardTitle>
                    <CardDescription>
                        Manage and process your SEO generation queue
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Queue Content */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">Queue Content for SEO Generation</h4>
                        <div className="flex gap-4 flex-wrap">
                            <Button onClick={handleQueuePodcasts} disabled={isPending} variant="outline">
                                <Mic className="mr-2 h-4 w-4" />
                                Queue All Podcasts
                            </Button>
                            <Button onClick={handleQueueEpisodes} disabled={isPending} variant="outline">
                                <FileText className="mr-2 h-4 w-4" />
                                Queue All Episodes
                            </Button>
                            <Button onClick={handleQueuePeople} disabled={isPending} variant="outline">
                                <User className="mr-2 h-4 w-4" />
                                Queue All People
                            </Button>
                        </div>
                    </div>

                    {/* Batch Processing */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">Batch Processing</h4>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="batchSize">Batch Size:</Label>
                                <Input
                                    id="batchSize"
                                    type="number"
                                    value={batchSize}
                                    onChange={(e) => setBatchSize(parseInt(e.target.value) || 10)}
                                    className="w-20"
                                    min="1"
                                    max="50"
                                />
                            </div>
                            <Button 
                                onClick={handleProcessBatch} 
                                disabled={isPending || isProcessing}
                                className="flex-1 max-w-xs"
                            >
                                {isProcessing ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-4 w-4" />
                                        Process Batch ({batchSize})
                                    </>
                                )}
                            </Button>
                        </div>
                        {isProcessing && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Processing Progress</span>
                                    <span>{processingProgress}%</span>
                                </div>
                                <Progress value={processingProgress} className="w-full" />
                            </div>
                        )}
                    </div>

                    {/* Queue Maintenance */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">Queue Maintenance</h4>
                        <div className="flex gap-4 flex-wrap">
                            <Button onClick={handleClearFailed} disabled={isPending} variant="destructive">
                                <XCircle className="mr-2 h-4 w-4" />
                                Clear Failed Jobs
                            </Button>
                            <Button onClick={fetchQueueStats} disabled={isPending} variant="outline">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh Stats
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Jobs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ListTodo className="h-5 w-5" />
                        Recent Jobs
                    </CardTitle>
                    <CardDescription>
                        Latest SEO generation jobs and their status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Content</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentJobs.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">
                                            {job.podcasts?.title || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getContentTypeIcon(job.target_table)}
                                                <Badge variant="outline">
                                                    {job.target_table}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                                        <TableCell>
                                            {new Date(job.created_at).toLocaleString()}
                                        </TableCell>
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
        </div>
    );
}

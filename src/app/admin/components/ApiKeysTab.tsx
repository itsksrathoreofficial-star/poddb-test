
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast, toastErrorWithCopy } from '@/components/ui/sonner';
import { Key, Save, Loader2, ExternalLink } from 'lucide-react';
import { 
    saveApiKeyAction, 
    deleteApiKeyAction, 
    toggleApiKeyAction, 
    resetApiKeyQuotasAction,
    saveGeminiApiKeyAction,
    deleteGeminiApiKeyAction,
    toggleGeminiApiKeyAction,
    resetGeminiApiKeyQuotasAction,
    saveOpenRouterApiKeyAction,
    deleteOpenRouterApiKeyAction,
    toggleOpenRouterApiKeyAction,
    resetOpenRouterApiKeyQuotasAction
} from '@/app/actions/admin';
import type { Tables } from '@/integrations/supabase/types';

type ApiKey = Tables<'youtube_api_keys'>;
type GeminiApiKey = Tables<'gemini_api_keys'>;
type OpenRouterApiKey = any; // Table type not available

interface ApiKeysTabProps {
    apiKeys: ApiKey[];
    geminiApiKeys: GeminiApiKey[];
    openRouterApiKeys: OpenRouterApiKey[];
    isPending: boolean;
    startTransition: React.TransitionStartFunction;
    refetchApiKeys: () => void;
    refetchGeminiApiKeys: () => void;
    refetchOpenRouterApiKeys: () => void;
}

export default function ApiKeysTab({
    apiKeys,
    geminiApiKeys,
    openRouterApiKeys,
    isPending,
    startTransition,
    refetchApiKeys,
    refetchGeminiApiKeys,
    refetchOpenRouterApiKeys
}: ApiKeysTabProps) {
    const [youtubeApiKey, setYoutubeApiKey] = useState('');
    const [apiKeyName, setApiKeyName] = useState('');
    const [geminiApiKeyName, setGeminiApiKeyName] = useState('');
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [openRouterApiKeyName, setOpenRouterApiKeyName] = useState('');
    const [openRouterApiKey, setOpenRouterApiKey] = useState('');

    const handleSaveApiKey = () => {
        if (!apiKeyName || !youtubeApiKey) {
            toast.warning("Please provide both a name and an API key.");
            return;
        }
        startTransition(async () => {
            const result = await saveApiKeyAction(apiKeyName, youtubeApiKey);
            if (result.success) {
                toast.success("YouTube API key saved successfully!");
                setApiKeyName('');
                setYoutubeApiKey('');
                refetchApiKeys();
            } else {
                toastErrorWithCopy("Failed to save API key", result.error);
            }
        });
    };
    
    const handleDeleteApiKey = (keyId: string) => {
        startTransition(async () => {
            const result = await deleteApiKeyAction(keyId);
            if (result.success) {
                toast.success("API key deleted successfully!");
                refetchApiKeys();
            } else {
                toastErrorWithCopy("Failed to delete API key", result.error);
            }
        });
    };
    
    const handleToggleApiKey = (keyId: string, isActive: boolean) => {
        startTransition(async () => {
            const result = await toggleApiKeyAction(keyId, isActive);
            if (result.success) {
                toast.success(`API key ${isActive ? 'deactivated' : 'activated'}!`);
                refetchApiKeys();
            } else {
                toastErrorWithCopy("Failed to toggle API key", result.error);
            }
        });
    };

    const handleSaveGeminiApiKey = () => {
        if (!geminiApiKeyName || !geminiApiKey) {
            toast.warning("Please provide both a name and a Gemini API key.");
            return;
        }
        startTransition(async () => {
            const result = await saveGeminiApiKeyAction(geminiApiKeyName, geminiApiKey);
            if (result.success) {
                toast.success("Gemini API key saved successfully!");
                setGeminiApiKeyName('');
                setGeminiApiKey('');
                refetchGeminiApiKeys();
            } else {
                toastErrorWithCopy("Failed to save Gemini API key", result.error);
            }
        });
    };
    
    const handleDeleteGeminiApiKey = (keyId: string) => {
        startTransition(async () => {
            const result = await deleteGeminiApiKeyAction(keyId);
            if (result.success) {
                toast.success("Gemini API key deleted successfully!");
                refetchGeminiApiKeys();
            } else {
                toastErrorWithCopy("Failed to delete Gemini API key", result.error);
            }
        });
    };
    
    const handleToggleGeminiApiKey = (keyId: string, isActive: boolean) => {
        startTransition(async () => {
            const result = await toggleGeminiApiKeyAction(keyId, isActive);
            if (result.success) {
                toast.success(`Gemini API key ${isActive ? 'deactivated' : 'activated'}!`);
                refetchGeminiApiKeys();
            } else {
                toastErrorWithCopy("Failed to toggle Gemini API key", result.error);
            }
        });
    };

    const handleSaveOpenRouterApiKey = () => {
        if (!openRouterApiKeyName || !openRouterApiKey) {
            toast.warning("Please provide both a name and an OpenRouter API key.");
            return;
        }
        startTransition(async () => {
            const result = await saveOpenRouterApiKeyAction(openRouterApiKeyName, openRouterApiKey);
            if (result.success) {
                toast.success("OpenRouter API key saved successfully!");
                setOpenRouterApiKeyName('');
                setOpenRouterApiKey('');
                refetchOpenRouterApiKeys();
            } else {
                toastErrorWithCopy("Failed to save OpenRouter API key", result.error);
            }
        });
    };
    
    const handleDeleteOpenRouterApiKey = (keyId: string) => {
        startTransition(async () => {
            const result = await deleteOpenRouterApiKeyAction(keyId);
            if (result.success) {
                toast.success("OpenRouter API key deleted successfully!");
                refetchOpenRouterApiKeys();
            } else {
                toastErrorWithCopy("Failed to delete OpenRouter API key", result.error);
            }
        });
    };
    
    const handleToggleOpenRouterApiKey = (keyId: string, isActive: boolean) => {
        startTransition(async () => {
            const result = await toggleOpenRouterApiKeyAction(keyId, isActive);
            if (result.success) {
                toast.success(`OpenRouter API key ${isActive ? 'deactivated' : 'activated'}!`);
                refetchOpenRouterApiKeys();
            } else {
                toastErrorWithCopy("Failed to toggle OpenRouter API key", result.error);
            }
        });
    };

    const handleResetApiKeyQuotas = (type: 'youtube' | 'gemini' | 'openrouter') => {
        startTransition(async () => {
            if (type === 'youtube') {
                const result = await resetApiKeyQuotasAction();
                if (result.success) {
                    toast.success("YouTube API key quotas reset successfully!");
                    refetchApiKeys();
                } else {
                    toastErrorWithCopy("Failed to reset YouTube API key quotas", result.error);
                }
            } else if (type === 'gemini') {
                const result = await resetGeminiApiKeyQuotasAction();
                if (result.success) {
                    toast.success("Gemini API key quotas reset successfully!");
                    refetchGeminiApiKeys();
                } else {
                    toastErrorWithCopy("Failed to reset Gemini API key quotas", result.error);
                }
            } else if (type === 'openrouter') {
                const result = await resetOpenRouterApiKeyQuotasAction();
                if (result.success) {
                    toast.success("OpenRouter API key quotas reset successfully!");
                    refetchOpenRouterApiKeys();
                } else {
                    toastErrorWithCopy("Failed to reset OpenRouter API key quotas", result.error);
                }
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Key /> API Key Management</CardTitle>
                <CardDescription>Add, remove, and manage your YouTube, Gemini, and OpenRouter API keys.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* API Usage Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {apiKeys?.filter(k => k.is_active).length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Active YouTube Keys</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {geminiApiKeys?.filter(k => k.is_active).length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Active Gemini Keys</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {openRouterApiKeys?.filter(k => k.is_active).length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Active OpenRouter Keys</div>
                    </div>
                </div>

                {/* YouTube API Keys */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">YouTube API Keys</h3>
                    <div className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Add New YouTube Key</Label>
                            <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                Generate from here <ExternalLink className="h-3 w-3"/>
                            </a>
                        </div>
                        <Input placeholder="Key Name (e.g., 'Primary Key')" value={apiKeyName} onChange={(e) => setApiKeyName(e.target.value)} />
                        <Input placeholder="YouTube API Key" value={youtubeApiKey} onChange={(e) => setYoutubeApiKey(e.target.value)} />
                        <Button onClick={handleSaveApiKey} disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Key
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Key (Partial)</TableHead>
                                <TableHead>Quota Usage</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {apiKeys && apiKeys.length > 0 ? (
                                apiKeys.map(key => (
                                    <TableRow key={key.id}>
                                        <TableCell>{key.name}</TableCell>
                                        <TableCell>{key.api_key.substring(0, 8)}...{key.api_key.substring(key.api_key.length - 4)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Progress value={((key.quota_used || 0) / (key.quota_limit || 1)) * 100} className="w-32"/>
                                                <span className="text-xs text-muted-foreground">{key.quota_used} / {key.quota_limit}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={key.is_active ? 'success' : 'destructive'}>
                                                {key.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleToggleApiKey(key.id, key.is_active || false)} disabled={isPending}>{key.is_active ? 'Deactivate' : 'Activate'}</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteApiKey(key.id)} disabled={isPending}>Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No YouTube API keys added yet. Add your first key above.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                     <Button variant="outline" size="sm" onClick={() => handleResetApiKeyQuotas('youtube')} disabled={isPending}>Reset All YouTube Quotas</Button>
                </div>

                <Separator />

                {/* Gemini API Keys */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Gemini API Keys</h3>
                     <div className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Add New Gemini Key</Label>
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                Generate from here <ExternalLink className="h-3 w-3"/>
                            </a>
                        </div>
                        <Input placeholder="Key Name (e.g., 'AI Key 1')" value={geminiApiKeyName} onChange={(e) => setGeminiApiKeyName(e.target.value)} />
                        <Input placeholder="Gemini API Key" value={geminiApiKey} onChange={(e) => setGeminiApiKey(e.target.value)} />
                        <Button onClick={handleSaveGeminiApiKey} disabled={isPending}>
                           {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Key
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Key (Partial)</TableHead>
                                <TableHead>Requests Used</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {geminiApiKeys && geminiApiKeys.length > 0 ? (
                                geminiApiKeys.map(key => (
                                    <TableRow key={key.id}>
                                        <TableCell>{key.name}</TableCell>
                                        <TableCell>{key.api_key.substring(0, 8)}...{key.api_key.substring(key.api_key.length - 4)}</TableCell>
                                        <TableCell>{key.requests_used}</TableCell>
                                        <TableCell>
                                            <Badge variant={key.is_active ? 'success' : 'destructive'}>
                                                {key.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleToggleGeminiApiKey(key.id, key.is_active)} disabled={isPending}>{key.is_active ? 'Deactivate' : 'Activate'}</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteGeminiApiKey(key.id)} disabled={isPending}>Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No Gemini API keys added yet. Add your first key above.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <Button variant="outline" size="sm" onClick={() => handleResetApiKeyQuotas('gemini')} disabled={isPending}>Reset All Gemini Quotas</Button>
                </div>

                <Separator />

                {/* OpenRouter API Keys */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">OpenRouter API Keys</h3>
                        <Badge variant="outline" className="text-xs">Free Models Available</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                        <strong>💡 OpenRouter Benefits:</strong> Access to multiple free AI models including Gemini 2.5 Flash, DeepSeek, GPT-OSS, and more. 
                        Add multiple keys for automatic failover when usage limits are reached.
                    </div>
                    <div className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Add New OpenRouter Key</Label>
                            <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                Generate from here <ExternalLink className="h-3 w-3"/>
                            </a>
                        </div>
                        <Input placeholder="Key Name (e.g., 'OpenRouter Key 1')" value={openRouterApiKeyName} onChange={(e) => setOpenRouterApiKeyName(e.target.value)} />
                        <Input placeholder="OpenRouter API Key" value={openRouterApiKey} onChange={(e) => setOpenRouterApiKey(e.target.value)} />
                        <Button onClick={handleSaveOpenRouterApiKey} disabled={isPending}>
                           {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Key
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Key (Partial)</TableHead>
                                <TableHead>Requests Used</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {openRouterApiKeys && openRouterApiKeys.length > 0 ? (
                                openRouterApiKeys.map(key => (
                                    <TableRow key={key.id}>
                                        <TableCell>{key.name}</TableCell>
                                        <TableCell>{key.api_key.substring(0, 8)}...{key.api_key.substring(key.api_key.length - 4)}</TableCell>
                                        <TableCell>{key.requests_used}</TableCell>
                                        <TableCell>
                                            <Badge variant={key.is_active ? 'success' : 'destructive'}>
                                                {key.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleToggleOpenRouterApiKey(key.id, key.is_active)} disabled={isPending}>{key.is_active ? 'Deactivate' : 'Activate'}</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteOpenRouterApiKey(key.id)} disabled={isPending}>Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No OpenRouter API keys added yet. Add your first key above.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <Button variant="outline" size="sm" onClick={() => handleResetApiKeyQuotas('openrouter')} disabled={isPending}>Reset All OpenRouter Quotas</Button>
                </div>
            </CardContent>
        </Card>
    );
}

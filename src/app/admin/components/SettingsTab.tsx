
import React, { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast, toastErrorWithCopy } from '@/components/ui/sonner';
import { Server, Database, Upload, Download, AlertTriangle, ShieldCheck, Loader2, Key } from 'lucide-react';
import { 
    toggleMaintenanceModeAction, 
    clearAllDataAction,
} from '@/app/actions/admin';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import ApiKeysTab from './ApiKeysTab';

interface SettingsTabProps {
    settings: any;
    isPending: boolean;
    startTransition: React.TransitionStartFunction;
    fetchSettings: () => void;
    // API Keys props
    apiKeys: any[];
    geminiApiKeys: any[];
    openRouterApiKeys: any[];
    refetchApiKeys: () => void;
    refetchGeminiApiKeys: () => void;
    refetchOpenRouterApiKeys: () => void;
}

export default function SettingsTab({
    settings,
    isPending,
    startTransition,
    fetchSettings,
    apiKeys,
    geminiApiKeys,
    openRouterApiKeys,
    refetchApiKeys,
    refetchGeminiApiKeys,
    refetchOpenRouterApiKeys,
}: SettingsTabProps) {
    
    const [maintenanceMode, setMaintenanceMode] = useState(settings?.maintenance_mode || false);

    const handleMaintenanceModeToggle = (checked: boolean) => {
        setMaintenanceMode(checked);
        startTransition(async () => {
            const result = await toggleMaintenanceModeAction(checked);
            if (result.success) {
                toast.success(`Maintenance mode has been ${checked ? 'enabled' : 'disabled'}.`);
                fetchSettings();
            } else {
                toastErrorWithCopy("Failed to toggle maintenance mode", result.error);
                setMaintenanceMode(!checked); // Revert on failure
            }
        });
    };

    const handleResetAllData = () => {
        startTransition(async () => {
            const result = await clearAllDataAction();
             if (result.success) {
                toast.success("All data has been successfully cleared.", {
                    description: "You may need to refresh other tabs to see the changes."
                });
            } else {
                toastErrorWithCopy("Failed to reset data", result.error);
            }
        })
    };


    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Server /> Site Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor="maintenance-mode" className="font-semibold">Maintenance Mode</Label>
                                <p className="text-sm text-muted-foreground">
                                    Put the site in maintenance mode to prevent public access.
                                </p>
                            </div>
                            <Switch
                                id="maintenance-mode"
                                checked={maintenanceMode}
                                onCheckedChange={handleMaintenanceModeToggle}
                                disabled={isPending}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Database /> Data Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                            <Label className="font-semibold">Export Data</Label>
                            <p className="text-sm text-muted-foreground">Download all your data as CSV files.</p>
                            </div>
                            <Button variant="outline" disabled><Download className="mr-2 h-4 w-4" /> Export</Button>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                            <Label className="font-semibold">Import Data</Label>
                            <p className="text-sm text-muted-foreground">Import data from a CSV file.</p>
                            </div>
                            <Button variant="outline" disabled><Upload className="mr-2 h-4 w-4" /> Import</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* API Management Section */}
            <ApiKeysTab 
                apiKeys={apiKeys}
                geminiApiKeys={geminiApiKeys}
                openRouterApiKeys={openRouterApiKeys}
                isPending={isPending}
                startTransition={startTransition}
                refetchApiKeys={refetchApiKeys}
                refetchGeminiApiKeys={refetchGeminiApiKeys}
                refetchOpenRouterApiKeys={refetchOpenRouterApiKeys}
            />
            
            <Card className="border-destructive md:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle /> Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                        <div>
                           <Label className="font-semibold text-destructive">Reset All Data</Label>
                           <p className="text-sm text-destructive/80">This will permanently delete all podcasts, episodes, people, reviews, and API keys. This action cannot be undone.</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isPending}>
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Database className="mr-2 h-4 w-4" />}
                                    Reset All Data
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action is irreversible. Only core content data (podcasts, people, episodes, and news articles) will be permanently deleted. System settings, API keys, analytics data, and other configurations will be preserved.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive hover:bg-destructive/90"
                                        onClick={handleResetAllData}
                                    >
                                        Yes, delete everything
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}

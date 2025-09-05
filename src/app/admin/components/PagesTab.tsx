import React, { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast, toastErrorWithCopy } from '@/components/ui/sonner';
import { 
    saveCarouselItemAction,
    deleteCarouselItemAction,
    toggleCarouselItemActiveAction,
    saveAboutPageContentAction,
} from '@/app/actions/admin';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Tables, Json } from '@/integrations/supabase/types';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NewsTab from './NewsTab';
// import EnhancedNewsTab from './EnhancedNewsTab'; // Temporarily disabled
import UnifiedPagesTab from './UnifiedPagesTab';

interface PagesTabProps {
    carouselItems: Tables<'explore_carousel'>[];
    pagesContent: { about: Json };
    isPending: boolean;
    startTransition: React.TransitionStartFunction;
    fetchCarouselItems: () => void;
    fetchPagesContent: () => void;
    // News props
    newsArticles: any[];
    fetchNewsArticles: () => void;
    user: any;
}

export default function PagesTab({
    carouselItems,
    pagesContent,
    isPending,
    startTransition,
    fetchCarouselItems,
    fetchPagesContent,
    newsArticles,
    fetchNewsArticles,
    user,
}: PagesTabProps) {
    const [aboutContent, setAboutContent] = useState(pagesContent.about);

    const handleSaveAboutPage = () => {
        startTransition(async () => {
            const result = await saveAboutPageContentAction(aboutContent);
            if(result.success) {
                toast.success("About page content saved successfully!");
                fetchPagesContent();
            } else {
                toastErrorWithCopy("Failed to save About page content", result.error);
            }
        });
    };

    const handleSaveCarouselItem = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
            const result = await saveCarouselItemAction(formData);
            if (result.success) {
                toast.success("Carousel item saved successfully!");
                fetchCarouselItems();
                (event.target as HTMLFormElement).reset();
            } else {
                toastErrorWithCopy("Failed to save carousel item", result.error);
            }
        });
    };

    const handleDeleteCarouselItem = (id: string) => {
        startTransition(async () => {
            const result = await deleteCarouselItemAction(id);
            if (result.success) {
                toast.success("Carousel item deleted!");
                fetchCarouselItems();
            } else {
                toastErrorWithCopy("Failed to delete item", result.error);
            }
        });
    };
    
    const handleToggleCarouselItem = (id: string, currentState: boolean) => {
        startTransition(async () => {
            const result = await toggleCarouselItemActiveAction(id, currentState);
            if (result.success) {
                toast.success(`Item has been ${!currentState ? 'activated' : 'deactivated'}.`);
                fetchCarouselItems();
            } else {
                toastErrorWithCopy("Failed to update item", result.error);
            }
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pages Content Management</CardTitle>
                <CardDescription>Manage all your website pages with advanced SEO features and content management.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="unified" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="unified">Unified Pages</TabsTrigger>
                        <TabsTrigger value="carousel">Explore Carousel</TabsTrigger>
                        <TabsTrigger value="about">About Page</TabsTrigger>
                        <TabsTrigger value="news">News Management</TabsTrigger>
                    </TabsList>
                    
                    {/* Unified Pages Tab */}
                    <TabsContent value="unified" className="mt-6">
                        <UnifiedPagesTab 
                            isPending={isPending}
                            startTransition={startTransition}
                            user={user}
                        />
                    </TabsContent>
                    
                    {/* Carousel Management Tab */}
                    <TabsContent value="carousel" className="mt-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Add New Carousel Item</h3>
                                <form onSubmit={handleSaveCarouselItem} className="space-y-4 p-4 border rounded-lg">
                                   <Input name="title" placeholder="Title (e.g., 'Featured Podcast')" required />
                                   <Textarea name="description" placeholder="Short description (optional)" />
                                   <Input name="image_url" placeholder="Image URL (e.g., https://.../image.png)" required />
                                   <Input name="redirect_link" placeholder="Redirect Link (e.g., /podcasts/slug)" required />
                                   <Input name="order" type="number" placeholder="Order (e.g., 1, 2, 3)" defaultValue="1" required />
                                   <div className="flex items-center space-x-2">
                                     <Switch id="is_active" name="is_active" defaultChecked />
                                     <Label htmlFor="is_active">Active</Label>
                                   </div>
                                   <Button type="submit" disabled={isPending}>
                                     {isPending ? <Loader2 className="mr-2 animate-spin"/> : <Plus className="mr-2"/>} Add Item
                                   </Button>
                                </form>
                            </div>
                             <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Current Items</h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {carouselItems.sort((a, b) => a.order - b.order).map(item => (
                                        <div key={item.id} className="flex items-center p-2 border rounded-md gap-4">
                                            <Image src={item.image_url} alt={item.title} className="w-16 h-16 object-cover rounded-md" width={64} height={64} />
                                            <div className="flex-1">
                                                <p className="font-semibold">{item.title} (Order: {item.order})</p>
                                                <p className="text-xs text-muted-foreground truncate">{item.redirect_link}</p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                             <Switch checked={item.is_active} onCheckedChange={() => handleToggleCarouselItem(item.id, item.is_active)} />
                                             <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeleteCarouselItem(item.id)} disabled={isPending}>
                                                <Trash2 className="h-4 w-4" />
                                             </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    
                    {/* About Page Tab */}
                    <TabsContent value="about" className="mt-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="about-title">Title</Label>
                            <Input id="about-title" value={(aboutContent as any)?.title || ''} onChange={(e) => setAboutContent({...(aboutContent as any), title: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="about-subtitle">Subtitle</Label>
                            <Input id="about-subtitle" value={(aboutContent as any)?.subtitle || ''} onChange={(e) => setAboutContent({...(aboutContent as any), subtitle: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="about-mission">Mission Statement (Markdown)</Label>
                            <Textarea id="about-mission" value={(aboutContent as any)?.mission || ''} onChange={(e) => setAboutContent({...(aboutContent as any), mission: e.target.value})} rows={5} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="about-community">Community Section (Markdown)</Label>
                            <Textarea id="about-community" value={(aboutContent as any)?.community || ''} onChange={(e) => setAboutContent({...(aboutContent as any), community: e.target.value})} rows={5} />
                        </div>
                         <Button onClick={handleSaveAboutPage} disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2"/>}
                            Save About Page
                        </Button>
                    </TabsContent>
                    
                    {/* News Management Tab */}
                    <TabsContent value="news" className="mt-6">
                        <NewsTab 
                            newsArticles={newsArticles}
                            isPending={isPending}
                            startTransition={startTransition}
                            fetchNewsArticles={fetchNewsArticles}
                            user={user}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
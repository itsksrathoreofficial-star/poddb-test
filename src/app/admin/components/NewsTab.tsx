
/*
  DEVELOPER NOTE:
  This component manages news articles in the admin panel.
  The `handleNewsArticleSubmit` function is responsible for creating and updating articles.
  It ensures that the `author_id` is correctly assigned to the current user's ID before
  submitting the data to Supabase. This file is connected to the following SQL migration:
  `supabase/migrations/20250829010000_fix_news_articles_author_id_fkey.sql`
*/
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast, toastErrorWithCopy } from '@/components/ui/sonner';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type NewsArticle = Tables<'news_articles'> & { profiles: { display_name: string } | null };
type NewsArticleInsert = Omit<TablesInsert<'news_articles'>, 'author_id'> & { author_id?: string | null };

interface NewsTabProps {
    newsArticles: NewsArticle[];
    isPending: boolean;
    startTransition: React.TransitionStartFunction;
    fetchNewsArticles: () => void;
    user: any;
}

export default function NewsTab({ newsArticles, isPending, startTransition, fetchNewsArticles, user }: NewsTabProps) {
    const [isEditingNews, setIsEditingNews] = useState(false);
    const [currentNewsArticle, setCurrentNewsArticle] = useState<NewsArticleInsert | null>(null);
    const [imageUrlError, setImageUrlError] = useState<string>('');

    // URL validation helper
    const validateImageUrl = (url: string): string => {
        if (!url) return '';
        if (url.startsWith('/')) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return '';
        return 'Please enter a valid URL starting with /, http://, or https://';
    };

    const handleImageUrlChange = (url: string) => {
        const error = validateImageUrl(url);
        setImageUrlError(error);
        setCurrentNewsArticle({ ...currentNewsArticle!, featured_image_url: url });
    };

    const handleNewsArticleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentNewsArticle || !currentNewsArticle.title || !currentNewsArticle.content || !currentNewsArticle.slug) {
            toast.warning("Title, content, and slug are required.");
            return;
        }
        
        // Validate featured image URL if provided
        if (currentNewsArticle.featured_image_url && validateImageUrl(currentNewsArticle.featured_image_url)) {
            toast.warning("Please enter a valid featured image URL.");
            return;
        }

        startTransition(async () => {
            const articleToSubmit = {
                ...currentNewsArticle,
                author_id: user?.id,
            };

            const { error } = await (supabase as any)
                .from('news_articles')
                .upsert(articleToSubmit as any);

            if (error) {
                toastErrorWithCopy("Failed to save article", error.message);
            } else {
                toast.success("News article saved successfully!");
                setIsEditingNews(false);
                setCurrentNewsArticle(null);
                setImageUrlError('');
                fetchNewsArticles();
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage News</CardTitle>
                <Button onClick={() => { setIsEditingNews(true); setCurrentNewsArticle({ title: '', content: '', slug: '', published: false }); setImageUrlError(''); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add New Article
                </Button>
            </CardHeader>
            <CardContent>
                {isEditingNews && currentNewsArticle ? (
                    <form onSubmit={handleNewsArticleSubmit} className="space-y-4 p-4 border rounded-lg">
                       <h3 className="text-lg font-semibold">{currentNewsArticle.id ? 'Edit' : 'Create'} News Article</h3>
                       <Input placeholder="Title" value={currentNewsArticle.title} onChange={e => setCurrentNewsArticle({ ...currentNewsArticle, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') })} required />
                       <Input placeholder="Slug" value={currentNewsArticle.slug} onChange={e => setCurrentNewsArticle({ ...currentNewsArticle, slug: e.target.value })} required />
                       <Textarea placeholder="Content (Markdown supported)" value={currentNewsArticle.content} onChange={e => setCurrentNewsArticle({ ...currentNewsArticle, content: e.target.value })} rows={10} required />
                       <Input placeholder="Excerpt" value={currentNewsArticle.excerpt || ''} onChange={e => setCurrentNewsArticle({ ...currentNewsArticle, excerpt: e.target.value })} />
                       <Input placeholder="Featured Image URL" value={currentNewsArticle.featured_image_url || ''} onChange={e => handleImageUrlChange(e.target.value)} />
                       {imageUrlError && <p className="text-red-500 text-sm">{imageUrlError}</p>}
                       <div className="flex items-center space-x-2"><Switch checked={!!currentNewsArticle.published} onCheckedChange={checked => setCurrentNewsArticle({ ...currentNewsArticle, published: checked, published_at: checked ? new Date().toISOString() : null })} /><Label>Published</Label></div>
                       <div className="flex gap-2"><Button type="submit" disabled={isPending}>Save</Button><Button variant="ghost" onClick={() => setIsEditingNews(false)}>Cancel</Button></div>
                    </form>
                ) : (
                    <Table>
                       <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Author</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                       <TableBody>
                           {newsArticles.map(article => (
                               <TableRow key={article.id}>
                                   <TableCell>{article.title}</TableCell>
                                   <TableCell><Badge variant={article.published ? 'default' : 'secondary'}>{article.published ? 'Published' : 'Draft'}</Badge></TableCell>
                                   <TableCell>{(article as any)?.profiles?.display_name || 'N/A'}</TableCell>
                                   <TableCell><Button variant="outline" size="sm" onClick={() => { setIsEditingNews(true); setCurrentNewsArticle(article as any); setImageUrlError(''); }}>Edit</Button></TableCell>
                               </TableRow>
                           ))}
                       </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

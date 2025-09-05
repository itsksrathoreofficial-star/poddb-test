"use client";

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  User,
  Tag,
  Code,
  Zap,
  Globe,
  Share2,
  Image as ImageIcon,
  FileText,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import Link from 'next/link';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  published: boolean;
  published_at: string;
  author_name?: string;
  author_bio?: string;
  author_photo_url?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  schema_markup?: any;
  custom_schema_code?: string;
  seo_score?: number;
  reading_time?: number;
  featured?: boolean;
  tags?: string[];
  category?: string;
  canonical_url?: string;
  social_title?: string;
  social_description?: string;
  social_image_url?: string;
  created_at: string;
  updated_at: string;
}

interface EnhancedNewsTabProps {
  newsArticles: NewsArticle[];
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
  fetchNewsArticles: () => void;
  user: any;
}

export default function EnhancedNewsTab({
  newsArticles,
  isPending,
  startTransition,
  fetchNewsArticles,
  user,
}: EnhancedNewsTabProps) {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showSchemaGenerator, setShowSchemaGenerator] = useState(false);
  const [schemaCode, setSchemaCode] = useState('');

  // Form states
  const [formData, setFormData] = useState<Partial<NewsArticle>>({
    title: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    published: false,
    author_name: '',
    author_bio: '',
    author_photo_url: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
    custom_schema_code: '',
    featured: false,
    tags: [],
    category: '',
    canonical_url: '',
    social_title: '',
    social_description: '',
    social_image_url: '',
  });

  const [keywordsInput, setKeywordsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleSaveArticle = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    startTransition(async () => {
      try {
        const articleData = {
          ...formData,
          meta_keywords: keywordsInput.split(',').map(k => k.trim()).filter(k => k),
          tags: tagsInput.split(',').map(t => t.trim()).filter(t => t),
          slug: formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          reading_time: Math.ceil((formData.content?.split(' ').length || 0) / 200),
          seo_score: calculateSEOScore(),
        };

        if (selectedArticle) {
          // Update existing article
          const { error } = await (supabase as any)
            .from('news_articles')
            .update(articleData)
            .eq('id', selectedArticle.id);

          if (error) throw error;
          toast.success('Article updated successfully!');
        } else {
          // Create new article
          const { error } = await (supabase as any)
            .from('news_articles')
            .insert([{
              ...articleData,
              created_by: user?.id,
            }]);

          if (error) throw error;
          toast.success('Article created successfully!');
        }

        fetchNewsArticles();
        resetForm();
      } catch (error: any) {
        toast.error(`Failed to save article: ${error.message}`);
      }
    });
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    startTransition(async () => {
      try {
        const { error } = await supabase
          .from('news_articles')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Article deleted successfully!');
        fetchNewsArticles();
      } catch (error: any) {
        toast.error(`Failed to delete article: ${error.message}`);
      }
    });
  };

  const handleEditArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setFormData(article);
    setKeywordsInput(article.meta_keywords?.join(', ') || '');
    setTagsInput(article.tags?.join(', ') || '');
  };

  const resetForm = () => {
    setSelectedArticle(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      featured_image_url: '',
      published: false,
      author_name: '',
      author_bio: '',
      author_photo_url: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: [],
      custom_schema_code: '',
      featured: false,
      tags: [],
      category: '',
      canonical_url: '',
      social_title: '',
      social_description: '',
      social_image_url: '',
    });
    setKeywordsInput('');
    setTagsInput('');
  };

  const calculateSEOScore = () => {
    let score = 0;
    
    if (formData.title && formData.title.length > 30 && formData.title.length < 60) score += 20;
    if (formData.meta_description && formData.meta_description.length > 120 && formData.meta_description.length < 160) score += 20;
    if (formData.meta_keywords && formData.meta_keywords.length > 0) score += 10;
    if (formData.featured_image_url) score += 10;
    if (formData.author_name) score += 10;
    if (formData.tags && formData.tags.length > 0) score += 10;
    if (formData.category) score += 10;
    if (formData.canonical_url) score += 10;
    
    return Math.min(score, 100);
  };

  const generateSchemaMarkup = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": formData.title,
      "description": formData.meta_description || formData.excerpt,
      "image": formData.featured_image_url,
      "author": {
        "@type": "Person",
        "name": formData.author_name,
        "description": formData.author_bio,
        "image": formData.author_photo_url
      },
      "publisher": {
        "@type": "Organization",
        "name": "PodDB Pro",
        "logo": {
          "@type": "ImageObject",
          "url": "https://poddb.pro/logo.png"
        }
      },
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": formData.canonical_url || `https://poddb.pro/news/${formData.slug}`
      },
      "keywords": formData.meta_keywords?.join(', '),
      "articleSection": formData.category,
      "wordCount": formData.content?.split(' ').length || 0,
      "timeRequired": `PT${formData.reading_time || 5}M`
    };

    setSchemaCode(JSON.stringify(schema, null, 2));
    setFormData(prev => ({ ...prev, schema_markup: schema }));
    setShowSchemaGenerator(true);
  };

  const filteredArticles = newsArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(newsArticles.map(article => article.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">News Management</h2>
          <p className="text-muted-foreground">Manage news articles with advanced SEO features</p>
        </div>
        <Button onClick={resetForm} className="gap-2">
          <Plus className="h-4 w-4" />
          New Article
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Articles List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Articles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div>
                <Label>Category</Label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Articles List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredArticles.map(article => (
              <Card key={article.id} className={`cursor-pointer transition-colors ${
                selectedArticle?.id === article.id ? 'ring-2 ring-primary' : ''
              }`}>
                <CardContent className="p-4" onClick={() => handleEditArticle(article)}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditArticle(article);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteArticle(article.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>{article.author_name || 'No author'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(article.published_at), 'MMM dd, yyyy')}</span>
                    </div>
                    {article.category && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-3 w-3" />
                        <span>{article.category}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <Badge variant={article.published ? 'default' : 'secondary'}>
                      {article.published ? 'Published' : 'Draft'}
                    </Badge>
                    {article.featured && <Badge variant="outline">Featured</Badge>}
                    {article.seo_score && (
                      <Badge variant="outline" className="gap-1">
                        <Zap className="h-3 w-3" />
                        SEO: {article.seo_score}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Article Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedArticle ? 'Edit Article' : 'Create New Article'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="author">Author</TabsTrigger>
                  <TabsTrigger value="schema">Schema</TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Article title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={formData.category || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g., Technology, Business"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Short description of the article"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Article content"
                      rows={10}
                    />
                  </div>

                  <div>
                    <Label htmlFor="featured_image">Featured Image URL</Label>
                    <Input
                      id="featured_image"
                      value={formData.featured_image_url || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="published"
                        checked={formData.published || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                      />
                      <Label htmlFor="published">Published</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={formData.featured || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                      />
                      <Label htmlFor="featured">Featured</Label>
                    </div>
                  </div>
                </TabsContent>

                {/* SEO Tab */}
                <TabsContent value="seo" className="space-y-4">
                  <div>
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                      placeholder="SEO optimized title (50-60 characters)"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(formData.meta_title?.length || 0)}/60 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                      placeholder="SEO description (120-160 characters)"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(formData.meta_description?.length || 0)}/160 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="keywords">Meta Keywords (comma separated)</Label>
                    <Input
                      id="keywords"
                      value={keywordsInput}
                      onChange={(e) => setKeywordsInput(e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  <div>
                    <Label htmlFor="canonical_url">Canonical URL</Label>
                    <Input
                      id="canonical_url"
                      value={formData.canonical_url || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, canonical_url: e.target.value }))}
                      placeholder="https://poddb.pro/news/article-slug"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>

                  {/* Social Media */}
                  <Separator />
                  <h3 className="text-lg font-semibold">Social Media</h3>
                  
                  <div>
                    <Label htmlFor="social_title">Social Title</Label>
                    <Input
                      id="social_title"
                      value={formData.social_title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, social_title: e.target.value }))}
                      placeholder="Title for social media sharing"
                    />
                  </div>

                  <div>
                    <Label htmlFor="social_description">Social Description</Label>
                    <Textarea
                      id="social_description"
                      value={formData.social_description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, social_description: e.target.value }))}
                      placeholder="Description for social media sharing"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="social_image">Social Image URL</Label>
                    <Input
                      id="social_image"
                      value={formData.social_image_url || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, social_image_url: e.target.value }))}
                      placeholder="https://example.com/social-image.jpg"
                    />
                  </div>
                </TabsContent>

                {/* Author Tab */}
                <TabsContent value="author" className="space-y-4">
                  <div>
                    <Label htmlFor="author_name">Author Name</Label>
                    <Input
                      id="author_name"
                      value={formData.author_name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                      placeholder="Author's full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="author_bio">Author Bio</Label>
                    <Textarea
                      id="author_bio"
                      value={formData.author_bio || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, author_bio: e.target.value }))}
                      placeholder="Brief author biography"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="author_photo">Author Photo URL</Label>
                    <Input
                      id="author_photo"
                      value={formData.author_photo_url || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, author_photo_url: e.target.value }))}
                      placeholder="https://example.com/author-photo.jpg"
                    />
                  </div>
                </TabsContent>

                {/* Schema Tab */}
                <TabsContent value="schema" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Schema Markup Generator</h3>
                    <Button onClick={generateSchemaMarkup} className="gap-2">
                      <Code className="h-4 w-4" />
                      Generate Schema
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="custom_schema">Custom Schema Code (JSON-LD)</Label>
                    <Textarea
                      id="custom_schema"
                      value={formData.custom_schema_code || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, custom_schema_code: e.target.value }))}
                      placeholder="Paste your custom JSON-LD schema here"
                      rows={10}
                    />
                  </div>

                  {schemaCode && (
                    <div>
                      <Label>Generated Schema</Label>
                      <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                        {schemaCode}
                      </pre>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    SEO Score: <span className="font-semibold">{calculateSEOScore()}/100</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Reading Time: <span className="font-semibold">{Math.ceil((formData.content?.split(' ').length || 0) / 200)} min</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveArticle} disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Article'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

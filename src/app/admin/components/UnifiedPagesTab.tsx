"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Settings,
  HelpCircle,
  Info,
  Shield,
  FileCheck,
  BookOpen,
  PlusCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import Link from 'next/link';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  page_type: 'about' | 'privacy' | 'terms' | 'help' | 'custom';
  featured_image_url?: string;
  published: boolean;
  featured: boolean;
  order_index: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  canonical_url?: string;
  social_title?: string;
  social_description?: string;
  social_image_url?: string;
  schema_markup?: any;
  custom_schema_code?: string;
  seo_score?: number;
  author_name?: string;
  author_bio?: string;
  author_photo_url?: string;
  tags?: string[];
  category?: string;
  reading_time?: number;
  help_category?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  related_pages?: string[];
  faq_items?: any[];
  show_in_navigation: boolean;
  show_in_footer: boolean;
  allow_comments: boolean;
  require_auth: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

interface HelpCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  order_index: number;
}

interface UnifiedPagesTabProps {
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
  user: any;
}

export default function UnifiedPagesTab({
  isPending,
  startTransition,
  user,
}: UnifiedPagesTabProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [helpCategories, setHelpCategories] = useState<HelpCategory[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showSchemaGenerator, setShowSchemaGenerator] = useState(false);
  const [schemaCode, setSchemaCode] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Form states
  const [formData, setFormData] = useState<Partial<Page>>({
    title: '',
    content: '',
    excerpt: '',
    page_type: 'custom',
    featured_image_url: '',
    published: false,
    featured: false,
    order_index: 0,
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
    custom_schema_code: '',
    author_name: '',
    author_bio: '',
    author_photo_url: '',
    tags: [],
    category: '',
    canonical_url: '',
    social_title: '',
    social_description: '',
    social_image_url: '',
    help_category: '',
    difficulty_level: 'beginner',
    related_pages: [],
    faq_items: [],
    show_in_navigation: true,
    show_in_footer: false,
    allow_comments: false,
    require_auth: false,
  });

  const [keywordsInput, setKeywordsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [faqItems, setFaqItems] = useState<Array<{question: string, answer: string}>>([]);

  useEffect(() => {
    fetchPages();
    fetchHelpCategories();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('page_type', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      toast.error(`Failed to fetch pages: ${error.message}`);
    }
  };

  const fetchHelpCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('help_categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setHelpCategories(data || []);
    } catch (error: any) {
      toast.error(`Failed to fetch help categories: ${error.message}`);
    }
  };

  const handleSavePage = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    startTransition(async () => {
      try {
        const pageData = {
          ...formData,
          meta_keywords: keywordsInput.split(',').map(k => k.trim()).filter(k => k),
          tags: tagsInput.split(',').map(t => t.trim()).filter(t => t),
          slug: formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          reading_time: Math.ceil((formData.content?.split(' ').length || 0) / 200),
          seo_score: calculateSEOScore(),
          faq_items: faqItems,
        };

        if (selectedPage) {
          // Update existing page
          const { error } = await (supabase as any)
            .from('pages')
            .update(pageData as any)
            .eq('id', selectedPage.id);

          if (error) throw error;
          toast.success('Page updated successfully!');
        } else {
          // Create new page
          const { error } = await (supabase as any)
            .from('pages')
            .insert([{
              ...pageData,
              created_by: user?.id,
            }] as any);

          if (error) throw error;
          toast.success('Page created successfully!');
        }

        fetchPages();
        resetForm();
      } catch (error: any) {
        toast.error(`Failed to save page: ${error.message}`);
      }
    });
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    startTransition(async () => {
      try {
        const { error } = await supabase
          .from('pages')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Page deleted successfully!');
        fetchPages();
      } catch (error: any) {
        toast.error(`Failed to delete page: ${error.message}`);
      }
    });
  };

  const handleEditPage = (page: Page) => {
    setSelectedPage(page);
    setFormData(page);
    setKeywordsInput(page.meta_keywords?.join(', ') || '');
    setTagsInput(page.tags?.join(', ') || '');
    setFaqItems(page.faq_items || []);
  };

  const resetForm = () => {
    setSelectedPage(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      page_type: 'custom',
      featured_image_url: '',
      published: false,
      featured: false,
      order_index: 0,
      meta_title: '',
      meta_description: '',
      meta_keywords: [],
      custom_schema_code: '',
      author_name: '',
      author_bio: '',
      author_photo_url: '',
      tags: [],
      category: '',
      canonical_url: '',
      social_title: '',
      social_description: '',
      social_image_url: '',
      help_category: '',
      difficulty_level: 'beginner',
      related_pages: [],
      faq_items: [],
      show_in_navigation: true,
      show_in_footer: false,
      allow_comments: false,
      require_auth: false,
    });
    setKeywordsInput('');
    setTagsInput('');
    setFaqItems([]);
  };

  const calculateSEOScore = () => {
    let score = 0;
    
    if (formData.title && formData.title.length > 30 && formData.title.length < 60) score += 20;
    if (formData.meta_description && formData.meta_description.length > 120 && formData.meta_description.length < 160) score += 20;
    if (formData.meta_keywords && formData.meta_keywords.length > 0) score += 10;
    if (formData.featured_image_url) score += 10;
    if (formData.author_name) score += 10;
    if (formData.tags && formData.tags.length > 0) score += 10;
    if (formData.canonical_url) score += 10;
    if (formData.content && formData.content.length > 500) score += 10;
    
    return Math.min(score, 100);
  };

  const generateSchemaMarkup = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": formData.page_type === 'help' ? "Article" : "WebPage",
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
        "@id": formData.canonical_url || `https://poddb.pro/${formData.slug}`
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

  const addFaqItem = () => {
    setFaqItems([...faqItems, { question: '', answer: '' }]);
  };

  const updateFaqItem = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqItems];
    updated[index][field] = value;
    setFaqItems(updated);
  };

  const removeFaqItem = (index: number) => {
    setFaqItems(faqItems.filter((_, i) => i !== index));
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || page.page_type === filterType;
    const matchesCategory = filterCategory === 'all' || page.help_category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const groupedPages = filteredPages.reduce((acc, page) => {
    if (!acc[page.page_type]) {
      acc[page.page_type] = [];
    }
    acc[page.page_type].push(page);
    return acc;
  }, {} as Record<string, Page[]>);

  const getPageTypeIcon = (type: string) => {
    switch (type) {
      case 'about': return <Info className="h-4 w-4" />;
      case 'privacy': return <Shield className="h-4 w-4" />;
      case 'terms': return <FileCheck className="h-4 w-4" />;
      case 'help': return <HelpCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPageTypeColor = (type: string) => {
    switch (type) {
      case 'about': return 'bg-blue-500';
      case 'privacy': return 'bg-green-500';
      case 'terms': return 'bg-orange-500';
      case 'help': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pages Management</h2>
          <p className="text-muted-foreground">Manage all website pages with advanced SEO features</p>
        </div>
        <Button onClick={resetForm} className="gap-2">
          <Plus className="h-4 w-4" />
          New Page
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pages List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="about">About</SelectItem>
                      <SelectItem value="privacy">Privacy</SelectItem>
                      <SelectItem value="terms">Terms</SelectItem>
                      <SelectItem value="help">Help</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Category</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {helpCategories.map(category => (
                        <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pages List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Object.entries(groupedPages).map(([type, typePages]) => (
              <div key={type} className="space-y-2">
                <div 
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-md cursor-pointer"
                  onClick={() => {
                    const newExpanded = new Set(expandedCategories);
                    if (expandedCategories.has(type)) {
                      newExpanded.delete(type);
                    } else {
                      newExpanded.add(type);
                    }
                    setExpandedCategories(newExpanded);
                  }}
                >
                  {expandedCategories.has(type) ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                  <div className={`w-2 h-2 rounded-full ${getPageTypeColor(type)}`} />
                  <span className="font-medium capitalize">{type} ({typePages.length})</span>
                </div>
                
                {expandedCategories.has(type) && (
                  <div className="ml-4 space-y-1">
                    {typePages.map(page => (
                      <Card key={page.id} className={`cursor-pointer transition-colors ${
                        selectedPage?.id === page.id ? 'ring-2 ring-primary' : ''
                      }`}>
                        <CardContent className="p-3" onClick={() => handleEditPage(page)}>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold line-clamp-2 text-sm">{page.title}</h3>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPage(page);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePage(page.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(page.updated_at), 'MMM dd, yyyy')}</span>
                            </div>
                            {page.help_category && (
                              <div className="flex items-center gap-2">
                                <Tag className="h-3 w-3" />
                                <span>{page.help_category}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-1 mt-2">
                            <Badge variant={page.published ? 'default' : 'secondary'} className="text-xs">
                              {page.published ? 'Published' : 'Draft'}
                            </Badge>
                            {page.featured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                            {page.seo_score && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Zap className="h-2 w-2" />
                                {page.seo_score}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Page Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedPage ? 'Edit Page' : 'Create New Page'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="help">Help</TabsTrigger>
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
                        placeholder="Page title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="page_type">Page Type</Label>
                      <Select 
                        value={formData.page_type || 'custom'} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, page_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="about">About</SelectItem>
                          <SelectItem value="privacy">Privacy Policy</SelectItem>
                          <SelectItem value="terms">Terms & Conditions</SelectItem>
                          <SelectItem value="help">Help Center</SelectItem>
                          <SelectItem value="custom">Custom Page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Short description of the page"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Page content (Markdown supported)"
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
                      placeholder="https://poddb.pro/page-slug"
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

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show_in_navigation"
                        checked={formData.show_in_navigation || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_in_navigation: checked }))}
                      />
                      <Label htmlFor="show_in_navigation">Show in Navigation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show_in_footer"
                        checked={formData.show_in_footer || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_in_footer: checked }))}
                      />
                      <Label htmlFor="show_in_footer">Show in Footer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allow_comments"
                        checked={formData.allow_comments || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_comments: checked }))}
                      />
                      <Label htmlFor="allow_comments">Allow Comments</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="require_auth"
                        checked={formData.require_auth || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, require_auth: checked }))}
                      />
                      <Label htmlFor="require_auth">Require Authentication</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="order_index">Order Index</Label>
                    <Input
                      id="order_index"
                      type="number"
                      value={formData.order_index || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Page category"
                    />
                  </div>
                </TabsContent>

                {/* Help Tab */}
                <TabsContent value="help" className="space-y-4">
                  <div>
                    <Label htmlFor="help_category">Help Category</Label>
                    <Select 
                      value={formData.help_category || ''} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, help_category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select help category" />
                      </SelectTrigger>
                      <SelectContent>
                        {helpCategories.map(category => (
                          <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty_level">Difficulty Level</Label>
                    <Select 
                      value={formData.difficulty_level || 'beginner'} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty_level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>FAQ Items</Label>
                    <div className="space-y-2">
                      {faqItems.map((item, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-2">
                            <Input
                              placeholder="Question"
                              value={item.question}
                              onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                            />
                            <Textarea
                              placeholder="Answer"
                              value={item.answer}
                              onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                              rows={2}
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeFaqItem(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        </Card>
                      ))}
                      <Button onClick={addFaqItem} className="w-full" variant="outline">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add FAQ Item
                      </Button>
                    </div>
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
                  <Button onClick={handleSavePage} disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Page'}
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

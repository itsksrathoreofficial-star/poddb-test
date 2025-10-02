"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Newspaper, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  Loader2, 
  Filter,
  TrendingUp,
  Star,
  Eye,
  Share2,
  Bookmark,
  Tag,
  Globe,
  Zap
} from 'lucide-react';
import { getSafeImageUrl, handleImageError } from '@/lib/image-utils';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  author_name: string | null;
  author_bio: string | null;
  author_photo_url: string | null;
  published_at: string | null;
  tags: string[] | null;
  category: string | null;
  featured_image_url: string | null;
  reading_time: number | null;
  seo_score: number | null;
  featured: boolean | null;
  social_title: string | null;
  social_description: string | null;
  social_image_url: string | null;
  profiles: { display_name: string } | null;
}

interface StaticNewsPageProps {
  articles: NewsArticle[];
}

export default function StaticNewsPage({ articles }: StaticNewsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(articles.map(article => article.category).filter(Boolean)));
    return cats;
  }, [articles]);

  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           article.author_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort articles
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.published_at || '').getTime() - new Date(b.published_at || '').getTime());
        break;
      case 'seo':
        filtered.sort((a, b) => (b.seo_score || 0) - (a.seo_score || 0));
        break;
      case 'reading_time':
        filtered.sort((a, b) => (a.reading_time || 0) - (b.reading_time || 0));
        break;
      case 'featured':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return filtered;
  }, [articles, searchTerm, selectedCategory, sortBy]);

  const featuredArticles = filteredAndSortedArticles.filter(article => article.featured);
  const regularArticles = filteredAndSortedArticles.filter(article => !article.featured);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatReadingTime = (minutes: number | null) => {
    if (!minutes) return '1 min read';
    return `${minutes} min read`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Header */}
        <div className="text-center space-y-6 py-12">
          <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-6 py-3 rounded-full">
            <Newspaper className="h-6 w-6" />
            <span className="font-semibold">Podcast News</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Stay Updated
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the latest trends, insights, and updates from the podcasting world. 
              Expert analysis, industry news, and exclusive content.
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>{articles.length} Articles</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{new Set(articles.map(a => a.author_name)).size} Authors</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>{categories.length} Categories</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search articles, authors, or topics..."
                className="pl-12 pr-4 py-3 text-lg bg-background/50 border-border/50 focus:border-primary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category || ''}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="seo">SEO Score</SelectItem>
                  <SelectItem value="reading_time">Reading Time</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="text-3xl font-bold">Featured Articles</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredArticles.slice(0, 2).map((article) => (
                <Card key={article.id} className="group cursor-pointer card-hover bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
                  <Link href={`/news/${article.slug}`}>
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={getSafeImageUrl(article.featured_image_url || article.social_image_url, '/placeholder.svg')}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-yellow-500/90 text-black font-semibold">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                      {article.seo_score && article.seo_score > 80 && (
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary" className="gap-1">
                            <Zap className="h-3 w-3" />
                            SEO: {article.seo_score}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-3 text-lg">
                          {article.social_description || article.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{article.author_name || 'PodDB Team'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(article.published_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatReadingTime(article.reading_time)}</span>
                        </div>
                      </div>

                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {article.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{article.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <Button variant="ghost" className="w-full justify-between group-hover:bg-primary/10">
                        Read Full Article
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular Articles */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Latest News</h2>
            <p className="text-muted-foreground">
              Showing {filteredAndSortedArticles.length} of {articles.length} articles
            </p>
          </div>
          
          {regularArticles.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-6"
            }>
              {regularArticles.map((article) => (
                <Card key={article.id} className="group cursor-pointer card-hover bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden h-full flex flex-col">
                  <Link href={`/news/${article.slug}`}>
                    {viewMode === 'grid' ? (
                      // Grid View
                      <>
                        <div className="aspect-video overflow-hidden relative">
                          <Image
                            src={getSafeImageUrl(article.featured_image_url || article.social_image_url, '/placeholder.svg')}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={handleImageError}
                          />
                          {article.seo_score && article.seo_score > 80 && (
                            <div className="absolute top-3 right-3">
                              <Badge variant="secondary" className="gap-1 text-xs">
                                <Zap className="h-3 w-3" />
                                {article.seo_score}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <CardContent className="p-6 space-y-4 flex-grow flex flex-col">
                          <div className="space-y-2 flex-grow">
                            <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-muted-foreground line-clamp-3">
                              {article.social_description || article.excerpt}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-3 w-3" />
                              </div>
                              <span className="font-medium">{article.author_name || 'PodDB Team'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(article.published_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatReadingTime(article.reading_time)}</span>
                            </div>
                          </div>

                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {article.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {article.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{article.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}

                          <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-primary/10 mt-auto">
                            Read Article
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </>
                    ) : (
                      // List View
                      <div className="flex">
                        <div className="w-1/3 aspect-video overflow-hidden relative">
                          <Image
                            src={getSafeImageUrl(article.featured_image_url || article.social_image_url, '/placeholder.svg')}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={handleImageError}
                          />
                        </div>
                        
                        <CardContent className="p-6 flex-1 space-y-3">
                          <div className="space-y-2">
                            <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-muted-foreground line-clamp-2">
                              {article.social_description || article.excerpt}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-3 w-3" />
                              </div>
                              <span className="font-medium">{article.author_name || 'PodDB Team'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(article.published_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatReadingTime(article.reading_time)}</span>
                            </div>
                            {article.category && (
                              <Badge variant="outline" className="text-xs">
                                {article.category}
                              </Badge>
                            )}
                          </div>

                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {article.tags.slice(0, 4).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {article.tags.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{article.tags.length - 4}
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </div>
                    )}
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Newspaper className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No articles are available at the moment.'}
              </p>
            </Card>
          )}
        </div>

        {/* Load More */}
        {articles.length > 0 && filteredAndSortedArticles.length < articles.length && (
          <div className="text-center pt-8">
            <Button variant="outline" size="lg" className="gap-2">
              Load More Articles
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

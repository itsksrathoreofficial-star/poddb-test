"use client";

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Clock } from 'lucide-react';

interface HelpSearchProps {
  pages: any[];
  categories: any[];
}

export default function HelpSearch({ pages, categories }: HelpSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredPages = useMemo(() => {
    let filtered = pages;

    if (searchQuery) {
      filtered = filtered.filter(page =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(page => page.help_category === selectedCategory);
    }

    return filtered;
  }, [pages, searchQuery, selectedCategory]);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 py-4 text-lg bg-background/50 border-border/50 focus:border-primary/50 h-14"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-muted/50"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('')}
            className="h-10 px-4 font-medium"
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.name ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.name)}
              className="h-10 px-4 font-medium"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-6">
        {filteredPages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">No articles found</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Try adjusting your search terms or browse by category to find what you're looking for.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {searchQuery || selectedCategory ? 'Search Results' : 'All Articles'}
              </h2>
              <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                {filteredPages.length} article{filteredPages.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid gap-6">
              {filteredPages.map((page) => (
                <Link key={page.id} href={`/help/${page.slug}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm cursor-pointer border-border/50 hover:border-primary/20">
                    <CardContent className="p-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          {page.featured && (
                            <Badge className="bg-yellow-500/90 text-black text-xs font-medium">
                              Featured
                            </Badge>
                          )}
                          <Badge 
                            variant="outline" 
                            className={`text-xs font-medium ${
                              page.difficulty_level === 'beginner' ? 'border-green-500 text-green-600' :
                              page.difficulty_level === 'intermediate' ? 'border-yellow-500 text-yellow-600' :
                              'border-red-500 text-red-600'
                            }`}
                          >
                            {page.difficulty_level}
                          </Badge>
                          {page.help_category && (
                            <Badge variant="secondary" className="text-xs font-medium">
                              {page.help_category}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-xl group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {page.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                          {page.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{page.reading_time || Math.ceil((page.content?.split(' ').length || 0) / 200)} min read</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

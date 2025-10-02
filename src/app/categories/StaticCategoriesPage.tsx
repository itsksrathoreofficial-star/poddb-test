"use client";
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, ListMusic } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { PodcastCard } from '@/components/PodcastCard';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  category: string;
  podcast_count: number;
}

interface Podcast {
  id: string;
  title: string;
  description: string;
  slug: string;
  cover_image_url: string;
  total_episodes: number;
  total_views: number;
  total_likes: number;
  categories: string[];
  average_duration: number;
  last_episode_date: string;
}

interface StaticCategoriesPageProps {
  initialData: Category[];
}

function CategoriesPageContent({ initialData }: { initialData: Category[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [allCategories, setAllCategories] = useState<Category[]>(initialData);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingPodcasts, setLoadingPodcasts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const categoryFromUrl = searchParams.get('name');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
      fetchPodcastsForCategory(categoryFromUrl);
    }
  }, [searchParams]);

  const fetchPodcastsForCategory = async (categoryName: string) => {
    try {
      setLoadingPodcasts(true);
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .eq('submission_status', 'approved')
        .contains('categories', [categoryName])
        .order('total_views', { ascending: false });

      if (error) throw error;
      setPodcasts(data || []);
    } catch (error: any) {
      toast.error(`Failed to fetch podcasts for ${categoryName}: ${error.message}`);
    } finally {
      setLoadingPodcasts(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/categories?name=${encodeURIComponent(categoryName)}`);
  };
  
  const handleClearCategory = () => {
      router.push('/categories');
  }

  const filteredCategories = useMemo(() => {
    return allCategories.filter(cat =>
      cat.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCategories, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg">
            <ListMusic className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">
              {selectedCategory ? `Category: ${selectedCategory}` : 'All Categories'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {selectedCategory 
                ? `Discover the best podcasts in the ${selectedCategory} category.`
                : 'Browse all podcast categories to find your next favorite show.'
              }
            </p>
          </div>
        </div>

        {selectedCategory && (
            <Button onClick={handleClearCategory}>Back to All Categories</Button>
        )}
      </div>

      {/* Main Content */}
      {selectedCategory ? (
        // Podcasts for selected category view
        <div>
          {loadingPodcasts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
            </div>
          ) : podcasts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {podcasts.map((podcast) => (
                <PodcastCard
                  key={podcast.id}
                  id={podcast.id}
                  slug={podcast.slug}
                  title={podcast.title}
                  description={podcast.description}
                  coverImage={podcast.cover_image_url}
                  totalEpisodes={podcast.total_episodes}
                  totalViews={podcast.total_views}
                  totalLikes={podcast.total_likes}
                  categories={podcast.categories}
                  averageDuration={podcast.average_duration}
                  lastEpisodeDate={podcast.last_episode_date}
                />
              ))}
            </div>
          ) : (
            <p className="text-center py-16 text-muted-foreground">No podcasts found for this category.</p>
          )}
        </div>
      ) : (
        // All categories view
        <div className="space-y-8">
            <div className="max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                    placeholder="Search categories..."
                    className="pl-10 bg-input border-border focus:border-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredCategories.map((cat) => (
                    <Card key={cat.category} className="group cursor-pointer card-hover bg-card border-border" onClick={() => handleCategoryClick(cat.category)}>
                        <CardContent className="p-6 text-center space-y-2">
                            <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                            {cat.category}
                            </h3>
                            <p className="text-muted-foreground">
                            {cat.podcast_count.toLocaleString()} podcasts
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}

export default function StaticCategoriesPage({ initialData }: StaticCategoriesPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading categories...</span>
        </div>
      </div>
    }>
      <CategoriesPageContent initialData={initialData} />
    </Suspense>
  );
}

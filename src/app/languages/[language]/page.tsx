import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { PodcastCard } from '@/components/PodcastCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe } from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: Promise<{ language: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language } = await params;
  const decodedLanguage = decodeURIComponent(language);
  
  return {
    title: `Podcasts in ${decodedLanguage} | PodDB Pro`,
    description: `Discover the best podcasts in ${decodedLanguage}. Browse ${decodedLanguage} language podcasts on PodDB Pro.`,
  };
}

export default async function LanguagePage({ params }: Props) {
  const { language } = await params;
  const decodedLanguage = decodeURIComponent(language);

  // Fetch podcasts in this language
  const { data: podcasts, error } = await supabase
    .from('podcasts')
    .select('*')
    .eq('submission_status', 'approved')
    .eq('language', decodedLanguage)
    .order('total_views', { ascending: false });

  if (error) {
    console.error('Error fetching podcasts:', error);
    notFound();
  }

  if (!podcasts || podcasts.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-primary text-primary-foreground p-3 rounded-lg">
              <Globe className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">
                Podcasts in {decodedLanguage}
              </h1>
              <p className="text-muted-foreground text-lg">
                Discover {podcasts.length} podcast{podcasts.length !== 1 ? 's' : ''} in {decodedLanguage}
              </p>
            </div>
          </div>
        </div>

        {/* Language Badge */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Language:</span>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {decodedLanguage}
          </Badge>
        </div>

        {/* Podcasts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {podcasts.map((podcast) => (
            <PodcastCard
              key={(podcast as any).id}
              id={(podcast as any).id}
              slug={(podcast as any).slug}
              title={(podcast as any).title}
              description={(podcast as any).description}
              coverImage={(podcast as any).cover_image_url}
              totalEpisodes={(podcast as any).total_episodes}
              totalViews={(podcast as any).total_views}
              totalLikes={(podcast as any).total_likes}
              categories={Array.isArray((podcast as any).categories) ? (podcast as any).categories : [(podcast as any).category]}
              averageDuration={(podcast as any).average_duration}
              lastEpisodeDate={(podcast as any).last_episode_date}
              isVerified={(podcast as any).is_verified}
              averageRating={(podcast as any).average_rating}
              ratingCount={(podcast as any).rating_count}
            />
          ))}
        </div>

        {/* No podcasts message */}
        {podcasts.length === 0 && (
          <div className="text-center py-12">
            <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No podcasts found</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find any podcasts in {decodedLanguage} yet.
            </p>
            <Button asChild>
              <Link href="/contribute">
                Contribute a Podcast
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PodcastClientPage from '@/app/podcasts/[slug]/PodcastClientPage';
import { getPodcastById } from '@/app/actions/podcasts';

interface Props {
  params: Promise<{ podcastId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { podcastId } = await params;
  
  try {
    const podcast = await getPodcastById(podcastId);
    
    return {
      title: `Preview: ${podcast.title} | PodDB`,
      description: podcast.description || `Preview of ${podcast.title} podcast`,
      openGraph: {
        title: `Preview: ${podcast.title}`,
        description: podcast.description || `Preview of ${podcast.title} podcast`,
        images: podcast.cover_image_url ? [podcast.cover_image_url] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `Preview: ${podcast.title}`,
        description: podcast.description || `Preview of ${podcast.title} podcast`,
        images: podcast.cover_image_url ? [podcast.cover_image_url] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Podcast Preview | PodDB',
      description: 'Preview of podcast submission',
    };
  }
}

export default async function PodcastPreviewPage({ params }: Props) {
  const { podcastId } = await params;
  
  try {
    const podcast = await getPodcastById(podcastId);
    
    return (
      <div className="min-h-screen bg-background">
        {/* Preview Banner */}
        <div className="bg-yellow-100 border-b border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                  Preview Mode - This is how the podcast will appear to users
                </span>
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                ID: {podcastId}
              </div>
            </div>
          </div>
        </div>
        
        {/* Podcast Content */}
        <PodcastClientPage podcast={podcast} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching podcast for preview:', error);
    notFound();
  }
}

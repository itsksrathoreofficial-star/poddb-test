import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';
import StaticSearchPage from './StaticSearchPage';

// Enable static generation
export const dynamic = 'force-static';
export const revalidate = false; // Fully static, no revalidation

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Search - PodDB Pro',
    description: 'Search through thousands of podcasts, episodes, and people in the world\'s largest podcast database.',
    keywords: 'podcast search, find podcasts, search episodes, podcast discovery, podcast database',
    openGraph: {
      title: 'Search - PodDB Pro',
      description: 'Search through thousands of podcasts, episodes, and people in the world\'s largest podcast database.',
      type: 'website',
      url: 'https://poddb.pro/search',
      images: [
        {
          url: '/og-search.jpg',
          width: 1200,
          height: 630,
          alt: 'Search - PodDB Pro',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Search - PodDB Pro',
      description: 'Search through thousands of podcasts, episodes, and people in the world\'s largest podcast database.',
      images: ['/og-search.jpg'],
    },
    alternates: {
      canonical: 'https://poddb.pro/search',
    },
  };
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-center items-center py-16">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading search page...</span>
          </div>
        </div>
      </div>
    }>
      <StaticSearchPage />
    </Suspense>
  );
}
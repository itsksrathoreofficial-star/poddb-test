#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Generating static pages for better performance...');

// 1. Create static generation for categories page
const categoriesPage = `import { Metadata } from 'next';
import { createClient } from '@/integrations/supabase/server';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Podcast Categories - PodDB Pro',
    description: 'Browse podcasts by category. Discover podcasts in Technology, Business, Comedy, News, and more.',
    keywords: 'podcast categories, podcast genres, browse podcasts, podcast discovery',
  };
}

async function getCategories() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('podcasts')
      .select('categories')
      .not('categories', 'is', null);

    if (error) throw error;

    const categoryCounts = {};
    data.forEach(podcast => {
      podcast.categories?.forEach(category => {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
    });

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Podcast Categories</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover podcasts organized by category and genre
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map(({ category, count }) => (
            <div key={category} className="group">
              <a
                href={\`/rankings?category=\${encodeURIComponent(category)}\`}
                className="block p-6 border rounded-lg hover:border-primary transition-colors"
              >
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {category}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {count} podcast{count !== 1 ? 's' : ''}
                </p>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(process.cwd(), 'src/app/categories/page.tsx'), categoriesPage);

// 2. Create static generation for people page
const peoplePage = `import { Metadata } from 'next';
import { createClient } from '@/integrations/supabase/server';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Podcast People - PodDB Pro',
    description: 'Discover podcast hosts, guests, and creators. Find your favorite podcast personalities.',
    keywords: 'podcast people, podcast hosts, podcast guests, podcast creators, podcast personalities',
  };
}

async function getFeaturedPeople() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('people')
      .select('id, slug, full_name, photo_urls, total_appearances, primary_role')
      .order('total_appearances', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching people:', error);
    return [];
  }
}

export default async function PeoplePage() {
  const people = await getFeaturedPeople();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Podcast People</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the hosts, guests, and creators shaping the podcasting world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {people.map((person) => (
            <div key={person.id} className="group">
              <a
                href={\`/people/\${person.slug}\`}
                className="block text-center space-y-4"
              >
                <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden">
                  <img
                    src={person.photo_urls?.[0] || '/placeholder.svg'}
                    alt={person.full_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {person.full_name}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {person.primary_role || 'Creator'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {person.total_appearances} appearance{person.total_appearances !== 1 ? 's' : ''}
                  </p>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(process.cwd(), 'src/app/people/page.tsx'), peoplePage);

// 3. Create static generation for news page
const newsPage = `import { Metadata } from 'next';
import { createClient } from '@/integrations/supabase/server';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-static';
export const revalidate = 1800; // Revalidate every 30 minutes

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Podcast News - PodDB Pro',
    description: 'Stay updated with the latest news and trends in the podcasting industry.',
    keywords: 'podcast news, podcast industry, podcast trends, podcast updates',
  };
}

async function getLatestNews() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('news_articles')
      .select('id, title, slug, excerpt, featured_image_url, published_at')
      .order('published_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export default async function NewsPage() {
  const news = await getLatestNews();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Podcast News</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest news and trends in the podcasting industry
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article) => (
            <article key={article.id} className="group">
              <Link href={\`/news/\${article.slug}\`}>
                <div className="block">
                  <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src={article.featured_image_url || '/placeholder.svg'}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(article.published_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(process.cwd(), 'src/app/news/page.tsx'), newsPage);

console.log('✅ Static pages generated successfully!');
console.log('');
console.log('📄 Generated pages:');
console.log('- /categories - Static category listing');
console.log('- /people - Static people directory');
console.log('- /news - Static news listing');
console.log('');
console.log('🚀 These pages will now load much faster!');

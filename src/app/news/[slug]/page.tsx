import { supabase } from '@/integrations/supabase/client';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowLeft,
  Share2,
  Bookmark,
  Eye,
  Tag,
  Globe,
  Zap,
  Star,
  TrendingUp,
  MessageCircle,
  Heart
} from 'lucide-react';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getSafeImageUrl, handleImageError } from '@/lib/image-utils';

type Props = {
  params: Promise<{ slug: string }>;
};

// This function generates the static pages at build time
export async function generateStaticParams() {
  const { data: articles } = await supabase
    .from('news_articles')
    .select('slug')
    .eq('published', true);

  return articles?.map(({ slug }) => ({
    slug,
  })) || [];
}

// This function fetches the article data
async function getArticle(slug: string) {
  const { data, error } = await supabase
    .from('news_articles')
    .select(`
      *,
      profiles ( display_name, avatar_url )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !data) {
    notFound();
  }

  return data;
}

// This function generates SEO metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: (article as any).meta_title || (article as any).social_title || (article as any).title,
    description: (article as any).meta_description || (article as any).social_description || (article as any).excerpt,
    keywords: (article as any).meta_keywords || (article as any).tags || [],
    authors: (article as any).author_name ? [{ name: (article as any).author_name }] : undefined,
    openGraph: {
      title: (article as any).social_title || (article as any).title,
      description: (article as any).social_description || (article as any).excerpt,
      images: (article as any).social_image_url ? [(article as any).social_image_url] : 
              (article as any).featured_image_url ? [(article as any).featured_image_url] : [],
      type: 'article',
      publishedTime: (article as any).published_at || undefined,
      authors: (article as any).author_name ? [(article as any).author_name] : undefined,
      tags: (article as any).tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: (article as any).social_title || (article as any).title,
      description: (article as any).social_description || (article as any).excerpt,
      images: (article as any).social_image_url ? [(article as any).social_image_url] : 
              (article as any).featured_image_url ? [(article as any).featured_image_url] : [],
    },
    alternates: {
      canonical: (article as any).canonical_url || `https://poddb.pro/news/${slug}`,
    },
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatReadingTime = (minutes: number | null) => {
    if (!minutes) return '1 min read';
    return `${minutes} min read`;
  };

  // Get related articles
  const { data: relatedArticles } = await supabase
    .from('news_articles')
    .select('id, title, slug, excerpt, featured_image_url, published_at, author_name, reading_time')
    .eq('published', true)
    .neq('id', (article as any).id)
    .limit(3)
    .order('published_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/news">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to News
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Article */}
          <article className="lg:col-span-3 space-y-8">
            {/* Article Header */}
            <header className="space-y-6">
              {/* Category and Tags */}
              <div className="flex flex-wrap gap-2">
                {(article as any).category && (
                  <Badge variant="default" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {(article as any).category}
                  </Badge>
                )}
                {(article as any).featured && (
                  <Badge variant="outline" className="gap-1">
                    <Star className="h-3 w-3" />
                    Featured
                  </Badge>
                )}
                {(article as any).seo_score && (article as any).seo_score > 80 && (
                  <Badge variant="secondary" className="gap-1">
                    <Zap className="h-3 w-3" />
                    SEO: {(article as any).seo_score}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                {(article as any).title}
              </h1>

              {/* Excerpt */}
              {(article as any).excerpt && (
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {(article as any).excerpt}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{(article as any).author_name || 'PodDB Team'}</p>
                    {(article as any).author_bio && (
                      <p className="text-xs text-muted-foreground">{(article as any).author_bio}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={(article as any).published_at || ''}>{formatDate((article as any).published_at)}</time>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatReadingTime((article as any).reading_time)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>1.2k views</span>
                </div>
              </div>

              {/* Tags */}
              {(article as any).tags && (article as any).tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(article as any).tags.map((tag: any) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Bookmark className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Like
                </Button>
              </div>
            </header>
            
            {/* Featured Image */}
            {(article as any).featured_image_url && (
              <div className="relative aspect-video overflow-hidden rounded-xl">
                <Image 
                  src={getSafeImageUrl((article as any).featured_image_url, '/placeholder.svg')} 
                  alt={(article as any).title}
                  fill
                  className="object-cover"
                  priority
                  onError={handleImageError}
                />
              </div>
            )}
            
            {/* Article Content */}
            <div className="prose prose-invert prose-lg max-w-none prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:p-4 prose-blockquote:rounded-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {(article as any).content}
              </ReactMarkdown>
            </div>

            {/* Author Bio */}
            {(article as any).author_name && (article as any).author_bio && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {(article as any).author_photo_url && (
                      <Image
                        src={getSafeImageUrl((article as any).author_photo_url, '/placeholder.svg')}
                        alt={(article as any).author_name}
                        width={80}
                        height={80}
                        className="rounded-full"
                      />
                    )}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">About {(article as any).author_name}</h3>
                      <p className="text-muted-foreground">{(article as any).author_bio}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Schema Markup */}
            {(article as any).schema_markup && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify((article as any).schema_markup),
                }}
              />
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Related Articles */}
            {relatedArticles && relatedArticles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Related Articles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedArticles.map((relatedArticle: any) => (
                    <Link key={(relatedArticle as any).id} href={`/news/${(relatedArticle as any).slug}`}>
                      <div className="group cursor-pointer space-y-2">
                        <div className="aspect-video relative overflow-hidden rounded-lg">
                          <Image
                            src={getSafeImageUrl((relatedArticle as any).featured_image_url, '/placeholder.svg')}
                            alt={(relatedArticle as any).title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <h4 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {(relatedArticle as any).title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{(relatedArticle as any).author_name || 'PodDB Team'}</span>
                          <span>•</span>
                          <span>{formatDate((relatedArticle as any).published_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Newsletter Signup */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Stay Updated</h3>
                  <p className="text-sm text-muted-foreground">
                    Get the latest podcast news delivered to your inbox.
                  </p>
                </div>
                <Button className="w-full">
                  Subscribe to Newsletter
                </Button>
              </CardContent>
            </Card>

            {/* SEO Stats */}
            {(article as any).seo_score && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    SEO Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overall Score</span>
                      <span className="font-semibold">{(article as any).seo_score}/100</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(article as any).seo_score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(article as any).seo_score > 80 ? 'Excellent SEO optimization' :
                       (article as any).seo_score > 60 ? 'Good SEO optimization' :
                       'Needs SEO improvement'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
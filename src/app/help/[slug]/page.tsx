import { supabase } from '@/integrations/supabase/client';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const revalidate = false;
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { Calendar, Tag, Clock, User, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Props = {
  params: Promise<{ slug: string }>;
};

// Generate static pages for each help article at build time
export async function generateStaticParams() {
  const { data: pages } = await supabase
    .from('pages')
    .select('slug')
    .eq('page_type', 'help')
    .eq('published', true) as { data: any };

  return pages?.map((page: any) => ({ slug: page.slug })) || [];
}

// Generate SEO metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('page_type', 'help')
    .eq('published', true)
    .single() as { data: any };

  if (!page) {
    return {
      title: 'Help Article Not Found',
    };
  }

  return {
    title: page.meta_title || `${page.title} - PodDB Help Center`,
    description: page.meta_description || page.excerpt,
    keywords: page.meta_keywords,
    alternates: {
      canonical: page.canonical_url || `/help/${page.slug}`,
    },
    openGraph: {
      title: page.social_title || page.meta_title || `${page.title} - PodDB Help Center`,
      description: page.social_description || page.meta_description || page.excerpt,
      images: page.social_image_url ? [{ url: page.social_image_url }] : [],
      url: page.canonical_url || `/help/${page.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.social_title || page.meta_title || `${page.title} - PodDB Help Center`,
      description: page.social_description || page.meta_description || page.excerpt,
      images: page.social_image_url ? [page.social_image_url] : [],
    },
  };
}

// Main component for rendering the help article
export default async function HelpArticlePage({ params }: Props) {
  const { slug } = await params;
  
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('page_type', 'help')
    .eq('published', true)
    .single() as { data: any };

  if (!page) {
    notFound();
  }

  // Get related pages
  const { data: relatedPages } = await supabase
    .from('pages')
    .select('id, title, slug, excerpt, featured_image_url')
    .eq('page_type', 'help')
    .eq('published', true)
    .eq('help_category', page.help_category)
    .neq('id', page.id)
    .limit(3) as { data: any };

  // FAQ Schema
  const faqSchema = page.faq_items && Array.isArray(page.faq_items) ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": page.faq_items.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        )}

        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {page.help_category && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                      {page.help_category}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium">
                {page.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Article Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            {page.title}
          </h1>
          
          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4"/>
              <span>Last updated: {new Date(page.updated_at).toLocaleDateString()}</span>
            </div>
            {page.help_category && (
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4"/>
                <span>{page.help_category}</span>
              </div>
            )}
            {page.reading_time && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4"/>
                <span>{page.reading_time} min read</span>
              </div>
            )}
            {page.difficulty_level && (
              <Badge
                variant="outline"
                className={`capitalize font-medium ${
                  page.difficulty_level === 'beginner' ? 'border-green-500 text-green-600' :
                  page.difficulty_level === 'intermediate' ? 'border-yellow-500 text-yellow-600' :
                  'border-red-500 text-red-600'
                }`}
              >
                {page.difficulty_level}
              </Badge>
            )}
          </div>

          {/* Author Info */}
          {page.author_name && (
            <div className="flex items-center space-x-4 p-4 bg-card/50 backdrop-blur-sm border rounded-lg mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{page.author_name}</p>
                {page.author_bio && (
                  <p className="text-sm text-muted-foreground">{page.author_bio}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Article Content */}
        <article className="prose prose-sm prose-invert max-w-none
          prose-headings:font-semibold prose-headings:text-foreground
          prose-h1:hidden
          prose-h2:text-lg prose-h2:mb-3 prose-h2:mt-6 prose-h2:leading-tight prose-h2:font-semibold
          prose-h3:text-base prose-h3:mb-2 prose-h3:mt-4 prose-h3:leading-tight prose-h3:font-semibold
          prose-h4:text-sm prose-h4:mb-2 prose-h4:mt-3 prose-h4:leading-tight prose-h4:font-semibold
          prose-p:text-sm prose-p:leading-relaxed prose-p:mb-3 prose-p:text-foreground/90
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
          prose-strong:text-foreground prose-strong:font-semibold
          prose-li:text-foreground/90 prose-li:leading-relaxed prose-li:mb-1 prose-li:text-sm
          prose-ul:mb-3 prose-ol:mb-3
          prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-3 prose-blockquote:rounded-r-lg prose-blockquote:text-sm
          prose-code:text-xs prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono
          prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg prose-pre:p-3 prose-pre:overflow-x-auto prose-pre:text-xs
          prose-table:border-collapse prose-table:w-full prose-table:mb-3 prose-table:text-xs
          prose-th:border prose-th:border-border prose-th:px-2 prose-th:py-1 prose-th:bg-muted prose-th:font-semibold prose-th:text-left prose-th:text-xs
          prose-td:border prose-td:border-border prose-td:px-2 prose-td:py-1 prose-td:text-xs
          prose-img:rounded-lg prose-img:shadow-lg prose-img:mb-3
          prose-hr:border-border prose-hr:my-4
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {page.content}
          </ReactMarkdown>
        </article>

        {/* FAQ Section */}
        {page.faq_items && Array.isArray(page.faq_items) && page.faq_items.length > 0 && (
          <div className="mt-12 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-3">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Quick answers to common questions</p>
            </div>
            <div className="space-y-3">
              {page.faq_items.map((faq: any, index: number) => (
                <div key={index} className="bg-card/50 backdrop-blur-sm border rounded-lg p-4 hover:bg-card/70 transition-colors">
                  <h3 className="font-semibold text-base text-foreground mb-2 flex items-start">
                    <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                      Q
                    </span>
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed ml-8 text-sm">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {relatedPages && relatedPages.length > 0 && (
          <div className="mt-12 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-3">Related Articles</h2>
              <p className="text-muted-foreground">Continue learning with these related topics</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {relatedPages.map((relatedPage: any) => (
                <Link
                  key={relatedPage.id}
                  href={`/help/${relatedPage.slug}`}
                  className="group block p-4 bg-card/50 backdrop-blur-sm border rounded-lg hover:bg-card/70 hover:shadow-lg transition-all duration-300"
                >
                  <h3 className="font-semibold text-base text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {relatedPage.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {relatedPage.excerpt}
                  </p>
                  <div className="mt-3 flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Read more
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Help Center */}
        <div className="mt-8 text-center">
          <Link
            href="/help"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
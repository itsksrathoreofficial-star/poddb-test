import { createServiceClient } from '@/integrations/supabase/service';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

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
  TrendingUp,
  MessageCircle,
  Heart,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getSafeImageUrl, handleImageError } from '@/lib/image-utils';

type Props = {
  params: Promise<{ previewId: string }>;
};

// This function generates the static pages at build time
export async function generateStaticParams() {
  // For now, return empty array to avoid build errors
  // TODO: Implement proper static generation when database is available
  return [];
}

// This function fetches the preview data
async function getPreview(previewId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('preview_updates')
    .select(`
      *,
      profiles ( display_name, avatar_url )
    `)
    .eq('id', previewId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { previewId } = await params;
  const preview = await getPreview(previewId);

  if (!preview) {
    return {
      title: 'Preview Not Found | PodDB Updates',
      description: 'The requested preview could not be found.',
    };
  }

  return {
    title: `${preview.title} | PodDB Updates Preview`,
    description: preview.description || 'Preview the latest updates from PodDB.',
    openGraph: {
      title: preview.title,
      description: preview.description,
      images: preview.image_url ? [preview.image_url] : [],
      type: 'article',
      publishedTime: preview.created_at,
      authors: preview.author_name ? [preview.author_name] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: preview.title,
      description: preview.description,
      images: preview.image_url ? [preview.image_url] : [],
    },
  };
}

export default async function PreviewUpdatePage({ params }: Props) {
  const { previewId } = await params;
  const preview = await getPreview(previewId);

  if (!preview) {
    notFound();
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

      return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" asChild>
              <Link href="/preview-updates">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Previews
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Preview Header */}
          <header className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Badge variant="secondary">Preview</Badge>
              <Badge className={getStatusColor(preview.status)}>
                {getStatusIcon(preview.status)}
                <span className="ml-1 capitalize">{preview.status}</span>
            </Badge>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(preview.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {preview.title}
            </h1>

            {preview.description && (
              <p className="text-xl text-muted-foreground mb-6">
                {preview.description}
              </p>
            )}

            <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{preview.author_name || 'PodDB Team'}</span>
            </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{preview.views || 0} views</span>
        </div>
      </div>

            {preview.image_url && (
              <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
                <Image
                  src={getSafeImageUrl(preview.image_url)}
                  alt={preview.title}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                />
              </div>
            )}
          </header>

          {/* Preview Content */}
          <article className="prose prose-lg max-w-none mb-12">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold mb-6 text-foreground">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold mb-4 text-foreground">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 text-foreground leading-relaxed">
                    {children}
                  </p>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                img: ({ src, alt }) => (
                  <div className="my-6">
                    <Image
                      src={getSafeImageUrl(src || '')}
                      alt={alt || ''}
                      width={800}
                      height={400}
                      className="rounded-lg w-full h-auto"
                      onError={handleImageError}
                    />
                  </div>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-6">
                    {children}
                  </pre>
                ),
              }}
            >
              {preview.content || preview.description || ''}
            </ReactMarkdown>
          </article>

          {/* Preview Tags */}
          {preview.tags && preview.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {preview.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
        ))}
      </div>
                </div>
          )}

          {/* Preview Stats */}
          <div className="flex items-center justify-between py-6 border-t border-b mb-8">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {preview.likes || 0} likes
                </span>
                  </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {preview.comments || 0} comments
                </span>
                  </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {preview.views || 0} views
                </span>
                  </div>
                  </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
        </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Save
          </Button>
        </div>
      </div>

          {/* Admin Actions */}
          {preview.status === 'pending' && (
            <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-yellow-800">
                Admin Actions Required
              </h3>
              <div className="flex space-x-4">
                <Button className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button variant="destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
              </Button>
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Add Comment
              </Button>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}



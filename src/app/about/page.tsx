import { supabase } from '@/integrations/supabase/client';

// Enable static generation for maximum performance
export const dynamic = 'force-static';
export const revalidate = false; // Fully static, no revalidation

import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Target, 
  Award, 
  Globe, 
  Heart,
  Zap,
  Shield,
  BookOpen,
  MessageCircle,
  TrendingUp,
  Star,
  CheckCircle
} from 'lucide-react';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// This function fetches the about page data
async function getAboutPage() {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('page_type', 'about')
    .eq('published', true)
    .single();

  if (error || !data) {
    // Fallback to default content
    return {
      title: 'About PodDB Pro',
      content: `# About PodDB Pro

Welcome to PodDB Pro, the ultimate platform for podcast discovery, management, and analytics.

## Our Mission

We are dedicated to revolutionizing the podcasting landscape by providing creators, listeners, and industry professionals with powerful tools and insights.

## What We Offer

- **Comprehensive Database**: Access to thousands of podcasts across all genres
- **Advanced Analytics**: Detailed insights and performance metrics
- **Creator Tools**: Everything you need to manage and grow your podcast
- **Community Features**: Connect with fellow podcast enthusiasts

## Our Team

Our team consists of passionate podcast enthusiasts, developers, and industry experts working together to build the future of podcasting.

## Contact Us

Have questions or feedback? We'd love to hear from you!`,
      meta_title: 'About PodDB Pro - The Ultimate Podcast Platform',
      meta_description: 'Learn about PodDB Pro, the comprehensive platform for podcast discovery, management, and analytics. Join thousands of podcast enthusiasts.',
      featured_image_url: null,
      author_name: 'PodDB Team',
      author_bio: 'The team behind PodDB Pro',
      tags: ['about', 'podcast', 'platform', 'community'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return data;
}

// This function generates SEO metadata for the page
export async function generateMetadata(): Promise<Metadata> {
  const page = await getAboutPage();

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || 'Learn about PodDB Pro, the comprehensive platform for podcast discovery, management, and analytics.',
    keywords: page.tags || ['about', 'podcast', 'platform', 'community'],
    authors: page.author_name ? [{ name: page.author_name }] : undefined,
    openGraph: {
      title: page.title,
      description: page.meta_description || 'Learn about PodDB Pro, the comprehensive platform for podcast discovery, management, and analytics.',
      images: page.featured_image_url ? [page.featured_image_url] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.meta_description || 'Learn about PodDB Pro, the comprehensive platform for podcast discovery, management, and analytics.',
      images: page.featured_image_url ? [page.featured_image_url] : [],
    },
    alternates: {
      canonical: 'https://poddb.pro/about',
    },
  };
}

export default async function AboutPage() {
  const page = await getAboutPage();

  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Comprehensive Database",
      description: "Access to thousands of podcasts across all genres and languages"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Detailed insights and performance metrics for creators and listeners"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Features",
      description: "Connect with fellow podcast enthusiasts and discover new content"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Creator Tools",
      description: "Everything you need to manage and grow your podcast"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure Platform",
      description: "Your data is protected with enterprise-grade security"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Reach",
      description: "Available worldwide with support for multiple languages"
    }
  ];

  const stats = [
    { label: "Active Users", value: "10,000+" },
    { label: "Podcasts", value: "50,000+" },
    { label: "Episodes", value: "1M+" },
    { label: "Countries", value: "150+" }
  ];

  const team = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      bio: "Passionate about podcasting and technology",
      image: "/placeholder.svg"
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      bio: "Full-stack developer with 10+ years experience",
      image: "/placeholder.svg"
    },
    {
      name: "Mike Rodriguez",
      role: "Head of Product",
      bio: "Product strategist focused on user experience",
      image: "/placeholder.svg"
    },
    {
      name: "Emily Davis",
      role: "Community Manager",
      bio: "Building connections in the podcast community",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-16">
          <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-6 py-3 rounded-full">
            <Heart className="h-6 w-6" />
            <span className="font-semibold">About PodDB Pro</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {page.title}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We&apos;re building the future of podcast discovery, management, and analytics. 
            Join thousands of creators and listeners who trust PodDB Pro.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="prose prose-invert prose-lg max-w-none prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:p-4 prose-blockquote:rounded-lg">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {page.content}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            {page.author_name && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{page.author_name}</h3>
                      {page.author_bio && (
                        <p className="text-sm text-muted-foreground">{page.author_bio}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {page.tags && page.tags.length > 0 && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {page.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose PodDB Pro?</h2>
            <p className="text-muted-foreground text-lg">
              Powerful features designed for podcast creators and listeners
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground text-lg">
              The passionate people behind PodDB Pro
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-primary font-medium">{member.role}</p>
                    <p className="text-sm text-muted-foreground mt-2">{member.bio}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground text-lg mb-6">
                Join thousands of podcast enthusiasts and discover your next favorite show.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2">
                <Star className="h-5 w-5" />
                Start Exploring
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AboutPage",
              "name": page.title,
              "description": page.meta_description,
              "url": "https://poddb.pro/about",
              "mainEntity": {
                "@type": "Organization",
                "name": "PodDB Pro",
                "description": "The comprehensive platform for podcast discovery, management, and analytics"
              }
            }),
          }}
        />
      </div>
    </div>
  );
}
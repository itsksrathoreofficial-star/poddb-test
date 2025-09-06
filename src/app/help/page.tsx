import { supabase } from '@/integrations/supabase/client';

// Enable static generation for maximum performance
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  MessageCircle, 
  Clock,
  User,
  Star,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import HelpSearch from './components/HelpSearch';
import { submitContactForm } from '@/app/actions/contact';

// Wrapper function for form action
async function handleContactForm(formData: FormData): Promise<void> {
  'use server';
  await submitContactForm(formData);
  // The form will handle the response via redirect or other means
}

// This function fetches help center data
async function getHelpCenterData() {
  const { data: pages, error: pagesError } = await supabase
    .from('pages')
    .select('*')
    .eq('page_type', 'help')
    .eq('published', true)
    .order('order_index', { ascending: true });

  const { data: categories, error: categoriesError } = await supabase
    .from('help_categories')
    .select('*')
    .order('order_index', { ascending: true });

  if (pagesError || categoriesError) {
    console.error('Error fetching help data:', pagesError || categoriesError);
    // Fallback to default content
    return {
      pages: [
        {
          id: '1',
          title: 'Getting Started with PodDB Pro',
          content: '# Getting Started\n\nWelcome to PodDB Pro! This guide will help you get started.\n\n## Creating Your Account\n\n1. Click the "Sign Up" button\n2. Enter your email and password\n3. Verify your email address\n4. Complete your profile\n\n## Exploring Podcasts\n\n- Use the search bar to find podcasts\n- Browse by category\n- Check out trending content\n- Save your favorites',
          excerpt: 'Learn how to get started with PodDB Pro',
          help_category: 'Getting Started',
          difficulty_level: 'beginner',
          tags: ['getting-started', 'tutorial', 'basics'],
          slug: 'getting-started-with-poddb-pro',
          featured: true,
          reading_time: 5,
          author_name: 'PodDB Team',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      categories: [
        {
          id: '1',
          name: 'Getting Started',
          description: 'Learn the basics of PodDB Pro',
          icon: 'play-circle',
          color: 'blue',
          order_index: 1
        }
      ]
    };
  }

  return { pages: pages || [], categories: categories || [] };
}

export const metadata: Metadata = {
  title: 'Help Center - PodDB Pro',
  description: 'Find answers to common questions, learn how to use PodDB Pro, and get the support you need.',
  keywords: 'help, support, documentation, tutorial, guide, PodDB Pro',
};

export default async function HelpPage() {
  const { pages, categories } = await getHelpCenterData();

  const featuredArticles = pages.filter(page => page.featured).slice(0, 3);
  const recentArticles = pages.slice(0, 6);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (icon: string) => {
    switch (icon) {
      case 'play-circle': return <BookOpen className="h-5 w-5" />;
      case 'user': return <User className="h-5 w-5" />;
      case 'search': return <Search className="h-5 w-5" />;
      case 'bar-chart': return <Zap className="h-5 w-5" />;
      case 'settings': return <HelpCircle className="h-5 w-5" />;
      case 'credit-card': return <MessageCircle className="h-5 w-5" />;
      default: return <HelpCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-6 py-3 rounded-full">
            <HelpCircle className="h-6 w-6" />
            <span className="font-semibold">Help Center</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            How can we help you?
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions, learn how to use PodDB Pro, and get the support you need.
          </p>

          {/* Search Component */}
          <div className="max-w-4xl mx-auto">
            <HelpSearch pages={pages} categories={categories} />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Browse by Category</h2>
            <p className="text-muted-foreground text-lg">Find help organized by topic</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/help/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <Card className="group hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm cursor-pointer border-border/50 hover:border-primary/20">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        {getCategoryIcon(category.icon)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl group-hover:text-primary transition-colors mb-2">
                          {category.name}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">{category.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-yellow-500/10 text-yellow-600 px-6 py-3 rounded-full mb-4">
                <Star className="h-5 w-5" />
                <span className="font-semibold">Featured Articles</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Must-Read Guides</h2>
              <p className="text-muted-foreground text-lg">Essential articles to get you started</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <Link key={article.id} href={`/help/${article.slug}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm cursor-pointer border-border/50 hover:border-primary/20">
                    <CardContent className="p-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-500/90 text-black font-medium">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs font-medium ${
                              article.difficulty_level === 'beginner' ? 'border-green-500 text-green-600' :
                              article.difficulty_level === 'intermediate' ? 'border-yellow-500 text-yellow-600' :
                              'border-red-500 text-red-600'
                            }`}
                          >
                            {article.difficulty_level}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-xl group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{article.reading_time || Math.ceil((article.content?.split(' ').length || 0) / 200)} min read</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Articles */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Latest Articles</h2>
            <p className="text-muted-foreground text-lg">Stay updated with our newest content</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recentArticles.map((article) => (
              <Link key={article.id} href={`/help/${article.slug}`}>
                <Card className="group hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm cursor-pointer border-border/50 hover:border-primary/20">
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-medium ${
                            article.difficulty_level === 'beginner' ? 'border-green-500 text-green-600' :
                            article.difficulty_level === 'intermediate' ? 'border-yellow-500 text-yellow-600' :
                            'border-red-500 text-red-600'
                          }`}
                        >
                          {article.difficulty_level}
                        </Badge>
                        {article.help_category && (
                          <Badge variant="secondary" className="text-xs font-medium">
                            {article.help_category}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-xl group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{article.reading_time || Math.ceil((article.content?.split(' ').length || 0) / 200)} min read</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{article.author_name || 'PodDB Team'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-xl">
          <CardContent className="p-12 text-center space-y-8">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <MessageCircle className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Still Need Help?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Can&apos;t find what you&apos;re looking for? Send us a message and we&apos;ll get back to you within 24 hours.
              </p>
            </div>
            
            {/* Contact Form */}
            <div className="max-w-lg mx-auto">
              <form action={handleContactForm} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      className="w-full h-12 text-base"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      className="w-full h-12 text-base"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    className="w-full h-12 text-base"
                    required
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    placeholder="Your Message"
                    className="w-full min-h-[140px] px-4 py-3 border border-input rounded-lg bg-background text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold gap-3">
                  <MessageCircle className="h-5 w-5" />
                  Send Message
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
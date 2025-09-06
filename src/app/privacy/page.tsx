import { supabase } from '@/integrations/supabase/client';

// Enable static generation for maximum performance
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Eye, 
  Lock, 
  Database,
  User,
  Globe,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// This function fetches the privacy policy page data
async function getPrivacyPage() {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('page_type', 'privacy')
    .eq('published', true)
    .single();

  if (error || !data) {
    // Fallback to default content
    return {
      title: 'Privacy Policy',
      content: `# Privacy Policy

Last updated: ${new Date().toLocaleDateString()}

## Introduction

At PodDB Pro, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you use our services.

## Information We Collect

### Personal Information
- Name and contact information
- Account credentials
- Profile information
- Communication preferences

### Usage Information
- Website usage data
- Device information
- IP addresses
- Cookies and similar technologies

## How We Use Your Information

We use your information to:
- Provide and improve our services
- Communicate with you
- Personalize your experience
- Ensure security and prevent fraud
- Comply with legal obligations

## Information Sharing

We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.

## Data Security

We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate information
- Delete your information
- Object to processing
- Data portability

## Contact Us

If you have any questions about this Privacy Policy, please contact us.`,
      meta_title: 'Privacy Policy - PodDB Pro',
      meta_description: 'Read our privacy policy to understand how we collect, use, and protect your personal information.',
      featured_image_url: null,
      author_name: 'PodDB Legal Team',
      author_bio: 'Legal team responsible for privacy and compliance',
      tags: ['privacy', 'legal', 'policy', 'data protection'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return data;
}

// This function generates SEO metadata for the page
export async function generateMetadata(): Promise<Metadata> {
  const page = await getPrivacyPage();

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || 'Read our privacy policy to understand how we collect, use, and protect your personal information.',
    keywords: page.tags || ['privacy', 'legal', 'policy', 'data protection'],
    authors: page.author_name ? [{ name: page.author_name }] : undefined,
    openGraph: {
      title: page.title,
      description: page.meta_description || 'Read our privacy policy to understand how we collect, use, and protect your personal information.',
      images: page.featured_image_url ? [page.featured_image_url] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.meta_description || 'Read our privacy policy to understand how we collect, use, and protect your personal information.',
      images: page.featured_image_url ? [page.featured_image_url] : [],
    },
    alternates: {
      canonical: 'https://poddb.pro/privacy',
    },
  };
}

export default async function PrivacyPage() {
  const page = await getPrivacyPage();

  const privacyPrinciples = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Data Protection",
      description: "We implement industry-standard security measures to protect your data"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Transparency",
      description: "We are transparent about how we collect and use your information"
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Minimal Collection",
      description: "We only collect the information necessary to provide our services"
    },
    {
      icon: <User className="h-6 w-6" />,
      title: "User Control",
      description: "You have control over your personal information and privacy settings"
    }
  ];

  const dataTypes = [
    {
      type: "Personal Information",
      examples: ["Name", "Email", "Profile data", "Account preferences"],
      purpose: "Account management and personalization"
    },
    {
      type: "Usage Data",
      examples: ["Website interactions", "Feature usage", "Performance metrics"],
      purpose: "Service improvement and analytics"
    },
    {
      type: "Technical Data",
      examples: ["IP address", "Device info", "Browser type", "Cookies"],
      purpose: "Security and functionality"
    },
    {
      type: "Communication Data",
      examples: ["Support messages", "Feedback", "Newsletter preferences"],
      purpose: "Customer support and communication"
    }
  ];

  const userRights = [
    "Access your personal information",
    "Correct inaccurate data",
    "Delete your account and data",
    "Export your data",
    "Object to data processing",
    "Withdraw consent at any time"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-6 py-3 rounded-full">
            <Shield className="h-6 w-6" />
            <span className="font-semibold">Privacy Policy</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {page.title}
          </h1>
          
          <p className="text-lg text-muted-foreground">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Last updated: {new Date(page.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Privacy Principles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Privacy Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {privacyPrinciples.map((principle, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      {principle.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{principle.title}</h3>
                      <p className="text-muted-foreground">{principle.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-card/50 backdrop-blur-sm mb-12">
          <CardContent className="p-8">
            <div className="prose prose-invert prose-lg max-w-none prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:p-4 prose-blockquote:rounded-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {page.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* Data Types Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Types of Data We Collect</h2>
          <div className="space-y-6">
            {dataTypes.map((dataType, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        {dataType.type}
                      </h3>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Examples:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {dataType.examples.map((example, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Purpose:</h4>
                      <p className="text-sm text-muted-foreground">{dataType.purpose}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* User Rights Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Your Rights</h2>
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userRights.map((right, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{right}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Questions About Privacy?</h2>
              <p className="text-muted-foreground mb-6">
                If you have any questions about this Privacy Policy or our data practices, 
                please don&apos;t hesitate to contact us.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2">
                <Mail className="h-5 w-5" />
                Contact Us
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <FileText className="h-5 w-5" />
                Download PDF
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
              "@type": "WebPage",
              "name": page.title,
              "description": page.meta_description,
              "url": "https://poddb.pro/privacy",
              "datePublished": page.created_at,
              "dateModified": page.updated_at,
              "author": {
                "@type": "Organization",
                "name": "PodDB"
              }
            }),
          }}
        />
      </div>
    </div>
  );
}
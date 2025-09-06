import { supabase } from '@/integrations/supabase/client';

// Enable static generation for maximum performance
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileCheck, 
  Scale, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Globe,
  Mail,
  BookOpen
} from 'lucide-react';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// This function fetches the terms and conditions page data
async function getTermsPage() {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('page_type', 'terms')
    .eq('published', true)
    .single();

  if (error || !data) {
    // Fallback to default content
    return {
      title: 'Terms and Conditions',
      content: `# Terms and Conditions

Last updated: ${new Date().toLocaleDateString()}

## Acceptance of Terms

By accessing and using PodDB Pro, you accept and agree to be bound by the terms and provision of this agreement.

## Use License

Permission is granted to temporarily download one copy of PodDB Pro per device for personal, non-commercial transitory viewing only.

## Disclaimer

The materials on PodDB Pro are provided on an 'as is' basis. PodDB Pro makes no warranties, expressed or implied.

## Limitations

In no event shall PodDB Pro or its suppliers be liable for any damages arising out of the use or inability to use the materials on PodDB Pro.

## Contact Information

If you have any questions about these Terms and Conditions, please contact us.`,
      meta_title: 'Terms and Conditions - PodDB Pro',
      meta_description: 'Read our terms and conditions to understand the rules and guidelines for using PodDB Pro.',
      featured_image_url: null,
      author_name: 'PodDB Legal Team',
      author_bio: 'Legal team responsible for terms and compliance',
      tags: ['terms', 'legal', 'conditions', 'agreement'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return data;
}

// This function generates SEO metadata for the page
export async function generateMetadata(): Promise<Metadata> {
  const page = await getTermsPage();

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || 'Read our terms and conditions to understand the rules and guidelines for using PodDB Pro.',
    keywords: page.tags || ['terms', 'legal', 'conditions', 'agreement'],
    authors: page.author_name ? [{ name: page.author_name }] : undefined,
    openGraph: {
      title: page.title,
      description: page.meta_description || 'Read our terms and conditions to understand the rules and guidelines for using PodDB Pro.',
      images: page.featured_image_url ? [page.featured_image_url] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.meta_description || 'Read our terms and conditions to understand the rules and guidelines for using PodDB Pro.',
      images: page.featured_image_url ? [page.featured_image_url] : [],
    },
    alternates: {
      canonical: 'https://poddb.pro/terms',
    },
  };
}

export default async function TermsPage() {
  const page = await getTermsPage();

  const keySections = [
    {
      icon: <User className="h-6 w-6" />,
      title: "User Responsibilities",
      description: "Your obligations when using our service",
      items: [
        "Provide accurate information",
        "Respect other users",
        "Follow community guidelines",
        "Report violations"
      ]
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Service Availability",
      description: "What you can expect from our service",
      items: [
        "99.9% uptime target",
        "Regular maintenance windows",
        "Security updates",
        "Feature improvements"
      ]
    },
    {
      icon: <Scale className="h-6 w-6" />,
      title: "Limitations",
      description: "Important limitations and disclaimers",
      items: [
        "Service provided 'as is'",
        "No warranty of accuracy",
        "Limited liability",
        "Third-party content"
      ]
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "International Use",
      description: "Guidelines for international users",
      items: [
        "Compliance with local laws",
        "Data transfer restrictions",
        "Regional availability",
        "Language support"
      ]
    }
  ];

  const prohibitedUses = [
    "Illegal activities",
    "Harassment or abuse",
    "Spam or unsolicited content",
    "Copyright infringement",
    "Malicious software",
    "Unauthorized access",
    "Commercial use without permission",
    "Violation of others' rights"
  ];

  const userRights = [
    "Access to service features",
    "Data portability",
    "Account deletion",
    "Privacy protection",
    "Fair use of content",
    "Support and assistance"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-6 py-3 rounded-full">
            <FileCheck className="h-6 w-6" />
            <span className="font-semibold">Terms & Conditions</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {page.title}
          </h1>
          
          <p className="text-lg text-muted-foreground">
            Please read these terms carefully before using our service. By using PodDB Pro, you agree to these terms.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Last updated: {new Date(page.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Key Sections */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Key Sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {keySections.map((section, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
                      <p className="text-muted-foreground mb-4">{section.description}</p>
                      <ul className="space-y-2">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
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

        {/* Prohibited Uses */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Prohibited Uses</h2>
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prohibitedUses.map((use, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm">{use}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Rights */}
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

        {/* Important Notice */}
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 mb-12">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Important Notice</h3>
                <p className="text-muted-foreground">
                  These terms may be updated from time to time. We will notify you of any significant changes 
                  via email or through our service. Continued use of the service after changes constitutes 
                  acceptance of the new terms.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Questions About Terms?</h2>
              <p className="text-muted-foreground mb-6">
                If you have any questions about these Terms and Conditions, 
                please don&apos;t hesitate to contact our legal team.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2">
                <Mail className="h-5 w-5" />
                Contact Legal Team
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <BookOpen className="h-5 w-5" />
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
              "url": "https://poddb.pro/terms",
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
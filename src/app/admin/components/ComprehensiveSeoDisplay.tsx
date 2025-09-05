import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface ComprehensiveSeoDisplayProps {
    seoData: any;
    title: string;
    contentType: 'podcast' | 'episode' | 'person' | 'news';
}

export default function ComprehensiveSeoDisplay({ seoData, title, contentType }: ComprehensiveSeoDisplayProps) {
    if (!seoData) return null;

    const formatSeoData = (rawSeoData: any) => {
        return {
            metaTags: {
                title: rawSeoData.meta_title || 'Not generated',
                description: rawSeoData.meta_description || 'Not generated',
                keywords: rawSeoData.keywords || []
            },
            slug: rawSeoData.slug || 'Not generated',
            faqs: rawSeoData.faqs || [],
            // Enhanced SEO data
            schemaMarkup: rawSeoData.schema_markup || {},
            socialMedia: rawSeoData.social_media || {},
            contentEnhancement: rawSeoData.content_enhancement || {},
            technicalSeo: rawSeoData.technical_seo || {},
            localSeo: rawSeoData.local_seo || {}
        };
    };

    const formattedData = formatSeoData(seoData);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Comprehensive SEO
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Comprehensive SEO Data for {title}</DialogTitle>
                    <DialogDescription>
                        AI-generated comprehensive SEO optimization including schema markup, social media, and technical SEO
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[80vh]">
                    <div className="space-y-6 p-4">
                        {/* Meta Tags */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-lg text-blue-600 border-b pb-2">Meta Tags</h4>
                            <div className="space-y-2">
                                <div>
                                    <span className="font-medium">Title:</span>
                                    <p className="text-sm text-muted-foreground mt-1 bg-blue-50 p-2 rounded">{formattedData.metaTags.title}</p>
                                </div>
                                <div>
                                    <span className="font-medium">Description:</span>
                                    <p className="text-sm text-muted-foreground mt-1 bg-blue-50 p-2 rounded">{formattedData.metaTags.description}</p>
                                </div>
                                <div>
                                    <span className="font-medium">Keywords:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {formattedData.metaTags.keywords.map((keyword: string, index: number) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {keyword}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Enhancement */}
                        {formattedData.contentEnhancement && Object.keys(formattedData.contentEnhancement).length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-semibold text-lg text-green-600 border-b pb-2">Content Enhancement</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-medium">Summary:</span>
                                        <p className="text-sm text-muted-foreground mt-1 bg-green-50 p-2 rounded">{formattedData.contentEnhancement.summary}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">Target Audience:</span>
                                        <p className="text-sm text-muted-foreground mt-1 bg-green-50 p-2 rounded">{formattedData.contentEnhancement.target_audience}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">Key Topics:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {formattedData.contentEnhancement.key_topics?.map((topic: string, index: number) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {topic}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-medium">Unique Selling Points:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {formattedData.contentEnhancement.unique_selling_points?.map((usp: string, index: number) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {usp}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Slug */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-lg text-purple-600 border-b pb-2">URL Slug</h4>
                            <code className="bg-muted px-2 py-1 rounded text-sm">{formattedData.slug}</code>
                        </div>

                        {/* FAQs */}
                        {formattedData.faqs.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-semibold text-lg text-orange-600 border-b pb-2">Generated FAQs</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {formattedData.faqs.map((faq: any, index: number) => (
                                        <div key={index} className="p-3 border rounded-lg bg-orange-50">
                                            <div className="font-medium text-sm text-orange-800">{faq.question}</div>
                                            <div className="text-sm text-muted-foreground mt-1">{faq.answer}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Schema Markup */}
                        {formattedData.schemaMarkup && Object.keys(formattedData.schemaMarkup).length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-semibold text-lg text-indigo-600 border-b pb-2">Schema Markup</h4>
                                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto">
                                    <pre>{JSON.stringify(formattedData.schemaMarkup, null, 2)}</pre>
                                </div>
                            </div>
                        )}

                        {/* Social Media */}
                        {formattedData.socialMedia && (
                            <div className="space-y-3">
                                <h4 className="font-semibold text-lg text-pink-600 border-b pb-2">Social Media Optimization</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h5 className="font-medium text-sm mb-2">Open Graph Tags</h5>
                                        <div className="space-y-1">
                                            {Object.entries(formattedData.socialMedia.og_tags || {}).map(([key, value]) => (
                                                <div key={key} className="text-xs">
                                                    <span className="font-medium">{key}:</span> <span className="bg-pink-50 p-1 rounded">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-sm mb-2">Twitter Cards</h5>
                                        <div className="space-y-1">
                                            {Object.entries(formattedData.socialMedia.twitter_cards || {}).map(([key, value]) => (
                                                <div key={key} className="text-xs">
                                                    <span className="font-medium">{key}:</span> <span className="bg-pink-50 p-1 rounded">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Technical SEO */}
                        {formattedData.technicalSeo && (
                            <div className="space-y-3">
                                <h4 className="font-semibold text-lg text-teal-600 border-b pb-2">Technical SEO</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-medium">Canonical URL:</span>
                                        <p className="text-sm text-muted-foreground mt-1 bg-teal-50 p-2 rounded">{formattedData.technicalSeo.canonical_url}</p>
                                    </div>
                                    {formattedData.technicalSeo.hreflang && (
                                        <div>
                                            <span className="font-medium">Hreflang:</span>
                                            <div className="space-y-1 mt-1">
                                                {formattedData.technicalSeo.hreflang.map((hreflang: any, i: number) => (
                                                    <div key={i} className="text-sm bg-teal-50 p-2 rounded">{hreflang.lang}: {hreflang.url}</div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Local SEO */}
                        {formattedData.localSeo && Object.keys(formattedData.localSeo).length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-semibold text-lg text-amber-600 border-b pb-2">Local SEO</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {formattedData.localSeo.geo_coordinates && (
                                        <div>
                                            <span className="font-medium">Coordinates:</span>
                                            <p className="text-sm text-muted-foreground mt-1 bg-amber-50 p-2 rounded">
                                                {formattedData.localSeo.geo_coordinates.latitude}, {formattedData.localSeo.geo_coordinates.longitude}
                                            </p>
                                        </div>
                                    )}
                                    {formattedData.localSeo.service_area && (
                                        <div>
                                            <span className="font-medium">Service Area:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {formattedData.localSeo.service_area.map((area: string, i: number) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        {area}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Complete Data */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-lg text-gray-600 border-b pb-2">Complete SEO Data</h4>
                            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                                {JSON.stringify(seoData, null, 2)}
                            </pre>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

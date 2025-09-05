'use server';

import { z } from 'zod';

/**
 * Custom AI Model Configuration for SEO
 * This model can be trained and improved over time with your specific SEO data
 */

export interface CustomAiModelConfig {
    modelId: string;
    name: string;
    version: string;
    description: string;
    capabilities: string[];
    trainingData: TrainingDataPoint[];
    performanceMetrics: PerformanceMetrics;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface TrainingDataPoint {
    id: string;
    input: SeoInput;
    expectedOutput: SeoOutput;
    actualOutput?: SeoOutput;
    feedback: 'positive' | 'negative' | 'neutral';
    userRating?: number; // 1-5 stars
    notes?: string;
    timestamp: Date;
}

export interface SeoInput {
    title: string;
    description: string;
    contentType: 'podcast' | 'episode' | 'person' | 'news' | 'article';
    targetKeywords: string[];
    competitorUrls?: string[];
    language: string;
    targetAudience?: string;
    industry?: string;
    contentLength: 'short' | 'medium' | 'long';
    seoGoals: SeoGoal[];
}

export interface SeoGoal {
    type: 'ranking' | 'traffic' | 'conversion' | 'brand-awareness';
    priority: 'high' | 'medium' | 'low';
    targetKeywords: string[];
}

export interface SeoOutput {
    metaTitle: string;
    metaDescription: string;
    slug: string;
    keywords: string[];
    contentOptimization: ContentOptimization;
    technicalSeo: TechnicalSeo;
    schemaMarkup: SchemaMarkup;
    socialMedia: SocialMediaOptimization;
    competitorInsights: CompetitorInsight[];
    contentGaps: ContentGap[];
    seoScore: number;
    recommendations: SeoRecommendation[];
}

export interface ContentOptimization {
    readabilityScore: number;
    keywordDensity: Record<string, number>;
    contentStructure: ContentStructure;
    internalLinking: InternalLinking[];
    contentGaps: string[];
}

export interface ContentStructure {
    headings: Heading[];
    paragraphs: number;
    wordCount: number;
    readingTime: number;
    complexity: 'simple' | 'moderate' | 'complex';
}

export interface Heading {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    text: string;
    keywordOptimization: number; // 0-100
}

export interface InternalLinking {
    anchorText: string;
    targetUrl: string;
    relevance: number; // 0-100
}

export interface TechnicalSeo {
    pageSpeed: number; // 0-100
    mobileOptimization: number; // 0-100
    coreWebVitals: CoreWebVitals;
    structuredData: boolean;
    canonicalUrl: string;
    robotsTxt: string;
    sitemap: boolean;
}

export interface CoreWebVitals {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
}

export interface SchemaMarkup {
    type: string;
    properties: Record<string, any>;
    jsonLd: string;
}

export interface SocialMediaOptimization {
    twitter: TwitterCard;
    facebook: FacebookCard;
    linkedin: LinkedinCard;
}

export interface TwitterCard {
    card: 'summary' | 'summary_large_image' | 'app' | 'player';
    title: string;
    description: string;
    image: string;
    creator: string;
}

export interface FacebookCard {
    title: string;
    description: string;
    image: string;
    url: string;
    type: 'website' | 'article' | 'book' | 'profile';
}

export interface LinkedinCard {
    title: string;
    description: string;
    image: string;
    url: string;
}

export interface CompetitorInsight {
    url: string;
    domain: string;
    rankingKeywords: string[];
    contentScore: number;
    backlinks: number;
    domainAuthority: number;
    insights: string[];
}

export interface ContentGap {
    keyword: string;
    searchVolume: number;
    difficulty: number;
    opportunity: 'high' | 'medium' | 'low';
    suggestedContent: string;
}

export interface SeoRecommendation {
    type: 'content' | 'technical' | 'on-page' | 'off-page';
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    implementation: string;
    expectedImprovement: string;
}

export interface PerformanceMetrics {
    accuracy: number; // 0-100
    responseTime: number; // milliseconds
    userSatisfaction: number; // 0-5
    trainingIterations: number;
    lastTrainingDate: Date;
}

// Zod schemas for validation
export const SeoInputSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    contentType: z.enum(['podcast', 'episode', 'person', 'news', 'article']),
    targetKeywords: z.array(z.string()).min(1, "At least one target keyword is required"),
    competitorUrls: z.array(z.string().url()).optional(),
    language: z.string().min(2, "Language code is required"),
    targetAudience: z.string().optional(),
    industry: z.string().optional(),
    contentLength: z.enum(['short', 'medium', 'long']),
    seoGoals: z.array(z.object({
        type: z.enum(['ranking', 'traffic', 'conversion', 'brand-awareness']),
        priority: z.enum(['high', 'medium', 'low']),
        targetKeywords: z.array(z.string())
    }))
});

export const SeoOutputSchema = z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    slug: z.string(),
    keywords: z.array(z.string()),
    contentOptimization: z.object({
        readabilityScore: z.number().min(0).max(100),
        keywordDensity: z.record(z.string(), z.number()),
        contentStructure: z.object({
            headings: z.array(z.object({
                level: z.number().min(1).max(6),
                text: z.string(),
                keywordOptimization: z.number().min(0).max(100)
            })),
            paragraphs: z.number(),
            wordCount: z.number(),
            readingTime: z.number(),
            complexity: z.enum(['simple', 'moderate', 'complex'])
        }),
        internalLinking: z.array(z.object({
            anchorText: z.string(),
            targetUrl: z.string(),
            relevance: z.number().min(0).max(100)
        })),
        contentGaps: z.array(z.string())
    }),
    technicalSeo: z.object({
        pageSpeed: z.number().min(0).max(100),
        mobileOptimization: z.number().min(0).max(100),
        coreWebVitals: z.object({
            lcp: z.number(),
            fid: z.number(),
            cls: z.number()
        }),
        structuredData: z.boolean(),
        canonicalUrl: z.string(),
        robotsTxt: z.string(),
        sitemap: z.boolean()
    }),
    schemaMarkup: z.object({
        type: z.string(),
        properties: z.record(z.any()),
        jsonLd: z.string()
    }),
    socialMedia: z.object({
        twitter: z.object({
            card: z.enum(['summary', 'summary_large_image', 'app', 'player']),
            title: z.string(),
            description: z.string(),
            image: z.string(),
            creator: z.string()
        }),
        facebook: z.object({
            title: z.string(),
            description: z.string(),
            image: z.string(),
            url: z.string(),
            type: z.enum(['website', 'article', 'book', 'profile'])
        }),
        linkedin: z.object({
            title: z.string(),
            description: z.string(),
            image: z.string(),
            url: z.string()
        })
    }),
    competitorInsights: z.array(z.object({
        url: z.string().url(),
        domain: z.string(),
        rankingKeywords: z.array(z.string()),
        contentScore: z.number(),
        backlinks: z.number(),
        domainAuthority: z.number(),
        insights: z.array(z.string())
    })),
    contentGaps: z.array(z.object({
        keyword: z.string(),
        searchVolume: z.number(),
        difficulty: z.number(),
        opportunity: z.enum(['high', 'medium', 'low']),
        suggestedContent: z.string()
    })),
    seoScore: z.number().min(0).max(100),
    recommendations: z.array(z.object({
        type: z.enum(['content', 'technical', 'on-page', 'off-page']),
        priority: z.enum(['critical', 'high', 'medium', 'low']),
        title: z.string(),
        description: z.string(),
        impact: z.enum(['high', 'medium', 'low']),
        effort: z.enum(['low', 'medium', 'high']),
        implementation: z.string(),
        expectedImprovement: z.string()
    }))
});

export type SeoInputType = z.infer<typeof SeoInputSchema>;
export type SeoOutputType = z.infer<typeof SeoOutputSchema>;

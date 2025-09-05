'use server';

import { seoAiEngine, SeoAnalysisRequest, SeoAnalysisResponse } from '@/ai/custom-engine/seo-ai-engine';
import { SeoInputType, SeoInputSchema } from '@/ai/custom-models/seo-ai-model';
import { revalidatePath } from 'next/cache';

/**
 * Advanced SEO Analysis Action
 * Uses the custom AI engine to analyze content and provide comprehensive SEO insights
 */

export async function analyzeSeoContentAction(
    formData: FormData
): Promise<SeoAnalysisResponse> {
    try {
        // Extract form data
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const contentType = formData.get('contentType') as string;
        const targetKeywords = formData.get('targetKeywords') as string;
        const competitorUrls = formData.get('competitorUrls') as string;
        const language = formData.get('language') as string;
        const targetAudience = formData.get('targetAudience') as string;
        const industry = formData.get('industry') as string;
        const contentLength = formData.get('contentLength') as string;
        const preferredModel = formData.get('preferredModel') as string;
        const useCustomModel = formData.get('useCustomModel') === 'true';
        const includeCompetitorAnalysis = formData.get('includeCompetitorAnalysis') === 'true';
        const includeContentGaps = formData.get('includeContentGaps') === 'true';
        const includeSchemaMarkup = formData.get('includeSchemaMarkup') === 'true';
        const includeSocialMedia = formData.get('includeSocialMedia') === 'true';

        // Parse keywords
        const keywords = targetKeywords
            ? targetKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
            : [];

        // Parse competitor URLs
        const competitorUrlList = competitorUrls
            ? competitorUrls.split('\n').map(url => url.trim()).filter(url => url.length > 0)
            : [];

        // Create SEO input
        const seoInput: SeoInputType = {
            title,
            description,
            contentType: contentType as any,
            targetKeywords: keywords,
            competitorUrls: competitorUrlList,
            language,
            targetAudience,
            industry,
            contentLength: contentLength as any,
            seoGoals: [
                {
                    type: 'ranking',
                    priority: 'high',
                    targetKeywords: keywords
                }
            ]
        };

        // Validate input
        const validatedInput = SeoInputSchema.parse(seoInput);

        // Create analysis request
        const request: SeoAnalysisRequest = {
            input: validatedInput,
            preferredModel,
            useCustomModel,
            includeCompetitorAnalysis,
            includeContentGaps,
            includeSchemaMarkup,
            includeSocialMedia,
            language,
            industry
        };

        // Perform SEO analysis
        const result = await seoAiEngine.analyzeSeo(request);

        // Revalidate relevant paths
        revalidatePath('/admin');

        return result;

    } catch (error) {
        console.error('SEO Analysis Error:', error);
        
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            modelUsed: 'unknown',
            processingTime: 0,
            confidence: 0,
            suggestions: ['Please check your input and try again']
        };
    }
}

/**
 * Get available AI models
 */
export async function getAvailableAiModelsAction() {
    try {
        const models = seoAiEngine.getActiveModels();
        return { success: true, data: models };
    } catch (error) {
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch models' 
        };
    }
}

/**
 * Add feedback for training data
 */
export async function addSeoFeedbackAction(
    trainingId: string,
    feedback: 'positive' | 'negative' | 'neutral',
    rating?: number,
    notes?: string
) {
    try {
        await seoAiEngine.addFeedback(trainingId, feedback, rating, notes);
        return { success: true };
    } catch (error) {
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to add feedback' 
        };
    }
}

/**
 * Get training data for model improvement
 */
export async function getSeoTrainingDataAction() {
    try {
        const trainingData = seoAiEngine.getTrainingData();
        return { success: true, data: trainingData };
    } catch (error) {
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch training data' 
        };
    }
}

/**
 * Get performance metrics for AI models
 */
export async function getSeoPerformanceMetricsAction() {
    try {
        const metrics = seoAiEngine.getPerformanceMetrics();
        return { success: true, data: Object.fromEntries(metrics) };
    } catch (error) {
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch performance metrics' 
        };
    }
}

/**
 * Train custom model with collected data
 */
export async function trainCustomSeoModelAction() {
    try {
        const trainingData = seoAiEngine.getTrainingData();
        await seoAiEngine.trainCustomModel(trainingData);
        return { success: true, message: 'Custom model training initiated' };
    } catch (error) {
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to train custom model' 
        };
    }
}

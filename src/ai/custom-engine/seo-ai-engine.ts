'use server';

import { getAi } from '@/ai/genkit';
import { 
    SeoInputType, 
    SeoOutputType, 
    SeoInputSchema, 
    SeoOutputSchema,
    TrainingDataPoint,
    CustomAiModelConfig
} from '../custom-models/seo-ai-model';
import { z } from 'zod';

/**
 * Custom AI Engine for SEO
 * This engine can use multiple AI models, learn from feedback, and improve over time
 */

export interface AiModelProvider {
    id: string;
    name: string;
    type: 'openai' | 'google' | 'anthropic' | 'ollama' | 'huggingface' | 'custom';
    apiKey?: string;
    baseUrl?: string;
    model: string;
    isActive: boolean;
    costPerToken: number;
    maxTokens: number;
    temperature: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
}

export interface SeoAnalysisRequest {
    input: SeoInputType;
    preferredModel?: string;
    useCustomModel?: boolean;
    includeCompetitorAnalysis?: boolean;
    includeContentGaps?: boolean;
    includeSchemaMarkup?: boolean;
    includeSocialMedia?: boolean;
    language?: string;
    industry?: string;
}

export interface SeoAnalysisResponse {
    success: boolean;
    data?: SeoOutputType;
    error?: string;
    modelUsed: string;
    processingTime: number;
    confidence: number;
    suggestions: string[];
}

export class SeoAiEngine {
    private models: Map<string, AiModelProvider> = new Map();
    private customModel: CustomAiModelConfig | null = null;
    private trainingData: TrainingDataPoint[] = [];
    private performanceHistory: Map<string, number[]> = new Map();

    constructor() {
        this.initializeDefaultModels();
    }

    private initializeDefaultModels() {
        // Free AI Models
        this.addModel({
            id: 'ollama-llama-3.1-8b',
            name: 'Llama 3.1 8B (Local)',
            type: 'ollama',
            model: 'llama3.1:8b',
            isActive: true,
            costPerToken: 0,
            maxTokens: 4096,
            temperature: 0.7,
            topP: 0.9,
            frequencyPenalty: 0.1,
            presencePenalty: 0.1
        });

        this.addModel({
            id: 'ollama-mistral-7b',
            name: 'Mistral 7B (Local)',
            type: 'ollama',
            model: 'mistral:7b',
            isActive: true,
            costPerToken: 0,
            maxTokens: 8192,
            temperature: 0.7,
            topP: 0.9,
            frequencyPenalty: 0.1,
            presencePenalty: 0.1
        });

        this.addModel({
            id: 'huggingface-llama-3.1-70b',
            name: 'Llama 3.1 70B (Hugging Face)',
            type: 'huggingface',
            model: 'meta-llama/Llama-3.1-70B-Instruct',
            isActive: true,
            costPerToken: 0.0001,
            maxTokens: 4096,
            temperature: 0.7,
            topP: 0.9,
            frequencyPenalty: 0.1,
            presencePenalty: 0.1
        });

        // Paid but powerful models
        this.addModel({
            id: 'openai-gpt-4o',
            name: 'GPT-4o (OpenAI)',
            type: 'openai',
            model: 'gpt-4o',
            isActive: false, // Requires API key
            costPerToken: 0.005,
            maxTokens: 128000,
            temperature: 0.7,
            topP: 0.9,
            frequencyPenalty: 0.1,
            presencePenalty: 0.1
        });

        this.addModel({
            id: 'anthropic-claude-3-5-sonnet',
            name: 'Claude 3.5 Sonnet (Anthropic)',
            type: 'anthropic',
            model: 'claude-3-5-sonnet-20241022',
            isActive: false, // Requires API key
            costPerToken: 0.003,
            maxTokens: 200000,
            temperature: 0.7,
            topP: 0.9,
            frequencyPenalty: 0.1,
            presencePenalty: 0.1
        });
    }

    public addModel(model: AiModelProvider): void {
        this.models.set(model.id, model);
    }

    public removeModel(modelId: string): boolean {
        return this.models.delete(modelId);
    }

    public getActiveModels(): AiModelProvider[] {
        return Array.from(this.models.values()).filter(model => model.isActive);
    }

    public async analyzeSeo(request: SeoAnalysisRequest): Promise<SeoAnalysisResponse> {
        const startTime = Date.now();
        
        try {
            // Validate input
            const validatedInput = SeoInputSchema.parse(request.input);
            
            // Select the best model based on request and availability
            const selectedModel = await this.selectBestModel(request);
            
            if (!selectedModel) {
                throw new Error('No suitable AI model available');
            }

            // Generate SEO analysis using the selected model
            const analysis = await this.generateSeoAnalysis(validatedInput, selectedModel);
            
            // Calculate confidence score
            const confidence = this.calculateConfidence(analysis, selectedModel);
            
            // Store training data for improvement
            await this.storeTrainingData(validatedInput, analysis);
            
            // Update performance metrics
            this.updatePerformanceMetrics(selectedModel.id, confidence);
            
            const processingTime = Date.now() - startTime;
            
            return {
                success: true,
                data: analysis,
                modelUsed: selectedModel.id,
                processingTime,
                confidence,
                suggestions: this.generateSuggestions(analysis, confidence)
            };

        } catch (error) {
            const processingTime = Date.now() - startTime;
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                modelUsed: 'unknown',
                processingTime,
                confidence: 0,
                suggestions: ['Please check your input and try again']
            };
        }
    }

    private async selectBestModel(request: SeoAnalysisRequest): Promise<AiModelProvider | null> {
        const activeModels = this.getActiveModels();
        
        if (activeModels.length === 0) {
            return null;
        }

        // If user specified a preferred model and it's available
        if (request.preferredModel && activeModels.find(m => m.id === request.preferredModel)) {
            return activeModels.find(m => m.id === request.preferredModel)!;
        }

        // Use custom model if available and requested
        if (request.useCustomModel && this.customModel && this.customModel.isActive) {
            // Return a virtual model configuration for custom model
            return {
                id: 'custom-trained-model',
                name: this.customModel.name,
                type: 'custom',
                model: 'custom',
                isActive: true,
                costPerToken: 0,
                maxTokens: 8192,
                temperature: 0.7,
                topP: 0.9,
                frequencyPenalty: 0.1,
                presencePenalty: 0.1
            };
        }

        // Select best model based on performance history and cost
        return this.selectOptimalModel(activeModels, request);
    }

    private selectOptimalModel(models: AiModelProvider[], request: SeoAnalysisRequest): AiModelProvider {
        // Score models based on performance, cost, and capabilities
        const scoredModels = models.map(model => {
            const performanceScore = this.getAveragePerformance(model.id);
            const costScore = 1 - (model.costPerToken * 1000); // Lower cost = higher score
            const capabilityScore = this.getCapabilityScore(model, request);
            
            const totalScore = (performanceScore * 0.4) + (costScore * 0.3) + (capabilityScore * 0.3);
            
            return { model, score: totalScore };
        });

        // Return the model with the highest score
        scoredModels.sort((a, b) => b.score - a.score);
        return scoredModels[0].model;
    }

    private getCapabilityScore(model: AiModelProvider, request: SeoAnalysisRequest): number {
        let score = 0.5; // Base score

        // Local models are good for privacy and cost
        if (model.type === 'ollama') {
            score += 0.2;
        }

        // Models with higher token limits are better for complex analysis
        if (model.maxTokens >= 8192) {
            score += 0.1;
        }

        // Free models get bonus points
        if (model.costPerToken === 0) {
            score += 0.2;
        }

        return Math.min(score, 1.0);
    }

    private async generateSeoAnalysis(input: SeoInputType, model: AiModelProvider): Promise<SeoOutputType> {
        // For now, we'll use the existing Gemini model as a fallback
        // In the future, this will route to different models based on type
        const ai = await getAi();
        
        const seoPrompt = ai.definePrompt({
            name: 'advancedSeoPrompt',
            model: 'googleai/gemini-2.0-flash',
            input: { schema: SeoInputSchema },
            output: { schema: SeoOutputSchema },
            prompt: this.generateAdvancedSeoPrompt(input),
        });

        const generateSeoFlow = ai.defineFlow(
            {
                name: 'generateAdvancedSeoFlow',
                inputSchema: SeoInputSchema,
                outputSchema: SeoOutputSchema,
                retries: 2,
            },
            async (input: SeoInputType) => {
                const { output } = await seoPrompt(input);
                if (!output) {
                    throw new Error("AI failed to generate SEO analysis.");
                }
                return output;
            }
        );

        return generateSeoFlow(input);
    }

    private generateAdvancedSeoPrompt(input: SeoInputType): string {
        return `You are an expert SEO specialist and AI content strategist for PodDB, a podcast database platform.

Your task is to provide comprehensive SEO analysis and optimization recommendations for content. You must analyze the input thoroughly and provide actionable insights.

CONTENT TO ANALYZE:
- Title: ${input.title}
- Description: ${input.description}
- Content Type: ${input.contentType}
- Target Keywords: ${input.targetKeywords.join(', ')}
- Language: ${input.language}
- Target Audience: ${input.targetAudience || 'General'}
- Industry: ${input.industry || 'Podcasting'}

REQUIRED OUTPUT:
1. **Meta Title**: SEO-optimized title (50-60 characters)
2. **Meta Description**: Compelling description (150-160 characters)
3. **Slug**: URL-friendly slug
4. **Keywords**: Expanded keyword list with long-tail variations
5. **Content Optimization**: Readability score, structure analysis, internal linking suggestions
6. **Technical SEO**: Page speed optimization, mobile optimization, Core Web Vitals
7. **Schema Markup**: Structured data for search engines
8. **Social Media**: Optimized cards for Twitter, Facebook, LinkedIn
9. **Competitor Insights**: Analysis of competitor strategies
10. **Content Gaps**: Opportunities for new content
11. **SEO Score**: Overall optimization score (0-100)
12. **Recommendations**: Prioritized action items with implementation steps

Focus on:
- User intent and search behavior
- Content quality and engagement
- Technical performance
- Local SEO if applicable
- E-commerce optimization if needed
- Accessibility and user experience

Provide specific, actionable recommendations that can be implemented immediately.`;
    }

    private calculateConfidence(analysis: SeoOutputType, model: AiModelProvider): number {
        let confidence = 0.7; // Base confidence

        // Higher confidence for more comprehensive analysis
        if (analysis.recommendations.length > 5) confidence += 0.1;
        if (analysis.contentOptimization.readabilityScore > 80) confidence += 0.1;
        if (analysis.seoScore > 85) confidence += 0.1;

        // Adjust based on model performance history
        const performance = this.getAveragePerformance(model.id);
        confidence += (performance - 0.5) * 0.2;

        return Math.min(Math.max(confidence, 0), 1);
    }

    private generateSuggestions(analysis: SeoOutputType, confidence: number): string[] {
        const suggestions: string[] = [];

        if (confidence < 0.8) {
            suggestions.push('Consider reviewing and refining the analysis for better accuracy');
        }

        if (analysis.seoScore < 70) {
            suggestions.push('Focus on implementing high-priority technical SEO improvements first');
        }

        if (analysis.contentOptimization.readabilityScore < 70) {
            suggestions.push('Improve content readability by simplifying language and structure');
        }

        if (analysis.contentGaps.length > 0) {
            suggestions.push('Explore content gap opportunities to expand your content strategy');
        }

        return suggestions;
    }

    private async storeTrainingData(input: SeoInputType, output: SeoOutputType): Promise<void> {
        const trainingPoint: TrainingDataPoint = {
            id: `training_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            input,
            expectedOutput: output as any,
            feedback: 'neutral',
            timestamp: new Date()
        };

        this.trainingData.push(trainingPoint);
        
        // Keep only last 1000 training points to manage memory
        if (this.trainingData.length > 1000) {
            this.trainingData = this.trainingData.slice(-1000);
        }
    }

    private updatePerformanceMetrics(modelId: string, confidence: number): void {
        if (!this.performanceHistory.has(modelId)) {
            this.performanceHistory.set(modelId, []);
        }

        const history = this.performanceHistory.get(modelId)!;
        history.push(confidence);

        // Keep only last 100 performance scores
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
    }

    private getAveragePerformance(modelId: string): number {
        const history = this.performanceHistory.get(modelId);
        if (!history || history.length === 0) {
            return 0.5; // Default neutral score
        }

        const sum = history.reduce((acc, score) => acc + score, 0);
        return sum / history.length;
    }

    // Training and improvement methods
    public async trainCustomModel(trainingData: TrainingDataPoint[]): Promise<void> {
        // This is where you would implement custom model training
        // For now, we'll store the training data for future use
        this.trainingData.push(...trainingData);
        
        // In the future, this could:
        // 1. Fine-tune an open-source model
        // 2. Create embeddings for semantic search
        // 3. Build a rule-based system
        // 4. Implement ensemble methods
    }

    public getTrainingData(): TrainingDataPoint[] {
        return [...this.trainingData];
    }

    public getPerformanceMetrics(): Map<string, number[]> {
        return new Map(this.performanceHistory);
    }

    public async addFeedback(trainingId: string, feedback: 'positive' | 'negative' | 'neutral', rating?: number, notes?: string): Promise<void> {
        const trainingPoint = this.trainingData.find(tp => tp.id === trainingId);
        if (trainingPoint) {
            trainingPoint.feedback = feedback;
            trainingPoint.userRating = rating;
            trainingPoint.notes = notes;
        }
    }
}

// Export a singleton instance
export const seoAiEngine = new SeoAiEngine();

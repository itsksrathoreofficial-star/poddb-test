
'use server';
/**
 * @fileOverview An AI agent for generating rich SEO metadata and FAQs.
 *
 * - generateSeoMetadata: Generates comprehensive SEO metadata for given content.
 * - SeoMetadataInput: The input type for the function.
 * - SeoMetadataOutput: The return type for the function.
 */

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for API key management
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SeoMetadataInputSchema = z.object({
  title: z.string().describe('The title of the content (e.g., podcast title, episode title, person\'s name).'),
  description: z.string().describe('The full description, bio, or content to be analyzed for SEO.'),
  contentType: z.enum(['podcast', 'episode', 'person', 'news']).describe('The type of content being analyzed.'),
  relatedInfo: z.string().optional().describe('Any additional related information, like podcast categories, guest names, or episode topics.'),
  // Additional context for comprehensive SEO generation
  additionalContext: z.object({
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    language: z.string().optional(),
    averageRating: z.number().optional(),
    totalViews: z.number().optional(),
    totalLikes: z.number().optional(),
    totalEpisodes: z.number().optional(),
    averageDuration: z.number().optional(),
    firstEpisodeDate: z.string().optional(),
    lastEpisodeDate: z.string().optional(),
    teamMembers: z.array(z.any()).optional(),
    socialLinks: z.any().optional(),
    platformLinks: z.any().optional(),
    officialWebsite: z.string().optional(),
    youtubePlaylistUrl: z.string().optional(),
    // Episode specific
    episodeNumber: z.number().optional(),
    seasonNumber: z.number().optional(),
    duration: z.number().optional(),
    publishedAt: z.string().optional(),
    podcastTitle: z.string().optional(),
    // Person specific
    bio: z.string().optional(),
    birthDate: z.string().optional(),
    location: z.string().optional(),
    photoUrls: z.array(z.string()).optional(),
    websiteUrl: z.string().optional(),
    totalAppearances: z.number().optional(),
    isVerified: z.boolean().optional(),
  }).optional(),
});

export type SeoMetadataInput = z.infer<typeof SeoMetadataInputSchema>;

const SeoMetadataOutputSchema = z.object({
  // Basic SEO
  slug: z.string().describe('URL-friendly slug for the content'),
  meta_title: z.string().describe('SEO-optimized meta title (under 60 characters)'),
  meta_description: z.string().describe('Compelling meta description (under 155 characters)'),
  keywords: z.array(z.string()).describe('Targeted keywords for SEO'),
  
  // Rich Content
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).describe('Frequently asked questions for rich snippets'),
  
  // Advanced Schema Markup
  schema_markup: z.object({
    podcast_schema: z.object({
      "@type": z.string(),
      name: z.string(),
      description: z.string(),
      url: z.string().optional(),
      image: z.string().optional(),
      author: z.object({
        "@type": z.string(),
        name: z.string()
      }).optional(),
      publisher: z.object({
        "@type": z.string(),
        name: z.string()
      }).optional(),
      category: z.string().optional(),
      language: z.string().optional(),
      explicit: z.boolean().optional(),
      complete: z.boolean().optional(),
      episode: z.array(z.any()).optional(),
    }).optional(),
    episode_schema: z.object({
      "@type": z.string(),
      name: z.string(),
      description: z.string(),
      episodeNumber: z.number().optional(),
      seasonNumber: z.number().optional(),
      duration: z.string().optional(),
      datePublished: z.string().optional(),
      partOfSeries: z.object({
        "@type": z.string(),
        name: z.string()
      }).optional(),
    }).optional(),
    person_schema: z.object({
      "@type": z.string(),
      name: z.string(),
      description: z.string(),
      image: z.string().optional(),
      url: z.string().optional(),
      sameAs: z.array(z.string()).optional(),
      jobTitle: z.string().optional(),
      worksFor: z.object({
        "@type": z.string(),
        name: z.string()
      }).optional(),
    }).optional(),
  }).optional(),
  
  // Social Media Optimization
  social_media: z.object({
    og_tags: z.object({
      "og:title": z.string(),
      "og:description": z.string(),
      "og:image": z.string().optional(),
      "og:type": z.string(),
      "og:url": z.string().optional(),
      "og:site_name": z.string().optional(),
    }),
    twitter_cards: z.object({
      "twitter:card": z.string(),
      "twitter:title": z.string(),
      "twitter:description": z.string(),
      "twitter:image": z.string().optional(),
      "twitter:site": z.string().optional(),
      "twitter:creator": z.string().optional(),
    }),
  }).optional(),
  
  // Content Enhancement
  content_enhancement: z.object({
    summary: z.string().describe('Enhanced summary for better content understanding'),
    target_audience: z.string().describe('Detailed target audience description'),
    key_topics: z.array(z.string()).describe('Main topics and themes covered'),
    unique_selling_points: z.array(z.string()).describe('What makes this content special'),
    content_structure: z.object({
      introduction: z.string().optional(),
      main_content: z.array(z.string()).optional(),
      conclusion: z.string().optional(),
    }).optional(),
  }).optional(),
  
  // Technical SEO
  technical_seo: z.object({
    canonical_url: z.string().optional(),
    hreflang: z.array(z.object({
      lang: z.string(),
      url: z.string()
    })).optional(),
    structured_data: z.object({
      breadcrumb_list: z.any().optional(),
      organization: z.any().optional(),
      website: z.any().optional(),
    }).optional(),
  }).optional(),
  
  // Local SEO (if applicable)
  local_seo: z.object({
    local_business: z.any().optional(),
    geo_coordinates: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }).optional(),
    service_area: z.array(z.string()).optional(),
  }).optional(),
});

export type SeoMetadataOutput = z.infer<typeof SeoMetadataOutputSchema>;

export async function generateSeoMetadata(input: SeoMetadataInput): Promise<SeoMetadataOutput> {
  try {
    console.log('🔍 Starting comprehensive SEO generation for:', input.title);
    
    // Get active OpenRouter API keys
    const { data: apiKeys, error: keysError } = await supabase
      .from('openrouter_api_keys')
      .select('api_key, requests_used, id')
      .eq('is_active', true)
      .order('requests_used', { ascending: true }); // Use least used key first

    if (keysError) {
      console.error('❌ Error fetching API keys:', keysError);
      throw new Error(`Failed to fetch API keys: ${keysError.message}`);
    }

    if (!apiKeys || apiKeys.length === 0) {
      console.error('❌ No active OpenRouter API keys found');
      throw new Error('No active OpenRouter API keys found. Please add OpenRouter API keys in the admin panel.');
    }

    console.log(`✅ Found ${apiKeys.length} active API keys`);

    // Use the first available key (least used)
    const apiKey = apiKeys[0].api_key;
    const keyId = apiKeys[0].id;
    const currentUsage = apiKeys[0].requests_used || 0;
    
    console.log(`🔑 Using API key with current usage: ${currentUsage}`);
    
    // Update usage count
    try {
      await supabase
        .from('openrouter_api_keys')
        .update({ requests_used: currentUsage + 1 })
        .eq('id', keyId);
      console.log('✅ Updated API key usage count');
    } catch (updateError) {
      console.warn('⚠️ Failed to update usage count:', updateError);
      // Continue anyway, this is not critical
    }

    // Try different models for better results (prioritize reliable ones)
    const models = [
      'google/gemini-2.5-flash-exp:free',           // Most reliable
      'deepseek/deepseek-chat-v3.1:free',          // Good for technical content
      'openai/gpt-4o-mini:free',                   // GPT-4 mini (very reliable)
      'anthropic/claude-3-haiku:free',              // Claude Haiku (reliable)
      'meta-llama/llama-3.1-8b-instruct:free',     // Llama 3.1 (good)
      'microsoft/wizardlm-2-8x22b:free'            // WizardLM (alternative)
    ];

    // Build comprehensive context string
    const contextString = buildContextString(input);
    
    const seoPrompt = `You are an expert SEO specialist for a podcast database website. Generate comprehensive, detailed SEO metadata for the given content.

IMPORTANT: Respond ONLY with valid JSON. No explanations, no markdown, just pure JSON.

Content to analyze:
- Type: ${input.contentType}
- Title: ${input.title}
- Description: ${input.description}
${input.relatedInfo ? `- Related: ${input.relatedInfo}` : ''}
${contextString}

Generate this exact JSON structure with comprehensive details:
{
  "slug": "url-friendly-slug-here",
  "meta_title": "SEO Title Under 60 Characters",
  "meta_description": "Compelling description under 155 characters for search results",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8"],
  
  "faqs": [
    {
      "question": "What is this ${input.contentType} about?",
      "answer": "Detailed, engaging answer about the content and purpose."
    },
    {
      "question": "Who is the target audience?",
      "answer": "Comprehensive description of who would benefit from this content."
    },
    {
      "question": "What topics are covered?",
      "answer": "Detailed list of main themes, subjects, and discussions."
    },
    {
      "question": "How often is new content released?",
      "answer": "Information about content frequency, schedule, and updates."
    },
    {
      "question": "Why should I engage with this content?",
      "answer": "Compelling reasons highlighting unique value, benefits, and advantages."
    },
    {
      "question": "What makes this content unique?",
      "answer": "Specific features, perspectives, or approaches that set it apart."
    }
  ],
  
  "schema_markup": {
    ${input.contentType === 'podcast' ? `
    "podcast_schema": {
      "@type": "PodcastSeries",
      "name": "${input.title}",
      "description": "Enhanced description for schema markup",
      "url": "https://poddb.com/podcast/[slug]",
      "image": "[cover_image_url]",
      "author": {
        "@type": "Person",
        "name": "[host_name]"
      },
      "publisher": {
        "@type": "Organization",
        "name": "PodDB"
      },
      "category": "[primary_category]",
      "language": "[language]",
      "explicit": false,
      "complete": false
    }` : ''}
    ${input.contentType === 'episode' ? `
    "episode_schema": {
      "@type": "PodcastEpisode",
      "name": "${input.title}",
      "description": "Enhanced episode description",
      "episodeNumber": [episode_number],
      "seasonNumber": [season_number],
      "duration": "PT[minutes]M",
      "datePublished": "[published_date]",
      "partOfSeries": {
        "@type": "PodcastSeries",
        "name": "[podcast_title]"
      }
    }` : ''}
    ${input.contentType === 'person' ? `
    "person_schema": {
      "@type": "Person",
      "name": "${input.title}",
      "description": "Enhanced person description",
      "image": "[photo_url]",
      "url": "https://poddb.com/people/[slug]",
      "sameAs": ["[social_links]"],
      "jobTitle": "[role_or_profession]",
      "worksFor": {
        "@type": "Organization",
        "name": "[organization]"
      }
    }` : ''}
  },
  
  "social_media": {
    "og_tags": {
      "og:title": "${input.title}",
      "og:description": "Enhanced social media description",
      "og:image": "[image_url]",
      "og:type": "website",
      "og:url": "https://poddb.com/${input.contentType}/[slug]",
      "og:site_name": "PodDB"
    },
    "twitter_cards": {
      "twitter:card": "summary_large_image",
      "twitter:title": "${input.title}",
      "twitter:description": "Enhanced Twitter description",
      "twitter:image": "[image_url]",
      "twitter:site": "@PodDB",
      "twitter:creator": "@PodDB"
    }
  },
  
  "content_enhancement": {
    "summary": "Comprehensive, engaging summary that captures the essence and value of this content.",
    "target_audience": "Detailed description of the ideal audience, including demographics, interests, and pain points.",
    "key_topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"],
    "unique_selling_points": ["USP 1", "USP 2", "USP 3"],
    "content_structure": {
      "introduction": "How the content begins and hooks the audience",
      "main_content": ["Key section 1", "Key section 2", "Key section 3"],
      "conclusion": "How the content wraps up and calls to action"
    }
  },
  
  "technical_seo": {
    "canonical_url": "https://poddb.com/${input.contentType}/[slug]",
    "hreflang": [
      {"lang": "en-US", "url": "https://poddb.com/${input.contentType}/[slug]"},
      {"lang": "hi-IN", "url": "https://poddb.com/hi/${input.contentType}/[slug]"}
    ],
    "structured_data": {
      "breadcrumb_list": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://poddb.com"},
          {"@type": "ListItem", "position": 2, "name": "${input.contentType.charAt(0).toUpperCase() + input.contentType.slice(1)}s", "item": "https://poddb.com/${input.contentType}s"},
          {"@type": "ListItem", "position": 3, "name": "${input.title}", "item": "https://poddb.com/${input.contentType}/[slug]"}
        ]
      }
    }
  }
}

Make sure to:
1. Fill in all placeholder values with actual data from the context
2. Generate engaging, specific content (not generic)
3. Use the actual data provided in the context
4. Create compelling, SEO-optimized content
5. Ensure all JSON is valid and properly formatted`;

    // Try each model until one succeeds
    for (let index = 0; index < models.length; index++) {
      const model = models[index];
      console.log(`🤖 Trying model ${index + 1}/${models.length}: ${model}`);
      
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://poddb.com',
            'X-Title': 'PodDB AI SEO Tool'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: 'You are an expert SEO specialist. Generate comprehensive, detailed SEO metadata in valid JSON format only.'
              },
              {
                role: 'user',
                content: seoPrompt
              }
            ],
            max_tokens: 4000,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          console.warn(`⚠️ Model ${model} failed with status: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        if (content) {
          console.log(`✅ Got response from ${model}`);
          
          // Extract JSON content
          let jsonContent = content;
          if (content.includes('```json')) {
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
              jsonContent = jsonMatch[1];
            }
          }
          
          // Parse JSON response
          const parsed = JSON.parse(jsonContent);
          console.log(`✅ Successfully parsed JSON from ${model}`);
          
          // Validate against schema
          const result = SeoMetadataOutputSchema.parse(parsed);
          console.log(`🎯 Comprehensive SEO generation successful with model ${model}`);
          return result;
        } else {
          console.warn(`⚠️ No content in response from ${model}`);
          continue;
        }
      } catch (modelError) {
        console.error(`❌ Error with model ${model}:`, modelError);
        continue;
      }
    }

    // If all models failed, try to generate a basic fallback
    console.log('🔄 All AI models failed, generating fallback SEO data...');
    
    try {
      const fallbackResult = generateFallbackSeo(input);
      console.log('✅ Generated fallback SEO data');
      return fallbackResult;
    } catch (fallbackError) {
      console.error('❌ Fallback generation also failed:', fallbackError);
      throw new Error('All AI models failed to generate SEO metadata. Please check your OpenRouter API keys and try again.');
    }
  } catch (error: any) {
    console.error('❌ SEO Generation Error:', error);
    throw new Error(`Failed to generate SEO metadata: ${error.message}`);
  }
}

// Helper function to build comprehensive context string
function buildContextString(input: SeoMetadataInput): string {
  let context = '';
  
  if (input.additionalContext) {
    const ctx = input.additionalContext;
    
    if (ctx.categories && ctx.categories.length > 0) {
      context += `- Categories: ${ctx.categories.join(', ')}\n`;
    }
    
    if (ctx.tags && ctx.tags.length > 0) {
      context += `- Tags: ${ctx.tags.join(', ')}\n`;
    }
    
    if (ctx.language) {
      context += `- Language: ${ctx.language}\n`;
    }
    
    if (ctx.averageRating) {
      context += `- Average Rating: ${ctx.averageRating}/5\n`;
    }
    
    if (ctx.totalViews) {
      context += `- Total Views: ${ctx.totalViews.toLocaleString()}\n`;
    }
    
    if (ctx.totalLikes) {
      context += `- Total Likes: ${ctx.totalLikes.toLocaleString()}\n`;
    }
    
    if (ctx.totalEpisodes) {
      context += `- Total Episodes: ${ctx.totalEpisodes}\n`;
    }
    
    if (ctx.averageDuration) {
      context += `- Average Duration: ${Math.round(ctx.averageDuration / 60)} minutes\n`;
    }
    
    if (ctx.firstEpisodeDate) {
      context += `- First Episode: ${ctx.firstEpisodeDate}\n`;
    }
    
    if (ctx.lastEpisodeDate) {
      context += `- Last Episode: ${ctx.lastEpisodeDate}\n`;
    }
    
    if (ctx.teamMembers && ctx.teamMembers.length > 0) {
      context += `- Team Members: ${ctx.teamMembers.map((m: any) => m.full_name || m.name).join(', ')}\n`;
    }
    
    if (ctx.socialLinks) {
      context += `- Social Media: Available\n`;
    }
    
    if (ctx.platformLinks) {
      context += `- Platform Links: Available\n`;
    }
    
    if (ctx.officialWebsite) {
      context += `- Official Website: ${ctx.officialWebsite}\n`;
    }
    
    if (ctx.youtubePlaylistUrl) {
      context += `- YouTube Playlist: Available\n`;
    }
    
    // Episode specific
    if (ctx.episodeNumber) {
      context += `- Episode Number: ${ctx.episodeNumber}\n`;
    }
    
    if (ctx.seasonNumber) {
      context += `- Season Number: ${ctx.seasonNumber}\n`;
    }
    
    if (ctx.duration) {
      context += `- Duration: ${Math.round(ctx.duration / 60)} minutes\n`;
    }
    
    if (ctx.publishedAt) {
      context += `- Published: ${ctx.publishedAt}\n`;
    }
    
    if (ctx.podcastTitle) {
      context += `- Podcast: ${ctx.podcastTitle}\n`;
    }
    
    // Person specific
    if (ctx.bio) {
      context += `- Bio: ${ctx.bio}\n`;
    }
    
    if (ctx.birthDate) {
      context += `- Birth Date: ${ctx.birthDate}\n`;
    }
    
    if (ctx.location) {
      context += `- Location: ${ctx.location}\n`;
    }
    
    if (ctx.photoUrls && ctx.photoUrls.length > 0) {
      context += `- Photos: ${ctx.photoUrls.length} available\n`;
    }
    
    if (ctx.websiteUrl) {
      context += `- Website: ${ctx.websiteUrl}\n`;
    }
    
    if (ctx.totalAppearances) {
      context += `- Total Appearances: ${ctx.totalAppearances}\n`;
    }
    
    if (ctx.isVerified !== undefined) {
      context += `- Verified: ${ctx.isVerified ? 'Yes' : 'No'}\n`;
    }
  }
  
  return context;
}

// Fallback function to generate basic SEO when AI fails
function generateFallbackSeo(input: SeoMetadataInput): SeoMetadataOutput {
  const title = input.title;
  const description = input.description;
  
  // Generate a basic slug
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  // Generate basic meta title
  const metaTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
  
  // Generate basic meta description
  const metaDescription = description.length > 155 ? description.substring(0, 152) + '...' : description;
  
  // Generate basic keywords from title and description
  const words = (title + ' ' + description)
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 8);
  
  const keywords = Array.from(new Set(words)); // Remove duplicates
  
  // Generate basic FAQs
  const faqs = [
    {
      question: `What is ${title} about?`,
      answer: description.substring(0, 100) + (description.length > 100 ? '...' : '')
    },
    {
      question: `Who would enjoy ${title}?`,
      answer: `Anyone interested in ${input.contentType} content and related topics.`
    },
    {
      question: `What makes ${title} unique?`,
      answer: `This ${input.contentType} offers valuable insights and engaging content for its audience.`
    },
    {
      question: `How often is new content available?`,
      answer: `Regular updates and new content are provided to keep audiences engaged.`
    },
    {
      question: `Why should I engage with ${title}?`,
      answer: `This content provides valuable information, insights, and entertainment for its target audience.`
    },
    {
      question: `What topics are covered?`,
      answer: `A wide range of relevant topics and themes that appeal to the target audience.`
    }
  ];
  
  return {
    slug,
    meta_title: metaTitle,
    meta_description: metaDescription,
    keywords,
    faqs,
    schema_markup: {},
    social_media: {
      og_tags: {
        "og:title": title,
        "og:description": metaDescription,
        "og:type": "website",
        "og:url": `https://poddb.com/${input.contentType}/${slug}`,
        "og:site_name": "PodDB"
      },
      twitter_cards: {
        "twitter:card": "summary",
        "twitter:title": title,
        "twitter:description": metaDescription
      }
    },
    content_enhancement: {
      summary: description,
      target_audience: `People interested in ${input.contentType} content`,
      key_topics: keywords.slice(0, 5),
      unique_selling_points: [`Quality ${input.contentType} content`, "Engaging presentation", "Valuable insights"],
      content_structure: {
        introduction: "Content introduction and overview",
        main_content: ["Main topic 1", "Main topic 2", "Main topic 3"],
        conclusion: "Content summary and takeaways"
      }
    },
    technical_seo: {
      canonical_url: `https://poddb.com/${input.contentType}/${slug}`,
      hreflang: [
        {"lang": "en-US", "url": `https://poddb.com/${input.contentType}/${slug}`}
      ],
      structured_data: {
        breadcrumb_list: {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://poddb.com"},
            {"@type": "ListItem", "position": 2, "name": `${input.contentType.charAt(0).toUpperCase() + input.contentType.slice(1)}s`, "item": `https://poddb.com/${input.contentType}s`},
            {"@type": "ListItem", "position": 3, "name": title, "item": `https://poddb.com/${input.contentType}/${slug}`}
          ]
        }
      }
    }
  };
}

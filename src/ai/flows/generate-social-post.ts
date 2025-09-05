"use server";
import { z } from "zod";

const inputSchema = z.object({
  podcastName: z.string().describe("The name of the podcast"),
  awardTitle: z.string().describe("The title of the award or nomination category"),
  podcastImageUrl: z.string().url().describe("The URL of the podcast's cover image"),
});

const outputSchema = z.object({
  socialPostImageUrl: z.string().url().describe("The URL of the generated social media post image"),
  socialPostCaption: z.string().describe("The suggested caption for the social media post"),
});

type Input = z.infer<typeof inputSchema>;
type Output = z.infer<typeof outputSchema>;

export async function generateSocialPost(input: Input): Promise<Output> {
  const { podcastName, awardTitle, podcastImageUrl } = input;
  // In a real application, you would use a library like Vercel's Satori
  // to generate an image from HTML and CSS.
  // For this example, we'll just return a placeholder from an image generation service.
  const imageUrl = `https://placehold.co/1080x1080/1a1a1a/ffffff/png?text=${encodeURIComponent(
    `${podcastName}\n${awardTitle}`
  )}`;

  const caption = `🏆 We're thrilled to announce that ${podcastName} has been awarded "${awardTitle}"! 🏆\n\nA huge thank you to our listeners and the PodDB community for this incredible honor. We couldn't have done it without your support!\n\n#${podcastName.replace(/\s+/g, '')} #${awardTitle.replace(/\s+/g, '')} #PodDBAwards #Podcast`;

  return {
    socialPostImageUrl: imageUrl,
    socialPostCaption: caption,
  };
}

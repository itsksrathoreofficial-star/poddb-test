/**
 * Debug utility for image URL issues
 */

export const debugImageUrl = (url: string | null | undefined, context: string = 'unknown') => {
  if (!url) {
    console.warn(`[${context}] Image URL is null or undefined`);
    return;
  }
  
  const trimmedUrl = url.trim();
  
  if (trimmedUrl.length < 4) {
    console.warn(`[${context}] Image URL too short: "${trimmedUrl}"`);
    return;
  }
  
  if (!trimmedUrl.startsWith('http') && !trimmedUrl.startsWith('/')) {
    console.warn(`[${context}] Invalid image URL format: "${trimmedUrl}"`);
    return;
  }
  
  try {
    if (trimmedUrl.startsWith('http')) {
      new URL(trimmedUrl);
      console.log(`[${context}] Valid image URL: "${trimmedUrl}"`);
    } else {
      console.log(`[${context}] Valid relative path: "${trimmedUrl}"`);
    }
  } catch (error) {
    console.error(`[${context}] Invalid URL construction: "${trimmedUrl}"`, error);
  }
};

export const validateImageUrl = (url: string | null | undefined): boolean => {
  if (!url || url.trim() === '') return false;
  
  const trimmedUrl = url.trim();
  
  // Basic length check
  if (trimmedUrl.length < 4) return false;
  
  // Basic format check
  if (!trimmedUrl.startsWith('http') && !trimmedUrl.startsWith('/')) return false;
  
  try {
    if (trimmedUrl.startsWith('http')) {
      new URL(trimmedUrl);
    }
    return true;
  } catch {
    return false;
  }
};

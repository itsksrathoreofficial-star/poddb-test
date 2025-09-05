/**
 * Utility functions for handling image URLs safely
 */

export const getSafeImageUrl = (url: string | null | undefined, fallback: string = '/placeholder.svg'): string => {
  if (!url || url.trim() === '') {
    return fallback;
  }
  
  const trimmedUrl = url.trim();
  
  // Handle invalid URLs that are just random strings
  if (trimmedUrl.length < 4) {
    return fallback;
  }
  
  // Handle localhost URLs by converting them to proper format
  if (trimmedUrl.includes('localhost:3000')) {
    return trimmedUrl.replace('localhost:3000', 'localhost:3001');
  }
  
  // Handle relative paths that start with /_next/
  if (trimmedUrl.startsWith('/_next/')) {
    return trimmedUrl;
  }
  
  // Handle relative paths that start with /
  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl;
  }
  
  // Handle full URLs with validation
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    try {
      new URL(trimmedUrl); // Validate URL
      return trimmedUrl;
    } catch (error) {
      return fallback;
    }
  }
  
  // More permissive: if it looks like it could be a valid URL, try it
  if (trimmedUrl.includes('.') && (trimmedUrl.includes('jpg') || trimmedUrl.includes('jpeg') || trimmedUrl.includes('png') || trimmedUrl.includes('gif') || trimmedUrl.includes('webp'))) {
    return trimmedUrl;
  }
  
  return fallback;
};

export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || url.trim() === '') return false;
  
  const trimmedUrl = url.trim();
  
  // Handle invalid URLs that are just random strings
  if (trimmedUrl.length < 4 || (!trimmedUrl.startsWith('http') && !trimmedUrl.startsWith('/'))) {
    return false;
  }
  
  try {
    // If it's a relative path starting with /, it's valid
    if (trimmedUrl.startsWith('/')) {
      return true;
    }
    
    // If it's a full URL, validate it
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      new URL(trimmedUrl); // This will throw if invalid
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
};

export const normalizeImageUrl = (url: string | null | undefined): string => {
  if (!url || url.trim() === '') return '/placeholder.svg';
  
  const trimmedUrl = url.trim();
  
  // Handle invalid URLs that are just random strings
  if (trimmedUrl.length < 4 || (!trimmedUrl.startsWith('http') && !trimmedUrl.startsWith('/'))) {
    return '/placeholder.svg';
  }
  
  // Check for already processed Next.js image URLs to avoid double processing
  if (trimmedUrl.includes('/_next/image?url=') || trimmedUrl.includes('_next/image')) {
    return '/placeholder.svg';
  }
  
  // Check for circular or malformed URLs
  if (trimmedUrl.includes('localhost:3001/_next/image') || 
      trimmedUrl.includes('localhost:3000/_next/image') ||
      trimmedUrl.includes('%2F_next%2Fimage')) {
    return '/placeholder.svg';
  }
  
  // Check for double-encoded URLs
  if (trimmedUrl.includes('%2F') && trimmedUrl.includes('_next')) {
    return '/placeholder.svg';
  }
  
  // Remove any query parameters that might cause issues
  const cleanUrl = trimmedUrl.split('?')[0];
  
  // Handle localhost port changes
  if (cleanUrl.includes('localhost:3000')) {
    return cleanUrl.replace('localhost:3000', 'localhost:3001');
  }
  
  // Validate URL format
  try {
    // If it's a relative path starting with /, it's valid
    if (cleanUrl.startsWith('/')) {
      return cleanUrl;
    }
    
    // If it's a full URL, validate it
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      new URL(cleanUrl); // This will throw if invalid
      return cleanUrl;
    }
    
    // If none of the above, return placeholder
    return '/placeholder.svg';
  } catch (error) {
    // If URL construction fails, return placeholder
    return '/placeholder.svg';
  }
};

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallback: string = '/placeholder.svg') => {
  console.warn('Image failed to load, using fallback:', e.currentTarget.src);
  e.currentTarget.src = fallback;
};

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// URL validation utility functions
export const isValidImageUrl = (url: string | null): boolean => {
  if (!url) return false;
  
  // Check if it's a relative path starting with /
  if (url.startsWith('/')) return true;
  
  // Check if it's an absolute URL with http/https
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const getSafeImageUrl = (url: string | null, placeholder: string = 'https://placehold.co/400x250.png?text=No+Image'): string => {
  if (isValidImageUrl(url)) {
    return url!;
  }
  return placeholder;
};

export const getSafeAvatarUrl = (url: string | null): string => {
  return getSafeImageUrl(url, 'https://placehold.co/40x40.png?text=U');
};

// Generate URL-friendly slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Generate unique slug by checking database
export const generateUniqueSlug = async (title: string, table: string, currentId?: string): Promise<string> => {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  // This will be used in server actions where we have database access
  return slug; // For now, return the base slug. The uniqueness check will be done in the server action.
};
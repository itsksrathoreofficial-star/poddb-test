import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

// Server-side upload function for server actions
export const uploadToCloudinary = async (
  file: File,
  folder: string = 'podcast-images'
): Promise<CloudinaryUploadResult> => {
  try {
    // Convert File to buffer for server-side processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Convert buffer to base64 string for Cloudinary
    const base64String = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;
    
    // Advanced optimization settings for different image types
    const getOptimizationSettings = (folder: string) => {
      const baseSettings = {
        folder,
        resource_type: 'auto' as const,
        upload_preset: 'Poddb-pro',
        // Advanced compression without quality loss
        transformation: [
          { quality: 'auto:best' }, // Use best quality with auto optimization
          { fetch_format: 'auto' }, // Auto format selection (WebP when supported)
          { flags: 'lossy' }, // Enable lossy compression for better size reduction
          { dpr: 'auto' }, // Device pixel ratio optimization
          { responsive: true }, // Enable responsive images
        ]
      };

      // Specific optimizations based on folder type
      if (folder.includes('episode-thumbnails')) {
        return {
          ...baseSettings,
          transformation: [
            ...baseSettings.transformation,
            { width: 1280, height: 720, crop: 'fill', gravity: 'center' }, // Standard thumbnail size
            { quality: 'auto:high' }, // High quality for thumbnails
          ]
        };
      } else if (folder.includes('podcast-logos') || folder.includes('people-photos')) {
        return {
          ...baseSettings,
          transformation: [
            ...baseSettings.transformation,
            { width: 800, height: 800, crop: 'fill', gravity: 'center' }, // Square format
            { quality: 'auto:best' }, // Best quality for profile images
          ]
        };
      } else if (folder.includes('podcast-additional')) {
        return {
          ...baseSettings,
          transformation: [
            ...baseSettings.transformation,
            { width: 1920, height: 1080, crop: 'limit' }, // Max size limit
            { quality: 'auto:good' }, // Good quality for additional photos
          ]
        };
      }

      return baseSettings;
    };
    
    const result = await cloudinary.uploader.upload(dataURI, getOptimizationSettings(folder));
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type
    };
  } catch (error) {
    console.error('Server-side upload error:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Function to get optimized URL for existing images with advanced compression
export const getCompressedImageUrl = (
  originalUrl: string,
  type: 'thumbnail' | 'profile' | 'logo' | 'additional' = 'thumbnail',
  width?: number
): string => {
  // If it's already a Cloudinary URL, extract public ID and optimize
  if (originalUrl.includes('res.cloudinary.com')) {
    const publicId = originalUrl.split('/').pop()?.split('.')[0];
    if (publicId) {
      return getOptimizedImageUrl(publicId, type, width);
    }
  }
  
  // If it's not a Cloudinary URL, return as is (for YouTube thumbnails, etc.)
  return originalUrl;
};

// Function to batch optimize existing images (for admin use)
export const batchOptimizeImages = async (
  publicIds: string[],
  type: 'thumbnail' | 'profile' | 'logo' | 'additional' = 'thumbnail'
): Promise<{ publicId: string; optimizedUrl: string }[]> => {
  try {
    const results = publicIds.map(publicId => ({
      publicId,
      optimizedUrl: getOptimizedImageUrl(publicId, type)
    }));
    
    return results;
  } catch (error) {
    console.error('Error batch optimizing images:', error);
    throw error;
  }
};

export const getOptimizedUrl = (
  publicId: string,
  width: number = 800,
  quality: string = 'auto:good'
): string => {
  return cloudinary.url(publicId, {
    width,
    quality,
    fetch_format: 'auto',
    crop: 'scale',
    flags: 'lossy', // Enable lossy compression
    dpr: 'auto', // Device pixel ratio optimization
    responsive: true, // Enable responsive images
    format: 'auto' // Auto format selection
  });
};

// New function for different image types with specific optimizations
export const getOptimizedImageUrl = (
  publicId: string,
  type: 'thumbnail' | 'profile' | 'logo' | 'additional' = 'thumbnail',
  width?: number
): string => {
  const baseSettings = {
    quality: 'auto:best',
    fetch_format: 'auto',
    flags: 'lossy',
    dpr: 'auto',
    responsive: true,
    format: 'auto'
  };

  switch (type) {
    case 'thumbnail':
      return cloudinary.url(publicId, {
        ...baseSettings,
        width: width || 1280,
        height: 720,
        crop: 'fill',
        gravity: 'center'
      });
    
    case 'profile':
    case 'logo':
      return cloudinary.url(publicId, {
        ...baseSettings,
        width: width || 800,
        height: 800,
        crop: 'fill',
        gravity: 'center'
      });
    
    case 'additional':
      return cloudinary.url(publicId, {
        ...baseSettings,
        width: width || 1920,
        height: 1080,
        crop: 'limit'
      });
    
    default:
      return cloudinary.url(publicId, {
        ...baseSettings,
        width: width || 800,
        crop: 'scale'
      });
  }
};

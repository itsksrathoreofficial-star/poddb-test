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
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder,
      resource_type: 'auto',
      upload_preset: 'Poddb-pro',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
    
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

export const getOptimizedUrl = (
  publicId: string,
  width: number = 800,
  quality: string = 'auto:good'
): string => {
  return cloudinary.url(publicId, {
    width,
    quality,
    fetch_format: 'auto',
    crop: 'scale'
  });
};

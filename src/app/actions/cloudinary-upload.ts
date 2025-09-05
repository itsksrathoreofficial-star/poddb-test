'use server';

import { uploadToCloudinary } from '@/lib/cloudinary';

export async function uploadPhotoToCloudinary(
  file: File,
  folder: string = 'people-photos'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Check if environment variables are set
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary environment variables');
      return {
        success: false,
        error: 'Cloudinary configuration is missing. Please check environment variables.'
      };
    }

    const result = await uploadToCloudinary(file, folder);
    return {
      success: true,
      url: result.secure_url
    };
  } catch (error: any) {
    console.error('Server-side upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
}

export async function uploadFileToCloudinary(
  file: File,
  folder: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Check if environment variables are set
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary environment variables');
      return {
        success: false,
        error: 'Cloudinary configuration is missing. Please check environment variables.'
      };
    }

    const result = await uploadToCloudinary(file, folder);
    return {
      success: true,
      url: result.secure_url
    };
  } catch (error: any) {
    console.error('Server-side upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
}

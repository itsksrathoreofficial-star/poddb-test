import { CloudinaryUploadResult } from '@/types/cloudinary';

// Server-side upload via API route
export const uploadToCloudinaryViaAPI = async (
  file: File,
  folder: string = 'podcast-images'
): Promise<CloudinaryUploadResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    console.error('API upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

// Client-side upload using Cloudinary Upload Widget
export const uploadToCloudinary = async (
  file: File,
  folder: string = 'podcast-images'
): Promise<CloudinaryUploadResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if Cloudinary cloud name is available
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        reject(new Error('Cloudinary cloud name is not configured. Please check your environment variables.'));
        return;
      }

      // Validate file
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file.'));
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('File size too large. Please select an image smaller than 10MB.'));
        return;
      }

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'Poddb-pro');
      formData.append('folder', folder);

      // Add optimization parameters based on folder type
      const getOptimizationParams = (folder: string) => {
        const params: Record<string, string> = {
          quality: 'auto:best',
          fetch_format: 'auto',
          flags: 'lossy',
          dpr: 'auto',
          responsive: 'true'
        };

        if (folder.includes('episode-thumbnails')) {
          params.width = '1280';
          params.height = '720';
          params.crop = 'fill';
          params.gravity = 'center';
          params.quality = 'auto:high';
        } else if (folder.includes('podcast-logos') || folder.includes('people-photos') || folder.includes('team-photos')) {
          params.width = '800';
          params.height = '800';
          params.crop = 'fill';
          params.gravity = 'center';
          params.quality = 'auto:high';
        } else if (folder.includes('podcast-images')) {
          params.width = '1200';
          params.height = '630';
          params.crop = 'fill';
          params.gravity = 'center';
          params.quality = 'auto:good';
        } else if (folder.includes('podcast-additional')) {
          params.width = '1920';
          params.height = '1080';
          params.crop = 'limit';
          params.quality = 'auto:good';
        }

        return params;
      };

      const optimizationParams = getOptimizationParams(folder);
      Object.entries(optimizationParams).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Upload to Cloudinary with multiple retry attempts
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      
      let lastError: Error | null = null;
      
      // Try multiple approaches
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`Cloudinary upload attempt ${attempt}/3`);
          
          const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            mode: 'cors',
            credentials: 'omit',
            headers: {
              'Accept': 'application/json',
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const result = await response.json();
          
          if (result.error) {
            throw new Error(result.error.message || 'Upload failed');
          }
          
          console.log('Cloudinary upload successful:', result.public_id);
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            resource_type: result.resource_type
          });
          return;
          
        } catch (error: any) {
          lastError = error;
          console.warn(`Cloudinary upload attempt ${attempt} failed:`, error.message);
          
          // Wait before retry (exponential backoff)
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          }
        }
      }
      
      // All attempts failed
      console.error('All Cloudinary upload attempts failed:', lastError);
      
      if (lastError?.name === 'TypeError' && lastError?.message.includes('Failed to fetch')) {
        reject(new Error('Unable to connect to image upload service. Please check your internet connection and try again.'));
      } else if (lastError?.message.includes('CORS')) {
        reject(new Error('Image upload service configuration error. Please contact administrator.'));
      } else {
        reject(new Error(`Image upload failed: ${lastError?.message || 'Unknown error'}`));
      }
      
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      reject(new Error(`Image upload failed: ${error.message}`));
    }
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  // Note: This requires server-side implementation for security
  console.warn('Delete from Cloudinary requires server-side implementation');
};

// Get optimized URL for existing image
export const getOptimizedUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
): string => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.warn('Cloudinary cloud name not configured');
    return '';
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto:best',
    format = 'auto'
  } = options;

  let url = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  const transformations = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  
  if (transformations.length > 0) {
    url += `/${transformations.join(',')}`;
  }
  
  url += `/${publicId}`;
  
  return url;
};

// Upload with progress tracking
export const uploadToCloudinaryWithProgress = async (
  file: File,
  folder: string = 'podcast-images',
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if Cloudinary cloud name is available
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        reject(new Error('Cloudinary cloud name is not configured. Please check your environment variables.'));
        return;
      }

      // Validate file
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file.'));
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('File size too large. Please select an image smaller than 10MB.'));
        return;
      }

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'Poddb-pro');
      formData.append('folder', folder);

      // Add optimization parameters
      const getOptimizationParams = (folder: string) => {
        const params: Record<string, string> = {
          quality: 'auto:best',
          fetch_format: 'auto',
          flags: 'lossy',
          dpr: 'auto',
          responsive: 'true'
        };

        if (folder.includes('episode-thumbnails')) {
          params.width = '1280';
          params.height = '720';
          params.crop = 'fill';
          params.gravity = 'center';
          params.quality = 'auto:high';
        } else if (folder.includes('podcast-logos') || folder.includes('people-photos') || folder.includes('team-photos')) {
          params.width = '800';
          params.height = '800';
          params.crop = 'fill';
          params.gravity = 'center';
          params.quality = 'auto:high';
        } else if (folder.includes('podcast-images')) {
          params.width = '1200';
          params.height = '630';
          params.crop = 'fill';
          params.gravity = 'center';
          params.quality = 'auto:good';
        } else if (folder.includes('podcast-additional')) {
          params.width = '1920';
          params.height = '1080';
          params.crop = 'limit';
          params.quality = 'auto:good';
        }

        return params;
      };

      const optimizationParams = getOptimizationParams(folder);
      Object.entries(optimizationParams).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Upload with progress tracking
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            if (result.error) {
              reject(new Error(result.error.message || 'Upload failed'));
            } else {
              resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                resource_type: result.resource_type
              });
            }
          } catch (error) {
            reject(new Error('Invalid response from upload service'));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });
      
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'));
      });
      
      xhr.open('POST', uploadUrl);
      xhr.timeout = 60000; // 60 seconds timeout
      xhr.send(formData);
      
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      reject(new Error(`Image upload failed: ${error.message}`));
    }
  });
};
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

// Client-side upload using Cloudinary Upload Widget
export const uploadToCloudinary = async (
  file: File,
  folder: string = 'podcast-images'
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
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
      } else if (folder.includes('podcast-logos') || folder.includes('people-photos')) {
        params.width = '800';
        params.height = '800';
        params.crop = 'fill';
        params.gravity = 'center';
        params.quality = 'auto:best';
      } else if (folder.includes('podcast-additional')) {
        params.width = '1920';
        params.height = '1080';
        params.crop = 'limit';
        params.quality = 'auto:good';
      }

      return params;
    };

    // Add optimization parameters to form data
    const optimizationParams = getOptimizationParams(folder);
    Object.entries(optimizationParams).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Upload to Cloudinary
    fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(result => {
      if (result.error) {
        reject(new Error(result.error.message || 'Upload failed'));
        return;
      }
      
      resolve({
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type
      });
    })
    .catch(error => {
      reject(error);
    });
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  // Note: This requires server-side implementation for security
  // For now, we'll just log the deletion request
  console.log('Delete request for:', publicId);
  // In production, you'd make an API call to your backend
};

export const getOptimizedUrl = (
  publicId: string,
  width: number = 800,
  quality: string = 'auto:good'
): string => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},q_${quality},f_auto,c_scale,fl_lossy,dpr_auto,fl_responsive/${publicId}`;
};

// New function for different image types with specific optimizations
export const getOptimizedImageUrl = (
  publicId: string,
  type: 'thumbnail' | 'profile' | 'logo' | 'additional' = 'thumbnail',
  width?: number
): string => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const baseParams = 'q_auto:best,f_auto,fl_lossy,dpr_auto,fl_responsive';

  switch (type) {
    case 'thumbnail':
      const thumbWidth = width || 1280;
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_${thumbWidth},h_720,c_fill,g_center,${baseParams}/${publicId}`;
    
    case 'profile':
    case 'logo':
      const profileWidth = width || 800;
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_${profileWidth},h_800,c_fill,g_center,${baseParams}/${publicId}`;
    
    case 'additional':
      const additionalWidth = width || 1920;
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_${additionalWidth},h_1080,c_limit,${baseParams}/${publicId}`;
    
    default:
      const defaultWidth = width || 800;
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_${defaultWidth},c_scale,${baseParams}/${publicId}`;
  }
};


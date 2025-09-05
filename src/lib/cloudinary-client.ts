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
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},q_${quality},f_auto,c_scale/${publicId}`;
};


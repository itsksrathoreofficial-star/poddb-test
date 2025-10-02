import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = false;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'podcast-images';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Get Cloudinary configuration
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'Poddb-pro';

    if (!cloudName) {
      return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 });
    }

    // Create FormData for Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', uploadPreset);
    cloudinaryFormData.append('folder', folder);

    // Add optimization parameters
    const optimizationParams = {
      quality: 'auto:best',
      fetch_format: 'auto',
      flags: 'lossy',
      dpr: 'auto',
      responsive: 'true'
    };

    Object.entries(optimizationParams).forEach(([key, value]) => {
      cloudinaryFormData.append(key, value);
    });

    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: cloudinaryFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload error:', errorText);
      return NextResponse.json({ 
        error: `Upload failed: ${response.status} ${errorText}` 
      }, { status: response.status });
    }

    const result = await response.json();

    if (result.error) {
      return NextResponse.json({ 
        error: result.error.message || 'Upload failed' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type
      }
    });

  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json({ 
      error: `Upload failed: ${error.message}` 
    }, { status: 500 });
  }
}

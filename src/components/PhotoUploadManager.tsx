import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, X, Image as ImageIcon, User, Images } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadToCloudinary } from '@/lib/cloudinary-client';

interface Photo {
  id: string;
  url: string;
  type: 'profile' | 'additional';
  uploadedAt: Date;
  title: string;
  keywords: string;
  person: string;
  credit: string;
}

interface PhotoUploadManagerProps {
  photos: Photo[];
  onPhotoUpload: (file: File, type: 'profile' | 'additional') => void;
  onPhotoDelete: (photoId: string) => void;
  onPhotoTypeChange: (photoId: string, type: 'profile' | 'additional') => void;
  onPhotoMetadataChange?: (photoId: string, field: 'title' | 'keywords' | 'person' | 'credit', value: string) => void;
  maxPhotos?: number;
  className?: string;
  title?: string;
  showAdditionalPhotos?: boolean;
  showProfilePhoto?: boolean;
  uploadType?: 'profile' | 'additional';
}

export function PhotoUploadManager({
  photos,
  onPhotoUpload,
  onPhotoDelete,
  onPhotoTypeChange,
  onPhotoMetadataChange,
  maxPhotos = 10,
  className,
  title = "Photo Management",
  showAdditionalPhotos = true,
  showProfilePhoto = true,
  uploadType: initialUploadType
}: PhotoUploadManagerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadType, setUploadType] = useState<'profile' | 'additional'>(initialUploadType || 'profile');
  
  // If initialUploadType is provided, lock the upload type
  const isUploadTypeLocked = !!initialUploadType;

  const profilePhoto = photos.find(p => p.type === 'profile');
  const additionalPhotos = photos.filter(p => p.type === 'additional');
  const canUploadMore = photos.length < maxPhotos;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onPhotoUpload(file, uploadType);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onPhotoUpload(file, uploadType);
    }
  };

  const handleTypeChange = (photoId: string, newType: 'profile' | 'additional') => {
    // If changing to profile, ensure only one profile photo exists
    if (newType === 'profile') {
      const currentProfile = photos.find(p => p.type === 'profile');
      if (currentProfile && currentProfile.id !== photoId) {
        onPhotoTypeChange(currentProfile.id, 'additional');
      }
    }
    onPhotoTypeChange(photoId, newType);
  };

  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ImageIcon className="h-6 w-6 text-primary" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        {canUploadMore && (
          <div className="space-y-4">
            {/* Only show upload type selection when no fixed uploadType is provided */}
            {showAdditionalPhotos && !isUploadTypeLocked && (
              <div className="flex items-center space-x-4">
                <Label className="text-sm font-medium">Upload Type:</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={uploadType === 'profile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUploadType('profile')}
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Logo</span>
                  </Button>
                  <Button
                    variant={uploadType === 'additional' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUploadType('additional')}
                    className="flex items-center space-x-2"
                  >
                    <Images className="h-4 w-4" />
                    <span>Additional</span>
                  </Button>
                </div>
              </div>
            )}

            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors relative",
                dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {/* Cross button for profile photo when locked upload type */}
              {isUploadTypeLocked && initialUploadType === 'profile' && profilePhoto && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onPhotoDelete(profilePhoto.id)}
                  className="absolute top-2 right-2 h-8 w-8 p-0 z-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  {isUploadTypeLocked 
                    ? (initialUploadType === 'profile' ? <User className="h-6 w-6 text-muted-foreground" /> : <Images className="h-6 w-6 text-muted-foreground" />)
                    : (uploadType === 'profile' ? <User className="h-6 w-6 text-muted-foreground" /> : <Images className="h-6 w-6 text-muted-foreground" />)
                  }
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {isUploadTypeLocked 
                      ? (initialUploadType === 'profile' ? 'Profile Pic' : 'Additional Photo')
                      : (uploadType === 'profile' ? 'Profile Pic' : 'Additional Photo')
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Drag and drop an image here, or click to select
                  </p>
                </div>
                <div className="flex justify-center space-x-2">
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select File
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

                 {/* Profile Photo Section - Only show when not used for logo upload */}
         {showProfilePhoto && !isUploadTypeLocked && (
           <div className="space-y-3">
             <div className="flex items-center space-x-2">
               <User className="h-5 w-5 text-primary" />
               <Label className="text-sm font-medium">Profile Pic</Label>
               {profilePhoto && (
                 <Badge variant="secondary" className="text-xs">
                   Main Display
                 </Badge>
               )}
             </div>
             
             {profilePhoto ? (
               <div className="relative group">
                 <img
                   src={profilePhoto.url}
                   alt="Profile"
                   className="w-24 h-24 rounded-lg object-cover border-2 border-primary"
                 />
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                   <div className="flex space-x-2">
                     <Button
                       variant="secondary"
                       size="sm"
                       onClick={() => onPhotoDelete(profilePhoto.id)}
                       className="h-8 w-8 p-0"
                     >
                       <X className="h-4 w-4" />
                     </Button>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                 <User className="h-8 w-8 text-muted-foreground" />
               </div>
             )}
           </div>
         )}

        <Separator />

        {/* SEO Metadata Section */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <Label className="text-sm font-medium">SEO Metadata</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Add metadata to improve SEO and provide proper attribution
          </p>
          
                     {/* Profile Photo Metadata - Show for profile photos (including logo) */}
           {showProfilePhoto && profilePhoto && (
            <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                             <Label className="text-xs font-medium">Logo Metadata</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={profilePhoto.title}
                                           onChange={(e) => onPhotoMetadataChange?.(profilePhoto.id, 'title', e.target.value)}
                    placeholder="Photo title"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Keywords</Label>
                  <Input
                    value={profilePhoto.keywords}
                                           onChange={(e) => onPhotoMetadataChange?.(profilePhoto.id, 'keywords', e.target.value)}
                    placeholder="SEO keywords"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Person</Label>
                  <Input
                    value={profilePhoto.person}
                    onChange={(e) => onPhotoMetadataChange?.(profilePhoto.id, 'person', e.target.value)}
                    placeholder="Person in photo"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Credit</Label>
                  <Input
                    value={profilePhoto.credit}
                                           onChange={(e) => onPhotoMetadataChange?.(profilePhoto.id, 'credit', e.target.value)}
                    placeholder="Photo credit/attribution"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Additional Photos Metadata */}
          {showAdditionalPhotos && additionalPhotos.length > 0 && (
            <div className="space-y-3">
              <Label className="text-xs font-medium">Additional Photos</Label>
              {additionalPhotos.map((photo) => (
                <div key={photo.id} className="space-y-3 p-3 border rounded-lg bg-muted/30 relative">
                  {/* Cross button for additional photos */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onPhotoDelete(photo.id)}
                    className="absolute top-2 right-2 h-6 w-6 p-0 z-10"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="flex items-center space-x-2">
                    <img
                      src={photo.url}
                      alt="Thumbnail"
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Title</Label>
                          <Input
                            value={photo.title}
                            onChange={(e) => onPhotoMetadataChange?.(photo.id, 'title', e.target.value)}
                            placeholder="Photo title"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Keywords</Label>
                          <Input
                            value={photo.keywords}
                            onChange={(e) => onPhotoMetadataChange?.(photo.id, 'keywords', e.target.value)}
                            placeholder="SEO keywords"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Person</Label>
                          <Input
                            value={photo.person}
                            onChange={(e) => onPhotoMetadataChange?.(photo.id, 'person', e.target.value)}
                            placeholder="Person in photo"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Credit</Label>
                          <Input
                            value={photo.credit}
                            onChange={(e) => onPhotoMetadataChange?.(photo.id, 'credit', e.target.value)}
                            placeholder="Photo credit/attribution"
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        

        {/* Upload Limit Warning */}
        {!canUploadMore && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Maximum {maxPhotos} photos reached</p>
            <p className="text-xs">Delete some photos to upload more</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

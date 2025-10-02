import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PlayCircle, Upload, Clock, Eye, Heart, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { uploadToCloudinary } from '@/lib/cloudinary-client';

interface Episode {
  title: string;
  description: string;
  duration: number;
  youtube_url: string;
  youtube_video_id: string;
  thumbnail_url: string;
  published_at: string;
  views: number;
  likes: number;
  comments: number;
  episode_number: number;
  tags: string[];
}

interface EpisodeManagerProps {
  episodes: Episode[];
  totalEpisodes: number;
  onEpisodeUpdate: (index: number, field: string, value: any) => void;
  onThumbnailUpload: (index: number, file: File) => void;
  readOnly?: boolean;
  handleEpisodeAction?: (index: number, status: 'approved' | 'rejected', reason?: string) => void;
  rejectionReasons?: { [key: string]: string };
  setRejectionReasons?: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  fieldStatuses?: any;
}

export function EpisodeManager({
  episodes,
  totalEpisodes,
  onEpisodeUpdate,
  onThumbnailUpload,
  readOnly = false,
  handleEpisodeAction,
  rejectionReasons,
  setRejectionReasons,
  fieldStatuses,
}: EpisodeManagerProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleFileUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file before upload
      if (!file.type.startsWith('image/')) {
        console.error('Please select a valid image file.');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        console.error('File size too large. Please select an image smaller than 10MB.');
        return;
      }

      try {
        // Upload to Cloudinary first
        const result = await uploadToCloudinary(file, 'episode-thumbnails');
        
        // Then call the parent function with the uploaded URL
        onEpisodeUpdate(index, 'thumbnail_url', result.secure_url);
      } catch (error: any) {
        console.error('Error uploading thumbnail:', error);
        // You might want to add toast notification here
      }
    }
  };

  // Use episode numbers from database if available, otherwise sort by published date
  const episodesWithNumbers = [...episodes].sort((a, b) => {
    // If both have episode numbers, sort by episode number
    if (a.episode_number && b.episode_number) {
      return a.episode_number - b.episode_number;
    }
    // If only one has episode number, prioritize it
    if (a.episode_number && !b.episode_number) return -1;
    if (!a.episode_number && b.episode_number) return 1;
    // If neither has episode number, sort by published date
    const dateA = new Date(a.published_at || 0);
    const dateB = new Date(b.published_at || 0);
    return dateA.getTime() - dateB.getTime();
  }).map((episode, index) => ({
    ...episode,
    episode_number: episode.episode_number || index + 1 // Use existing number or assign new one
  }));

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PlayCircle className="h-6 w-6 text-primary" />
          <span>Episodes ({totalEpisodes})</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Review and edit episode information fetched from YouTube. Showing {episodes.length} of {totalEpisodes} episodes.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {episodesWithNumbers.map((episode, index) => (
            <Card key={index} className="border border-border/50">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Episode Thumbnail */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Image
                        src={episode.thumbnail_url}
                        alt={episode.title}
                        width={300}
                        height={200}
                        className="w-full aspect-video rounded-lg object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 rounded px-2 py-1 text-xs text-white">
                        {formatDuration(episode.duration)}
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                          #{episode.episode_number}
                        </Badge>
                      </div>
                    </div>
                    
                    {!readOnly && (
                      <div className="space-y-2">
                        <Label htmlFor={`thumbnail-${index}`}>Custom Thumbnail</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id={`thumbnail-${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(index, e)}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`thumbnail-${index}`)?.click()}
                            className="w-full"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Custom
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{formatNumber(episode.views)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{formatNumber(episode.likes)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(episode.duration)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Episode Details */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`title-${index}`}>Episode Title</Label>
                      <Input
                        id={`title-${index}`}
                        value={episode.title}
                        onChange={(e) => onEpisodeUpdate(index, 'title', e.target.value)}
                        placeholder="Episode title"
                        readOnly={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`description-${index}`}>Description</Label>
                      <Textarea
                        id={`description-${index}`}
                        value={episode.description || ''}
                        onChange={(e) => onEpisodeUpdate(index, 'description', e.target.value)}
                        placeholder="Episode description"
                        readOnly={readOnly}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`episode-number-${index}`}>Episode Number</Label>
                        <Input
                          id={`episode-number-${index}`}
                          type="number"
                          value={episode.episode_number}
                          onChange={(e) => onEpisodeUpdate(index, 'episode_number', parseInt(e.target.value))}
                          placeholder="Episode number"
                          readOnly={readOnly}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`published-date-${index}`}>Published Date</Label>
                        <Input
                          id={`published-date-${index}`}
                          type="date"
                          value={episode.published_at ? new Date(episode.published_at).toISOString().split('T')[0] : ''}
                          onChange={(e) => onEpisodeUpdate(index, 'published_at', e.target.value)}
                          readOnly={readOnly}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`tags-${index}`}>Tags (comma separated)</Label>
                      <Input
                        id={`tags-${index}`}
                        value={episode.tags?.join(', ') || ''}
                        onChange={(e) => onEpisodeUpdate(index, 'tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                        placeholder="comedy, interview, technology"
                        readOnly={readOnly}
                      />
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <p>YouTube URL: <a href={episode.youtube_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{episode.youtube_url}</a></p>
                      <p>Published: {episode.published_at ? new Date(episode.published_at).toLocaleDateString() : 'Unknown'}</p>
                    </div>

                    {readOnly && handleEpisodeAction && rejectionReasons && setRejectionReasons && fieldStatuses && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleEpisodeAction(index, 'approved')}
                              disabled={fieldStatuses.episodes?.[`episode_${index}`]?.status === 'approved'}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setRejectionReasons({ ...rejectionReasons, [`episode_${index}`]: '' })}
                              disabled={fieldStatuses.episodes?.[`episode_${index}`]?.status === 'rejected'}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                          {rejectionReasons[`episode_${index}`] !== undefined && (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Enter rejection reason"
                                value={rejectionReasons[`episode_${index}`] || ''}
                                onChange={(e) =>
                                  setRejectionReasons({ ...rejectionReasons, [`episode_${index}`]: e.target.value })
                                }
                              />
                              <Button
                                onClick={() => handleEpisodeAction(index, 'rejected', rejectionReasons[`episode_${index}`])}
                                disabled={!rejectionReasons[`episode_${index}`]}
                              >
                                Submit Rejection
                              </Button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContributionById } from '@/app/actions/get-contribution-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Calendar, FileText, Globe, Users, Play, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const contribution = await getContributionById(id);
    
    return {
      title: `Preview Contribution: ${contribution?.data?.title || 'Untitled'} | PodDB Admin`,
      description: `Preview contribution submission for ${contribution?.target_table}`,
    };
  } catch (error) {
    return {
      title: 'Contribution Preview | PodDB Admin',
      description: 'Preview contribution submission',
    };
  }
}

export default async function ContributionPreviewPage({ params }: Props) {
  const { id } = await params;
  
  const contribution = await getContributionById(id);
  
  if (!contribution) {
    notFound();
  }

  const { data: formData, target_table, target_id, status, created_at, profiles } = contribution;

  return (
    <div className="min-h-screen bg-background">
      {/* Preview Banner */}
      <div className="bg-yellow-100 border-b border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                Contribution Preview Mode - Review submitted changes
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={status === 'pending' ? 'default' : status === 'approved' ? 'default' : 'destructive'}>
                {status.toUpperCase()}
              </Badge>
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                ID: {id}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Contribution Preview</h1>
              <p className="text-muted-foreground">
                Reviewing changes for {target_table} #{target_id}
              </p>
            </div>
          </div>
        </div>

        {/* Contribution Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Contribution Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Submitted By</label>
                <p className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{profiles?.display_name || 'Unknown User'}</span>
                </p>
                <p className="text-sm text-muted-foreground">{profiles?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Target</label>
                <p className="font-medium">{target_table} #{target_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                <p className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(created_at).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Data Preview */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <p className="font-medium">{formData?.title || <span className="text-muted-foreground italic">Not provided</span>}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{formData?.description || <span className="text-muted-foreground italic">Not provided</span>}</p>
                </div>
              </div>
              
              {formData?.categories && formData.categories.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Categories</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.categories.map((category: string, index: number) => (
                      <Badge key={index} variant="secondary">{category}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {formData?.languages && formData.languages.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Languages</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.languages.map((language: string, index: number) => (
                      <Badge key={index} variant="outline">{language}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Platform Links */}
          {formData?.platform_links && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Platform Links</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(formData.platform_links).map(([platform, url]) => (
                    <div key={platform}>
                      <label className="text-sm font-medium text-muted-foreground capitalize">{platform}</label>
                      <p className="text-sm">
                        {url ? (
                          <a href={url as string} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center space-x-1">
                            <LinkIcon className="h-3 w-3" />
                            <span>{url as string}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground italic">Not provided</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Links */}
          {formData?.social_links && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Social Links</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(formData.social_links).map(([platform, url]) => (
                    <div key={platform}>
                      <label className="text-sm font-medium text-muted-foreground capitalize">{platform}</label>
                      <p className="text-sm">
                        {url ? (
                          <a href={url as string} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center space-x-1">
                            <LinkIcon className="h-3 w-3" />
                            <span>{url as string}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground italic">Not provided</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Official Website */}
          {formData?.official_website && (
            <Card>
              <CardHeader>
                <CardTitle>Official Website</CardTitle>
              </CardHeader>
              <CardContent>
                <a href={formData.official_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center space-x-1">
                  <LinkIcon className="h-4 w-4" />
                  <span>{formData.official_website}</span>
                </a>
              </CardContent>
            </Card>
          )}

          {/* Episodes */}
          {formData?.episodes && formData.episodes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>Episodes ({formData.episodes.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {formData.episodes.map((episode: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium">{episode.title || `Episode ${index + 1}`}</h4>
                      {episode.description && (
                        <p className="text-sm text-muted-foreground mt-1">{episode.description}</p>
                      )}
                      {episode.youtube_url && (
                        <a href={episode.youtube_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                          Watch on YouTube
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Members */}
          {formData?.team_members && formData.team_members.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Team Members ({formData.team_members.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {formData.team_members.map((member: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium">{member.full_name || `Member ${index + 1}`}</h4>
                      {member.role && (
                        <p className="text-sm text-muted-foreground">Role: {member.role}</p>
                      )}
                      {member.bio && (
                        <p className="text-sm text-muted-foreground mt-1">{member.bio}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw Data (for debugging) */}
          <Card>
            <CardHeader>
              <CardTitle>Raw Form Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
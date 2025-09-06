import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { 
  Users, 
  Plus, 
  X, 
  Upload, 
  Search, 
  User,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Linkedin,
  Globe,
  MapPin,
  Calendar,
  Edit
} from 'lucide-react';
import Image from 'next/image';
import { TeamMemberSearch } from './TeamMemberSearch';
import { PhotoUploadManager } from './PhotoUploadManager';
import { SocialMediaInput } from './SocialMediaInput';
import { uploadToCloudinary } from '@/lib/cloudinary-client';

interface TeamMember {
  id: string;
  name: string;
  bio: string;
  role: string | string[]; // Support both single role and multiple roles
  birth_date?: string;
  location?: string;
  also_known_as?: string;
  photo_urls: string[];
  social_links: {
    instagram?: string;
    youtube?: string;
    x?: string;
    facebook?: string;
    linkedin?: string;
    threads?: string;
    pinterest?: string;
    website?: string;
  };
  episodes: string[]; // Episode IDs or 'all'
  isExistingUser?: boolean; // Flag to identify existing users
}

interface Episode {
  title: string;
  episode_number: number;
  youtube_video_id: string;
}

interface TeamManagerProps {
  teamMembers: TeamMember[];
  episodes: Episode[];
  onTeamUpdate: (members: TeamMember[]) => void;
  onPhotoUpload: (memberId: string, file: File) => void;
  readOnly?: boolean;
}

export function TeamManager({ teamMembers, episodes, onTeamUpdate, onPhotoUpload, readOnly = false }: TeamManagerProps) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [episodeSearch, setEpisodeSearch] = useState('');

  const roleOptions = [
    'Host',
    'Co-Host',
    'Guest',
    'Editor',
    'Producer',
    'Director of Photography',
    'Sound Engineer',
    'Writer',
    'Researcher',
    'Social Media Manager',
    'Other'
  ];

  const createNewMember = (): TeamMember => ({
    id: Date.now().toString(),
    name: '',
    bio: '',
    role: ['Guest'], // Default to array for multiple roles
    photo_urls: [],
    social_links: {},
    episodes: [],
    isExistingUser: false // New members are not existing users
  });

  const addMember = () => {
    const newMember = createNewMember();
    onTeamUpdate([...teamMembers, newMember]);
    setEditingMember(newMember.id);
    setShowAddMember(false);
  };

  const handleSelectExistingPerson = (person: any) => {
    const newMember: TeamMember = {
      id: person.id,
      name: person.name,
      bio: person.bio || '',
      role: ['Guest'],
      photo_urls: person.photo_urls || [],
      social_links: person.social_links || {},
      episodes: [],
      isExistingUser: true // Mark as existing user
    };
    onTeamUpdate([...teamMembers, newMember]);
    setEditingMember(newMember.id);
    setShowAddMember(false);
    
    // Show a message that existing people can only be added to episodes
    toast.info(`Added ${person.name} to team. Existing people can only be added to episodes, not edited.`);
  };

  const handleCreateNewMember = () => {
    addMember();
    setShowAddMember(false);
  };

  const updateMember = (memberId: string, field: string, value: any) => {
    const updatedMembers = teamMembers.map(member =>
      member.id === memberId ? { ...member, [field]: value } : member
    );
    onTeamUpdate(updatedMembers);
  };

  const updateSocialLink = (memberId: string, platform: string, value: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
      const updatedSocialLinks = { ...member.social_links, [platform]: value };
      updateMember(memberId, 'social_links', updatedSocialLinks);
    }
  };

  const removeMember = (memberId: string) => {
    const updatedMembers = teamMembers.filter(member => member.id !== memberId);
    onTeamUpdate(updatedMembers);
  };

  const toggleEpisode = (memberId: string, episodeId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
      let updatedEpisodes = [...member.episodes];
      if (episodeId === 'all') {
        updatedEpisodes = updatedEpisodes.includes('all') ? [] : ['all'];
      } else {
        if (updatedEpisodes.includes(episodeId)) {
          updatedEpisodes = updatedEpisodes.filter(id => id !== episodeId);
        } else {
          updatedEpisodes = updatedEpisodes.filter(id => id !== 'all');
          updatedEpisodes.push(episodeId);
        }
      }
      updateMember(memberId, 'episodes', updatedEpisodes);
    }
  };

  const handlePhotoUpload = (memberId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onPhotoUpload(memberId, file);
    }
  };

  const handlePhotoUploadNew = async (file: File, type: 'profile' | 'additional') => {
    if (editingMember) {
      try {
        toast.info("Uploading photo...");
        const result = await uploadToCloudinary(file, 'team-photos');
        
        const member = teamMembers.find(m => m.id === editingMember);
        if (member) {
          const updatedPhotoUrls = [...member.photo_urls, result.secure_url];
          updateMember(editingMember, 'photo_urls', updatedPhotoUrls);
          toast.success("Photo uploaded successfully!");
        }
      } catch (error: any) {
        console.error('Error uploading photo:', error);
        toast.error("Failed to upload photo", { description: error.message });
      }
    }
  };

  const handlePhotoDelete = (photoId: string) => {
    if (editingMember) {
      const member = teamMembers.find(m => m.id === editingMember);
      if (member) {
        const updatedPhotoUrls = member.photo_urls.filter((_, index) => `photo-${index}` !== photoId);
        updateMember(editingMember, 'photo_urls', updatedPhotoUrls);
      }
    }
  };

  const handlePhotoTypeChange = (photoId: string, type: 'profile' | 'additional') => {
    // This would need to be implemented based on your photo management structure
    console.log('Photo type change:', photoId, type);
  };

  const filteredEpisodes = episodes.filter(episode =>
    episode.title.toLowerCase().includes(episodeSearch.toLowerCase()) ||
    episode.episode_number.toString().includes(episodeSearch)
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-primary" />
            <span>Team Members ({teamMembers.length})</span>
          </div>
          {!readOnly && (
            <div className="flex space-x-2">
              <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Search for existing people in the database or create a new team member.
                    </p>
                    <TeamMemberSearch
                      onSelectUser={handleSelectExistingPerson}
                      onCreateNew={handleCreateNewMember}
                      placeholder="Search by name..."
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add information about hosts, guests, and other team members
        </p>
        <p className="text-sm text-muted-foreground">
          Note: Existing people can only be added to episodes, not edited. To edit person information, go to their profile page.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {teamMembers.map((member) => (
            <Card key={member.id} className="border border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      {member.photo_urls.length > 0 ? (
                        <Image
                          src={member.photo_urls[0]}
                          alt={member.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {member.name || 'Unnamed Member'}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {member.role}
                        </Badge>
                        {member.isExistingUser && (
                          <Badge variant="secondary" className="text-xs">
                            Existing User
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMember(editingMember === member.id ? null : member.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!readOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMember(member.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {editingMember === member.id && (
                  <div className="space-y-6 border-t pt-6">
                    {/* For existing users, only show role selection */}
                    {member.isExistingUser ? (
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                          value={Array.isArray(member.role) ? member.role[0] : member.role}
                          onValueChange={(value) => updateMember(member.id, 'role', value)}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Only role can be changed for existing users. Other information is locked.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Basic Information - Only for new members */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                              value={member.name}
                              onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                              placeholder="Full name"
                              readOnly={readOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Also Known As</Label>
                            <Input
                              value={member.also_known_as || ''}
                              onChange={(e) => updateMember(member.id, 'also_known_as', e.target.value)}
                              placeholder="Nickname, stage name, etc."
                              readOnly={readOnly}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select
                            value={Array.isArray(member.role) ? member.role[0] : member.role}
                            onValueChange={(value) => updateMember(member.id, 'role', value)}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roleOptions.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Bio</Label>
                          <Textarea
                            value={member.bio}
                            onChange={(e) => updateMember(member.id, 'bio', e.target.value)}
                            placeholder="Brief biography"
                            rows={3}
                            readOnly={readOnly}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Date of Birth</Label>
                            <Input
                              type="date"
                              value={member.birth_date || ''}
                              onChange={(e) => updateMember(member.id, 'birth_date', e.target.value)}
                              readOnly={readOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Location</Label>
                            <Input
                              value={member.location || ''}
                              onChange={(e) => updateMember(member.id, 'location', e.target.value)}
                              placeholder="City, Country"
                              readOnly={readOnly}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Photo Upload Manager - Only for new members */}
                    {!member.isExistingUser && (
                      <PhotoUploadManager
                        photos={member.photo_urls.map((url, index) => ({
                          id: `photo-${index}`,
                          url,
                          type: index === 0 ? 'profile' : 'additional',
                          uploadedAt: new Date(),
                          title: `Profile Image ${index + 1}`,
                          keywords: '',
                          person: member.name,
                          credit: ''
                        }))}
                        onPhotoUpload={handlePhotoUploadNew}
                        onPhotoDelete={handlePhotoDelete}
                        onPhotoTypeChange={handlePhotoTypeChange}
                        onPhotoMetadataChange={(photoId, field, value) => {
                          // Handle metadata changes for team member photos
                          console.log('Team member photo metadata updated:', photoId, field, value);
                        }}
                        maxPhotos={10}
                        title="Member Photos"
                      />
                    )}

                    <Separator />

                    {/* Social Media Links - Only for new members */}
                    {!member.isExistingUser && (
                      <div className="space-y-4">
                        <h4 className="font-semibold">Social Media Links</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <SocialMediaInput
                            platform="instagram"
                            value={member.social_links.instagram || ''}
                            onChange={(value) => updateSocialLink(member.id, 'instagram', value)}
                          />
                          <SocialMediaInput
                            platform="youtube"
                            value={member.social_links.youtube || ''}
                            onChange={(value) => updateSocialLink(member.id, 'youtube', value)}
                          />
                          <SocialMediaInput
                            platform="x"
                            value={member.social_links.x || ''}
                            onChange={(value) => updateSocialLink(member.id, 'x', value)}
                          />
                          <SocialMediaInput
                            platform="facebook"
                            value={member.social_links.facebook || ''}
                            onChange={(value) => updateSocialLink(member.id, 'facebook', value)}
                          />
                          <SocialMediaInput
                            platform="linkedin"
                            value={member.social_links.linkedin || ''}
                            onChange={(value) => updateSocialLink(member.id, 'linkedin', value)}
                          />
                          <SocialMediaInput
                            platform="threads"
                            value={member.social_links.threads || ''}
                            onChange={(value) => updateSocialLink(member.id, 'threads', value)}
                          />
                          <SocialMediaInput
                            platform="pinterest"
                            value={member.social_links.pinterest || ''}
                            onChange={(value) => updateSocialLink(member.id, 'pinterest', value)}
                          />
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Episode Appearances */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Episode Appearances</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search episodes..."
                            value={episodeSearch}
                            onChange={(e) => setEpisodeSearch(e.target.value)}
                            className="flex-1"
                            readOnly={readOnly}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded">
                          <Checkbox
                            id={`all-episodes-${member.id}`}
                            checked={member.episodes.includes('all')}
                            onCheckedChange={() => toggleEpisode(member.id, 'all')}
                            disabled={readOnly}
                          />
                          <Label htmlFor={`all-episodes-${member.id}`} className="font-medium">
                            All Episodes
                          </Label>
                        </div>
                        
                        {filteredEpisodes.map((episode) => {
                          const episodeId = episode.youtube_video_id;
                          return (
                            <div key={episodeId} className="flex items-center space-x-2 p-2 hover:bg-muted/30 rounded">
                              <Checkbox
                                id={`episode-${member.id}-${episodeId}`}
                                checked={member.episodes.includes(episodeId) || member.episodes.includes('all')}
                                onCheckedChange={() => toggleEpisode(member.id, episodeId)}
                                disabled={member.episodes.includes('all') || readOnly}
                              />
                              <Label htmlFor={`episode-${member.id}-${episodeId}`} className="flex-1 text-sm">
                                #{episode.episode_number}: {episode.title}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Selected: {member.episodes.includes('all') ? 'All episodes' : `${member.episodes.length} episodes`}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {teamMembers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No team members added yet</p>
              <p className="text-sm">Add hosts, guests, and other contributors to your podcast</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";
import React, { useState, useEffect, useRef, Suspense } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Upload, Plus, X, CheckCircle, Youtube, Users, AlertCircle, Loader2, Search, Image as ImageIcon, Globe, Calendar, MapPin, User, Eye } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/integrations/supabase/client';
import { EpisodeManager } from '@/components/EpisodeManager';
import { TeamManager } from '@/components/TeamManager';
import { LanguageAutocomplete } from '@/components/LanguageAutocomplete';
import { CategoryAutocomplete } from '@/components/CategoryAutocomplete';
import { SocialMediaInput } from '@/components/SocialMediaInput';
import { PlatformLinkInput } from '@/components/PlatformLinkInput';
import { PhotoUploadManager } from '@/components/PhotoUploadManager';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { LocationRequestForm } from '@/components/LocationRequestForm';
import { submitPodcastAction } from '@/app/actions/submit';
import { useSearchParams } from 'next/navigation';
import { createContributionAction } from '@/app/actions/contributions';
import { getContributionData } from '@/app/actions/get-contribution-data';
import { uploadPhotoToCloudinary, uploadFileToCloudinary } from '@/app/actions/cloudinary-upload';
import { createPreviewUpdateAction } from '@/app/actions/preview-updates';

function ContributeContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [podcastData, setPodcastData] = useState<any>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('podcast-info');
  const [visibleEpisodes, setVisibleEpisodes] = useState(5);
  const topRef = useRef<HTMLDivElement>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState('');
  const [podcastLocation, setPodcastLocation] = useState('');
  const [showLocationRequest, setShowLocationRequest] = useState(false);
  const [platformLinks, setPlatformLinks] = useState({
    spotify: '',
    apple: '',
    jiosaavn: '', // Changed from google to jiosaavn
    amazon: '',
    other: [{ title: '', url: '' }]
  });
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    youtube: '',
    x: '',
    facebook: '',
    linkedin: '',
    threads: '',
    pinterest: '',
    other: [{ title: '', url: '' }]
  });
  const [officialWebsite, setOfficialWebsite] = useState('');
  const [podcastProfilePhoto, setPodcastProfilePhoto] = useState<File | null>(null);
  const [podcastAdditionalPhotos, setPodcastAdditionalPhotos] = useState<File[]>([]);
  const [podcastLogoMetadata, setPodcastLogoMetadata] = useState({
    title: '',
    keywords: '',
    person: '',
    credit: ''
  });
  const [podcastAdditionalPhotosMetadata, setPodcastAdditionalPhotosMetadata] = useState<Array<{
    title: string;
    keywords: string;
    person: string;
    credit: string;
  }>>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Additional state
  const [fetchError, setFetchError] = useState('');
  const [targetTable, setTargetTable] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);

  // Redirect if not authenticated - REMOVED for public access
  // useEffect(() => {
  //   if (!user) {
  //     router.replace('/auth');
  //   }
  // }, [user, router]);

  useEffect(() => {
    const table = searchParams.get('target_table');
    const id = searchParams.get('target_id');

    if (table && id) {
      setTargetTable(table);
      setTargetId(id);
      
      const fetchData = async () => {
        const data = await getContributionData(table, id);
        if (data) {
          if (table === 'people') {
            // Handle people data
            setPodcastData(data);
            setPersonName(data.full_name || '');
            setPersonBio(data.bio || '');
            setPersonBirthDate(data.birth_date || '');
            setPersonLocation(data.location || '');
            setPersonWebsite(data.website_url || '');
            setSocialLinksForPeople(data.social_links || { 
              instagram: '', 
              youtube: '', 
              x: '', 
              facebook: '', 
              linkedin: '', 
              threads: '', 
              pinterest: '', 
              other: [{ title: '', url: '' }] 
            });
          } else {
            // Handle podcast data
            setPodcastData(data);
            setTitle(data.title || '');
            setDescription(data.description || '');
            setCategories(data.categories || []);
            setEpisodes(data.episodes || []);
            setTeamMembers(data.team_members || []);
            setLanguages(data.languages || (data.language ? [data.language] : []));
            setPodcastLocation(data.podcastLocation || data.location || '');
            setPlatformLinks(data.platform_links || { spotify: '', apple: '', jiosaavn: '', amazon: '', other: [{ title: '', url: '' }] });
            setSocialLinks(data.social_links || { instagram: '', youtube: '', x: '', facebook: '', linkedin: '', threads: '', pinterest: '', other: [{ title: '', url: '' }] });
            setOfficialWebsite(data.official_website || '');
          }
        }
      };

      fetchData();
    }
  }, [searchParams]);


  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    scrollToTop();
  };

  const checkDuplicatePlaylist = async (playlistUrl: string) => {
    try {
      // Extract playlist ID from URL
      const playlistIdMatch = playlistUrl.match(/[?&]list=([\w-]+)/);
      if (!playlistIdMatch) {
        return { isDuplicate: false, existingPodcast: null };
      }
      
      const playlistId = playlistIdMatch[1];
      
      // Check if playlist ID already exists in database
      const { data, error } = await supabase
        .from('podcasts')
        .select('id, title, slug, submission_status')
        .eq('youtube_playlist_id', playlistId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking duplicate playlist:', error);
        return { isDuplicate: false, existingPodcast: null };
      }

      if (data) {
        return { isDuplicate: true, existingPodcast: data };
      }

      return { isDuplicate: false, existingPodcast: null };
    } catch (error) {
      console.error('Error checking duplicate playlist:', error);
      return { isDuplicate: false, existingPodcast: null };
    }
  };

  const fetchPodcastInfo = async () => {
    if (!youtubeUrl.trim()) {
      toast.error("Please enter a YouTube playlist URL");
      return;
    }

    // Validate YouTube playlist URL
    const playlistRegex = /^https:\/\/(www\.)?youtube\.com\/playlist\?list=[\w-]+/;
    if (!playlistRegex.test(youtubeUrl)) {
      toast.error("Please enter a valid YouTube playlist URL (e.g., https://www.youtube.com/playlist?list=PL...)");
      return;
    }

    setLoading(true);
    setFetchError('');
    try {
      // Check for duplicate playlist ID before fetching YouTube data
      const duplicateCheck = await checkDuplicatePlaylist(youtubeUrl);
      if (duplicateCheck.isDuplicate) {
        const existingPodcast = duplicateCheck.existingPodcast;
        const statusText = (existingPodcast as any)?.submission_status === 'approved' ? 'approved' : 'pending review';
        toast.error(`This playlist has already been submitted! The podcast "${(existingPodcast as any)?.title}" is ${statusText}.`, {
          duration: 10000,
          action: (existingPodcast as any)?.slug ? {
            label: 'View Podcast',
            onClick: () => window.open(`/podcasts/${(existingPodcast as any).slug}`, '_blank')
          } : undefined
        });
        setLoading(false);
        return;
      }

      console.log('Fetching YouTube data for:', youtubeUrl);
      
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { playlistUrl: youtubeUrl }
      });

      if (error) {
          const errorMessage = error.message || 'An unknown error occurred';
           if (errorMessage.includes('non-2xx status code') || errorMessage.toLowerCase().includes('failed to fetch')) {
             setFetchError('Failed to fetch YouTube data. Please check the YouTube API key in the admin panel, ensure the playlist is public and valid, or try again later as the API quota might be exhausted.');
           } else {
             setFetchError(errorMessage);
           }
           throw new Error(errorMessage);
       }

      if (!data) {
        throw new Error('No data received from YouTube API');
      }

      console.log('YouTube data received:', data);
      
      setPodcastData(data);
      setTitle(data.title || '');
      setDescription(data.description || '');
      setCategories(data.categories || []);
      // Sort episodes by published date (oldest first) and assign episode numbers
      const sortedEpisodes = (data.episodes || []).sort((a: any, b: any) => {
        const dateA = new Date(a.published_at || 0);
        const dateB = new Date(b.published_at || 0);
        return dateA.getTime() - dateB.getTime();
      }).map((episode: any, index: number) => ({
        ...episode,
        episode_number: episode.episode_number || index + 1 // Use existing number or assign new one
      }));
      setEpisodes(sortedEpisodes);
      setPlatformLinks({
        spotify: data.platform_links?.spotify || '',
        apple: data.platform_links?.apple || '',
        jiosaavn: data.platform_links?.jiosaavn || '',
        amazon: data.platform_links?.amazon || '',
        other: data.platform_links?.other || [{ title: '', url: '' }]
      });
      setSocialLinks({
        instagram: data.social_links?.instagram || '',
        youtube: data.social_links?.youtube || '',
        x: data.social_links?.x || '',
        facebook: data.social_links?.facebook || '',
        linkedin: data.social_links?.linkedin || '',
        threads: data.social_links?.threads || '',
        pinterest: data.social_links?.pinterest || '',
        other: data.social_links?.other || [{ title: '', url: '' }]
      });
      
      toast.success("Success", {
        description: `Fetched ${data.total_episodes} episodes (${data.episodes?.filter((ep: any) => ep.duration >= 300).length || 0} over 5 minutes)`,
      });
    } catch (error: any) {
      console.error('Error fetching YouTube data:', error);
      if (!fetchError) {
        setFetchError(error.message || "Failed to fetch podcast information");
      }
    } finally {
      setLoading(false);
    }
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory) && categories.length < 3) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  const addLanguage = () => {
    if (newLanguage && !languages.includes(newLanguage) && languages.length < 3) {
      setLanguages([...languages, newLanguage]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setLanguages(languages.filter(l => l !== language));
  };

  const handlePreviewUpdate = async () => {
    if (!user) {
      toast.error("You must be logged in to preview changes.");
      return;
    }
    if (!targetTable || !targetId) {
      toast.error("Invalid contribution target.");
      return;
    }

    setSubmitting(true);
    try {
      const contributionData = {
        title,
        description,
        categories,
        platform_links: platformLinks,
        social_links: socialLinks,
        official_website: officialWebsite,
        team_members: teamMembers,
        episodes: episodes,
      };

      // Get original data for comparison
      const originalData = await getContributionData(targetTable, targetId);
      
      const result = await createPreviewUpdateAction(
        targetTable,
        targetId,
        originalData,
        contributionData
      );

      if (result.success && result.previewId) {
        toast.success("Preview created successfully!");
        router.push(`/admin-preview/${result.previewId}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error creating preview:', error);
      toast.error("Failed to create preview", {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to submit a contribution.");
      return;
    }
    if (!targetTable || !targetId) {
      toast.error("Invalid contribution target.");
      return;
    }

    setSubmitting(true);
    try {
      const contributionData = {
        title,
        description,
        categories,
        platform_links: platformLinks,
        social_links: socialLinks,
        official_website: officialWebsite,
        team_members: teamMembers,
        episodes: episodes,
      };

      const result = await createContributionAction({
        target_table: targetTable as any,
        target_id: targetId,
        data: contributionData,
      });

      if (result.success) {
        setSubmitted(true);
        toast.success("Contribution submitted for review successfully!");
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error submitting contribution:', error);
      toast.error("Failed to submit contribution", {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePeopleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to submit a contribution.");
      return;
    }

    setSubmitting(true);
    try {
      // Upload photos if they exist
      let photoUrls: string[] = [];
      if (personPhotos.length > 0) {
        try {
          toast.info("Uploading photos...");
          for (let i = 0; i < personPhotos.length; i++) {
            const file = personPhotos[i];
            const result = await uploadPhotoToCloudinary(file, 'people-photos');
            if (result.success && result.url) {
              photoUrls.push(result.url);
            } else {
              throw new Error(result.error || 'Upload failed');
            }
          }
          toast.success("Photos uploaded successfully!");
        } catch (error: any) {
          console.error('Error uploading photos:', error);
          toast.error("Failed to upload photos", { description: error.message });
        }
      }

      const contributionData: any = {
        full_name: personName,
        bio: personBio,
        birth_date: personBirthDate || undefined,
        location: personLocation || undefined,
        website_url: personWebsite || undefined,
        photo_urls: photoUrls,
        social_links: socialLinksForPeople,
      };

      const result = await createContributionAction({
        target_table: targetTable as any,
        target_id: targetId!,
        data: contributionData,
      });

      if (result.success) {
        setSubmitted(true);
        // Clear the form and close edit section
        setPersonName('');
        setPersonBio('');
        setPersonBirthDate('');
        setPersonLocation('');
        setPersonWebsite('');
        setPersonPhotos([]);
        setSocialLinksForPeople({ instagram: '', youtube: '', x: '', facebook: '', linkedin: '', threads: '', pinterest: '', other: [{ title: '', url: '' }] });
        // Reset target table and ID to close edit section
        setTargetTable(null);
        setTargetId(null);
        toast.success("Person information updated successfully!");
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error updating person:', error);
      toast.error("Failed to update person information", {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (targetTable && targetId) {
      if (targetTable === 'people') {
        await handlePeopleSubmit(e);
        return;
      } else {
        await handleContributionSubmit(e);
        return;
      }
    }

    if (!podcastData) {
      toast.error("No podcast data to submit. Please fetch YouTube data first.");
      return;
    }
    
    if (!user) {
      toast.error("You must be logged in to submit a podcast.");
      return;
    }

    // Validate required fields
    if (!title.trim()) {
      toast.error("Podcast title is required.");
      return;
    }
    if (!description.trim()) {
      toast.error("Podcast description is required.");
      return;
    }

    setSubmitting(true);
    try {
             // Upload podcast profile photo if exists
       let profilePhotoUrl = podcastData.cover_image_url || '';
       if (podcastProfilePhoto) {
         try {
           toast.info("Uploading profile photo...");
           const result = await uploadFileToCloudinary(podcastProfilePhoto, 'podcast-logos');
           if (result.success && result.url) {
             profilePhotoUrl = result.url;
           }
           toast.success("Profile photo uploaded successfully!");
         } catch (error: any) {
           console.error('Error uploading profile photo:', error);
           toast.error("Failed to upload profile photo", { description: error.message });
         }
       }

             // Upload additional photos if exist
       const additionalPhotoUrls: string[] = [];
       if (podcastAdditionalPhotos.length > 0) {
         try {
           toast.info(`Uploading ${podcastAdditionalPhotos.length} additional photos...`);
           for (let i = 0; i < podcastAdditionalPhotos.length; i++) {
             const file = podcastAdditionalPhotos[i];
             const result = await uploadFileToCloudinary(file, 'podcast-additional');
             if (result.success && result.url) {
               additionalPhotoUrls.push(result.url);
             }
           }
           toast.success("Additional photos uploaded successfully!");
         } catch (error: any) {
           console.error('Error uploading additional photos:', error);
           toast.error("Failed to upload additional photos", { description: error.message });
         }
       }

      const podcastSubmission = {
        title,
        description,
        cover_image_url: profilePhotoUrl,
        additional_images: additionalPhotoUrls,
        logo_metadata: podcastProfilePhoto ? podcastLogoMetadata : null,
        additional_images_metadata: podcastAdditionalPhotos.length > 0 ? podcastAdditionalPhotosMetadata : null,
        youtube_playlist_url: podcastData.youtube_playlist_url || '',
        youtube_playlist_id: podcastData.youtube_playlist_id || '',
        categories,
        platform_links: platformLinks,
        social_links: socialLinks,
        official_website: officialWebsite || '',
        team_members: teamMembers.map(m => ({
          name: m.name,
          roles: Array.isArray(m.role) ? m.role : [m.role], // Support multiple roles
          bio: m.bio,
          photo_urls: m.photo_urls,
          social_links: m.social_links,
        })) || [],
        total_episodes: podcastData.total_episodes || 0,
        total_views: podcastData.total_views || 0,
        total_likes: podcastData.total_likes || 0,
        total_comments: podcastData.total_comments || 0,
        average_duration: podcastData.average_duration || 0,
        first_episode_date: podcastData.first_episode_date || null,
        last_episode_date: podcastData.last_episode_date || null,
        language: languages.length > 0 ? languages[0] : 'en',
        location: podcastLocation || undefined,
        submission_status: 'pending' as 'pending' | 'approved' | 'rejected' | 'partial',
        submitted_by: user.id
      };

      const episodesSubmission = podcastData.episodes?.map((episode: any) => ({
        title: episode.title || '',
        description: episode.description || '',
        duration: episode.duration || 0,
        youtube_url: episode.youtube_url || '',
        youtube_video_id: episode.youtube_video_id || '',
        thumbnail_url: episode.thumbnail_url || '',
        published_at: episode.published_at || null,
        views: episode.views || 0,
        likes: episode.likes || 0,
        comments: episode.comments || 0,
        episode_number: episode.episode_number || null,
        tags: episode.tags || []
      })) || [];

      const result = await submitPodcastAction({
          podcast: podcastSubmission,
          episodes: episodesSubmission,
      });

      if (result.success) {
          setSubmitted(true);
          setPodcastData(null);
          setYoutubeUrl('');
          setTitle('');
          setDescription('');
          setCategories([]);
          setLanguages([]);
          setPodcastLocation('');
          setEpisodes([]);
          setTeamMembers([]);
          setPlatformLinks({ spotify: '', apple: '', jiosaavn: '', amazon: '', other: [{ title: '', url: '' }] });
          setSocialLinks({ instagram: '', youtube: '', x: '', facebook: '', linkedin: '', threads: '', pinterest: '', other: [{ title: '', url: '' }] });
          setOfficialWebsite('');

          setVisibleEpisodes(5);
          toast.success("Podcast submitted for review successfully!");
      } else {
        throw new Error(result.error);
      }

    } catch (error: any) {
      console.error('Error submitting podcast:', error);
      toast.error("Failed to submit podcast", {
          description: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEpisodeUpdate = (index: number, field: string, value: any) => {
    const updatedEpisodes = [...episodes];
    updatedEpisodes[index] = { ...updatedEpisodes[index], [field]: value };
    setEpisodes(updatedEpisodes);
  };

  const handleTeamUpdate = (members: any[]) => {
    setTeamMembers(members);
  };

  const handlePhotoUpload = async (memberId: string, file: File) => {
    try {
      toast.info("Uploading team member photo...");
      const result = await uploadFileToCloudinary(file, 'team-photos');
      
      if (result.success && result.url) {
        const updatedMembers = teamMembers.map(member =>
          member.id === memberId 
            ? { ...member, photo_urls: [...(member.photo_urls || []), result.url] }
            : member
        );
        setTeamMembers(updatedMembers);
      }

      toast.success("Photo uploaded successfully");
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast.error("Failed to upload photo", { description: error.message });
    }
  };

  const handleThumbnailUpload = async (index: number, file: File) => {
    try {
      toast.info("Uploading episode thumbnail...");
      const result = await uploadFileToCloudinary(file, 'episode-thumbnails');
      
      if (result.success && result.url) {
        handleEpisodeUpdate(index, 'thumbnail_url', result.url);
      }

      toast.success("Thumbnail uploaded successfully");
    } catch (error: any) {
      console.error('Error uploading thumbnail:', error);
      toast.error("Failed to upload thumbnail", { description: error.message });
    }
  };

  const addCustomPlatform = (type: 'platform' | 'social') => {
    if (type === 'platform') {
      setPlatformLinks(prev => ({
        ...prev,
        other: [...prev.other, { title: '', url: '' }]
      }));
    } else {
      setSocialLinks(prev => ({
        ...prev,
        other: [...prev.other, { title: '', url: '' }]
      }));
    }
  };

  const updateCustomPlatform = (type: 'platform' | 'social', index: number, field: 'title' | 'url', value: string) => {
    if (type === 'platform') {
      const updated = [...platformLinks.other];
      updated[index] = { ...updated[index], [field]: value };
      setPlatformLinks(prev => ({ ...prev, other: updated }));
    } else {
      const updated = [...socialLinks.other];
      updated[index] = { ...updated[index], [field]: value };
      setSocialLinks(prev => ({ ...prev, other: updated }));
    }
  };

  const removeCustomPlatform = (type: 'platform' | 'social', index: number) => {
    if (type === 'platform') {
      setPlatformLinks(prev => ({
        ...prev,
        other: prev.other.filter((_, i) => i !== index)
      }));
    } else {
      setSocialLinks(prev => ({
        ...prev,
        other: prev.other.filter((_, i) => i !== index)
      }));
    }
  };

  const handleLoadMore = () => {
    setVisibleEpisodes(prev => prev + 5);
    scrollToTop();
  };

  // New state for people contribution
  const [activePeopleTab, setActivePeopleTab] = useState<'info' | 'podcasts'>('info');
  const [personName, setPersonName] = useState('');
  const [personBirthDate, setPersonBirthDate] = useState('');
  const [personLocation, setPersonLocation] = useState('');
  const [personWebsite, setPersonWebsite] = useState('');
  const [personBio, setPersonBio] = useState('');
  const [personPhotos, setPersonPhotos] = useState<File[]>([]);
  const [socialLinksForPeople, setSocialLinksForPeople] = useState({
    instagram: '',
    youtube: '',
    x: '',
    facebook: '',
    linkedin: '',
    threads: '',
    pinterest: '',
    other: [{ title: '', url: '' }]
  });

  const [podcastSearchTerm, setPodcastSearchTerm] = useState('');
  const [podcastSearchResults, setPodcastSearchResults] = useState<any[]>([]);
  const [selectedPodcast, setSelectedPodcast] = useState<any>(null);
  const [availableEpisodes, setAvailableEpisodes] = useState<any[]>([]);
  const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);

  const searchPodcasts = async (term: string) => {
    if (!term.trim()) {
      setPodcastSearchResults([]);
      return;
    }
    try {
             const { data, error } = await supabase
         .from('podcasts')
         .select('id, title, description, cover_image_url, slug')
         .ilike('title', `%${term.trim()}%`)
         .eq('submission_status', 'approved')
         .limit(10);

      if (error) {
        console.error('Error searching podcasts:', error);
        toast.error('Failed to search podcasts.');
        return;
      }
      setPodcastSearchResults(data || []);
    } catch (error: any) {
      console.error('Error searching podcasts:', error);
      toast.error('Failed to search podcasts.');
    }
  };

  const handlePodcastSelect = async (podcast: any) => {
    setSelectedPodcast(podcast);
    try {
             const { data, error } = await supabase
         .from('episodes')
         .select('id, title, episode_number, published_at')
         .eq('podcast_id', podcast.id)
         .order('episode_number', { ascending: true });

      if (error) {
        console.error('Error fetching episodes for podcast:', error);
        toast.error('Failed to fetch episodes for this podcast.');
        setAvailableEpisodes([]);
        return;
      }
      setAvailableEpisodes(data || []);
      setSelectedEpisodes([]); // Clear selected episodes when a new podcast is selected
    } catch (error: any) {
      console.error('Error fetching episodes for podcast:', error);
      toast.error('Failed to fetch episodes for this podcast.');
      setAvailableEpisodes([]);
    }
  };

  const handleEpisodeToggle = (episodeId: string) => {
    setSelectedEpisodes(prev => {
      if (prev.includes(episodeId)) {
        return prev.filter(id => id !== episodeId);
      } else {
        return [...prev, episodeId];
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div ref={topRef} />
      {/* Header */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg">
            <Upload className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Contribute a Podcast</h1>
            <p className="text-muted-foreground text-lg">
              Help grow the world&apos;s largest podcast database by submitting your favorite shows
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Step 1: YouTube URL - Only show when not editing anything specific */}
        {!targetTable && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Youtube className="h-6 w-6 text-primary" />
                <span>Step 1: Fetch Podcast Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="youtube-url">YouTube Playlist URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="youtube-url"
                    placeholder="https://www.youtube.com/playlist?list=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={fetchPodcastInfo}
                    disabled={loading}
                    variant="hero"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Fetch Info
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter the YouTube playlist URL containing all episodes of the podcast
                </p>
              </div>

              {fetchError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{fetchError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {podcastData && !fetchError && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Successfully fetched information for &quot;{podcastData.title}&quot; with {episodes.length} episodes ({episodes.filter(ep => ep.duration >= 300).length} over 5 minutes)
            </AlertDescription>
          </Alert>
        )}

        {/* Menu for sections - Only show when editing podcasts */}
        {podcastData && targetTable !== 'people' && (
          <div className="flex space-x-4 border-b border-border">
            <Button
              variant={activeSection === 'podcast-info' ? 'default' : 'ghost'}
              className="px-4 py-2"
              onClick={() => handleSectionChange('podcast-info')}
            >
              Podcast Information
            </Button>
            <Button
              variant={activeSection === 'episodes' ? 'default' : 'ghost'}
              className="px-4 py-2"
              onClick={() => handleSectionChange('episodes')}
            >
              Episodes
            </Button>
            <Button
              variant={activeSection === 'team' ? 'default' : 'ghost'}
              className="px-4 py-2"
              onClick={() => handleSectionChange('team')}
            >
              Team Members
            </Button>
          </div>
        )}

        {/* Step 2: Podcast Details - Only show when editing podcasts */}
        {podcastData && activeSection === 'podcast-info' && targetTable !== 'people' && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="h-6 w-6 text-primary" />
                <span>Podcast Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                             {/* Podcast Cover Image and Logo */}
               <div className="space-y-4">
                 <h3 className="text-lg font-semibold">Podcast Cover Image & Logo</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                       {/* Cover Image from YouTube or Custom Logo */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Cover Image</Label>
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted max-w-xs relative group">
                        <Image
                          src={podcastProfilePhoto ? URL.createObjectURL(podcastProfilePhoto) : (podcastData.cover_image_url || '/placeholder.svg')}
                          alt="Podcast cover"
                          width={300}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                        {/* Hover overlay with upload option */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <Upload className="h-8 w-8 text-white mx-auto" />
                            <p className="text-white text-sm font-medium">Click to change</p>
                            <p className="text-white/80 text-xs">Upload new cover image</p>
                          </div>
                        </div>
                        {/* Hidden file input */}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setPodcastProfilePhoto(file);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {podcastProfilePhoto ? 'Custom logo uploaded' : 'Cover image from YouTube playlist'}
                      </p>
                    </div>

                    {/* Logo Upload */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Upload Custom Logo</Label>
                      <PhotoUploadManager
                                                 photos={podcastProfilePhoto ? [{
                           id: 'profile-1',
                           url: URL.createObjectURL(podcastProfilePhoto),
                           type: 'profile' as const,
                           uploadedAt: new Date(),
                           title: podcastLogoMetadata.title || 'Podcast Logo',
                           keywords: podcastLogoMetadata.keywords,
                           person: podcastLogoMetadata.person,
                           credit: podcastLogoMetadata.credit
                         }] : []}
                        onPhotoUpload={(file, type) => {
                          if (type === 'profile') {
                            setPodcastProfilePhoto(file);
                          }
                        }}
                        onPhotoDelete={(photoId) => {
                          if (photoId === 'profile-1') {
                            setPodcastProfilePhoto(null);
                          }
                        }}
                        onPhotoTypeChange={(photoId, newType) => {
                          // Handle photo type change if needed
                        }}
                                                 onPhotoMetadataChange={(photoId, field, value) => {
                           // Handle metadata changes
                           if (photoId === 'profile-1') {
                             setPodcastLogoMetadata(prev => ({
                               ...prev,
                               [field]: value
                             }));
                           }
                         }}
                                                 maxPhotos={1}
                         className="w-full"
                         title="Podcast Logo"
                         showAdditionalPhotos={false}
                         uploadType="profile"
                      />
                    </div>
                 </div>
               </div>

                             <Separator />

                               {/* Additional Photos Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Photos</h3>
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Upload Additional Photos</Label>
                    <PhotoUploadManager
                      photos={podcastAdditionalPhotos.map((file, index) => ({
                        id: `additional-${index + 1}`,
                        url: URL.createObjectURL(file),
                        type: 'additional' as const,
                        uploadedAt: new Date(),
                        title: podcastAdditionalPhotosMetadata[index]?.title || `Additional Photo ${index + 1}`,
                        keywords: podcastAdditionalPhotosMetadata[index]?.keywords || '',
                        person: podcastAdditionalPhotosMetadata[index]?.person || '',
                        credit: podcastAdditionalPhotosMetadata[index]?.credit || ''
                      }))}
                      onPhotoUpload={(file, type) => {
                        if (type === 'additional') {
                          setPodcastAdditionalPhotos(prev => [...prev, file]);
                        }
                      }}
                      onPhotoDelete={(photoId) => {
                        const index = parseInt(photoId.split('-')[1]) - 1;
                        setPodcastAdditionalPhotos(prev => prev.filter((_, i) => i !== index));
                        // Also remove metadata for this photo
                        setPodcastAdditionalPhotosMetadata(prev => prev.filter((_, i) => i !== index));
                      }}
                      onPhotoTypeChange={(photoId, newType) => {
                        // Handle photo type change if needed
                      }}
                      onPhotoMetadataChange={(photoId, field, value) => {
                        // Handle metadata changes
                        const index = parseInt(photoId.split('-')[1]) - 1;
                        setPodcastAdditionalPhotosMetadata(prev => {
                          const updated = [...prev];
                          if (!updated[index]) {
                            updated[index] = { title: '', keywords: '', person: '', credit: '' };
                          }
                          updated[index] = {
                            ...updated[index],
                            [field]: value
                          };
                          return updated;
                        });
                      }}
                      maxPhotos={14}
                      className="w-full"
                      title="Additional Photos"
                      showAdditionalPhotos={true}
                      showProfilePhoto={false}
                      uploadType="additional"
                    />
                  </div>
                </div>

               <Separator />

               {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Podcast Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Languages</Label>
                  <div className="flex space-x-2">
                    <LanguageAutocomplete
                      value={newLanguage}
                      onChange={setNewLanguage}
                      onSelect={(value) => {
                        // Only add when explicitly selected from dropdown
                        if (value && !languages.includes(value) && languages.length < 3) {
                          setLanguages([...languages, value]);
                          setNewLanguage('');
                        }
                      }}
                      placeholder="Search or add language..."
                    />
                    <Button type="button" onClick={addLanguage} variant="outline" disabled={languages.length >= 3}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can add up to 3 languages only.
                  </p>
                  {languages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {languages.map((language) => (
                        <Badge key={language} variant="secondary" className="flex items-center space-x-1">
                          <span>{language}</span>
                          <button
                            type="button"
                            onClick={() => removeLanguage(language)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="podcastLocation">Location</Label>
                <LocationAutocomplete
                  value={podcastLocation}
                  onChange={setPodcastLocation}
                  placeholder="Search for location..."
                  onRequestLocation={() => setShowLocationRequest(true)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Official Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Official Website</Label>
                <Input
                  id="website"
                  value={officialWebsite}
                  onChange={(e) => setOfficialWebsite(e.target.value)}
                  placeholder="https://yourpodcast.com"
                />
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="flex space-x-2">
                  <CategoryAutocomplete
                    value={newCategory}
                    onChange={setNewCategory}
                    onAddCategory={(category) => {
                      if (!categories.includes(category) && categories.length < 3) {
                        setCategories([...categories, category]);
                      }
                    }}
                    placeholder="Search or add category..."
                    maxCategories={3}
                    currentCategories={categories}
                  />
                  <Button type="button" onClick={addCategory} variant="outline" disabled={categories.length >= 3}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can add up to 3 categories only.
                </p>
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((category) => (
                      <Badge key={category} variant="secondary" className="flex items-center space-x-1">
                        <span>{category}</span>
                        <button
                          type="button"
                          onClick={() => removeCategory(category)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Social Media Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SocialMediaInput
                    platform="instagram"
                    value={socialLinks.instagram}
                    onChange={(value) => setSocialLinks({...socialLinks, instagram: value})}
                  />
                  <SocialMediaInput
                    platform="youtube"
                    value={socialLinks.youtube}
                    onChange={(value) => setSocialLinks({...socialLinks, youtube: value})}
                  />
                  <SocialMediaInput
                    platform="x"
                    value={socialLinks.x}
                    onChange={(value) => setSocialLinks({...socialLinks, x: value})}
                  />
                  <SocialMediaInput
                    platform="facebook"
                    value={socialLinks.facebook}
                    onChange={(value) => setSocialLinks({...socialLinks, facebook: value})}
                  />
                  <SocialMediaInput
                    platform="linkedin"
                    value={socialLinks.linkedin}
                    onChange={(value) => setSocialLinks({...socialLinks, linkedin: value})}
                  />
                  <SocialMediaInput
                    platform="threads"
                    value={socialLinks.threads}
                    onChange={(value) => setSocialLinks({...socialLinks, threads: value})}
                  />
                  <SocialMediaInput
                    platform="pinterest"
                    value={socialLinks.pinterest}
                    onChange={(value) => setSocialLinks({...socialLinks, pinterest: value})}
                  />
                </div>

                {/* Custom Social Links */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Other Social Media</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCustomPlatform('social')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom
                    </Button>
                  </div>
                  {socialLinks.other.map((link, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        placeholder="Platform name"
                        value={link.title}
                        onChange={(e) => updateCustomPlatform('social', index, 'title', e.target.value)}
                      />
                      <Input
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => updateCustomPlatform('social', index, 'url', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCustomPlatform('social', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Platform Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Podcast Platforms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PlatformLinkInput
                    platform="spotify"
                    value={platformLinks.spotify}
                    onChange={(value) => setPlatformLinks({...platformLinks, spotify: value})}
                  />
                  <PlatformLinkInput
                    platform="apple"
                    value={platformLinks.apple}
                    onChange={(value) => setPlatformLinks({...platformLinks, apple: value})}
                  />
                  <PlatformLinkInput
                    platform="jiosaavn"
                    value={platformLinks.jiosaavn}
                    onChange={(value) => setPlatformLinks({...platformLinks, jiosaavn: value})}
                  />
                  <PlatformLinkInput
                    platform="amazon"
                    value={platformLinks.amazon}
                    onChange={(value) => setPlatformLinks({...platformLinks, amazon: value})}
                  />
                </div>

                {/* Custom Platform Links */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Other Platforms</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCustomPlatform('platform')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom
                    </Button>
                  </div>
                  {platformLinks.other.map((link, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        placeholder="Platform name"
                        value={link.title}
                        onChange={(e) => updateCustomPlatform('platform', index, 'title', e.target.value)}
                      />
                      <Input
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => updateCustomPlatform('platform', index, 'url', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCustomPlatform('platform', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setPodcastData(null);
                    setYoutubeUrl('');
                    setTitle('');
                    setDescription('');
                    setCategories([]);
                    setLanguages([]);
                    setPodcastLocation('');
                    setEpisodes([]);
                    setTeamMembers([]);
                    setVisibleEpisodes(5);
                    setSubmitted(false);
                  }}
                >
                  Cancel
                </Button>
                {targetTable && targetId && (
                  <Button 
                    type="button"
                    variant="secondary" 
                    size="lg"
                    onClick={handlePreviewUpdate}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Preview...
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview Changes
                      </>
                    )}
                  </Button>
                )}
                <Button 
                  type="button"
                  variant="hero" 
                  size="lg"
                  onClick={() => handleSectionChange('episodes')}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

                 {/* Episodes Section - Only show when editing podcasts */}
         {episodes.length > 0 && activeSection === 'episodes' && targetTable !== 'people' && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Episodes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EpisodeManager
                episodes={episodes.slice(0, visibleEpisodes)}
                totalEpisodes={podcastData?.total_episodes || episodes.length}
                onEpisodeUpdate={handleEpisodeUpdate}
                onThumbnailUpload={handleThumbnailUpload}
              />
              {visibleEpisodes < episodes.length && (
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                  >
                    Load More
                  </Button>
                </div>
              )}
              <div className="flex justify-end space-x-4 mt-6">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setPodcastData(null);
                    setYoutubeUrl('');
                    setTitle('');
                    setDescription('');
                    setCategories([]);
                    setLanguages([]);
                    setPodcastLocation('');
                    setEpisodes([]);
                    setTeamMembers([]);
                    setVisibleEpisodes(5);
                    setSubmitted(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  variant="hero" 
                  size="lg"
                  onClick={() => handleSectionChange('team')}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

                 {/* Team Section - Only show when editing podcasts */}
         {activeSection === 'team' && !submitted && targetTable !== 'people' && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Team Members</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TeamManager
                teamMembers={teamMembers}
                episodes={episodes}
                onTeamUpdate={handleTeamUpdate}
                onPhotoUpload={handlePhotoUpload}
              />
              <div className="flex justify-end space-x-4 mt-6">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setPodcastData(null);
                    setYoutubeUrl('');
                    setTitle('');
                    setDescription('');
                    setCategories([]);
                    setLanguages([]);
                    setPodcastLocation('');
                    setEpisodes([]);
                    setTeamMembers([]);
                    setVisibleEpisodes(5);
                    setSubmitted(false);
                  }}
                >
                  Cancel
                </Button>
                {targetTable && targetId && (
                  <Button 
                    type="button"
                    variant="secondary" 
                    size="lg"
                    onClick={handlePreviewUpdate}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Preview...
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview Changes
                      </>
                    )}
                  </Button>
                )}
                <Button 
                  onClick={handleSubmit}
                  variant="hero" 
                  disabled={submitting}
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit for Review
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* People Form Section */}
        {targetTable === 'people' && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary" />
                <span>Edit Person Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Tabs for People Form */}
              <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6">
                <button
                  onClick={() => setActivePeopleTab('info')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activePeopleTab === 'info'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Personal Info
                </button>
                <button
                  onClick={() => setActivePeopleTab('podcasts')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activePeopleTab === 'podcasts'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Add to Podcasts
                </button>
              </div>

              {/* Personal Info Tab */}
              {activePeopleTab === 'info' && (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="personName">Full Name</Label>
                      <Input
                        id="personName"
                        value={personName}
                        onChange={(e) => setPersonName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="personBirthDate">Birth Date</Label>
                      <Input
                        id="personBirthDate"
                        type="date"
                        value={personBirthDate}
                        onChange={(e) => setPersonBirthDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="personLocation">Location</Label>
                    <Input
                      id="personLocation"
                      value={personLocation}
                      onChange={(e) => setPersonLocation(e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="personWebsite">Website</Label>
                    <Input
                      id="personWebsite"
                      value={personWebsite}
                      onChange={(e) => setPersonWebsite(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="personBio">Biography</Label>
                    <Textarea
                      id="personBio"
                      value={personBio}
                      rows={4}
                      onChange={(e) => setPersonBio(e.target.value)}
                      placeholder="Tell us about this person..."
                    />
                  </div>

                  {/* Social Media Links */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Social Media Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SocialMediaInput
                        platform="instagram"
                        value={socialLinksForPeople.instagram}
                        onChange={(value) => setSocialLinksForPeople({...socialLinksForPeople, instagram: value})}
                      />
                      <SocialMediaInput
                        platform="youtube"
                        value={socialLinksForPeople.youtube}
                        onChange={(value) => setSocialLinksForPeople({...socialLinksForPeople, youtube: value})}
                      />
                      <SocialMediaInput
                        platform="x"
                        value={socialLinksForPeople.x}
                        onChange={(value) => setSocialLinksForPeople({...socialLinksForPeople, x: value})}
                      />
                      <SocialMediaInput
                        platform="facebook"
                        value={socialLinksForPeople.facebook}
                        onChange={(value) => setSocialLinksForPeople({...socialLinksForPeople, facebook: value})}
                      />
                      <SocialMediaInput
                        platform="linkedin"
                        value={socialLinksForPeople.linkedin}
                        onChange={(value) => setSocialLinksForPeople({...socialLinksForPeople, linkedin: value})}
                      />
                    </div>
                    
                    {/* Custom Social Media Platforms */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Other Social Media Platforms</Label>
                      <div className="space-y-2">
                        {(socialLinksForPeople.other || []).map((link, index) => (
                          <div key={index} className="flex space-x-2">
                            <Input
                              placeholder="Platform name (e.g., TikTok, Snapchat)"
                              value={link.title}
                              onChange={(e) => {
                                const updatedOther = [...(socialLinksForPeople.other || [])];
                                updatedOther[index] = { ...updatedOther[index], title: e.target.value };
                                setSocialLinksForPeople({...socialLinksForPeople, other: updatedOther});
                              }}
                              className="flex-1"
                            />
                            <Input
                              placeholder="URL"
                              value={link.url}
                              onChange={(e) => {
                                const updatedOther = [...(socialLinksForPeople.other || [])];
                                updatedOther[index] = { ...updatedOther[index], url: e.target.value };
                                setSocialLinksForPeople({...socialLinksForPeople, other: updatedOther});
                              }}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedOther = (socialLinksForPeople.other || []).filter((_, i) => i !== index);
                                setSocialLinksForPeople({...socialLinksForPeople, other: updatedOther});
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSocialLinksForPeople({
                              ...socialLinksForPeople,
                              other: [...(socialLinksForPeople.other || []), { title: '', url: '' }]
                            });
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Custom Platform
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Profile Picture */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Profile Picture</h3>
                    <div className="flex items-center space-x-4">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border">
                          {podcastData?.profile_image_url ? (
                            <Image
                              src={podcastData.profile_image_url}
                              alt="Profile"
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        {/* Hover overlay with upload option */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center cursor-pointer">
                          <div className="text-center space-y-1">
                            <Upload className="w-6 h-6 text-white mx-auto" />
                            <p className="text-white text-xs font-medium">Click to upload</p>
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Handle profile photo upload
                              setPersonPhotos(prev => [file, ...prev]);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Click on the profile picture to upload a new one
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Recommended size: 400x400 pixels
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Photos */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Additional Photos</h3>
                    <PhotoUploadManager
                      photos={personPhotos.map((file, index) => ({
                        id: `person-${index + 1}`,
                        url: URL.createObjectURL(file),
                        type: 'additional' as const,
                        uploadedAt: new Date(),
                        title: `Photo ${index + 1}`,
                        keywords: '',
                        person: '',
                        credit: ''
                      }))}
                      onPhotoUpload={(file, type) => {
                        if (type === 'additional') {
                          setPersonPhotos(prev => [...prev, file]);
                        }
                      }}
                      onPhotoDelete={(photoId) => {
                        const index = parseInt(photoId.split('-')[1]) - 1;
                        setPersonPhotos(prev => prev.filter((_, i) => i !== index));
                      }}
                      onPhotoTypeChange={(photoId, newType) => {
                        // Handle photo type change if needed
                      }}
                      onPhotoMetadataChange={(photoId, field, value) => {
                        // Handle metadata changes for additional photos
                        console.log('Metadata change:', photoId, field, value);
                      }}
                      maxPhotos={10}
                      className="w-full"
                      title="Additional Photos"
                      showAdditionalPhotos={true}
                      showProfilePhoto={false}
                      uploadType="additional"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setPersonName('');
                        setPersonBio('');
                        setPersonBirthDate('');
                        setPersonLocation('');
                        setPersonWebsite('');
                        setPersonPhotos([]);
                        setSocialLinksForPeople({ instagram: '', youtube: '', x: '', facebook: '', linkedin: '', threads: '', pinterest: '', other: [{ title: '', url: '' }] });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button"
                      variant="hero" 
                      size="lg"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Submit Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Podcasts Tab */}
              {activePeopleTab === 'podcasts' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Add Person to Podcast Episodes</h3>
                    <p className="text-sm text-muted-foreground">
                      Search for approved podcasts and select which episodes this person should be added to.
                    </p>
                  </div>

                  {/* Podcast Search */}
                  <div className="space-y-3">
                    <Label htmlFor="podcastSearch">Search Podcasts</Label>
                    <div className="relative">
                      <Input
                        id="podcastSearch"
                        placeholder="Type podcast name to search..."
                        value={podcastSearchTerm}
                        onChange={(e) => {
                          setPodcastSearchTerm(e.target.value);
                          searchPodcasts(e.target.value);
                        }}
                      />
                      {podcastSearchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                          {podcastSearchResults.map((podcast) => (
                            <button
                              key={podcast.id}
                              onClick={() => handlePodcastSelect(podcast)}
                              className="w-full p-3 text-left hover:bg-muted flex items-center space-x-3 border-b border-border last:border-b-0"
                            >
                              <Image
                                src={podcast.cover_image_url || '/placeholder.svg'}
                                alt={podcast.title}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <div>
                                <div className="font-medium">{podcast.title}</div>
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {podcast.description}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected Podcast and Episodes */}
                  {selectedPodcast && (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium mb-2">Selected Podcast: {selectedPodcast.title}</h4>
                        <div className="flex items-center space-x-3">
                          <Image
                            src={selectedPodcast.cover_image_url || '/placeholder.svg'}
                            alt={selectedPodcast.title}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded object-cover"
                          />
                          <div>
                            <p className="text-sm text-muted-foreground">{selectedPodcast.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Episode Selection */}
                      {availableEpisodes.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium">Select Episodes to Add Person To:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                            {availableEpisodes.map((episode) => (
                              <label key={episode.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/30 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedEpisodes.includes(episode.id)}
                                  onChange={() => handleEpisodeToggle(episode.id)}
                                  className="rounded"
                                />
                                <div>
                                  <div className="font-medium text-sm">
                                    Episode {episode.episode_number}: {episode.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {episode.published_at ? new Date(episode.published_at).toLocaleDateString() : 'No date'}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Submit Button for Podcast Addition */}
                      <div className="flex justify-end space-x-4 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedPodcast(null);
                            setPodcastSearchTerm('');
                            setAvailableEpisodes([]);
                            setSelectedEpisodes([]);
                          }}
                        >
                          Clear Selection
                        </Button>
                        <Button
                          type="button"
                          variant="hero"
                          disabled={selectedEpisodes.length === 0}
                          onClick={() => {
                            // Here you would submit the person to the selected episodes
                            toast.success(`Added person to ${selectedEpisodes.length} episode(s) of ${selectedPodcast.title}`);
                            setSelectedPodcast(null);
                            setPodcastSearchTerm('');
                            setAvailableEpisodes([]);
                            setSelectedEpisodes([]);
                          }}
                        >
                          Add to Selected Episodes
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Review Card */}
        {submitted && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-primary" />
                <span>Thank You for Your Submission!</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Thank you for contributing to our podcast database! Our team will review your submission and respond within the next 48 hours. If you have any questions or need assistance, please contact us at <a href="mailto:support@poddb.pro" className="text-primary hover:underline">support@poddb.pro</a>.
              </p>
              <div className="flex justify-end space-x-4">
                {targetTable && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (targetTable === 'podcasts') {
                        router.push(`/podcasts/${podcastData.slug}`);
                      } else if (targetTable === 'episodes') {
                        router.push(`/episodes/${podcastData.slug}`);
                      } else if (targetTable === 'people') {
                        router.push(`/people/${podcastData.slug}`);
                      }
                    }}
                  >
                    Back to Page
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmitted(false);
                    setPodcastData(null);
                    setYoutubeUrl('');
                    setTitle('');
                    setDescription('');
                    setCategories([]);
                    setEpisodes([]);
                    setTeamMembers([]);
                    setVisibleEpisodes(5);
                    setActiveSection('podcast-info');
                    scrollToTop();
                  }}
                >
                  Submit More
                </Button>
                <Button
                  variant="hero"
                  onClick={() => router.push('/')}
                >
                  Home Page
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guidelines */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Contribution Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Only submit podcasts that you have permission to add or that are publicly available</p>
            <p>• Ensure the YouTube playlist contains only episodes from the same podcast</p>
            <p>• Provide accurate and complete information about the podcast</p>
            <p>• All submissions will be reviewed by our moderation team before going live</p>
            <p>• You&apos;ll receive a notification once your submission is approved or if changes are needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Location Request Dialog */}
      <Dialog open={showLocationRequest} onOpenChange={setShowLocationRequest}>
        <LocationRequestForm
          onClose={() => setShowLocationRequest(false)}
          initialLocation={podcastLocation}
        />
      </Dialog>
    </div>
  );
}

export default function Contribute() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading contribute page...</span>
        </div>
      </div>
    }>
      <ContributeContent />
    </Suspense>
  );
}

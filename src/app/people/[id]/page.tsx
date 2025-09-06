
// =================================================================================================
// DEVELOPER NOTICE
// =================================================================================================
// This page fetches its data from the `get_person_details_by_slug` Supabase RPC function.
// If you need to modify the data fetching logic, please update the corresponding SQL function
// in `supabase/migrations/20250828260000_fix_get_person_details_by_slug_function_null_reviews.sql`
// and document your changes here.
//
// The function returns a JSONB object with the following structure:
// {
//   "id": "uuid",
//   "full_name": "text",
//   "bio": "text",
//   "photo_urls": "text[]",
//   "social_links": "jsonb",
//   "website_url": "text",
//   "birth_date": "date",
//   "location": "text",
//   "is_verified": "boolean",
//   "custom_fields": "jsonb",
//   "total_appearances": "integer",
//   "average_rating": "numeric",
//   "rating_count": "integer",
//   "reviews": [
//     {
//       "id": "uuid",
//       "rating": "integer",
//       "review_title": "text",
//       "review_text": "text",
//       "created_at": "timestamp",
//       "upvotes": "integer",
//       "downvotes": "integer",
//       "profiles": {
//         "display_name": "text",
//         "avatar_url": "text"
//       }
//     }
//   ]
// }
// =================================================================================================

import { supabase } from '@/integrations/supabase/client';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Mic, 
  Play,
  Eye,
  Heart,
  Clock,
  Star,
  Users,
  Award,
  MessageSquare,
  Globe,
  Youtube,
  Twitter,
  Instagram,
  Facebook,
  Twitch,
  Linkedin,
  Link as LinkIcon
} from 'lucide-react';
import { Metadata } from 'next';
import { StarRating } from '@/components/StarRating';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewsList } from '@/components/ReviewsList';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { AwardsAndNominations } from '@/components/AwardsAndNominations';
import { Tables } from '@/integrations/supabase/types';

type PodcastAppearance = Tables<'podcast_people'> & {
    podcasts: Tables<'podcasts'>;
};

type EpisodeAppearance = Tables<'episode_people'> & {
    episodes: Tables<'episodes'> & {
        podcasts: Tables<'podcasts'>;
    };
};

type PersonDetails = {
  id: string;
  full_name: string;
  also_known_as?: string;
  bio: string;
  photo_urls: string[];
  social_links: any;
  website_url: string;
  birth_date: string;
  location: string;
  is_verified: boolean;
  custom_fields: any;
  total_appearances: number;
  average_rating: number;
  rating_count: number;
  reviews: (Tables<'reviews'> & { profiles: Tables<'profiles'> | null })[];
  seo_metadata: any;
};

type Props = {
    params: Promise<{ id: string }>; // This will be the slug
};

export async function generateStaticParams() {
    const { data: people } = await supabase.from('people').select('slug').not('slug', 'is', null);
    return people?.map(({ slug }) => ({ id: slug! })) || [];
}

async function getPersonDetails(identifier: string): Promise<PersonDetails> {
    // First try to get by slug
    let { data, error } = await supabase.rpc('get_person_details_by_slug', { p_slug: identifier } as any);
    
    // If not found by slug, try to get by ID
    if (error || !data) {
      console.log(`Trying to fetch person by ID instead of slug: ${identifier}`);
      const { data: personData, error: personError } = await supabase
        .from('people')
        .select('*')
        .eq('id', identifier)
        .single();
      
      if (personError || !personData) {
        console.error(`Error fetching person details with identifier "${identifier}":`, error || personError);
        notFound();
      }
      
      // If we found by ID, try to get full details by slug if available
      if ((personData as any).slug) {
        const { data: fullData, error: fullError } = await supabase.rpc('get_person_details_by_slug', { p_slug: (personData as any).slug } as any);
        if (!fullError && fullData) {
          return fullData as PersonDetails;
        }
      }
      
      // Fallback to basic person data
      return {
        ...(personData as any),
        total_appearances: 0,
        average_rating: null,
        rating_count: 0,
        reviews: []
      } as PersonDetails;
    }
    
    return data as PersonDetails;
}

async function getAppearances(id: string) {
    const podcastPromise = supabase
        .from('podcast_people')
        .select(`
            *,
            podcasts!inner(
                id, title, description, cover_image_url, total_episodes, 
                total_views, total_likes, categories, submission_status, slug
            )
        `)
        .eq('person_id', id)
        .eq('podcasts.submission_status', 'approved');

    const episodePromise = supabase
        .from('episode_people')
        .select(`
            *,
            episodes!inner(
                id, title, description, duration, views, likes, published_at, 
                thumbnail_url, youtube_url, slug,
                podcasts!inner(id, title, cover_image_url, submission_status)
            )
        `)
        .eq('person_id', id)
        .eq('episodes.podcasts.submission_status', 'approved');

    const [podcastRes, episodeRes] = await Promise.all([podcastPromise, episodePromise]);

    if (podcastRes.error) throw new Error(`Podcast Appearances Error: ${podcastRes.error.message}`);
    if (episodeRes.error) throw new Error(`Episode Appearances Error: ${episodeRes.error.message}`);

    return {
        podcastAppearances: (podcastRes.data as PodcastAppearance[]) || [],
        episodeAppearances: (episodeRes.data as EpisodeAppearance[]) || [],
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const person = await getPersonDetails(id); // id is the slug
    if (!person) {
        return { title: 'Person Not Found' };
    }
    const seo = person.seo_metadata as any;
    return {
        title: seo?.meta_title || `${person.full_name} - Podcast Appearances`,
        description: seo?.meta_description || person.bio || `Discover all podcast and episode appearances by ${person.full_name}.`,
        keywords: seo?.keywords || [],
    };
}


export default async function PersonDetailPage({ params }: Props) {
    const { id } = await params;
    const person = await getPersonDetails(id); // params.id is the slug
    const { podcastAppearances, episodeAppearances } = await getAppearances(person.id);
    

    
    const formatDuration = (seconds: number | null) => {
        if (seconds === null) return 'N/A';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const formatNumber = (num: number | null) => {
        if (num === null) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const displayPhoto = person.photo_urls && person.photo_urls.length > 0
        ? person.photo_urls[0]
        : null;

    const initials = person.full_name
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase() || '?';

    const allRoles = Array.from(new Set([
        ...podcastAppearances.map(pa => pa.role),
        ...episodeAppearances.map(ea => ea.role)
    ]));

    const totalAppearances = podcastAppearances.length + episodeAppearances.length;

    return (
        <div className="min-h-screen">
            {/* Header Section with Hero Background */}
            <header className="relative h-[40vh] min-h-[300px] bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"/>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                        <Avatar className="h-32 w-32 md:h-48 md:w-48 border-4 border-background shadow-2xl">
                            <AvatarImage src={displayPhoto || undefined} alt={person.full_name} />
                            <AvatarFallback className="text-4xl md:text-6xl font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center md:text-left space-y-4">
                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold">{person.full_name}</h1>
                                {person.is_verified && (
                                    <VerifiedBadge className="h-8 w-8 md:h-10 md:w-10" />
                                )}
                            </div>
                            {person.also_known_as && (
                                <div className="text-lg md:text-xl text-muted-foreground">
                                    Also known as: <span className="font-medium">{person.also_known_as}</span>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {allRoles.map((role, index) => (
                                    <Badge key={index} variant="secondary" className="capitalize text-sm">
                                        {role}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back Button */}
                <div className="mb-8">
                    <Link href="/people">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to People
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Person Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">About {person.full_name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Stats Row */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <div className="text-2xl font-bold text-primary">{totalAppearances}</div>
                                        <div className="text-sm text-muted-foreground">Appearances</div>
                                    </div>
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <div className="text-2xl font-bold text-primary">{person.rating_count || 0}</div>
                                        <div className="text-sm text-muted-foreground">Reviews</div>
                                    </div>
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <div className="text-2xl font-bold text-primary">{person.average_rating ? person.average_rating.toFixed(1) : '0'}</div>
                                        <div className="text-sm text-muted-foreground">Rating</div>
                                    </div>
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <div className="text-2xl font-bold text-primary">{allRoles.length}</div>
                                        <div className="text-sm text-muted-foreground">Roles</div>
                                    </div>
                                </div>

                                {/* Rating Display */}
                                <div className="flex items-center gap-4">
                                    <StarRating rating={person.average_rating || 0} readOnly showValue size={20}/> 
                                    <span className="text-muted-foreground">({person.rating_count} ratings)</span>
                                </div>

                                {/* Bio */}
                                {person.bio && (
                                    <div>
                                        <h3 className="font-semibold mb-3 text-lg">Biography</h3>
                                        <p className="text-muted-foreground leading-relaxed text-base">{person.bio}</p>
                                    </div>
                                )}

                                {/* Personal Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {person.location && (
                                        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <Link href={`/locations/${encodeURIComponent(person.location)}`}>
                                                <span className="cursor-pointer hover:text-primary transition-colors">{person.location}</span>
                                            </Link>
                                        </div>
                                    )}
                                    {person.birth_date && (
                                        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>{new Date(person.birth_date).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Links */}
                                {(person.website_url || (person.social_links && Object.keys(person.social_links).length > 0)) && (
                                    <div>
                                        <h3 className="font-semibold mb-3 text-lg">Links</h3>
                                        <div className="space-y-3">
                                            {person.website_url && (
                                                <Link 
                                                    href={person.website_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="link-consistent"
                                                    title="Visit website"
                                                >
                                                    <Globe className="h-5 w-5" />
                                                    <span className="link-consistent-text">Website</span>
                                                </Link>
                                            )}
                                        </div>
                                        
                                        {/* Social Links Section - Same as Podcast Page */}
                                        {person.social_links && Object.keys(person.social_links).length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="font-medium mb-3 text-base">Social Media</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {getAllSocialLinks(person.social_links)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Additional Images Section */}
                        {person.photo_urls && person.photo_urls.length > 1 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        <Users className="h-6 w-6" />
                                        Photos & Media
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {person.photo_urls.map((photoUrl, index) => (
                                            <div key={index} className="aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                                <Image 
                                                    src={photoUrl} 
                                                    alt={`${person.full_name} - Photo ${index + 1}`}
                                                    width={300}
                                                    height={300}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Awards Section */}
                        <AwardsAndNominations
                            targetId={person.id}
                            targetType="person"
                            targetName={person.full_name}
                            targetImageUrl={displayPhoto || ''}
                        />

                        {/* Main Tabs Section */}
                        <Card>
                            <CardContent className="p-0">
                                <Tabs defaultValue="podcasts" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4 h-12">
                                        <TabsTrigger value="podcasts" className="flex items-center gap-2">
                                            <Mic className="h-4 w-4" />
                                            Podcasts ({podcastAppearances.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="episodes" className="flex items-center gap-2">
                                            <Play className="h-4 w-4" />
                                            Episodes ({episodeAppearances.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="reviews" className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Reviews ({(person.reviews || []).length})
                                        </TabsTrigger>
                                        <TabsTrigger value="write-review" className="flex items-center gap-2">
                                            <Star className="h-4 w-4" />
                                            Write Review
                                        </TabsTrigger>
                                    </TabsList>

                                    <div className="p-6">
                                        <TabsContent value="podcasts" className="space-y-4">
                                            <div className="space-y-4">
                                                <h2 className="text-2xl font-semibold flex items-center gap-2">
                                                    <Mic className="h-6 w-6" />
                                                    Regular Podcast Appearances
                                                </h2>
                                                {podcastAppearances.length === 0 ? (
                                                    <Card>
                                                        <CardContent className="p-12 text-center text-muted-foreground">
                                                            <Mic className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                                            <p className="text-lg">No regular podcast appearances found</p>
                                                            <p className="text-sm">This person hasn&apos;t been added to any podcast teams yet.</p>
                                                        </CardContent>
                                                    </Card>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {podcastAppearances.map((appearance) => (
                                                            <Link key={appearance.id} href={`/podcasts/${appearance.podcasts.slug}`}>
                                                                <Card className="group cursor-pointer card-hover transition-all duration-200 hover:shadow-lg h-52">
                                                                    <CardContent className="p-4 h-full">
                                                                        <div className="flex items-start space-x-3 h-full">
                                                                            <Image 
                                                                                src={appearance.podcasts.cover_image_url || 'https://placehold.co/64x64.png'} 
                                                                                alt={appearance.podcasts.title} 
                                                                                width={64}
                                                                                height={64}
                                                                                className="w-16 h-16 rounded-lg object-cover shadow-md flex-shrink-0" 
                                                                                data-ai-hint="podcast cover"
                                                                            />
                                                                            <div className="flex-1 min-w-0 flex flex-col h-full">
                                                                                <div className="flex-shrink-0">
                                                                                    <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-2 break-words">
                                                                                        {appearance.podcasts.title}
                                                                                    </h3>
                                                                                    <Badge className="text-xs capitalize mt-1">{appearance.role}</Badge>
                                                                                </div>
                                                                                <p className="text-sm text-muted-foreground line-clamp-2 break-words mt-2 flex-shrink-0">
                                                                                    {appearance.podcasts.description}
                                                                                </p>
                                                                                <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-auto pt-2">
                                                                                    <span className="flex items-center gap-1">
                                                                                        <Play className="h-3 w-3" />
                                                                                        {appearance.podcasts.total_episodes} episodes
                                                                                    </span>
                                                                                    <span className="flex items-center gap-1">
                                                                                        <Eye className="h-3 w-3" />
                                                                                        {formatNumber(appearance.podcasts.total_views)}
                                                                                    </span>
                                                                                    <span className="flex items-center gap-1">
                                                                                        <Heart className="h-3 w-3" />
                                                                                        {formatNumber(appearance.podcasts.total_likes)}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="episodes" className="space-y-4">
                                            <div className="space-y-4">
                                                <h2 className="text-2xl font-semibold flex items-center gap-2">
                                                    <Play className="h-6 w-6" />
                                                    Guest Episode Appearances
                                                </h2>
                                                {episodeAppearances.length === 0 ? (
                                                    <Card>
                                                        <CardContent className="p-12 text-center text-muted-foreground">
                                                            <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                                            <p className="text-lg">No guest episode appearances found</p>
                                                            <p className="text-sm">This person hasn&apos;t appeared as a guest on any episodes yet.</p>
                                                        </CardContent>
                                                    </Card>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {episodeAppearances.map((appearance) => (
                                                            <Card key={appearance.id} className="group cursor-pointer card-hover transition-all duration-200 hover:shadow-lg">
                                                                <Link href={`/episodes/${appearance.episodes.slug}`}>
                                                                    <CardContent className="p-6">
                                                                        <div className="flex items-start space-x-4">
                                                                            <Image 
                                                                                src={appearance.episodes.thumbnail_url || appearance.episodes.podcasts.cover_image_url || 'https://placehold.co/80x80.png'} 
                                                                                alt={appearance.episodes.title} 
                                                                                width={96}
                                                                                height={96}
                                                                                className="w-24 h-24 rounded-lg object-cover shadow-md flex-shrink-0" 
                                                                                data-ai-hint="episode thumbnail" 
                                                                            />
                                                                            <div className="flex-1 space-y-3 min-w-0">
                                                                                <div>
                                                                                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2 break-words">
                                                                                        {appearance.episodes.title}
                                                                                    </h3>
                                                                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                                                                        From: <span className="text-primary hover:underline">{appearance.episodes.podcasts.title}</span>
                                                                                    </p>
                                                                                    <Badge className="text-xs capitalize mt-2">{appearance.role}</Badge>
                                                                                </div>
                                                                                <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                                                                                    {appearance.episodes.description}
                                                                                </p>
                                                                                <div className="flex items-center space-x-4 text-xs text-muted-foreground flex-wrap">
                                                                                    <span className="flex items-center gap-1">
                                                                                        <Clock className="h-3 w-3" />
                                                                                        {formatDuration(appearance.episodes.duration)}
                                                                                    </span>
                                                                                    <span className="flex items-center gap-1">
                                                                                        <Eye className="h-3 w-3" />
                                                                                        {formatNumber(appearance.episodes.views)}
                                                                                    </span>
                                                                                    <span className="flex items-center gap-1">
                                                                                        <Heart className="h-3 w-3" />
                                                                                        {formatNumber(appearance.episodes.likes)}
                                                                                    </span>
                                                                                    <span className="flex items-center gap-1">
                                                                                        <Calendar className="h-3 w-3" />
                                                                                        {appearance.episodes.published_at ? new Date(appearance.episodes.published_at).toLocaleDateString() : 'N/A'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <Button variant="outline" size="sm" asChild className="flex-shrink-0">
                                                                                <a href={appearance.episodes.youtube_url} target="_blank" rel="noopener noreferrer">
                                                                                    <Play className="h-4 w-4 mr-1" />
                                                                                    Watch
                                                                                </a>
                                                                            </Button>
                                                                        </div>
                                                                    </CardContent>
                                                                </Link>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="reviews" className="space-y-4">
                                            <div className="space-y-4">
                                                <h2 className="text-2xl font-semibold flex items-center gap-2">
                                                    <MessageSquare className="h-6 w-6" />
                                                    Reviews
                                                </h2>
                                                <ReviewsList reviews={person.reviews || []} />
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="write-review" className="space-y-4">
                                            <div className="space-y-4">
                                                <h2 className="text-2xl font-semibold flex items-center gap-2">
                                                    <Star className="h-6 w-6" />
                                                    Write a Review
                                                </h2>
                                                <ReviewForm targetId={person.id} targetTable="people" />
                                            </div>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Quick Stats Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Quick Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center p-4 bg-primary/10 rounded-lg">
                                    <div className="text-3xl font-bold text-primary">{totalAppearances}</div>
                                    <div className="text-sm text-muted-foreground">Total Appearances</div>
                                </div>
                                <div className="text-center p-4 bg-primary/10 rounded-lg">
                                    <div className="text-3xl font-bold text-primary">{person.rating_count || 0}</div>
                                    <div className="text-sm text-muted-foreground">Total Reviews</div>
                                </div>
                                <div className="text-center p-4 bg-primary/10 rounded-lg">
                                    <div className="text-3xl font-bold text-primary">{allRoles.length}</div>
                                    <div className="text-sm text-muted-foreground">Different Roles</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Edit Page Button */}
                        <Card>
                            <CardContent className="p-6">
                                <Link
                                    href={{
                                        pathname: '/contribute',
                                        query: {
                                            target_table: 'people',
                                            target_id: person.id,
                                        },
                                    }}
                                    passHref
                                >
                                    <Button variant="outline" className="w-full">
                                        <Award className="h-4 w-4 mr-2" />
                                        Edit Page
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                                         </div>
                 </div>
             </main>
         </div>
     );
 }

// Helper function to get social media icon
const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
        case 'youtube':
            return <Youtube className="h-5 w-5" />;
        case 'twitter':
            return <Twitter className="h-5 w-5" />;
        case 'instagram':
            return <Instagram className="h-5 w-5" />;
        case 'facebook':
            return <Facebook className="h-5 w-5" />;
        case 'twitch':
            return <Twitch className="h-5 w-5" />;
        case 'linkedin':
            return <Linkedin className="h-5 w-5" />;
        default:
            return <LinkIcon className="h-5 w-5" />;
    }
};

// Helper function to get all social media links in correct sequence
const getAllSocialLinks = (socialLinks: { [key: string]: string }) => {
    const platformSequence = ['youtube', 'instagram', 'facebook', 'twitter', 'linkedin', 'threads', 'pinterest'];
    
    // First, get platforms in the correct sequence
    const orderedLinks = platformSequence
        .filter(platform => socialLinks[platform])
        .map(platform => (
            <Link 
                key={platform} 
                href={socialLinks[platform]} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="link-consistent"
                title={`Follow on ${platform}`}
            >
                {getSocialIcon(platform)}
                <span className="link-consistent-text">{platform === 'twitter' ? 'X' : platform}</span>
            </Link>
        ));
    
    // Then, get any other platforms not in the sequence
    const otherLinks = Object.entries(socialLinks)
        .filter(([platform]) => !platformSequence.includes(platform))
        .map(([platform, url]) => (
            <Link 
                key={platform} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="link-consistent"
                title={`Follow on ${platform}`}
            >
                {getSocialIcon(platform)}
                <span className="link-consistent-text">{platform}</span>
            </Link>
        ));
    
    const allLinks = [...orderedLinks, ...otherLinks];
    return allLinks;
};

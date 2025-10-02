"use client";
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, MapPin, Calendar, ExternalLink, Mic, Users, Award, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface StaticPeoplePageProps {
  initialData: any[];
}

export default function StaticPeoplePage({ initialData }: StaticPeoplePageProps) {
  const [people, setPeople] = useState<any[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('total_appearances');

  const sortedPeople = useMemo(() => {
    let sortedData = [...people];
    if (sortBy === 'full_name') {
      sortedData = sortedData.sort((a: any, b: any) => (a.full_name || '').localeCompare(b.full_name || ''));
    } else if (sortBy === 'created_at') {
       sortedData = sortedData.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else { // 'total_appearances' is default
       sortedData = sortedData.sort((a: any, b: any) => (b.total_appearances || 0) - (a.total_appearances || 0));
    }
    return sortedData;
  }, [people, sortBy]);

  const filteredPeople = useMemo(() => {
    return sortedPeople.filter((person) =>
      person.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedPeople, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Podcast People</h1>
            <p className="text-muted-foreground text-lg">
              Discover hosts, guests, and personalities in the podcast world
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort by</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total_appearances">Most Appearances</SelectItem>
                  <SelectItem value="full_name">Name A-Z</SelectItem>
                  <SelectItem value="created_at">Recently Added</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPeople.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>

      {filteredPeople.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No people found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms' : 'No podcast personalities available yet'}
          </p>
        </div>
      )}
    </div>
  );
}

function PersonCard({ person }: { person: any }) {
  const displayPhoto = person.photo_urls && person.photo_urls.length > 0 
    ? person.photo_urls[0] 
    : null;

  const displayName = person.full_name || person.name || 'Unknown';
  const initials = displayName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || '?';

  // Handle roles - could be array or string
  const roles = Array.isArray(person.role) ? person.role : 
               person.role ? [person.role] : 
               person.roles || [];

  return (
    <Link href={`/people/${person.slug}`}>
      <Card className="group cursor-pointer card-hover bg-card border-border h-full">
        <CardContent className="p-6 space-y-4">
          {/* Avatar and Basic Info */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={displayPhoto || undefined} alt={displayName} />
              <AvatarFallback className="text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                  {displayName}
                </h3>
                {person.is_verified && <VerifiedBadge className="h-5 w-5 flex-shrink-0" />}
              </div>
              {person.location && (
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <Link href={`/locations/${encodeURIComponent(person.location)}`}>
                    <span className="cursor-pointer hover:text-primary transition-colors">{person.location}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {person.bio && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {person.bio}
            </p>
          )}

          {/* Roles */}
          <div className="flex flex-wrap gap-1">
            {roles?.slice(0, 3).map((role: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs capitalize">
                {role}
              </Badge>
            ))}
            {roles?.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{roles.length - 3} more
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Mic className="h-3 w-3" />
                <span>{person.total_appearances || 0} appearances</span>
              </div>
            </div>
            {person.website_url && (
              <ExternalLink className="h-3 w-3" />
            )}
          </div>

          {/* Featured Podcasts */}
          {person.podcasts?.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-1">Featured in:</p>
              <div className="flex flex-wrap gap-1">
                {person.podcasts.slice(0, 2).map((podcast: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {typeof podcast === 'string' ? podcast : podcast.title}
                  </Badge>
                ))}
                {person.podcasts.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{person.podcasts.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

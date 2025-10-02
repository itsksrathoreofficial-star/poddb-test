
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/integrations/supabase/server';
import StaticPeoplePage from './StaticPeoplePage';

// Enable static generation
export const dynamic = 'force-static';
export const revalidate = false; // Fully static, no revalidation

// Pre-fetch people data at build time
async function getPeopleData() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Fetch people from the people table
    const { data: peopleData, error: peopleError } = await supabase
      .from('people')
      .select('*')
      .order('created_at', { ascending: false });

    if (peopleError) {
      console.warn('Warning: Could not fetch people data during build:', peopleError.message);
      return [];
    }

    // Also get team members from podcast_people table with podcast info
    const { data: podcastPeopleData, error: podcastPeopleError } = await supabase
      .from('podcast_people')
      .select(`
        role,
        people (
          id,
          full_name,
          bio,
          photo_urls,
          social_links,
          is_verified,
          slug,
          created_at
        ),
        podcasts (
          id,
          title,
          slug
        )
      `);

    if (podcastPeopleError) {
      console.warn('Warning: Could not fetch team members during build:', podcastPeopleError.message);
      return peopleData || [];
    }

    // Extract team members from podcast_people and count appearances
    const teamMembers: any[] = [];
    const memberCounts: { [key: string]: number } = {};
    
    if (podcastPeopleData) {
      podcastPeopleData.forEach((pp: any) => {
        if (pp.people) {
          const memberId = pp.people.id;
          if (!memberCounts[memberId]) {
            memberCounts[memberId] = 0;
          }
          memberCounts[memberId]++;
        }
      });

      // Create team members with proper appearance counts and podcast info
      const memberPodcasts: { [key: string]: any[] } = {};
      
      podcastPeopleData.forEach((pp: any) => {
        if (pp.people) {
          const memberId = pp.people.id;
          if (!memberPodcasts[memberId]) {
            memberPodcasts[memberId] = [];
          }
          if (pp.podcasts) {
            memberPodcasts[memberId].push(pp.podcasts);
          }
        }
      });

      podcastPeopleData.forEach((pp: any) => {
        if (pp.people) {
          const memberId = pp.people.id;
          // Check if this member is already in the list
          if (!teamMembers.find(tm => tm.id === memberId)) {
            teamMembers.push({
              id: pp.people.id,
              full_name: pp.people.full_name,
              name: pp.people.full_name,
              bio: pp.people.bio,
              photo_urls: pp.people.photo_urls,
              social_links: pp.people.social_links,
              is_verified: pp.people.is_verified,
              slug: pp.people.slug,
              role: pp.role,
              roles: [pp.role],
              total_appearances: memberCounts[memberId] || 1,
              podcasts: memberPodcasts[memberId] || [],
              created_at: pp.people.created_at || new Date().toISOString()
            });
          }
        }
      });
    }

    // Combine people from people table and team members, removing duplicates
    const allPeople: any[] = [...(peopleData || [])];
    
    // Add team members that are not already in people table
    teamMembers.forEach((teamMember: any) => {
      const existingPerson = allPeople.find((person: any) => person.id === teamMember.id);
      if (!existingPerson) {
        allPeople.push(teamMember);
      } else {
        // Update existing person with team member data
        existingPerson.total_appearances = Math.max(existingPerson.total_appearances || 0, teamMember.total_appearances || 0);
        if (teamMember.role) {
          existingPerson.role = teamMember.role;
          existingPerson.roles = teamMember.roles;
        }
        if (teamMember.podcasts && teamMember.podcasts.length > 0) {
          existingPerson.podcasts = teamMember.podcasts;
        }
      }
    });

    return allPeople;
  } catch (error: any) {
    console.warn('Warning: Could not fetch people data during build:', error.message);
    return [];
  }
}

export default async function PeoplePage() {
  const peopleData = await getPeopleData();

  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading people...</span>
        </div>
      </div>
    }>
      <StaticPeoplePage initialData={peopleData} />
    </Suspense>
  );
}



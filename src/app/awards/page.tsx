"use client";
import React, { useState, useEffect, useTransition } from 'react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Share2, Loader2, Trophy, Vote, Check, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast, toastErrorWithCopy } from '@/components/ui/sonner';
import { generateSocialPost } from '@/ai/flows/generate-social-post';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/components/AuthProvider';
import { castVoteAction } from '@/app/actions/nominations';
import { Progress } from '@/components/ui/progress';

interface AssignedAward {
    id: string;
    assigned_at: string;
    award_name: string;
    award_description: string;
    award_icon_svg: string;
    target_id: string;
    target_table: string;
    target_name: string;
    target_slug: string;
    target_cover_image_url: string;
}

interface Nomination {
    nomination_id: string;
    category_name: string;
    nominee_name: string;
    nominee_type: string;
    nominee_slug: string;
    nominee_image_url: string;
    nomination_year: number;
    votes_count: number;
}

export default function AwardsAndNominationsPage() {
    const [assignedAwards, setAssignedAwards] = useState<AssignedAward[]>([]);
    const [polls, setPolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sharing, setSharing] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("awards");
    const [userVotes, setUserVotes] = useState<Record<string, string>>({});
    const [votingFor, setVotingFor] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { user } = useAuth();

    useEffect(() => {
        if (activeTab === "awards") {
            fetchAssignedAwards();
        } else {
            fetchNominations();
        }
    }, [activeTab]);

    useEffect(() => {
        if (user && polls.length > 0 && activeTab === "nominations") {
            fetchUserVotes();
        }
    }, [user, polls, activeTab]);

    const fetchAssignedAwards = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.rpc('get_assigned_awards_details');
            if (error) throw error;
            setAssignedAwards(data || []);
        } catch (error: any) {
            toastErrorWithCopy("Failed to fetch awards", error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchNominations = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('nomination_polls')
                .select(`
                    id,
                    title,
                    deadline,
                    created_at,
                    nominated_podcasts (
                        id,
                        podcasts (slug, title, cover_image_url),
                        votes (count)
                    )
                `)
                .eq('status', 'open');

            if (error) throw error;
            setPolls(data || []);
        } catch (error: any) {
            toastErrorWithCopy("Failed to fetch nominations", error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserVotes = async () => {
        if (!user) return;
        const pollIds = polls.map(p => p.id);
        if (pollIds.length === 0) return;

        const { data, error } = await supabase
            .from('votes')
            .select('nominated_podcast_id, nominated_podcasts(poll_id)')
            .in('nominated_podcasts.poll_id', pollIds)
            .eq('user_id', user.id);

        if (error) {
            toastErrorWithCopy("Could not fetch your votes", error.message);
            return;
        }

        const votesMap = data.reduce((acc, vote) => {
            if ((vote as any).nominated_podcasts) {
                acc[(vote as any).nominated_podcasts.poll_id] = (vote as any).nominated_podcast_id;
            }
            return acc;
        }, {} as Record<string, string>);
        setUserVotes(votesMap);
    }

    const handleVote = (pollId: string, nominatedPodcastId: string) => {
        if (!user) {
            toast.error("Please log in to vote.");
            return;
        }
        setVotingFor(nominatedPodcastId);
        startTransition(async () => {
            const result = await castVoteAction(pollId, nominatedPodcastId, user.id);
            if (result.success) {
                toast.success(result.message);
                setUserVotes(prev => ({ ...prev, [pollId]: nominatedPodcastId }));
                fetchNominations();
            } else {
                toastErrorWithCopy("Vote failed", result.error);
            }
            setVotingFor(null);
        });
    };

    const handleShare = async (item: AssignedAward | Nomination) => {
        const id = 'id' in item ? item.id : item.nomination_id;
        setSharing(id);
        try {
            const isAward = 'award_name' in item;
            const title = isAward ? item.award_name : `Nominated for ${item.category_name}`;
            const name = 'target_name' in item ? item.target_name : item.nominee_name;
            const imageUrl = 'target_cover_image_url' in item ? item.target_cover_image_url : item.nominee_image_url;

            const result = await generateSocialPost({
                podcastName: name,
                awardTitle: title,
                podcastImageUrl: imageUrl
            });

            const socialImageUrl = result.socialPostImageUrl;
            const caption = result.socialPostCaption;
            
            window.open(socialImageUrl, '_blank');
            console.log("Shareable Caption:", caption);
            toast.success("Social post image generated!", {
                description: "The image has been opened in a new tab.",
            });

        } catch (error: any) {
            toastErrorWithCopy("Failed to generate social post", error.message);
        } finally {
            setSharing(null);
        }
    };
    
    const renderLoading = () => (
        <div className="container mx-auto px-4 py-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );

    const getNomineeLink = (nominee: Nomination) => {
        if (nominee.nominee_type === 'podcast') {
            return `/podcasts/${nominee.nominee_slug}`;
        }
        return `/people/${nominee.nominee_slug}`;
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <header className="text-center space-y-4">
                <Trophy className="mx-auto h-16 w-16 text-primary" />
                <h1 className="text-5xl font-bold tracking-tighter">Awards & Nominations</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Celebrating the best in podcasting. See the winners and vote for the nominees.
                </p>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="awards">
                        <Award className="mr-2 h-4 w-4" /> Hall of Fame
                    </TabsTrigger>
                    <TabsTrigger value="nominations">
                        <Vote className="mr-2 h-4 w-4" /> Nominations
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="awards">
                    {loading ? renderLoading() : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                            {assignedAwards.map((award) => (
                                <Card key={award.id} className="group overflow-hidden card-hover bg-card border-border">
                                   <Link href={`/podcasts/${award.target_slug}`}>
                                    <CardHeader className="p-0 relative">
                                        <div className="aspect-video">
                                            <Image
                                                src={award.target_cover_image_url || 'https://placehold.co/400x225.png'}
                                                alt={award.target_name}
                                                width={400}
                                                height={225}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                        </div>
                                        <div className="absolute bottom-4 left-4 text-white space-y-1">
                                             <h2 className="text-xl font-bold text-shadow">{award.target_name}</h2>
                                        </div>
                                         <div className="absolute top-4 right-4" dangerouslySetInnerHTML={{ __html: award.award_icon_svg }}>
                                        </div>
                                    </CardHeader>
                                   </Link>
                                    <CardContent className="p-6 space-y-4">
                                        <div>
                                            <Badge variant="secondary" className="bg-primary/10 text-primary">{award.award_name}</Badge>
                                            <p className="text-sm text-muted-foreground mt-2">{award.award_description}</p>
                                        </div>
                                         <Button
                                            onClick={() => handleShare(award)}
                                            disabled={sharing === award.id}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            {sharing === award.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                                            Share Award
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                             {assignedAwards.length === 0 && (
                                <div className="text-center py-16 col-span-full">
                                    <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <h3 className="text-lg font-semibold">No Awards Yet</h3>
                                    <p className="text-muted-foreground">Check back soon for our first round of winners!</p>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="nominations">
                    {loading ? renderLoading() : (
                        <div className="space-y-8 mt-6">
                            {polls.map((poll) => {
                                const userVotedFor = userVotes[poll.id];
                                const hasVoted = !!userVotedFor;
                                const totalVotes = poll.nominated_podcasts.reduce((acc: number, nominee: any) => acc + (nominee.votes[0]?.count || 0), 0);
                                
                                return (
                                    <Card key={poll.id} className="bg-card border-border">
                                        <CardHeader>
                                            <CardTitle>{poll.title}</CardTitle>
                                            <CardDescription>
                                                <span className="block mt-2 text-xs text-red-400">
                                                    Deadline: {new Date(poll.deadline).toLocaleString()}
                                                </span>
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {poll.nominated_podcasts.map((nominee: any) => {
                                                const voteCount = nominee.votes[0]?.count || 0;
                                                const percentage = totalVotes > 0 && hasVoted ? (voteCount / totalVotes) * 100 : 0;
                                                const isVotedFor = userVotedFor === nominee.id;
                                                const isVotingForThis = isPending && votingFor === nominee.id;

                                                return (
                                                    <div key={nominee.id}>
                                                        <div className="flex items-center gap-4 p-3 rounded-lg transition-all"
                                                             style={{ background: isVotedFor ? 'hsl(var(--primary) / 0.1)' : 'transparent' }}>
                                                            <Image src={nominee.podcasts.cover_image_url} alt={nominee.podcasts.title} width={64} height={64} className="w-16 h-16 rounded-md object-cover" />
                                                            <div className="flex-1 space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <h4 className="font-semibold">{nominee.podcasts.title}</h4>
                                                                    <Link href={`/podcasts/${nominee.podcasts.slug}`} passHref>
                                                                        <Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4"/></Button>
                                                                    </Link>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {hasVoted ? `${voteCount} votes` : 'Cast your vote!'}
                                                                </p>
                                                            </div>
                                                            <Button 
                                                                onClick={() => handleVote(poll.id, nominee.id)}
                                                                disabled={isPending || hasVoted}
                                                                variant={isVotedFor ? "success" : "outline"}
                                                                className="w-24"
                                                            >
                                                                {isVotingForThis ? <Loader2 className="h-4 w-4 animate-spin" /> : isVotedFor ? <Check/> : 'Vote'}
                                                            </Button>
                                                        </div>
                                                        {hasVoted && (
                                                            <div className="mt-1 px-3">
                                                                <Progress value={percentage} className="h-2" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            {polls.length === 0 && (
                                <div className="text-center py-16 col-span-full">
                                    <Vote className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <h3 className="text-lg font-semibold">No Nominations Currently Open</h3>
                                    <p className="text-muted-foreground">Nominations for the next awards will be announced soon.</p>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

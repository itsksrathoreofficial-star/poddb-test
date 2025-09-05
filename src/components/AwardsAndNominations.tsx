"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Share2, Loader2, Trophy, Vote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toastErrorWithCopy, toast } from '@/components/ui/sonner';
import Image from 'next/image';
import Link from 'next/link';
import { generateSocialPost } from '@/ai/flows/generate-social-post';

interface Award {
    id: string;
    name: string;
    description: string;
    icon_svg: string;
    assigned_at: string;
}

interface Nomination {
    id: string;
    category_name: string;
    year: number;
    votes_count: number;
}

interface AwardsAndNominationsProps {
    targetId: string;
    targetType: 'podcast' | 'person';
    targetName: string;
    targetImageUrl: string;
}

export function AwardsAndNominations({ targetId, targetType, targetName, targetImageUrl }: AwardsAndNominationsProps) {
    const [awards, setAwards] = useState<Award[]>([]);
    const [nominations, setNominations] = useState<Nomination[]>([]);
    const [loading, setLoading] = useState(true);
    const [sharing, setSharing] = useState<string | null>(null);

    useEffect(() => {
        const fetchAwards = async () => {
            const { data, error } = await supabase.rpc('get_awards_for_target', { target_id: targetId } as any);
            if (error) {
                console.error('Error fetching awards:', error);
                return;
            };
            setAwards((data as unknown as Award[]) || []);
        };

        const fetchNominations = async () => {
            const { data, error } = await supabase
                .from('nomination_polls')
                .select(`
                    title,
                    created_at,
                    nominated_podcasts!inner (
                        id,
                        podcast_id,
                        podcasts (slug, title, cover_image_url),
                        votes (count)
                    )
                `)
                .eq('status', 'open')
                .eq('nominated_podcasts.podcast_id', targetId);

            if (error) {
                console.error('Error fetching nominations:', error);
                return;
            }

            const filteredNominations = data?.map((poll: any) => ({
                id: poll.nominated_podcasts[0].id,
                category_name: poll.title,
                year: poll.created_at ? new Date(poll.created_at).getFullYear() : new Date().getFullYear(),
                votes_count: poll.nominated_podcasts[0].votes[0]?.count || 0,
            })) || [];

            setNominations(filteredNominations);
        };

        const fetchData = async () => {
            try {
                setLoading(true);
                await Promise.all([fetchAwards(), fetchNominations()]);
            } catch (error: any) {
                toastErrorWithCopy("Failed to fetch awards and nominations", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [targetId]);

    const handleShare = async (item: Award | Nomination) => {
        setSharing(item.id);
        try {
            const isAward = 'name' in item;
            const title = isAward ? item.name : `Nominated for ${item.category_name}`;
            
            const result = await generateSocialPost({
                podcastName: targetName,
                awardTitle: title,
                podcastImageUrl: targetImageUrl
            });

            window.open(result.socialPostImageUrl, '_blank');
            toast.success("Social post image generated!");

        } catch (error: any) {
            toastErrorWithCopy("Failed to generate social post", error.message);
        } finally {
            setSharing(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (awards.length === 0 && nominations.length === 0) {
        return null;
    }

    return (
        <div className="space-y-8">
            {(awards.length > 0) && (
                <Card>
                    <CardHeader>
                        <h2 className="text-2xl font-bold tracking-tight flex items-center">
                            <Trophy className="mr-3 h-6 w-6 text-primary" /> Awards
                        </h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {awards.map((award) => (
                            <Card key={award.id} className="bg-card border-border">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div dangerouslySetInnerHTML={{ __html: award.icon_svg }} className="h-10 w-10" />
                                    <Badge variant="secondary">{new Date(award.assigned_at).getFullYear()}</Badge>
                                </CardHeader>
                                <CardContent>
                                    <h4 className="font-semibold">{award.name}</h4>
                                    <p className="text-sm text-muted-foreground mt-1 mb-4">{award.description}</p>
                                    <Button
                                        onClick={() => handleShare(award)}
                                        disabled={sharing === award.id}
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                    >
                                        {sharing === award.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                                        Share
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            )}

            {(nominations.length > 0) && (
                <Card>
                    <CardHeader>
                        <h2 className="text-2xl font-bold tracking-tight flex items-center">
                            <Vote className="mr-3 h-6 w-6 text-primary" /> Nominations
                        </h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {nominations.map((nom) => (
                            <Card key={nom.id} className="bg-card border-border">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <h4 className="font-semibold">{nom.category_name}</h4>
                                    <Badge>{nom.year}</Badge>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">Total Votes: {nom.votes_count}</p>
                                    <div className="flex items-center justify-between gap-2">
                                        <Button asChild className="w-full">
                                            <Link href={`/awards/vote?category=${nom.category_name}&nominee=${nom.id}`}>
                                                <Vote className="mr-2 h-4 w-4" /> Vote Now
                                            </Link>
                                        </Button>
                                        <Button
                                            onClick={() => handleShare(nom)}
                                            disabled={sharing === nom.id}
                                            variant="outline"
                                            size="icon"
                                        >
                                            {sharing === nom.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

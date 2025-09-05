
'use client';
import React, { useState, useEffect, useTransition } from 'react';
import { default as Image } from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast, toastErrorWithCopy } from '@/components/ui/sonner';
import { Vote, Plus, Loader2, X, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { createNominationPollAction } from '@/app/actions/nominations';
import { deleteNominationPollAction, addManualVoteAction } from '@/app/actions/admin';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
// import type { Tables } from '@/integrations/supabase/types';

// DEV. NOTE: This component fetches data from the 'nomination_polls', 'nominated_podcasts', and 'votes' tables
// client-side. Ensure that the 'authenticated' role has the necessary permissions on these
// tables in Supabase.
//
// -- Grant permissions for the 'authenticated' role on the nomination-related tables
// GRANT SELECT, INSERT ON TABLE public.nomination_polls TO authenticated;
// GRANT SELECT ON TABLE public.nominated_podcasts TO authenticated;
// GRANT SELECT ON TABLE public.votes TO authenticated;
// CREATE POLICY "Allow authenticated users to create polls" ON public.nomination_polls FOR INSERT WITH CHECK (auth.role() = 'authenticated');

interface NominationsTabProps {
  user: any;
}

type PodcastForNomination = {
  id: string;
  title: string;
  cover_image_url: string | null;
};

type NominatedPodcast = {
  id: string;
  podcasts: PodcastForNomination;
  votes: { count: number }[];
};

type NominationPoll = {
  id: string;
  title: string;
  description: string | null;
  deadline: string;
  created_at: string;
  created_by: string | null;
  status: string;
  winner_podcast_id: string | null;
  nominated_podcasts: NominatedPodcast[];
};

export default function NominationsTab({ user }: NominationsTabProps) {
  const [isPending, startTransition] = useTransition();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [allPodcasts, setAllPodcasts] = useState<PodcastForNomination[]>([]);
  const [nominatedPodcasts, setNominatedPodcasts] = useState<PodcastForNomination[]>([]);
  const [polls, setPolls] = useState<NominationPoll[]>([]);
  
  useEffect(() => {
    fetchPodcasts();
    fetchPolls();
  }, []);

  const fetchPodcasts = async () => {
    const { data, error } = await supabase
      .from('podcasts')
      .select('id, title, cover_image_url')
      .eq('submission_status', 'approved')
      .order('title', { ascending: true });
    if (error) toastErrorWithCopy("Failed to fetch podcasts", error.message);
    else setAllPodcasts(data);
  };
  
  const fetchPolls = async () => {
    const { data, error } = await supabase
      .from('nomination_polls')
      .select(`
        *,
        nominated_podcasts (
          id,
          podcasts (id, title, cover_image_url),
          votes:votes (count)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) toastErrorWithCopy("Failed to fetch polls", error.message);
    else setPolls(data as any);
  };

  const handleAddNominee = (podcastId: string) => {
    const podcast = allPodcasts.find(p => p.id === podcastId);
    if (podcast && nominatedPodcasts.length < 10 && !nominatedPodcasts.some(p => p.id === podcastId)) {
      setNominatedPodcasts([...nominatedPodcasts, podcast]);
    } else if (nominatedPodcasts.length >= 10) {
        toast.warning("You can only nominate up to 10 podcasts.");
    }
  };

  const handleRemoveNominee = (podcastId: string) => {
    setNominatedPodcasts(nominatedPodcasts.filter(p => p.id !== podcastId));
  };
  
  const handleCreatePoll = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    nominatedPodcasts.forEach(p => formData.append('nominated_podcast_ids', p.id));
    formData.append('created_by_id', user.id);

    startTransition(async () => {
        const result = await createNominationPollAction(formData);
        if (result.success) {
            toast.success("Nomination poll created successfully!");
            setShowCreateForm(false);
            setNominatedPodcasts([]);
            fetchPolls();
        } else {
            toastErrorWithCopy("Failed to create poll", result.error);
        }
    });
  }

  const getTotalVotes = (poll: NominationPoll) => {
      return poll.nominated_podcasts.reduce((total: number, nominee: NominatedPodcast) => total + (nominee.votes[0]?.count || 0), 0);
  }

  const handleDeletePoll = (pollId: string) => {
    if (!confirm('Are you sure you want to delete this poll? This cannot be undone.')) return;
    startTransition(async () => {
        const result = await deleteNominationPollAction(pollId);
        if (result.success) {
            toast.success("Poll deleted successfully!");
            fetchPolls();
        } else {
            toastErrorWithCopy("Failed to delete poll", result.error);
        }
    });
  }

  const handleAddManualVotes = (pollId: string, nominatedPodcastId: string, votesToAdd: number) => {
    if (votesToAdd <= 0) {
        toast.warning("Please enter a positive number of votes.");
        return;
    }
    startTransition(async () => {
        const result = await addManualVoteAction(pollId, nominatedPodcastId, votesToAdd, user.id);
        if (result.success) {
            toast.success(`${votesToAdd} votes added successfully!`);
            fetchPolls();
        } else {
            toastErrorWithCopy("Failed to add votes", result.error);
        }
    });
  }

  const activePolls = polls.filter(p => new Date(p.deadline) >= new Date());
  const expiredPolls = polls.filter(p => new Date(p.deadline) < new Date());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2"><Vote /> Manage Nominations & Polls</CardTitle>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="mr-2" /> {showCreateForm ? 'Cancel' : 'Create New Poll'}
            </Button>
          </div>
          <CardDescription>Create and monitor community voting polls for different awards.</CardDescription>
        </CardHeader>
        {showCreateForm && (
            <CardContent>
                <form onSubmit={handleCreatePoll} className="p-4 border rounded-lg space-y-6">
                    <h3 className="text-lg font-semibold">New Nomination Poll</h3>
                    <div className="space-y-2">
                        <Label htmlFor="poll-title">Poll Title</Label>
                        <Input id="poll-title" name="title" placeholder="e.g., Best Comedy Podcast 2024" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="poll-desc">Description</Label>
                        <Textarea id="poll-desc" name="description" placeholder="A short description of this poll." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="poll-deadline">Voting Deadline</Label>
                        <Input id="poll-deadline" name="deadline" type="datetime-local" required />
                    </div>
                    
                    <div className="space-y-4">
                        <Label>Nominated Podcasts ({nominatedPodcasts.length}/10)</Label>
                         <Select onValueChange={handleAddNominee}>
                            <SelectTrigger><SelectValue placeholder="Select a podcast to nominate..." /></SelectTrigger>
                            <SelectContent>
                                {allPodcasts.filter(p => !nominatedPodcasts.some(np => np.id === p.id)).map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="space-y-2">
                            {nominatedPodcasts.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-2 border rounded-md">
                                    <div className="flex items-center gap-2">
                                        <Image src={p.cover_image_url || '/placeholder.svg'} alt={p.title} width={32} height={32} className="w-8 h-8 rounded-sm object-cover" />
                                        <span>{p.title}</span>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveNominee(p.id)}><X className="h-4 w-4"/></Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button type="submit" disabled={isPending || nominatedPodcasts.length === 0}>
                        {isPending ? <Loader2 className="mr-2 animate-spin" /> : <Plus className="mr-2" />}
                        Create Poll
                    </Button>
                </form>
            </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Active Polls</CardTitle>
        </CardHeader>
        <CardContent>
            <PollsTable polls={activePolls} getTotalVotes={getTotalVotes} handleDeletePoll={handleDeletePoll} handleAddManualVotes={handleAddManualVotes} isPending={isPending} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Expired Polls</CardTitle>
        </CardHeader>
        <CardContent>
            <PollsTable polls={expiredPolls} getTotalVotes={getTotalVotes} handleDeletePoll={handleDeletePoll} handleAddManualVotes={handleAddManualVotes} isPending={isPending} />
        </CardContent>
      </Card>
    </div>
  );
}

function PollsTable({ polls, getTotalVotes, handleDeletePoll, handleAddManualVotes, isPending }: any) {
    const [votesToAdd, setVotesToAdd] = useState<{ [key: string]: number }>({});

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Poll Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Total Votes</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {polls.map((poll: NominationPoll) => {
                    const totalVotes = getTotalVotes(poll);
                    const isClosed = new Date(poll.deadline) < new Date();
                    return (
                        <React.Fragment key={poll.id}>
                        <TableRow>
                            <TableCell className="font-semibold">{poll.title}</TableCell>
                            <TableCell><Badge variant={isClosed ? 'secondary' : 'default'}>{isClosed ? 'Closed' : 'Open'}</Badge></TableCell>
                            <TableCell>{new Date(poll.deadline).toLocaleString()}</TableCell>
                            <TableCell>{totalVotes}</TableCell>
                            <TableCell>
                                <Button variant="destructive" size="sm" onClick={() => handleDeletePoll(poll.id)} disabled={isPending}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={5} className="p-0">
                                <div className="p-4 space-y-2">
                                {poll.nominated_podcasts.sort((a: NominatedPodcast, b: NominatedPodcast) => (b.votes[0]?.count || 0) - (a.votes[0]?.count || 0)).map((nominee: NominatedPodcast) => {
                                    const voteCount = nominee.votes[0]?.count || 0;
                                    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                                    return (
                                    <div key={nominee.id} className="text-sm space-y-2">
                                        <div className="flex justify-between mb-1">
                                            <span>{nominee.podcasts.title}</span>
                                            <span className="font-medium">{voteCount} votes ({percentage.toFixed(1)}%)</span>
                                        </div>
                                        <Progress value={percentage} />
                                        {!isClosed && (
                                            <div className="flex items-center gap-2">
                                                <Input 
                                                    type="number" 
                                                    placeholder="Votes to add" 
                                                    className="h-8 w-32"
                                                    value={votesToAdd[nominee.id] || ''}
                                                    onChange={(e) => setVotesToAdd({...votesToAdd, [nominee.id]: parseInt(e.target.value, 10)})}
                                                />
                                                <Button size="sm" onClick={() => handleAddManualVotes(poll.id, nominee.id, votesToAdd[nominee.id] || 0)} disabled={isPending}>Add Votes</Button>
                                            </div>
                                        )}
                                    </div>
                                )})}
                                </div>
                            </TableCell>
                        </TableRow>
                       </React.Fragment>
                    )
                })}
            </TableBody>
        </Table>
    )
}

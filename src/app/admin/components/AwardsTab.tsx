
import React, { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast, toastErrorWithCopy } from '@/components/ui/sonner';
import { Award, Plus, Loader2, Save, Trash2, Edit, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { createAwardAction, assignAwardAction, deleteAwardAction, updateAwardAction, revokeAwardAction } from '@/app/actions/admin';
import type { Tables } from '@/integrations/supabase/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import NominationsTab from './NominationsTab';

// DEV. NOTE: This component fetches data from the 'awards' and 'assigned_awards' tables
// client-side. Ensure that the 'authenticated' role has SELECT permissions on these
// tables in Supabase.
//
// -- Grant select access to the 'authenticated' role on the 'awards' and 'assigned_awards' tables
// GRANT SELECT ON TABLE public.awards TO authenticated;
// GRANT SELECT ON TABLE public.assigned_awards TO authenticated;

interface AwardsTabProps {
    user: any;
}

type AwardType = Tables<'awards'>;
type AssignedAwardType = {
    id: string;
    award_name: string;
    target_name: string;
    target_table: string;
    assigned_at: string;
    assigned_by: string;
};
type PodcastForAward = {
    id: string;
    title: string;
    cover_image_url: string;
};

export default function AwardsTab({ user }: AwardsTabProps) {
    const [awards, setAwards] = useState<AwardType[]>([]);
    const [editingAward, setEditingAward] = useState<AwardType | null>(null);
    const [assignedAwards, setAssignedAwards] = useState<AssignedAwardType[]>([]);
    const [podcasts, setPodcasts] = useState<PodcastForAward[]>([]);
    const [isPending, startTransition] = useTransition();

    // Form state for creating a new award
    const [newAwardName, setNewAwardName] = useState('');
    const [newAwardDesc, setNewAwardDesc] = useState('');
    const [newAwardIcon, setNewAwardIcon] = useState('');

    // Form state for assigning an award
    const [selectedAwardId, setSelectedAwardId] = useState('');
    const [selectedPodcastId, setSelectedPodcastId] = useState('');

    useEffect(() => {
        fetchAwards();
        fetchAssignedAwards();
        fetchPodcastsForAward();
    }, []);

    const handleRevokeAward = (assignedAwardId: string) => {
        if (!confirm('Are you sure you want to revoke this award?')) return;

        startTransition(async () => {
            const result = await revokeAwardAction(assignedAwardId);
            if (result.success) {
                toast.success('Award revoked successfully!');
                fetchAssignedAwards();
            } else {
                toastErrorWithCopy('Failed to revoke award', result.error);
            }
        });
    };

    const handleUpdateAward = () => {
        if (!editingAward) return;

        startTransition(async () => {
            const result = await updateAwardAction(editingAward.id, {
                name: editingAward.name,
                description: editingAward.description,
                icon_svg: editingAward.icon_svg,
            });

            if (result.success) {
                toast.success('Award updated successfully!');
                setEditingAward(null);
                fetchAwards();
            } else {
                toastErrorWithCopy('Failed to update award', result.error);
            }
        });
    };

    const fetchAwards = async () => {
        const { data, error } = await supabase.from('awards').select('*').order('created_at');
        if (error) toastErrorWithCopy('Failed to fetch awards', error.message);
        else setAwards(data);
    };

    const fetchAssignedAwards = async () => {
        const { data, error } = await (supabase.rpc as any)('get_assigned_awards_details');
        if (error) toastErrorWithCopy('Failed to fetch assigned awards', error.message);
        else setAssignedAwards(data || []);
    };
    
    const fetchPodcastsForAward = async () => {
        const { data, error } = await (supabase.rpc as any)('get_podcast_for_award_assignment');
        if (error) toastErrorWithCopy('Failed to fetch podcasts', error.message);
        else setPodcasts(data || []);
    }

    const handleCreateAward = () => {
        if (!newAwardName.trim()) {
            toast.warning('Award name is required.');
            return;
        }
        startTransition(async () => {
            const result = await createAwardAction({
                name: newAwardName,
                description: newAwardDesc,
                icon_svg: newAwardIcon,
            });
            if (result.success) {
                toast.success('Award created successfully!');
                setNewAwardName('');
                setNewAwardDesc('');
                setNewAwardIcon('');
                fetchAwards();
            } else {
                toastErrorWithCopy('Failed to create award', result.error);
            }
        });
    };

    const handleDeleteAward = (awardId: string) => {
        if (!confirm('Are you sure you want to delete this award? This cannot be undone.')) return;
        startTransition(async () => {
            const result = await deleteAwardAction(awardId);
            if (result.success) {
                toast.success('Award deleted successfully!');
                fetchAwards();
                fetchAssignedAwards();
            } else {
                toastErrorWithCopy('Failed to delete award', result.error);
            }
        });
    };

    const handleAssignAward = () => {
        if (!selectedAwardId || !selectedPodcastId) {
            toast.warning('Please select both an award and a podcast.');
            return;
        }
        startTransition(async () => {
            const result = await assignAwardAction({
                award_id: selectedAwardId,
                target_id: selectedPodcastId,
                target_table: 'podcasts', // For now, only podcasts
                assigned_by: user.id,
            });
             if (result.success) {
                toast.success('Award assigned successfully!');
                setSelectedAwardId('');
                setSelectedPodcastId('');
                fetchAssignedAwards();
            } else {
                toastErrorWithCopy('Failed to assign award', result.error);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Award /> Manage Awards</CardTitle>
                        <CardDescription>Create new awards and view existing ones.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 border rounded-lg space-y-4">
                            <h3 className="font-semibold">Create New Award</h3>
                            <div className="space-y-2">
                                <Label htmlFor="award-name">Award Name</Label>
                                <Input id="award-name" placeholder="e.g., 'Rising Podcaster of India'" value={newAwardName} onChange={(e) => setNewAwardName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="award-desc">Description</Label>
                                <Textarea id="award-desc" placeholder="A short description of what this award represents." value={newAwardDesc} onChange={(e) => setNewAwardDesc(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="award-icon">Icon (SVG)</Label>
                                <Textarea id="award-icon" placeholder="Paste SVG code for the award icon." value={newAwardIcon} onChange={(e) => setNewAwardIcon(e.target.value)} rows={3} />
                            </div>
                            <Button onClick={handleCreateAward} disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2"/>}
                                Create Award
                            </Button>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Existing Awards</h3>
                            <div className="space-y-2">
                                {awards.map(award => (
                                    <div key={award.id} className="flex items-center justify-between p-2 border rounded-md">
                                        <div className="flex items-center gap-2">
                                            {award.icon_svg && <div className="h-6 w-6" dangerouslySetInnerHTML={{ __html: award.icon_svg }} />}
                                            <span>{award.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => setEditingAward(award)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                            </Dialog>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteAward(award.id)} disabled={isPending}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Plus /> Assign Awards</CardTitle>
                        <CardDescription>Assign awards to podcasts, episodes, or people.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="p-4 border rounded-lg space-y-4">
                            <h3 className="font-semibold">Assign an Award</h3>
                            <div className="space-y-2">
                                <Label>Select Podcast</Label>
                                <Select value={selectedPodcastId} onValueChange={setSelectedPodcastId}>
                                    <SelectTrigger><SelectValue placeholder="Choose a podcast..." /></SelectTrigger>
                                    <SelectContent>
                                        {podcasts.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Select Award</Label>
                                <Select value={selectedAwardId} onValueChange={setSelectedAwardId}>
                                    <SelectTrigger><SelectValue placeholder="Choose an award..." /></SelectTrigger>
                                    <SelectContent>
                                        {awards.map(award => (
                                            <SelectItem key={award.id} value={award.id}>{award.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <Button onClick={handleAssignAward} disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 animate-spin"/> : <Award className="mr-2"/>}
                                Assign Award
                            </Button>
                        </div>
                        <div>
                             <h3 className="font-semibold mb-2">Recently Assigned Awards</h3>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Podcast</TableHead>
                                        <TableHead>Award</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignedAwards.map(aa => (
                                        <TableRow key={aa.id}>
                                            <TableCell>{aa.target_name}</TableCell>
                                            <TableCell><Badge variant="secondary">{aa.award_name}</Badge></TableCell>
                                            <TableCell>{new Date(aa.assigned_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Button variant="destructive" size="sm" onClick={() => handleRevokeAward(aa.id)} disabled={isPending}>
                                                    <X className="h-4 w-4 mr-1" /> Revoke
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                             </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {editingAward && (
                <Dialog open={!!editingAward} onOpenChange={(isOpen) => !isOpen && setEditingAward(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Award</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-award-name">Award Name</Label>
                                <Input id="edit-award-name" value={editingAward.name} onChange={(e) => setEditingAward({ ...editingAward, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-award-desc">Description</Label>
                                <Textarea id="edit-award-desc" value={editingAward.description || ''} onChange={(e) => setEditingAward({ ...editingAward, description: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-award-icon">Icon (SVG)</Label>
                                <Textarea id="edit-award-icon" value={editingAward.icon_svg || ''} onChange={(e) => setEditingAward({ ...editingAward, icon_svg: e.target.value })} rows={3} />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleUpdateAward} disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Nominations Section */}
            <NominationsTab user={user} />
        </div>
    );
}

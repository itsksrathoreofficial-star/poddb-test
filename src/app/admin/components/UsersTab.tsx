
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UsersTabProps {
    users: any[];
    fetchUsers: () => void;
}

export default function UsersTab({ users, fetchUsers }: UsersTabProps) {
    return (
        <Card>
            <CardHeader><CardTitle>Manage Users</CardTitle></CardHeader>
            <CardContent>
               <Table>
                   <TableHeader><TableRow><TableHead>Display Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                   <TableBody>
                       {users.map(u => (
                           <TableRow key={u.id}>
                               <TableCell className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarImage src={u.avatar_url} /><AvatarFallback>{u.display_name?.charAt(0)}</AvatarFallback></Avatar> {u.display_name}</TableCell>
                               <TableCell>{u.email}</TableCell>
                               <TableCell>
                                 <Select defaultValue={u.role || 'user'} onValueChange={async (role) => {
                                                                           const { error } = await (supabase as any).from('profiles').update({ role } as any).eq('id', u.id);
                                     if(error) toast.error(error.message); else { toast.success("Role updated"); fetchUsers();}
                                 }}>
                                     <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                                     <SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                                 </Select>
                               </TableCell>
                               <TableCell><Button variant="outline" size="sm">Edit</Button></TableCell>
                           </TableRow>
                       ))}
                   </TableBody>
               </Table>
            </CardContent>
        </Card>
    );
}

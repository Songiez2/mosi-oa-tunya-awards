import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { listProfiles, updateUserRole, suspendUser, deleteUser } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, ChevronLeft, ChevronRight, Loader2, Shield, Ban, Trash2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { Profile, UserRole } from '@/types/types';

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const r = await listProfiles(page, PAGE_SIZE, search);
    setUsers(r.data);
    setTotal(r.total);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleRole = async (id: string, role: UserRole) => {
    await updateUserRole(id, role);
    toast.success('Role updated');
    load();
  };

  const handleSuspend = async (u: Profile) => {
    await suspendUser(u.id, !u.is_suspended);
    toast.success(u.is_suspended ? 'User unsuspended' : 'User suspended');
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteUser(deleteTarget.id);
    toast.success('User deleted');
    setDeleteTarget(null);
    load();
  };

  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg font-black text-gradient-gold">Users</h1>
            <p className="text-xs text-muted-foreground">{total} total users</p>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input className="pl-8 h-8 text-sm w-56 bg-input border-border" placeholder="Search users..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                  {['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap font-medium text-sm">{u.full_name}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{u.phone ?? '—'}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Select value={u.role} onValueChange={(v) => handleRole(u.id, v as UserRole)}>
                        <SelectTrigger className="h-7 text-xs w-28 bg-input border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Badge className={`text-[10px] ${u.is_suspended ? 'bg-destructive/10 text-destructive border-destructive/30' : 'bg-success/10 text-success border-success/30'}`}>
                        {u.is_suspended ? 'Suspended' : 'Active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleSuspend(u)} title={u.is_suspended ? 'Unsuspend' : 'Suspend'}>
                          {u.is_suspended ? <UserCheck className="w-3.5 h-3.5 text-success" /> : <Ban className="w-3.5 h-3.5 text-warning" />}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDeleteTarget(u)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-xs text-muted-foreground">Page {page} of {pages}</span>
            <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>Delete "{deleteTarget?.full_name}"? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

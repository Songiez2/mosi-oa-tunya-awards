import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getVotes, deleteVote } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, ChevronLeft, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Vote } from '@/types/types';

export default function AdminVotes() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Vote | null>(null);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const r = await getVotes(page, PAGE_SIZE);
    setVotes(r.data);
    setTotal(r.total);
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteVote(deleteTarget.id);
    toast.success('Vote deleted');
    setDeleteTarget(null);
    load();
  };

  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-gradient-gold">Votes</h1>
            <p className="text-xs text-muted-foreground">{total.toLocaleString()} total votes</p>
          </div>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                  {['Voter', 'Nominee', 'Category', 'Votes', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : votes.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">No votes found</td></tr>
                ) : votes.map(v => (
                  <tr key={v.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm">{(v.profiles as { full_name?: string } | null)?.full_name ?? '—'}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium">{(v.nominees as { full_name?: string } | null)?.full_name ?? '—'}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{(v.categories as { name?: string } | null)?.name ?? '—'}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm font-bold text-primary">{v.votes_count}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDeleteTarget(v)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
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
          <AlertDialogHeader><AlertDialogTitle>Delete Vote</AlertDialogTitle>
            <AlertDialogDescription>Delete this vote record? The nominee's vote count will not be automatically adjusted.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

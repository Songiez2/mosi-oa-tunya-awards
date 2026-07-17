import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getPayments, approvePayment, rejectPayment } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle, XCircle, Smartphone, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import type { Payment, Status } from '@/types/types';
import { useSettings } from '@/contexts/SettingsContext';

export default function AdminPayments() {
  const { settings } = useSettings();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<Payment | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [viewMetadata, setViewMetadata] = useState<Payment | null>(null);
  const PAGE_SIZE = 20;
  const currency = settings.currency ?? 'K';

  const load = useCallback(async () => {
    setLoading(true);
    const r = await getPayments(page, PAGE_SIZE, '', statusFilter === 'all' ? undefined : statusFilter, typeFilter === 'all' ? undefined : typeFilter);
    setPayments(r.data);
    setTotal(r.total);
    setLoading(false);
  }, [page, statusFilter, typeFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => {
    try {
      await approvePayment(id);
      toast.success('Payment approved — votes updated');
      load();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    await rejectPayment(rejectTarget.id, rejectNote);
    toast.success('Payment rejected');
    setRejectTarget(null);
    setRejectNote('');
    load();
  };

  const pages = Math.ceil(total / PAGE_SIZE);
  const totalApproved = payments.filter(p => p.status === 'approved').reduce((s, p) => s + p.amount, 0);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h1 className="text-lg font-black text-gradient-gold">Payments</h1>
            <p className="text-xs text-muted-foreground">{total} payments · Approved: {currency}{totalApproved.toLocaleString()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as Status | 'all'); setPage(1); }}>
              <SelectTrigger className="h-8 w-32 text-xs bg-input border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="h-8 w-36 text-xs bg-input border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="registration">Registration</SelectItem>
                <SelectItem value="voting">Voting</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                  {['Ref', 'User', 'Type', 'Amount', 'Votes', 'Phone', 'Status', 'Date', 'Lipila', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-10 text-muted-foreground text-sm">No payments found</td></tr>
                ) : payments.map(p => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap text-[10px] text-muted-foreground font-mono">{p.transaction_ref.slice(0, 12)}…</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm">{(p.profiles as { full_name?: string } | null)?.full_name ?? '—'}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs capitalize">{p.payment_type}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm font-bold text-primary">{currency}{p.amount.toLocaleString()}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs">{p.votes_count ?? '—'}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs">{p.phone ? <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" />{p.phone}</span> : '—'}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {p.lipila_reference ? (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setViewMetadata(p)} title="View Lipila details">
                          <FileJson className="w-3.5 h-3.5 text-primary" />
                        </Button>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {p.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleApprove(p.id)} title="Approve">
                              <CheckCircle className="w-3.5 h-3.5 text-success" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setRejectTarget(p); setRejectNote(''); }} title="Reject">
                              <XCircle className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </>
                        )}
                        {p.notes && <span className="text-[10px] text-muted-foreground max-w-[80px] truncate">{p.notes}</span>}
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

      {/* Reject Dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>Reject Payment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Amount: {currency}{rejectTarget?.amount.toLocaleString()}</p>
            <input className="w-full h-9 px-3 rounded-lg bg-input border border-border text-sm" placeholder="Reason (optional)" value={rejectNote} onChange={e => setRejectNote(e.target.value)} />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setRejectTarget(null)}>Cancel</Button>
              <Button className="bg-destructive text-destructive-foreground" onClick={handleReject}>Reject</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lipila Metadata Dialog */}
      <Dialog open={!!viewMetadata} onOpenChange={() => setViewMetadata(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>Lipila Transaction Details</DialogTitle></DialogHeader>
          {viewMetadata && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Reference:</div>
                <div className="font-mono text-xs">{viewMetadata.lipila_reference || '—'}</div>
                <div className="text-muted-foreground">Transaction ID:</div>
                <div className="font-mono text-xs">{viewMetadata.transaction_id || '—'}</div>
                <div className="text-muted-foreground">Payment Method:</div>
                <div>{viewMetadata.payment_method || '—'}</div>
                <div className="text-muted-foreground">Phone:</div>
                <div>{viewMetadata.phone || '—'}</div>
                <div className="text-muted-foreground">Currency:</div>
                <div>{viewMetadata.currency || '—'}</div>
              </div>
              {viewMetadata.metadata && (
                <div>
                  <div className="text-sm font-semibold mb-2">Full Metadata:</div>
                  <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-48">
                    {JSON.stringify(viewMetadata.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

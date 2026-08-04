import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getSponsorsAdmin, approveSponsor, rejectSponsor, deleteSponsor, featureSponsor, createSponsor } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle, XCircle, Trash2, Star, StarOff, Eye, Mail, Phone, MessageCircle, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Sponsor, Status } from '@/types/types';

const PACKAGES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
const EMPTY_SPONSOR = { company_name: '', rep_name: '', email: '', phone: '', website: '', address: '', package: '', description: '' };

export default function AdminSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Sponsor | null>(null);
  const [viewTarget, setViewTarget] = useState<Sponsor | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_SPONSOR });
  const [addSaving, setAddSaving] = useState(false);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const r = await getSponsorsAdmin(page, PAGE_SIZE, statusFilter === 'all' ? undefined : statusFilter);
    setSponsors(r.data);
    setTotal(r.total);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => { await approveSponsor(id); toast.success('Sponsor approved'); load(); };
  const handleReject = async (id: string) => { await rejectSponsor(id); toast.success('Sponsor rejected'); load(); };
  const handleFeature = async (s: Sponsor) => { await featureSponsor(s.id, !s.is_featured); toast.success(s.is_featured ? 'Unfeatured' : 'Featured'); load(); };
  const handleDelete = async () => { if (!deleteTarget) return; await deleteSponsor(deleteTarget.id); toast.success('Sponsor deleted'); setDeleteTarget(null); load(); };

  const handleAdd = async () => {
    if (!addForm.company_name) { toast.error('Company name is required'); return; }
    setAddSaving(true);
    try {
      await createSponsor({ ...addForm, status: 'approved', is_featured: false });
      toast.success('Sponsor added successfully');
      setAddOpen(false);
      setAddForm({ ...EMPTY_SPONSOR });
      load();
    } catch { toast.error('Failed to add sponsor'); }
    setAddSaving(false);
  };

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setAddForm(f => ({ ...f, [k]: e.target.value }));

  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-black text-gradient-gold">Sponsors</h1>
            <p className="text-xs text-muted-foreground">{total} applications</p>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as Status | 'all'); setPage(1); }}>
              <SelectTrigger className="h-8 w-32 text-xs bg-input border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="h-8 bg-gradient-gold text-primary-foreground text-xs font-bold" onClick={() => setAddOpen(true)}>
              <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Sponsor
            </Button>
          </div>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                  {['Company', 'Representative', 'Package', 'Contact', 'Status', 'Featured', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : sponsors.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No sponsors found</td></tr>
                ) : sponsors.map(s => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {s.logo_url ? <img src={s.logo_url} className="w-7 h-7 rounded object-contain bg-white/5" alt="" /> : <div className="w-7 h-7 rounded bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">{s.company_name[0]}</div>}
                        <span className="text-sm font-medium">{s.company_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{s.rep_name}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs capitalize">{s.package ?? '—'}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{s.email}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleFeature(s)}>
                        {s.is_featured ? <Star className="w-3.5 h-3.5 text-primary fill-primary" /> : <StarOff className="w-3.5 h-3.5 text-muted-foreground" />}
                      </Button>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setViewTarget(s)}><Eye className="w-3.5 h-3.5" /></Button>
                        {s.status !== 'approved' && <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleApprove(s.id)}><CheckCircle className="w-3.5 h-3.5 text-success" /></Button>}
                        {s.status !== 'rejected' && <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleReject(s.id)}><XCircle className="w-3.5 h-3.5 text-destructive" /></Button>}
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDeleteTarget(s)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
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

      {/* Add Sponsor Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-gradient-gold">Add Sponsor</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Company Name *</Label><Input className="bg-input border-border" value={addForm.company_name} onChange={sf('company_name')} placeholder="Company name" /></div>
              <div className="space-y-1.5"><Label>Representative Name</Label><Input className="bg-input border-border" value={addForm.rep_name} onChange={sf('rep_name')} placeholder="Contact person" /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" className="bg-input border-border" value={addForm.email} onChange={sf('email')} placeholder="email@company.com" /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input className="bg-input border-border" value={addForm.phone} onChange={sf('phone')} placeholder="0962 267 118" /></div>
              <div className="space-y-1.5"><Label>Website</Label><Input className="bg-input border-border" value={addForm.website} onChange={sf('website')} placeholder="https://..." /></div>
              <div className="space-y-1.5">
                <Label>Sponsorship Package</Label>
                <Select value={addForm.package} onValueChange={v => setAddForm(f => ({ ...f, package: v }))}>
                  <SelectTrigger className="bg-input border-border"><SelectValue placeholder="Select package" /></SelectTrigger>
                  <SelectContent>{PACKAGES.map(p => <SelectItem key={p} value={p.toLowerCase()}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2"><Label>Address</Label><Input className="bg-input border-border" value={addForm.address} onChange={sf('address')} placeholder="Company address" /></div>
            </div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea className="bg-input border-border resize-none min-h-16" value={addForm.description} onChange={sf('description')} placeholder="Brief description..." /></div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button className="bg-gradient-gold text-primary-foreground font-bold" onClick={handleAdd} disabled={addSaving}>
                {addSaving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-1.5" />} Add Sponsor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewTarget} onOpenChange={() => setViewTarget(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewTarget?.company_name}</DialogTitle></DialogHeader>
          {viewTarget && (
            <div className="space-y-3 text-sm">
              {viewTarget.banner_url && <img src={viewTarget.banner_url} className="w-full h-32 object-cover rounded-lg" alt="" />}
              {[['Rep', viewTarget.rep_name], ['Email', viewTarget.email], ['Phone', viewTarget.phone], ['Package', viewTarget.package], ['Website', viewTarget.website], ['Address', viewTarget.address], ['Description', viewTarget.description]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string}><span className="text-muted-foreground text-xs">{k}:</span> <span className="text-sm">{v}</span></div>
              ))}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                {viewTarget.email && (
                  <Button size="sm" variant="secondary" className="h-8 text-xs gap-1.5" asChild>
                    <a href={`mailto:${viewTarget.email}`} target="_blank" rel="noopener noreferrer"><Mail className="w-3.5 h-3.5" /> Email</a>
                  </Button>
                )}
                {viewTarget.phone && (
                  <Button size="sm" variant="secondary" className="h-8 text-xs gap-1.5" asChild>
                    <a href={`tel:${viewTarget.phone}`}><Phone className="w-3.5 h-3.5" /> Call</a>
                  </Button>
                )}
                {viewTarget.phone && (
                  <Button size="sm" className="h-8 text-xs gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white" asChild>
                    <a href={`https://wa.me/${viewTarget.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</a>
                  </Button>
                )}
                {viewTarget.status !== 'approved' && (
                  <Button size="sm" className="h-8 text-xs gap-1.5 bg-success text-success-foreground" onClick={() => { handleApprove(viewTarget.id); setViewTarget(null); }}>
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </Button>
                )}
                {viewTarget.status !== 'rejected' && (
                  <Button size="sm" variant="destructive" className="h-8 text-xs gap-1.5" onClick={() => { handleReject(viewTarget.id); setViewTarget(null); }}>
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader><AlertDialogTitle>Delete Sponsor</AlertDialogTitle>
            <AlertDialogDescription>Delete &ldquo;{deleteTarget?.company_name}&rdquo;?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

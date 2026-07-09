import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getPartnersAdmin, approvePartner, rejectPartner, deletePartner, createPartner } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle, XCircle, Trash2, Eye, Mail, Phone, MessageCircle, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Partner, Status } from '@/types/types';

const EMPTY_PARTNER = { org_name: '', rep_name: '', email: '', phone: '', website: '', address: '', description: '' };

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);
  const [viewTarget, setViewTarget] = useState<Partner | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_PARTNER });
  const [addSaving, setAddSaving] = useState(false);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const r = await getPartnersAdmin(page, PAGE_SIZE, statusFilter === 'all' ? undefined : statusFilter);
    setPartners(r.data);
    setTotal(r.total);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => { await approvePartner(id); toast.success('Partner approved'); load(); };
  const handleReject = async (id: string) => { await rejectPartner(id); toast.success('Partner rejected'); load(); };
  const handleDelete = async () => { if (!deleteTarget) return; await deletePartner(deleteTarget.id); toast.success('Deleted'); setDeleteTarget(null); load(); };

  const handleAdd = async () => {
    if (!addForm.org_name) { toast.error('Organization name is required'); return; }
    setAddSaving(true);
    try {
      await createPartner({ ...addForm, status: 'approved' });
      toast.success('Partner added successfully');
      setAddOpen(false);
      setAddForm({ ...EMPTY_PARTNER });
      load();
    } catch { toast.error('Failed to add partner'); }
    setAddSaving(false);
  };

  const pf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setAddForm(f => ({ ...f, [k]: e.target.value }));

  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-black text-gradient-gold">Partners</h1>
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
              <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Partner
            </Button>
          </div>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                  {['Organization', 'Representative', 'Email', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : partners.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">No partners found</td></tr>
                ) : partners.map(p => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {p.logo_url ? <img src={p.logo_url} className="w-7 h-7 rounded object-contain bg-white/5" alt="" /> : <div className="w-7 h-7 rounded bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">{p.org_name[0]}</div>}
                        <span className="text-sm font-medium">{p.org_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{p.rep_name}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{p.email}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setViewTarget(p)}><Eye className="w-3.5 h-3.5" /></Button>
                        {p.status !== 'approved' && <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleApprove(p.id)} title="Approve"><CheckCircle className="w-3.5 h-3.5 text-success" /></Button>}
                        {p.status !== 'rejected' && <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleReject(p.id)} title="Reject"><XCircle className="w-3.5 h-3.5 text-destructive" /></Button>}
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDeleteTarget(p)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
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

      {/* Add Partner Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-gradient-gold">Add Partner</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Organization Name *</Label><Input className="bg-input border-border" value={addForm.org_name} onChange={pf('org_name')} placeholder="Organization name" /></div>
              <div className="space-y-1.5"><Label>Representative Name</Label><Input className="bg-input border-border" value={addForm.rep_name} onChange={pf('rep_name')} placeholder="Contact person" /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" className="bg-input border-border" value={addForm.email} onChange={pf('email')} placeholder="email@org.com" /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input className="bg-input border-border" value={addForm.phone} onChange={pf('phone')} placeholder="0962 267 118" /></div>
              <div className="space-y-1.5"><Label>Website</Label><Input className="bg-input border-border" value={addForm.website} onChange={pf('website')} placeholder="https://..." /></div>
              <div className="space-y-1.5 md:col-span-1"><Label>Address</Label><Input className="bg-input border-border" value={addForm.address} onChange={pf('address')} placeholder="Organization address" /></div>
            </div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea className="bg-input border-border resize-none min-h-16" value={addForm.description} onChange={pf('description')} placeholder="Brief description of the organization..." /></div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button className="bg-gradient-gold text-primary-foreground font-bold" onClick={handleAdd} disabled={addSaving}>
                {addSaving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-1.5" />} Add Partner
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewTarget} onOpenChange={() => setViewTarget(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewTarget?.org_name}</DialogTitle></DialogHeader>
          {viewTarget && (
            <div className="space-y-3 text-sm">
              {[['Rep', viewTarget.rep_name], ['Email', viewTarget.email], ['Phone', viewTarget.phone], ['Website', viewTarget.website], ['Address', viewTarget.address], ['Description', viewTarget.description]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string}><span className="text-muted-foreground text-xs">{k}:</span> <span>{v}</span></div>
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
          <AlertDialogHeader><AlertDialogTitle>Delete Partner</AlertDialogTitle>
            <AlertDialogDescription>Delete &ldquo;{deleteTarget?.org_name}&rdquo;?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

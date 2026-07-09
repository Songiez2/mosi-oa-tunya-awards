import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getAllNomineesAdmin, approveNominee, rejectNominee, featureNominee, deleteNominee, getCategories, promoteNomineeAsWinner, adminAddNominee, uploadFile } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, ChevronLeft, ChevronRight, Loader2, CheckCircle, XCircle, Star, StarOff, Trash2, Eye, Trophy, PlusCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { Nominee, Category, Status } from '@/types/types';

const PROVINCES = ['Central','Copperbelt','Eastern','Luapula','Lusaka','Muchinga','Northern','North-Western','Southern','Western'];

const EMPTY_FORM = { full_name:'', stage_name:'', category_id:'', biography:'', phone:'', email:'', province:'', district:'', facebook:'', instagram:'', tiktok:'', youtube:'', website:'', whatsapp:'' };

export default function AdminNominees() {
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Nominee | null>(null);
  const [viewTarget, setViewTarget] = useState<Nominee | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Nominee | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM });
  const [addProfileFile, setAddProfileFile] = useState<File | null>(null);
  const [addSaving, setAddSaving] = useState(false);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const [r, cats] = await Promise.all([
      getAllNomineesAdmin(page, PAGE_SIZE, search, statusFilter === 'all' ? undefined : statusFilter, categoryFilter === 'all' ? undefined : categoryFilter),
      categories.length === 0 ? getCategories() : Promise.resolve(categories),
    ]);
    setNominees(r.data);
    setTotal(r.total);
    if (categories.length === 0) setCategories(cats);
    setLoading(false);
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => { await approveNominee(id); toast.success('Nominee approved'); load(); };
  const handleReject = async () => {
    if (!rejectTarget) return;
    await rejectNominee(rejectTarget.id, rejectReason);
    toast.success('Nominee rejected');
    setRejectTarget(null); setRejectReason('');
    load();
  };
  const handleFeature = async (n: Nominee) => { await featureNominee(n.id, !n.is_featured); toast.success(n.is_featured ? 'Unfeatured' : 'Featured'); load(); };
  const handleDelete = async () => { if (!deleteTarget) return; await deleteNominee(deleteTarget.id); toast.success('Nominee deleted'); setDeleteTarget(null); load(); };
  const handlePromote = async (n: Nominee) => {
    await promoteNomineeAsWinner(n.id, !n.is_winner);
    toast.success(n.is_winner ? 'Winner status removed' : '🏆 Promoted as Winner!');
    load();
  };

  const handleAddNominee = async () => {
    if (!addForm.full_name || !addForm.email || !addForm.category_id) {
      toast.error('Full name, email and category are required'); return;
    }
    setAddSaving(true);
    try {
      let profileUrl: string | null = null;
      if (addProfileFile) {
        profileUrl = await uploadFile('nominees', `profiles/${Date.now()}_${addProfileFile.name}`, addProfileFile);
      }
      const result = await adminAddNominee({ ...addForm, profile_picture_url: profileUrl ?? undefined });
      if (result) {
        toast.success('Nominee added successfully');
        setAddOpen(false);
        setAddForm({ ...EMPTY_FORM });
        setAddProfileFile(null);
        load();
      } else {
        toast.error('Failed to add nominee');
      }
    } catch { toast.error('Error adding nominee'); }
    setAddSaving(false);
  };

  const pages = Math.ceil(total / PAGE_SIZE);
  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setAddForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h1 className="text-lg font-black text-gradient-gold">Nominees</h1>
            <p className="text-xs text-muted-foreground">{total} total</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input className="pl-8 h-8 text-sm w-44 bg-input border-border" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as Status | 'all'); setPage(1); }}>
              <SelectTrigger className="h-8 w-32 text-xs bg-input border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger className="h-8 w-36 text-xs bg-input border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" className="h-8 bg-gradient-gold text-primary-foreground text-xs font-bold" onClick={() => setAddOpen(true)}>
              <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Nominee
            </Button>
          </div>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                  {['Nominee', 'Category', 'Email', 'Status', 'Votes', 'Winner', 'Featured', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : nominees.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-muted-foreground text-sm">No nominees found</td></tr>
                ) : nominees.map(n => (
                  <tr key={n.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20 shrink-0 flex items-center justify-center">
                          {n.profile_picture_url ? <img src={n.profile_picture_url} className="w-full h-full object-cover" alt="" /> : <span className="text-[10px] font-bold text-primary">{n.full_name[0]}</span>}
                        </div>
                        <div>
                          <div className="text-sm font-medium flex items-center gap-1">
                            {n.full_name}
                            {n.is_winner && <Trophy className="w-3 h-3 text-primary fill-primary" />}
                          </div>
                          {n.stage_name && <div className="text-[10px] text-muted-foreground">{n.stage_name}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{(n.categories as { name?: string } | null)?.name ?? '—'}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{n.email}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap"><StatusBadge status={n.status} /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm font-bold text-primary">{n.vote_count.toLocaleString()}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Button
                        variant="ghost" size="sm" className="h-7 w-7 p-0"
                        onClick={() => handlePromote(n)}
                        title={n.is_winner ? 'Remove winner status' : 'Promote as winner'}
                        disabled={n.status !== 'approved'}
                      >
                        <Trophy className={`w-3.5 h-3.5 ${n.is_winner ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                      </Button>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleFeature(n)}>
                        {n.is_featured ? <Star className="w-3.5 h-3.5 text-primary fill-primary" /> : <StarOff className="w-3.5 h-3.5 text-muted-foreground" />}
                      </Button>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setViewTarget(n)} title="View"><Eye className="w-3.5 h-3.5" /></Button>
                        {n.status !== 'approved' && <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleApprove(n.id)} title="Approve"><CheckCircle className="w-3.5 h-3.5 text-success" /></Button>}
                        {n.status !== 'rejected' && <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setRejectTarget(n); setRejectReason(''); }} title="Reject"><XCircle className="w-3.5 h-3.5 text-destructive" /></Button>}
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDeleteTarget(n)} title="Delete"><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
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

      {/* Add Nominee Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-gradient-gold">Add Nominee</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Full Name *</Label><Input className="bg-input border-border" value={addForm.full_name} onChange={setF('full_name')} placeholder="Full name" /></div>
              <div className="space-y-1.5"><Label>Stage Name</Label><Input className="bg-input border-border" value={addForm.stage_name} onChange={setF('stage_name')} placeholder="Stage name" /></div>
              <div className="space-y-1.5"><Label>Email *</Label><Input type="email" className="bg-input border-border" value={addForm.email} onChange={setF('email')} placeholder="Email" /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input className="bg-input border-border" value={addForm.phone} onChange={setF('phone')} placeholder="Phone" /></div>
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={addForm.category_id} onValueChange={v => setAddForm(f => ({ ...f, category_id: v }))}>
                  <SelectTrigger className="bg-input border-border"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Province</Label>
                <Select value={addForm.province} onValueChange={v => setAddForm(f => ({ ...f, province: v }))}>
                  <SelectTrigger className="bg-input border-border"><SelectValue placeholder="Province" /></SelectTrigger>
                  <SelectContent>{PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>District</Label><Input className="bg-input border-border" value={addForm.district} onChange={setF('district')} placeholder="District" /></div>
            </div>
            <div className="space-y-1.5"><Label>Biography</Label><Textarea className="bg-input border-border resize-none min-h-16" value={addForm.biography} onChange={setF('biography')} placeholder="Short biography..." /></div>
            <div className="space-y-1.5">
              <Label>Profile Picture</Label>
              <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-primary/30 cursor-pointer hover:border-primary/60 transition-colors">
                <Upload className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{addProfileFile ? addProfileFile.name : 'Click to upload photo'}</span>
                <input type="file" className="hidden" accept="image/*" onChange={e => setAddProfileFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button className="bg-gradient-gold text-primary-foreground font-bold" onClick={handleAddNominee} disabled={addSaving}>
                {addSaving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-1.5" />} Add Nominee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewTarget} onOpenChange={() => setViewTarget(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewTarget?.full_name}
              {viewTarget?.is_winner && <Trophy className="w-4 h-4 text-primary fill-primary" />}
            </DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-2 text-sm">
              {viewTarget.profile_picture_url && <img src={viewTarget.profile_picture_url} className="w-full h-40 object-cover rounded-lg" alt="" />}
              {[['Stage Name', viewTarget.stage_name], ['Email', viewTarget.email], ['Phone', viewTarget.phone], ['Province', viewTarget.province], ['District', viewTarget.district], ['Biography', viewTarget.biography]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string}><span className="text-muted-foreground text-xs">{k}:</span> <span>{v}</span></div>
              ))}
              {viewTarget.payment_proof_url && (
                <div><span className="text-muted-foreground text-xs">Payment Proof:</span>
                  <a href={viewTarget.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs ml-1 hover:underline">View Proof</a>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {viewTarget.status !== 'approved' && (
                  <Button size="sm" className="bg-success text-success-foreground" onClick={() => { handleApprove(viewTarget.id); setViewTarget(null); }}>
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                )}
                {viewTarget.status !== 'rejected' && (
                  <Button size="sm" variant="destructive" onClick={() => { setRejectTarget(viewTarget); setViewTarget(null); }}>
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                )}
                {viewTarget.status === 'approved' && (
                  <Button size="sm" className={viewTarget.is_winner ? 'bg-muted text-foreground' : 'bg-gradient-gold text-primary-foreground'} onClick={() => { handlePromote(viewTarget); setViewTarget(null); }}>
                    <Trophy className="w-3.5 h-3.5 mr-1" /> {viewTarget.is_winner ? 'Remove Winner' : 'Promote as Winner'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>Reject Nominee</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Rejecting &ldquo;{rejectTarget?.full_name}&rdquo;</p>
            <Input className="bg-input border-border" placeholder="Reason (optional)" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setRejectTarget(null)}>Cancel</Button>
              <Button className="bg-destructive text-destructive-foreground" onClick={handleReject}>Reject</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader><AlertDialogTitle>Delete Nominee</AlertDialogTitle>
            <AlertDialogDescription>Delete &ldquo;{deleteTarget?.full_name}&rdquo;? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

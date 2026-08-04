import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getAllNewsAdmin, createNews, updateNews, deleteNews } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { News } from '@/types/types';

interface NewsForm { title: string; summary: string; content: string; image_url: string; is_published: boolean; }
const EMPTY: NewsForm = { title: '', summary: '', content: '', image_url: '', is_published: false };

export default function AdminNews() {
  const [items, setItems] = useState<News[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<News | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<News | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NewsForm>(EMPTY);
  const PAGE_SIZE = 15;

  const load = useCallback(async () => {
    setLoading(true);
    const r = await getAllNewsAdmin(page, PAGE_SIZE);
    setItems(r.data); setTotal(r.total); setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditTarget(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (n: News) => { setEditTarget(n); setForm({ title: n.title, summary: n.summary ?? '', content: n.content ?? '', image_url: n.image_url ?? '', is_published: n.is_published }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return; }
    setSaving(true);
    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (editTarget) {
      await updateNews(editTarget.id, { ...form, slug });
      toast.success('Article updated');
    } else {
      await createNews({ ...form, slug });
      toast.success('Article created');
    }
    setSaving(false); setShowForm(false); load();
  };

  const handleTogglePublish = async (n: News) => {
    await updateNews(n.id, { is_published: !n.is_published });
    toast.success(n.is_published ? 'Unpublished' : 'Published'); load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteNews(deleteTarget.id); toast.success('Deleted'); setDeleteTarget(null); load();
  };

  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-lg font-black text-gradient-gold">News</h1><p className="text-xs text-muted-foreground">{total} articles</p></div>
          <Button size="sm" className="bg-gradient-gold text-primary-foreground font-bold h-8" onClick={openAdd}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New Article
          </Button>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                  {['Title', 'Summary', 'Status', 'Date', 'Actions'].map(h => <th key={h} className="px-4 py-3 whitespace-nowrap font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">No articles yet</td></tr>
                ) : items.map(n => (
                  <tr key={n.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap font-medium text-sm max-w-[200px] truncate">{n.title}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[240px] truncate">{n.summary ?? '—'}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Badge className={`text-[10px] ${n.is_published ? 'bg-success/10 text-success border-success/30' : 'bg-muted text-muted-foreground'}`}>
                        {n.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleTogglePublish(n)} title={n.is_published ? 'Unpublish' : 'Publish'}>
                          {n.is_published ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-success" />}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(n)}><Pencil className="w-3.5 h-3.5 text-primary" /></Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDeleteTarget(n)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
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

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editTarget ? 'Edit Article' : 'New Article'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Title *</Label><Input className="bg-input border-border" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Summary</Label><Input className="bg-input border-border" value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Content</Label><Textarea className="bg-input border-border resize-none min-h-32" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Image URL</Label><Input className="bg-input border-border" placeholder="https://..." value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} /></div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-primary" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
              <span className="text-sm">Publish immediately</span>
            </label>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="bg-gradient-gold text-primary-foreground font-bold" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />} Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader><AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>Delete "{deleteTarget?.title}"?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

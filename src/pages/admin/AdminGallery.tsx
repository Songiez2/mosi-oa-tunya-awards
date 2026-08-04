import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getGallery, createGalleryItem, deleteGalleryItem, uploadFile } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Trash2, Upload, Loader2, Image, Film } from 'lucide-react';
import { toast } from 'sonner';
import type { GalleryItem } from '@/types/types';

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ title: '', description: '', media_url: '', media_type: 'image' as 'image' | 'video', category: '' });
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const r = await getGallery(page, PAGE_SIZE);
    setItems(r.data); setTotal(r.total); setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    let mediaUrl = form.media_url;
    if (file) {
      const url = await uploadFile('gallery', `${Date.now()}_${file.name}`, file);
      if (!url) { toast.error('Upload failed'); setSaving(false); return; }
      mediaUrl = url;
    }
    if (!mediaUrl) { toast.error('Provide a file or URL'); setSaving(false); return; }
    await createGalleryItem({ title: form.title || undefined, description: form.description || undefined, media_url: mediaUrl, media_type: form.media_type, category: form.category || undefined, sort_order: 0 });
    toast.success('Item added'); setSaving(false); setShowForm(false); setFile(null);
    setForm({ title: '', description: '', media_url: '', media_type: 'image', category: '' });
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteGalleryItem(deleteTarget.id); toast.success('Deleted'); setDeleteTarget(null); load();
  };

  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-lg font-black text-gradient-gold">Gallery</h1><p className="text-xs text-muted-foreground">{total} items</p></div>
          <Button size="sm" className="bg-gradient-gold text-primary-foreground font-bold h-8" onClick={() => setShowForm(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Media
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map(item => (
              <div key={item.id} className="glass-card rounded-xl overflow-hidden group relative">
                {item.media_type === 'image' ? (
                  <img src={item.media_url} alt={item.title} className="w-full aspect-square object-cover" />
                ) : (
                  <div className="w-full aspect-square bg-muted flex flex-col items-center justify-center gap-2">
                    <Film className="w-8 h-8 text-primary" />
                    <span className="text-xs text-muted-foreground truncate px-2">{item.title ?? 'Video'}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <div className="flex-1 min-w-0"><p className="text-white text-xs truncate">{item.title ?? '—'}</p></div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0" onClick={() => setDeleteTarget(item)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <Badge className={`absolute top-2 right-2 text-[9px] ${item.media_type === 'video' ? 'bg-primary/80' : 'bg-black/60'} text-white border-0`}>
                  {item.media_type}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-xs text-muted-foreground">Page {page} of {pages}</span>
            <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>Add Gallery Item</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.media_type} onValueChange={v => setForm(f => ({ ...f, media_type: v as 'image' | 'video' }))}>
                <SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="image">Image</SelectItem><SelectItem value="video">Video</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Upload File</Label>
              <label className="flex items-center gap-3 h-10 px-3 rounded-lg border border-dashed border-primary/30 cursor-pointer hover:border-primary/60 bg-muted">
                <Upload className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{file ? file.name : 'Choose file...'}</span>
                <input type="file" className="hidden" accept={form.media_type === 'image' ? 'image/*' : 'video/*'} onChange={e => setFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <div className="space-y-1.5"><Label>Or URL</Label><Input className="bg-input border-border" placeholder="https://..." value={form.media_url} onChange={e => setForm(f => ({ ...f, media_url: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Title</Label><Input className="bg-input border-border" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Category</Label><Input className="bg-input border-border" placeholder="e.g. Event 2025" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="bg-gradient-gold text-primary-foreground font-bold" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />} Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader><AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>Remove this media item from the gallery?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

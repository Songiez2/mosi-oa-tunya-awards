import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Announcement } from '@/types/types';

export default function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', is_active: true });

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getAnnouncements(false);
    setItems(data); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditTarget(null); setForm({ title: '', content: '', is_active: true }); setShowForm(true); };
  const openEdit = (a: Announcement) => { setEditTarget(a); setForm({ title: a.title, content: a.content, is_active: a.is_active }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content required'); return; }
    setSaving(true);
    if (editTarget) { await updateAnnouncement(editTarget.id, form); toast.success('Updated'); }
    else { await createAnnouncement(form); toast.success('Created'); }
    setSaving(false); setShowForm(false); load();
  };

  const handleToggle = async (a: Announcement) => {
    await updateAnnouncement(a.id, { is_active: !a.is_active });
    toast.success(a.is_active ? 'Deactivated' : 'Activated'); load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteAnnouncement(deleteTarget.id); toast.success('Deleted'); setDeleteTarget(null); load();
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-lg font-black text-gradient-gold">Announcements</h1><p className="text-xs text-muted-foreground">{items.length} total</p></div>
          <Button size="sm" className="bg-gradient-gold text-primary-foreground font-bold h-8" onClick={openAdd}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center text-muted-foreground text-sm">No announcements yet</div>
        ) : (
          <div className="space-y-3">
            {items.map(a => (
              <div key={a.id} className="glass-card rounded-xl p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{a.title}</span>
                    <Badge className={`text-[10px] ${a.is_active ? 'bg-success/10 text-success border-success/30' : 'bg-muted text-muted-foreground'}`}>
                      {a.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{a.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleToggle(a)}>
                    {a.is_active ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(a)}><Pencil className="w-3.5 h-3.5 text-primary" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDeleteTarget(a)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>{editTarget ? 'Edit Announcement' : 'New Announcement'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Title *</Label><Input className="bg-input border-border" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Content *</Label><Textarea className="bg-input border-border resize-none min-h-24" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-primary" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
              <span className="text-sm">Active (visible on site)</span>
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
          <AlertDialogHeader><AlertDialogTitle>Delete Announcement</AlertDialogTitle>
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

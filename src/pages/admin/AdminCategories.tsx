import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '@/types/types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const cats = await getCategories();
    setCategories(cats);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditTarget(null); setForm({ name: '', description: '' }); setShowForm(true); };
  const openEdit = (c: Category) => { setEditTarget(c); setForm({ name: c.name, description: c.description ?? '' }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    if (editTarget) {
      await updateCategory(editTarget.id, { name: form.name, description: form.description || undefined });
      toast.success('Category updated');
    } else {
      await createCategory(form.name, form.description || undefined);
      toast.success('Category created');
    }
    setSaving(false);
    setShowForm(false);
    load();
  };

  const handleToggle = async (c: Category) => {
    await updateCategory(c.id, { is_enabled: !c.is_enabled });
    toast.success(c.is_enabled ? 'Disabled' : 'Enabled');
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteCategory(deleteTarget.id);
    toast.success('Category deleted');
    setDeleteTarget(null);
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-gradient-gold">Categories</h1>
            <p className="text-xs text-muted-foreground">{categories.length} categories</p>
          </div>
          <Button size="sm" className="bg-gradient-gold text-primary-foreground font-bold h-8" onClick={openAdd}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Category
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                    {['#', 'Category Name', 'Description', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 whitespace-nowrap font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c, i) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap font-medium text-sm">{c.name}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-xs truncate">{c.description ?? '—'}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <Badge className={`text-[10px] ${c.is_enabled ? 'bg-success/10 text-success border-success/30' : 'bg-muted text-muted-foreground'}`}>
                          {c.is_enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleToggle(c)}>
                            {c.is_enabled ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(c)}>
                            <Pencil className="w-3.5 h-3.5 text-primary" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDeleteTarget(c)}>
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
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>{editTarget ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name *</Label><Input className="bg-input border-border" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea className="bg-input border-border resize-none min-h-20" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
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
          <AlertDialogHeader><AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>Delete "{deleteTarget?.name}"? Nominees in this category will still exist.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

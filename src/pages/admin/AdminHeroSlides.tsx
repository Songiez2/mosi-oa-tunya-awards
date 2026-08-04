import React, { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { HeroSlide } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, GripVertical, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    button_text: '',
    is_active: true,
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      setSlides(data || []);
    } catch (error: any) {
      toast.error('Failed to load slides', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error('Upload failed', { description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDialog = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title || '',
        description: slide.description || '',
        image_url: slide.image_url,
        link_url: slide.link_url || '',
        button_text: slide.button_text || '',
        is_active: slide.is_active,
      });
    } else {
      setEditingSlide(null);
      setFormData({
        title: '',
        description: '',
        image_url: '',
        link_url: '',
        button_text: '',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.image_url) {
        toast.error('Image URL is required');
        return;
      }

      if (editingSlide) {
        const { error } = await supabase
          .from('hero_slides')
          .update(formData)
          .eq('id', editingSlide.id);
        if (error) throw error;
        toast.success('Slide updated successfully');
      } else {
        const { error } = await supabase
          .from('hero_slides')
          .insert({
            ...formData,
            display_order: slides.length
          });
        if (error) throw error;
        toast.success('Slide created successfully');
      }
      setIsDialogOpen(false);
      fetchSlides();
    } catch (error: any) {
      toast.error('Operation failed', { description: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    try {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
      toast.success('Slide deleted');
      fetchSlides();
    } catch (error: any) {
      toast.error('Delete failed', { description: error.message });
    }
  };

  const handleReorder = async (newOrder: HeroSlide[]) => {
    setSlides(newOrder);
    try {
      const updates = newOrder.map((slide, index) => ({
        id: slide.id,
        display_order: index,
        image_url: slide.image_url // Required by Supabase for bulk upsert if missing defaults
      }));
      
      const { error } = await supabase.from('hero_slides').upsert(updates);
      if (error) throw error;
      toast.success('Order saved');
    } catch (error: any) {
      toast.error('Failed to save order', { description: error.message });
      fetchSlides(); // Revert on failure
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gradient-gold">Hero Banner Slider</h2>
        <Button onClick={() => handleOpenDialog()} className="bg-gradient-gold text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Add Slide
        </Button>
      </div>

      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle>Manage Slides</CardTitle>
          <p className="text-sm text-muted-foreground">Drag and drop to reorder the slides as they appear on the homepage.</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : slides.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
              <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
              <p>No slides found. Add one to get started.</p>
            </div>
          ) : (
            <Reorder.Group axis="y" values={slides} onReorder={handleReorder} className="space-y-2">
              {slides.map((slide) => (
                <Reorder.Item key={slide.id} value={slide} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg border border-border cursor-grab active:cursor-grabbing">
                  <GripVertical className="text-muted-foreground w-5 h-5 shrink-0" />
                  <div className="w-24 h-16 shrink-0 rounded overflow-hidden bg-black relative">
                    <img src={slide.image_url} alt="Slide thumbnail" className="w-full h-full object-cover" />
                    {!slide.is_active && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-bold text-white uppercase">Inactive</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{slide.title || 'Untitled Slide'}</h4>
                    <p className="text-xs text-muted-foreground truncate">{slide.description || 'No description'}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(slide)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(slide.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSlide ? 'Edit Slide' : 'Add New Slide'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Image URL or Upload *</Label>
              <div className="flex gap-2">
                <Input 
                  value={formData.image_url} 
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                  placeholder="https://..."
                  required
                />
                <div className="relative">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <div className="h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </div>
                </div>
              </div>
              {formData.image_url && (
                <div className="mt-2 h-32 rounded border border-border overflow-hidden">
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Title (Optional)</Label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder="Hero Title"
              />
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Brief description or subtitle"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Button Text (Optional)</Label>
                <Input 
                  value={formData.button_text} 
                  onChange={(e) => setFormData({...formData, button_text: e.target.value})} 
                  placeholder="e.g. Vote Now"
                />
              </div>
              <div className="space-y-2">
                <Label>Link URL (Optional)</Label>
                <Input 
                  value={formData.link_url} 
                  onChange={(e) => setFormData({...formData, link_url: e.target.value})} 
                  placeholder="e.g. /vote"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="is-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is-active">Active (Visible on homepage)</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-gold text-primary-foreground">Save Slide</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

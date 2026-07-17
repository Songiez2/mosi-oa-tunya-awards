import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCategories, createNomineeRegistration, uploadFile } from '@/lib/api';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '@/types/types';

const PROVINCES = ['Central', 'Copperbelt', 'Eastern', 'Luapula', 'Lusaka', 'Muchinga', 'Northern', 'North-Western', 'Southern', 'Western'];

export default function NomineeRegistrationPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    full_name: '', stage_name: '', category_id: '', biography: '',
    phone: '', email: '', province: '', district: '',
    facebook: '', instagram: '', tiktok: '', youtube: '', website: '', whatsapp: ''
  });

  useEffect(() => { getCategories(false).then(setCategories); }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.category_id || !form.phone) {
      toast.error('Please fill in all required fields'); return;
    }

    setLoading(true);
    try {
      const ts = Date.now();
      const [profileUrl, bannerUrl, galleryUrls] = await Promise.all([
        profileFile ? uploadFile('nominees', `profiles/${ts}_${profileFile.name}`, profileFile) : Promise.resolve(null),
        bannerFile ? uploadFile('nominees', `banners/${ts}_${bannerFile.name}`, bannerFile) : Promise.resolve(null),
        galleryFiles.length > 0 
          ? Promise.all(galleryFiles.map((f, i) => uploadFile('nominees', `gallery/${ts}_${i}_${f.name}`, f)))
          : Promise.resolve([]),
      ]);
      
      await createNomineeRegistration({
        ...form,
        profile_picture_url: profileUrl ?? undefined,
        banner_image_url: bannerUrl ?? undefined,
        gallery_urls: galleryUrls.filter((u): u is string => u !== null).length > 0 ? galleryUrls.filter((u): u is string => u !== null) : undefined,
        status: 'approved',
        is_featured: false,
        vote_count: 0,
      });

      setDone(true);
      toast.success('Registration successful! Thank you for registering as a nominee.');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  if (done) return (
    <PublicLayout>
      <div className="pt-20 min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md glass-card rounded-2xl p-8">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>Thank You!</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Your nominee registration has been submitted successfully. You are now registered and can start receiving votes!
          </p>
          <div className="space-y-3">
            <Button className="w-full bg-gradient-gold text-primary-foreground font-bold" onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen">
        <div className="relative py-16 text-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(201,162,39,0.15), transparent 70%)' }} />
          <div className="relative z-10 container mx-auto px-4">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/30">Join The Awards</Badge>
            <h1 className="text-3xl md:text-5xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>Register as Nominee</h1>
            <p className="text-muted-foreground text-sm">Free registration - Submit your nomination today</p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16 max-w-2xl">
          {/* Registration notice */}
          <div className="glass-card rounded-xl p-4 mb-6 border-primary/30">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold mb-1">Free & Instant Registration</div>
                <div className="text-xs text-muted-foreground">
                  Fill in the form below to submit your nominee application. Your registration will be approved instantly and you can start receiving votes right away!
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-bold text-lg text-gradient-gold">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Full Name *</Label><Input className="bg-input border-border" placeholder="John Doe" value={form.full_name} onChange={set('full_name')} required /></div>
              <div className="space-y-1.5"><Label>Stage Name</Label><Input className="bg-input border-border" placeholder="Your stage name" value={form.stage_name} onChange={set('stage_name')} /></div>
              <div className="space-y-1.5"><Label>Email *</Label><Input type="email" className="bg-input border-border" placeholder="you@example.com" value={form.email} onChange={set('email')} required /></div>
              <div className="space-y-1.5"><Label>Phone *</Label><Input className="bg-input border-border" placeholder="0962 267 118" value={form.phone} onChange={set('phone')} required /></div>
              <div className="space-y-1.5">
                <Label>Province</Label>
                <Select value={form.province} onValueChange={v => setForm(f => ({ ...f, province: v }))}>
                  <SelectTrigger className="bg-input border-border"><SelectValue placeholder="Select province" /></SelectTrigger>
                  <SelectContent>{PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>District</Label><Input className="bg-input border-border" placeholder="Your district" value={form.district} onChange={set('district')} /></div>
            </div>

            <div className="space-y-1.5">
              <Label>Award Category *</Label>
              <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
                <SelectTrigger className="bg-input border-border"><SelectValue placeholder="Select your category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Biography</Label>
              <Textarea className="bg-input border-border min-h-24 resize-none" placeholder="Tell us about yourself..." value={form.biography} onChange={set('biography')} />
            </div>

            <h2 className="font-bold text-lg text-gradient-gold pt-2">Photos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUpload label="Profile Picture" file={profileFile} onChange={setProfileFile} />
              <FileUpload label="Banner Image" file={bannerFile} onChange={setBannerFile} />
            </div>
            
            <div className="space-y-1.5">
              <Label>Gallery Images (Multiple)</Label>
              <label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-primary/30 cursor-pointer hover:border-primary/60 transition-colors bg-muted/30">
                <Upload className="w-5 h-5 text-primary mb-1" />
                <span className="text-xs text-muted-foreground text-center px-2">
                  {galleryFiles.length > 0 ? `${galleryFiles.length} file(s) selected` : 'Click to upload gallery images'}
                </span>
                <input type="file" className="hidden" accept="image/*" multiple onChange={e => setGalleryFiles(Array.from(e.target.files ?? []))} />
              </label>
            </div>

            <h2 className="font-bold text-lg text-gradient-gold pt-2">Social Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[['facebook','Facebook URL'],['instagram','Instagram URL'],['tiktok','TikTok URL'],['youtube','YouTube URL'],['website','Website URL'],['whatsapp','WhatsApp Number']].map(([k, label]) => (
                <div key={k} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Input className="bg-input border-border" placeholder={label} value={(form as Record<string, string>)[k]} onChange={set(k)} />
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground font-bold py-3" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Submit Registration
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Your registration is complete and you can start receiving votes immediately.
            </p>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
}

function FileUpload({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-primary/30 cursor-pointer hover:border-primary/60 transition-colors bg-muted/30">
        <Upload className="w-5 h-5 text-primary mb-1" />
        <span className="text-xs text-muted-foreground text-center px-2 truncate max-w-full">
          {file ? file.name : 'Click to upload image'}
        </span>
        <input type="file" className="hidden" accept="image/*" onChange={e => onChange(e.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}

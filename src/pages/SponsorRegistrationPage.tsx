import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSponsor, uploadFile } from '@/lib/api';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Upload, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const PACKAGES = ['Platinum', 'Gold', 'Silver', 'Bronze', 'Media', 'Community'];

export default function SponsorRegistrationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [form, setForm] = useState({ company_name: '', rep_name: '', email: '', phone: '', website: '', address: '', package: '', description: '' });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.email || !form.phone) { toast.error('Please fill in required fields'); return; }
    setLoading(true);
    try {
      const ts = Date.now();
      const [logoUrl, bannerUrl] = await Promise.all([
        logoFile ? uploadFile('sponsors', `logos/${ts}_${logoFile.name}`, logoFile) : Promise.resolve(null),
        bannerFile ? uploadFile('sponsors', `banners/${ts}_${bannerFile.name}`, bannerFile) : Promise.resolve(null),
      ]);
      await createSponsor({ ...form, logo_url: logoUrl ?? undefined, banner_url: bannerUrl ?? undefined, status: 'pending', is_featured: false });
      setDone(true);
      toast.success('Sponsor application submitted!');
    } catch { toast.error('Failed to submit. Please try again.'); }
    setLoading(false);
  };

  if (done) return (
    <PublicLayout>
      <div className="pt-20 min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <CheckCircle className="w-20 h-20 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>Application Submitted!</h2>
          <p className="text-muted-foreground mb-6">Your sponsorship application has been received. Our team will contact you within 48 hours.</p>
          <Button className="bg-gradient-gold text-primary-foreground font-bold" onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    </PublicLayout>
  );

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen">
        <div className="relative py-16 text-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(201,162,39,0.15), transparent 70%)' }} />
          <div className="relative z-10 container mx-auto px-4">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/30">Partnership</Badge>
            <h1 className="text-3xl md:text-5xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>Become a Sponsor</h1>
            <p className="text-muted-foreground text-sm">Partner with TUNYA AWARDS and reach thousands</p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16 max-w-2xl">
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[['company_name', 'Company Name *'], ['rep_name', 'Representative Name'], ['email', 'Email *'], ['phone', 'Phone *'], ['website', 'Website'], ['address', 'Address']].map(([k, label]) => (
                <div key={k} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Input className="bg-input border-border" type={k === 'email' ? 'email' : 'text'} placeholder={label} value={(form as Record<string, string>)[k]} onChange={set(k)} required={label.includes('*')} />
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label>Sponsorship Package</Label>
              <Select value={form.package} onValueChange={v => setForm(f => ({ ...f, package: v }))}>
                <SelectTrigger className="bg-input border-border"><SelectValue placeholder="Select package" /></SelectTrigger>
                <SelectContent>{PACKAGES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea className="bg-input border-border min-h-20 resize-none" placeholder="Brief description of your company..." value={form.description} onChange={set('description')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[['Company Logo', logoFile, setLogoFile], ['Banner Image', bannerFile, setBannerFile]].map(([label, file, setFile]) => (
                <div key={label as string} className="space-y-1.5">
                  <Label>{label as string}</Label>
                  <label className="flex flex-col items-center justify-center h-20 rounded-xl border-2 border-dashed border-primary/30 cursor-pointer hover:border-primary/60 transition-colors bg-muted/30">
                    <Upload className="w-4 h-4 text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">{(file as File | null) ? (file as File).name : 'Upload image'}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={e => (setFile as (f: File | null) => void)(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground font-bold" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Building2 className="w-4 h-4 mr-2" />}
              Submit Application
            </Button>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
}

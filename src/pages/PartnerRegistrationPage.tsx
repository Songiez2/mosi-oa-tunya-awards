import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPartner, uploadFile } from '@/lib/api';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Handshake, Upload, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PartnerRegistrationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [form, setForm] = useState({ org_name: '', rep_name: '', email: '', phone: '', website: '', address: '', description: '' });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.org_name || !form.email) { toast.error('Please fill in required fields'); return; }
    setLoading(true);
    try {
      const logoUrl = logoFile ? await uploadFile('partners', `logos/${Date.now()}_${logoFile.name}`, logoFile) : null;
      await createPartner({ ...form, logo_url: logoUrl ?? undefined, status: 'pending' });
      setDone(true);
      toast.success('Partner application submitted!');
    } catch { toast.error('Failed to submit. Please try again.'); }
    setLoading(false);
  };

  if (done) return (
    <PublicLayout>
      <div className="pt-20 min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <CheckCircle className="w-20 h-20 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gradient-gold mb-3">Application Submitted!</h2>
          <p className="text-muted-foreground mb-6">Your partner application has been received. We'll be in touch soon.</p>
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
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/30">Collaboration</Badge>
            <h1 className="text-3xl md:text-5xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>Become a Partner</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 pb-16 max-w-2xl">
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[['org_name', 'Organization Name *'], ['rep_name', 'Representative Name'], ['email', 'Email *'], ['phone', 'Phone'], ['website', 'Website'], ['address', 'Address']].map(([k, label]) => (
                <div key={k} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Input className="bg-input border-border" placeholder={label} value={(form as Record<string, string>)[k]} onChange={set(k)} required={label.includes('*')} />
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea className="bg-input border-border min-h-20 resize-none" placeholder="About your organization..." value={form.description} onChange={set('description')} />
            </div>
            <div className="space-y-1.5">
              <Label>Organization Logo</Label>
              <label className="flex flex-col items-center justify-center h-20 rounded-xl border-2 border-dashed border-primary/30 cursor-pointer hover:border-primary/60 bg-muted/30 transition-colors">
                <Upload className="w-4 h-4 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">{logoFile ? logoFile.name : 'Upload logo'}</span>
                <input type="file" className="hidden" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground font-bold" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Handshake className="w-4 h-4 mr-2" />}
              Submit Application
            </Button>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
}

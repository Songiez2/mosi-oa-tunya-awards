import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { sendContactMessage } from '@/lib/api';
import { toast } from 'sonner';
import { useSettings } from '@/contexts/SettingsContext';
import { Phone, Mail, MessageCircle, Send, Loader2, MapPin, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill required fields'); return; }
    setLoading(true);
    await sendContactMessage(form);
    setLoading(false);
    setSent(true);
    toast.success('Message sent!');
  };

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen">
        <div className="relative py-16 text-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(201,162,39,0.15), transparent 70%)' }} />
          <div className="relative z-10 container mx-auto px-4">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/30">Get In Touch</Badge>
            <h1 className="text-3xl md:text-5xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>Contact Us</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gradient-gold mb-4">Reach Out</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Have questions about the awards, nominations, or voting? Our team is here to help you.
                </p>
              </div>
              {[
                { icon: <Phone className="w-5 h-5" />, label: 'Phone', value: settings.help_number ?? '0962267118', href: `tel:${settings.help_number ?? '0962267118'}` },
                { icon: <Mail className="w-5 h-5" />, label: 'Email', value: settings.help_email ?? 'info@tunyaawards.com', href: `mailto:${settings.help_email ?? 'info@tunyaawards.com'}` },
                { icon: <MessageCircle className="w-5 h-5" />, label: 'WhatsApp', value: settings.whatsapp_number ?? settings.help_number ?? '0962267118', href: `https://wa.me/${(settings.whatsapp_number ?? settings.help_number ?? '0962267118').replace(/\D/g, '')}` },
              ].map(item => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-4 glass-card rounded-xl hover-gold block"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">{item.icon}</div>
                  <div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    <div className="font-medium text-sm">{item.value}</div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Form */}
            <div className="glass-card rounded-2xl p-6">
              {sent ? (
                <div className="text-center py-10">
                  <CheckCircle className="w-14 h-14 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gradient-gold mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground text-sm">We'll get back to you within 24 hours.</p>
                  <Button className="mt-6 bg-gradient-gold text-primary-foreground" onClick={() => setSent(false)}>Send Another</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Full Name *</Label>
                    <Input className="bg-input border-border" placeholder="Your name" value={form.name} onChange={set('name')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email *</Label>
                    <Input type="email" className="bg-input border-border" placeholder="your@email.com" value={form.email} onChange={set('email')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input className="bg-input border-border" placeholder="0962 267 118" value={form.phone} onChange={set('phone')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Message *</Label>
                    <Textarea className="bg-input border-border min-h-28 resize-none" placeholder="How can we help you?" value={form.message} onChange={set('message')} />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground font-bold" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

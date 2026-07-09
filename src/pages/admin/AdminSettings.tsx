import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getSiteSettings, updateSiteSettings } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Globe, CreditCard, Bell, Lock, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import type { SiteSettings } from '@/types/types';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteSettings().then(s => { setSettings(s); setLoading(false); });
  }, []);

  const set = (key: keyof SiteSettings, value: unknown) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    await updateSiteSettings(settings as Record<string, unknown>);
    toast.success('Settings saved successfully');
    setSaving(false);
  };

  if (loading) return (
    <AdminLayout><div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-lg font-black text-gradient-gold">Settings</h1><p className="text-xs text-muted-foreground">Configure your platform</p></div>
          <Button size="sm" className="bg-gradient-gold text-primary-foreground font-bold h-8" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />} Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="bg-muted border border-border flex-wrap h-auto">
            <TabsTrigger value="general" className="text-xs"><Globe className="w-3.5 h-3.5 mr-1" />General</TabsTrigger>
            <TabsTrigger value="payment" className="text-xs"><CreditCard className="w-3.5 h-3.5 mr-1" />Payment</TabsTrigger>
            <TabsTrigger value="contact" className="text-xs"><Phone className="w-3.5 h-3.5 mr-1" />Contact</TabsTrigger>
            <TabsTrigger value="email" className="text-xs"><Mail className="w-3.5 h-3.5 mr-1" />Email</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs"><Bell className="w-3.5 h-3.5 mr-1" />Notifications</TabsTrigger>
            <TabsTrigger value="security" className="text-xs"><Lock className="w-3.5 h-3.5 mr-1" />Security</TabsTrigger>
          </TabsList>

          {/* General */}
          <TabsContent value="general">
            <div className="glass-card rounded-xl p-5 space-y-4 mt-3">
              <h2 className="text-sm font-bold text-primary">Website Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Site Name</Label>
                  <Input className="bg-input border-border" value={settings.website_name ?? ''} onChange={e => set('website_name', e.target.value)} placeholder="MOSI-OA - TUNYA SOUTHERN AWARDS" />
                </div>
                <div className="space-y-1.5">
                  <Label>Header Text</Label>
                  <Input className="bg-input border-border" value={settings.header_text ?? ''} onChange={e => set('header_text', e.target.value)} placeholder="MOSI-OA - TUNYA AWARDS 2026" />
                </div>
                <div className="space-y-1.5">
                  <Label>Logo URL</Label>
                  <Input className="bg-input border-border" value={settings.logo_url ?? ''} onChange={e => set('logo_url', e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Favicon URL</Label>
                  <Input className="bg-input border-border" value={settings.favicon_url ?? ''} onChange={e => set('favicon_url', e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Awards Night Date</Label>
                  <Input type="datetime-local" className="bg-input border-border" value={settings.awards_night_date ? settings.awards_night_date.slice(0, 16) : ''} onChange={e => set('awards_night_date', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency Symbol</Label>
                  <Input className="bg-input border-border" value={settings.currency ?? 'K'} onChange={e => set('currency', e.target.value)} placeholder="K" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>About Text</Label>
                <Textarea className="bg-input border-border resize-none min-h-20" value={settings.about_content ?? ''} onChange={e => set('about_content', e.target.value)} placeholder="About the awards..." />
              </div>
              <div className="space-y-1.5">
                <Label>Footer Text</Label>
                <Input className="bg-input border-border" value={settings.footer_text ?? ''} onChange={e => set('footer_text', e.target.value)} placeholder="© 2026 TUNYA Awards" />
              </div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['facebook', 'instagram', 'tiktok', 'youtube', 'twitter'] as const).map(k => (
                  <div key={k} className="space-y-1.5">
                    <Label className="capitalize">{k}</Label>
                    <Input className="bg-input border-border" value={settings[k] ?? ''} onChange={e => set(k, e.target.value)} placeholder="https://..." />
                  </div>
                ))}
              </div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">SEO</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Meta Title</Label><Input className="bg-input border-border" value={settings.meta_title ?? ''} onChange={e => set('meta_title', e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Google Analytics ID</Label><Input className="bg-input border-border" value={settings.ga_tracking_id ?? ''} onChange={e => set('ga_tracking_id', e.target.value)} placeholder="G-XXXXXXXXXX" /></div>
                <div className="space-y-1.5 md:col-span-2"><Label>Meta Description</Label><Textarea className="bg-input border-border resize-none h-16" value={settings.meta_description ?? ''} onChange={e => set('meta_description', e.target.value)} /></div>
              </div>
            </div>
          </TabsContent>

          {/* Payment */}
          <TabsContent value="payment">
            <div className="glass-card rounded-xl p-5 space-y-4 mt-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-primary">Payment &amp; Registration Fee Settings</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-primary" checked={settings.payments_enabled !== false} onChange={e => set('payments_enabled', e.target.checked)} />
                  <span className="text-xs font-medium">Payments Enabled</span>
                </label>
              </div>

              {/* Registration fee — prominent section */}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Nominee Registration Fee
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Registration Fee Amount</Label>
                    <Input type="number" min="0" className="bg-input border-border text-base font-bold" value={settings.nomination_fee ?? 100} onChange={e => set('nomination_fee', Number(e.target.value))} placeholder="100" />
                    <p className="text-[10px] text-muted-foreground">Amount nominees must pay to register (in {settings.currency ?? 'K'})</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Mobile Money Number</Label>
                    <Input className="bg-input border-border" value={settings.mobile_money_number ?? ''} onChange={e => set('mobile_money_number', e.target.value)} placeholder="0962267118" />
                    <p className="text-[10px] text-muted-foreground">Number nominees send payment to</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Payment Instructions (displayed to nominees)</Label>
                  <Textarea className="bg-input border-border resize-none min-h-24" value={settings.payment_instructions ?? ''} onChange={e => set('payment_instructions', e.target.value)} placeholder={`1. Send K100 to Mobile Money 0962267118\n2. Screenshot your confirmation\n3. Send via WhatsApp when prompted`} />
                </div>
              </div>

              {/* Voting fee */}
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Voting Fee</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Voting Fee (per vote)</Label>
                  <Input type="number" min="1" className="bg-input border-border" value={settings.voting_fee ?? 10} onChange={e => set('voting_fee', Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency Symbol</Label>
                  <Input className="bg-input border-border" value={settings.currency ?? 'K'} onChange={e => set('currency', e.target.value)} placeholder="K" />
                </div>
              </div>

              {/* Banking */}
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Banking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Account Name</Label>
                  <Input className="bg-input border-border" value={settings.account_name ?? ''} onChange={e => set('account_name', e.target.value)} placeholder="TUNYA AWARDS" />
                </div>
                <div className="space-y-1.5">
                  <Label>Bank Name</Label>
                  <Input className="bg-input border-border" value={settings.bank_name ?? ''} onChange={e => set('bank_name', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Bank Account Number</Label>
                  <Input className="bg-input border-border" value={settings.bank_account ?? ''} onChange={e => set('bank_account', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Payment QR Code URL</Label>
                  <Input className="bg-input border-border" value={settings.payment_qr_url ?? ''} onChange={e => set('payment_qr_url', e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Manual Verification</Label>
                  <Select value={settings.manual_verification !== false ? 'true' : 'false'} onValueChange={v => set('manual_verification', v === 'true')}>
                    <SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="true">Enabled</SelectItem><SelectItem value="false">Disabled</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Contact */}
          <TabsContent value="contact">
            <div className="glass-card rounded-xl p-5 space-y-4 mt-3">
              <h2 className="text-sm font-bold text-primary">Contact &amp; Help</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Help / Support Number</Label>
                  <Input className="bg-input border-border" value={settings.help_number ?? '0962267118'} onChange={e => set('help_number', e.target.value)} placeholder="0962267118" />
                </div>
                <div className="space-y-1.5">
                  <Label>Contact Email</Label>
                  <Input type="email" className="bg-input border-border" value={settings.help_email ?? ''} onChange={e => set('help_email', e.target.value)} placeholder="info@tunyaawards.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>WhatsApp Number (for nominee registrations)</Label>
                  <Input className="bg-input border-border" value={settings.whatsapp_number ?? ''} onChange={e => set('whatsapp_number', e.target.value)} placeholder="260962267118" />
                  <p className="text-[10px] text-muted-foreground">Include country code, e.g. 260962267118 for Zambia</p>
                </div>
                <div className="space-y-1.5">
                  <Label>WhatsApp Button</Label>
                  <Select value={settings.whatsapp_enabled !== false ? 'true' : 'false'} onValueChange={v => set('whatsapp_enabled', v === 'true')}>
                    <SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="true">Enabled</SelectItem><SelectItem value="false">Disabled</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Office / Contact Address</Label>
                  <Input className="bg-input border-border" value={settings.office_address ?? ''} onChange={e => set('office_address', e.target.value)} placeholder="Livingstone, Southern Province, Zambia" />
                </div>
              </div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">Footer Quick Links</h3>
              <p className="text-xs text-muted-foreground">Format: <span className="font-mono">Label:/path</span> separated by commas — e.g. <span className="font-mono">Home:/,Nominees:/nominees,Vote:/vote</span></p>
              <Textarea
                className="bg-input border-border resize-none min-h-16 font-mono text-xs"
                value={typeof settings.quick_links === 'string' ? settings.quick_links : ''}
                onChange={e => set('quick_links', e.target.value)}
                placeholder="Home:/,Nominees:/nominees,Vote:/vote,Categories:/categories"
              />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">Footer Support Links</h3>
              <Textarea
                className="bg-input border-border resize-none min-h-16 font-mono text-xs"
                value={typeof settings.support_links === 'string' ? settings.support_links : ''}
                onChange={e => set('support_links', e.target.value)}
                placeholder="About:/about,Contact:/contact,FAQ:/faq,Privacy Policy:/privacy"
              />
            </div>
          </TabsContent>

          {/* Email */}
          <TabsContent value="email">
            <div className="glass-card rounded-xl p-5 space-y-4 mt-3">
              <h2 className="text-sm font-bold text-primary">Email / SMTP Settings</h2>
              <p className="text-xs text-muted-foreground">Configure SMTP for sending email notifications.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>SMTP Host</Label><Input className="bg-input border-border" value={settings.smtp_host ?? ''} onChange={e => set('smtp_host', e.target.value)} placeholder="smtp.gmail.com" /></div>
                <div className="space-y-1.5"><Label>SMTP Port</Label><Input type="number" className="bg-input border-border" value={settings.smtp_port ?? 587} onChange={e => set('smtp_port', Number(e.target.value))} /></div>
                <div className="space-y-1.5"><Label>SMTP Username</Label><Input className="bg-input border-border" value={settings.smtp_user ?? ''} onChange={e => set('smtp_user', e.target.value)} /></div>
                <div className="space-y-1.5"><Label>From Name</Label><Input className="bg-input border-border" value={settings.email_from_name ?? 'TUNYA Awards'} onChange={e => set('email_from_name', e.target.value)} /></div>
                <div className="space-y-1.5"><Label>From Email</Label><Input type="email" className="bg-input border-border" value={settings.email_from ?? ''} onChange={e => set('email_from', e.target.value)} /></div>
                <div className="space-y-1.5">
                  <Label>Encryption</Label>
                  <Select value={settings.smtp_encryption ?? 'tls'} onValueChange={v => set('smtp_encryption', v)}>
                    <SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="tls">TLS</SelectItem><SelectItem value="ssl">SSL</SelectItem><SelectItem value="none">None</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <div className="glass-card rounded-xl p-5 space-y-4 mt-3">
              <h2 className="text-sm font-bold text-primary">Email Notifications</h2>
              <p className="text-xs text-muted-foreground">Toggle which email notifications are sent automatically.</p>
              <div className="space-y-3">
                {([
                  ['notify_user_register', 'User registration confirmation'],
                  ['notify_vote_confirm', 'Vote / payment confirmation'],
                  ['notify_nominee_register', 'Nominee registration receipt'],
                  ['notify_nominee_approved', 'Nominee approval / rejection'],
                  ['notify_sponsor_approved', 'Sponsor approval / rejection'],
                  ['notify_partner_approved', 'Partner approval / rejection'],
                  ['notify_admin_new_payment', 'Admin alert: new pending payment'],
                  ['notify_admin_new_nominee', 'Admin alert: new nominee registration'],
                ] as [keyof SiteSettings, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                    <input
                      type="checkbox"
                      className="accent-primary w-4 h-4"
                      checked={(settings[key] as boolean) !== false}
                      onChange={e => set(key, e.target.checked)}
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <div className="glass-card rounded-xl p-5 space-y-4 mt-3">
              <h2 className="text-sm font-bold text-primary">Security Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([
                  ['rate_limiting_enabled', 'Rate Limiting'],
                  ['captcha_enabled', 'CAPTCHA on forms'],
                  ['audit_log_enabled', 'Audit Logging'],
                  ['maintenance_mode', 'Maintenance Mode'],
                ] as [keyof SiteSettings, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                    <input
                      type="checkbox"
                      className="accent-primary w-4 h-4"
                      checked={(settings[key] as boolean) ?? (key !== 'maintenance_mode')}
                      onChange={e => set(key, e.target.checked)}
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-xs text-warning">
                Enable Maintenance Mode to show a maintenance page to visitors while you make changes.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}


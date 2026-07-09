import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getNomineeById } from '@/lib/api';
import PublicLayout from '@/components/layouts/PublicLayout';
import VoteModal from '@/components/common/VoteModal';
import GoldLoader from '@/components/common/GoldLoader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Star, Share2, ExternalLink, Facebook, Instagram, Youtube, Globe,
  Phone, Trophy, ChevronLeft, MessageCircle
} from 'lucide-react';
import type { Nominee } from '@/types/types';
import { toast } from 'sonner';

export default function NomineeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [nominee, setNominee] = useState<Nominee | null>(null);
  const [loading, setLoading] = useState(true);
  const [voteOpen, setVoteOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    getNomineeById(id).then(n => { setNominee(n); setLoading(false); });
  }, [id]);

  const handleShare = () => {
    navigator.share?.({ title: nominee?.full_name, url: window.location.href })
      .catch(() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); });
  };

  if (loading) return <PublicLayout><div className="pt-20"><GoldLoader /></div></PublicLayout>;
  if (!nominee) return <PublicLayout><div className="pt-20 text-center p-12 text-muted-foreground">Nominee not found.</div></PublicLayout>;

  const socials = [
    { icon: <Facebook className="w-4 h-4" />, url: nominee.facebook, label: 'Facebook' },
    { icon: <Instagram className="w-4 h-4" />, url: nominee.instagram, label: 'Instagram' },
    { icon: <Youtube className="w-4 h-4" />, url: nominee.youtube, label: 'YouTube' },
    { icon: <Globe className="w-4 h-4" />, url: nominee.website, label: 'Website' },
    { icon: <MessageCircle className="w-4 h-4" />, url: nominee.whatsapp ? `https://wa.me/${nominee.whatsapp}` : null, label: 'WhatsApp' },
  ].filter(s => s.url);

  return (
    <PublicLayout>
      <div className="pt-16 min-h-screen">
        {/* Banner */}
        <div className="relative h-56 md:h-80 bg-muted overflow-hidden">
          {nominee.banner_image_url ? (
            <img src={nominee.banner_image_url} alt="banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(201,162,39,0.2), transparent 70%)' }}>
              <Trophy className="w-16 h-16 text-primary/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>

        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile row */}
          <div className="flex flex-col md:flex-row gap-6 -mt-16 relative z-10 mb-8">
            <div className="shrink-0">
              {nominee.profile_picture_url ? (
                <img src={nominee.profile_picture_url} alt={nominee.full_name} className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-background gold-glow" />
              ) : (
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-gold flex items-center justify-center text-4xl font-black text-primary-foreground border-4 border-background">
                  {nominee.full_name[0]}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pt-16 md:pt-0 md:mt-auto pb-2">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-xl md:text-3xl font-black text-gradient-gold truncate" style={{ fontFamily: 'Cinzel, serif' }}>{nominee.full_name}</h1>
                  {nominee.stage_name && <div className="text-primary text-sm font-medium">"{nominee.stage_name}"</div>}
                  <Badge className="mt-1 bg-primary/15 text-primary border-primary/30 text-xs">
                    {(nominee.categories as { name?: string } | null)?.name ?? 'Nominee'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="secondary" size="sm" className="border border-primary/30" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-1" /> Share
                  </Button>
                  <Button size="sm" className="bg-gradient-gold text-primary-foreground font-bold" onClick={() => setVoteOpen(true)}>
                    <Star className="w-4 h-4 mr-1" /> Vote
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Main */}
            <div className="md:col-span-2 space-y-6">
              {/* Votes */}
              <div className="glass-card rounded-xl p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center shrink-0 gold-glow">
                  <Star className="w-7 h-7 text-primary-foreground fill-primary-foreground" />
                </div>
                <div>
                  <div className="text-3xl font-black text-gradient-gold">{nominee.vote_count.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Votes</div>
                </div>
                <Button className="ml-auto bg-gradient-gold text-primary-foreground font-bold shrink-0" onClick={() => setVoteOpen(true)}>
                  Vote Now
                </Button>
              </div>

              {/* Biography */}
              {nominee.biography && (
                <div className="glass-card rounded-xl p-5">
                  <h2 className="font-bold text-base mb-3 text-gradient-gold">Biography</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{nominee.biography}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Details */}
              <div className="glass-card rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-sm text-gradient-gold">Details</h3>
                {nominee.province && (
                  <div className="text-xs"><span className="text-muted-foreground">Province: </span><span>{nominee.province}</span></div>
                )}
                {nominee.district && (
                  <div className="text-xs"><span className="text-muted-foreground">District: </span><span>{nominee.district}</span></div>
                )}
              </div>

              {/* Social */}
              {socials.length > 0 && (
                <div className="glass-card rounded-xl p-4 space-y-2">
                  <h3 className="font-bold text-sm text-gradient-gold mb-3">Social Media</h3>
                  {socials.map(s => (
                    <a key={s.label} href={s.url!} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <span className="text-primary">{s.icon}</span> {s.label}
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Back */}
          <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-8">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>

      <VoteModal nominee={nominee} open={voteOpen} onClose={() => setVoteOpen(false)} />
    </PublicLayout>
  );
}

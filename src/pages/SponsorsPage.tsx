import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getSponsors } from '@/lib/api';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, ExternalLink, Crown, ChevronRight } from 'lucide-react';
import type { Sponsor } from '@/types/types';
import { useNavigate } from 'react-router-dom';

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const navigate = useNavigate();

  useEffect(() => { getSponsors().then(setSponsors); }, []);

  const featured = sponsors.filter(s => s.is_featured);
  const regular = sponsors.filter(s => !s.is_featured);

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen">
        <div className="relative py-16 text-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(201,162,39,0.15), transparent 70%)' }} />
          <div className="relative z-10 container mx-auto px-4">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/30">Our Sponsors</Badge>
            <h1 className="text-3xl md:text-5xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>Proud Sponsors</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">Companies and organizations making TUNYA AWARDS possible</p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16 space-y-12">
          {featured.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gradient-gold mb-6 flex items-center gap-2"><Crown className="w-5 h-5 text-primary" /> Featured Sponsors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((s, i) => <SponsorCard key={s.id} sponsor={s} index={i} large />)}
              </div>
            </div>
          )}
          {regular.length > 0 && (
            <div>
              {featured.length > 0 && <h2 className="text-lg font-bold text-foreground mb-6">Other Sponsors</h2>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {regular.map((s, i) => <SponsorCard key={s.id} sponsor={s} index={i} />)}
              </div>
            </div>
          )}
          {sponsors.length === 0 && (
            <div className="text-center py-20">
              <Building2 className="w-16 h-16 text-primary/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-muted-foreground">No sponsors yet</h3>
            </div>
          )}
          <div className="glass-card rounded-2xl p-8 text-center">
            <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-black text-gradient-gold mb-2">Become a Sponsor</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">Partner with TUNYA AWARDS and gain massive exposure to Southern Zambia's most engaged audience.</p>
            <Button className="bg-gradient-gold text-primary-foreground font-bold" onClick={() => navigate('/sponsor-registration')}>
              Apply Now <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function SponsorCard({ sponsor: s, index, large }: { sponsor: Sponsor; index: number; large?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}>
      <div className={`glass-card rounded-xl p-5 hover-gold h-full flex flex-col ${large ? 'border-primary/30' : ''}`}>
        <div className="flex items-start gap-4 mb-3">
          {s.logo_url ? (
            <img src={s.logo_url} alt={s.company_name} className="w-14 h-14 object-contain rounded-lg border border-border shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-gradient-gold flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-black text-lg">{s.company_name[0]}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold truncate">{s.company_name}</h3>
            {s.package && <Badge className="mt-1 bg-primary/15 text-primary border-primary/30 text-[10px]">{s.package}</Badge>}
          </div>
        </div>
        {s.description && <p className="text-sm text-muted-foreground flex-1 line-clamp-2">{s.description}</p>}
        {s.website && (
          <a href={s.website} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline">
            <ExternalLink className="w-3 h-3" /> Visit Website
          </a>
        )}
      </div>
    </motion.div>
  );
}

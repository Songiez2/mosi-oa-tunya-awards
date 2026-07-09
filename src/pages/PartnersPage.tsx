import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPartners } from '@/lib/api';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Handshake, ExternalLink, ChevronRight } from 'lucide-react';
import type { Partner } from '@/types/types';
import { useNavigate } from 'react-router-dom';

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const navigate = useNavigate();

  useEffect(() => { getPartners().then(setPartners); }, []);

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen">
        <div className="relative py-16 text-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(201,162,39,0.15), transparent 70%)' }} />
          <div className="relative z-10 container mx-auto px-4">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/30">Our Partners</Badge>
            <h1 className="text-3xl md:text-5xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>Partners</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">Organizations collaborating to make this awards a success</p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16 space-y-10">
          {partners.length === 0 ? (
            <div className="text-center py-20">
              <Handshake className="w-16 h-16 text-primary/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-muted-foreground">No partners yet</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {partners.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <div className="glass-card rounded-xl p-5 hover-gold h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      {p.logo_url ? (
                        <img src={p.logo_url} alt={p.org_name} className="w-12 h-12 object-contain rounded-lg border border-border shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                          <span className="text-primary font-black">{p.org_name[0]}</span>
                        </div>
                      )}
                      <h3 className="font-bold text-sm truncate flex-1">{p.org_name}</h3>
                    </div>
                    {p.description && <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{p.description}</p>}
                    {p.rep_name && <p className="text-xs text-muted-foreground mt-1">Rep: {p.rep_name}</p>}
                    {p.website && (
                      <a href={p.website} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline">
                        <ExternalLink className="w-3 h-3" /> Website
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <div className="glass-card rounded-2xl p-8 text-center">
            <Handshake className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-black text-gradient-gold mb-2">Become a Partner</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">Join our network of partners and help celebrate excellence in Southern Zambia.</p>
            <Button className="bg-gradient-gold text-primary-foreground font-bold" onClick={() => navigate('/partner-registration')}>
              Apply Now <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

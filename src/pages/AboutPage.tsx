import React from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, Crown, Award, Users, Heart } from 'lucide-react';

export default function AboutPage() {
  const { settings } = useSettings();
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen">
        <div className="relative py-20 text-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(201,162,39,0.15), transparent 70%)' }} />
          <div className="relative z-10 container mx-auto px-4">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/30">Our Story</Badge>
            <h1 className="text-3xl md:text-5xl font-black text-gradient-gold mb-4" style={{ fontFamily: 'Cinzel, serif' }}>About TUNYA AWARDS</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {settings.about_content ?? 'The MOSI-OA TUNYA SOUTHERN AWARDS is the most prestigious celebration of excellence in Southern Zambia, recognizing talent, innovation, and achievement across all sectors.'}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16 max-w-4xl space-y-16">
          {/* Mission */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-black text-gradient-gold mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Our Mission</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                To celebrate and recognize outstanding talent, businesses, and organizations in Southern Zambia, providing a platform where excellence is rewarded and communities are empowered.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We believe that recognition drives excellence. By celebrating the best in Southern Zambia, we inspire others to strive for greatness and contribute to the development of our region.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-4">
              {[
                { icon: <Trophy className="w-6 h-6" />, title: '25+', desc: 'Award Categories' },
                { icon: <Users className="w-6 h-6" />, title: '100s', desc: 'Nominees' },
                { icon: <Star className="w-6 h-6" />, title: '1000s', desc: 'Votes Cast' },
                { icon: <Heart className="w-6 h-6" />, title: '2026', desc: 'Edition' },
              ].map(item => (
                <div key={item.title} className="glass-card rounded-xl p-4 text-center hover-gold">
                  <div className="text-primary mb-2 flex justify-center">{item.icon}</div>
                  <div className="text-xl font-black text-gradient-gold">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Values */}
          <div>
            <h2 className="text-2xl font-black text-gradient-gold mb-6 text-center" style={{ fontFamily: 'Cinzel, serif' }}>Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: <Award className="w-8 h-8" />, title: 'Excellence', desc: 'We recognize only the best, ensuring that our awards carry prestige and meaning.' },
                { icon: <Heart className="w-8 h-8" />, title: 'Integrity', desc: 'Fair, transparent processes in every nomination, voting, and judging process.' },
                { icon: <Crown className="w-8 h-8" />, title: 'Community', desc: 'Building a stronger Southern Zambia by celebrating its people and culture.' },
              ].map((v, i) => (
                <motion.div key={v.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="glass-card rounded-xl p-6 text-center hover-gold">
                    <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-4 text-primary-foreground">{v.icon}</div>
                    <h3 className="font-bold mb-2">{v.title}</h3>
                    <p className="text-xs text-muted-foreground">{v.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="glass-card rounded-2xl p-8 text-center">
            <h2 className="text-xl font-black text-gradient-gold mb-3">Join the Celebration</h2>
            <p className="text-muted-foreground text-sm mb-6">Be part of the biggest awards ceremony in Southern Zambia</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-gradient-gold text-primary-foreground font-bold" onClick={() => navigate('/vote')}>Vote Now</Button>
              <Button variant="secondary" className="border border-primary/30" onClick={() => navigate('/register-nominee')}>Register as Nominee</Button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

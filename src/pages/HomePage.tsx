import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSettings } from '@/contexts/SettingsContext';
import { getCategories, getFeaturedNominees, getSponsors, getPartners, getNews } from '@/lib/api';
import PublicLayout from '@/components/layouts/PublicLayout';
import NomineeCard from '@/components/common/NomineeCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trophy, Star, Users, Award, ChevronRight, Play, Mail, Phone,
  MapPin, Clock, Sparkles, Crown, Music, Camera, Mic2, Laugh,
  Instagram, Facebook, Youtube, Radio, Newspaper
} from 'lucide-react';
import type { Category, Nominee, Sponsor, Partner, News as NewsType } from '@/types/types';

// Category icon map
const categoryIcons: Record<string, React.ReactNode> = {
  'Artist': <Music className="w-5 h-5" />,
  'Model': <Crown className="w-5 h-5" />,
  'DJ': <Radio className="w-5 h-5" />,
  'Comedian': <Laugh className="w-5 h-5" />,
  'Photographer': <Camera className="w-5 h-5" />,
  'default': <Award className="w-5 h-5" />,
};

function getIcon(name: string) {
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return categoryIcons.default;
}

// Animated particles background
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${Math.random() * 4 + 4}s`,
            opacity: Math.random() * 0.6 + 0.2,
          }}
        />
      ))}
    </div>
  );
}

// Countdown Component
function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  return (
    <div className="flex gap-3 md:gap-4 justify-center">
      {Object.entries(timeLeft).map(([unit, val]) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="glass-dark rounded-lg px-3 py-2 md:px-4 md:py-3 min-w-[50px] md:min-w-[64px] text-center gold-border">
            <div className="text-xl md:text-3xl font-bold text-gradient-gold font-mono">{String(val).padStart(2, '0')}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground capitalize tracking-wider mt-0.5">{unit}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [nominees, setNominees] = React.useState<Nominee[]>([]);
  const [sponsors, setSponsors] = React.useState<Sponsor[]>([]);
  const [partners, setPartners] = React.useState<Partner[]>([]);
  const [news, setNews] = React.useState<NewsType[]>([]);

  useEffect(() => {
    getCategories(false).then(setCategories);
    getFeaturedNominees().then(setNominees);
    getSponsors().then(setSponsors);
    getPartners().then(setPartners);
    getNews(1, 3).then(r => setNews(r.data));
  }, []);

  const awardsDate = settings.awards_night_date ?? '2026-12-31T20:00:00';
  const currency = settings.currency ?? 'K';
  const votingFee = settings.voting_fee ?? 10;

  return (
    <PublicLayout>
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-background" />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 100% 80% at 50% -10%, rgba(201,162,39,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(139,105,20,0.10) 0%, transparent 60%)'
          }}
        />
        <Particles />

        {/* Gold lines */}
        <div className="absolute top-1/4 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,162,39,0.3), transparent)' }} />
        <div className="absolute top-3/4 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,162,39,0.2), transparent)' }} />

        <div className="relative z-10 container mx-auto px-4 text-center py-20">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-6 bg-primary/15 text-primary border-primary/30 px-4 py-1.5 text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
              Nominations Now Open
            </Badge>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-gold flex items-center justify-center gold-glow">
                <Trophy className="w-10 h-10 md:w-14 md:h-14 text-primary-foreground" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl md:text-5xl lg:text-7xl font-black text-gradient-gold mb-3 leading-tight text-balance"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            {settings.header_text ?? 'TUNYA AWARDS 2026'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="text-base md:text-xl text-muted-foreground mb-4 max-w-xl mx-auto"
          >
            Celebrating Excellence in Southern Zambia
          </motion.p>

          {/* Countdown */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8">
            <div className="text-xs text-muted-foreground mb-3 flex items-center justify-center gap-2">
              <Clock className="w-3.5 h-3.5 text-primary" /> Awards Night Countdown
            </div>
            <Countdown targetDate={awardsDate} />
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <Button
              size="lg"
              className="bg-gradient-gold text-primary-foreground font-bold px-6 py-3 text-sm hover:opacity-90 gold-glow"
              onClick={() => navigate('/vote')}
            >
              <Star className="w-4 h-4 mr-2" /> Vote Now
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="px-6 py-3 text-sm font-semibold border border-primary/30"
              onClick={() => navigate('/register-nominee')}
            >
              <Trophy className="w-4 h-4 mr-2" /> Register as Nominee
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="px-6 py-3 text-sm font-semibold border border-primary/20"
              onClick={() => navigate('/sponsor-registration')}
            >
              <Crown className="w-4 h-4 mr-2" /> Become a Sponsor
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary/40 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 rounded-full bg-primary" />
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="py-20 bg-muted/30 relative">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-primary/15 text-primary border-primary/30">About The Awards</Badge>
              <h2 className="text-2xl md:text-4xl font-black text-gradient-gold mb-5 text-balance" style={{ fontFamily: 'Cinzel, serif' }}>
                Celebrating Southern Zambia's Finest
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5">
                {settings.about_content ?? 'The TUNYA SOUTHERN AWARDS is the most prestigious awards ceremony in Southern Zambia, celebrating excellence across music, business, entertainment, and more.'}
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[['25+', 'Categories'], ['100s', 'Nominees'], ['1000s', 'Voters']].map(([num, label]) => (
                  <div key={label} className="text-center p-3 glass-card rounded-lg">
                    <div className="text-xl font-black text-gradient-gold">{num}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-video rounded-2xl glass-card overflow-hidden flex items-center justify-center relative">
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(201,162,39,0.15), transparent 70%)' }} />
                <Trophy className="w-24 h-24 text-primary/30" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="glass-dark rounded-lg p-3 text-center">
                    <div className="text-sm font-semibold text-gradient-gold">Awards Night 2026</div>
                    <div className="text-xs text-muted-foreground">Southern Zambia's Premier Awards</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">Award Categories</Badge>
            <h2 className="text-2xl md:text-4xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
              {categories.length} Award Categories
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">Recognizing talent and excellence across every discipline in Southern Zambia</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.02 }}
              >
                <Link to={`/categories?cat=${cat.id}`}>
                  <div className="glass-card rounded-xl p-4 text-center hover-gold group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-2.5 group-hover:bg-primary/25 transition-colors text-primary">
                      {getIcon(cat.name)}
                    </div>
                    <div className="text-xs font-medium text-foreground leading-tight">{cat.name.replace(' Award', '').replace(' of the Year', '')}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="secondary" className="border border-primary/30" onClick={() => navigate('/categories')}>
              View All Categories <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* ===== FEATURED NOMINEES ===== */}
      {nominees.length > 0 && (
        <section className="py-20 bg-muted/20 relative">
          <div className="section-divider absolute top-0 left-0 right-0" />
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">Featured Nominees</Badge>
              <h2 className="text-2xl md:text-4xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
                Top Contenders
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto text-sm">Vote for your favorites and help them win</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {nominees.map((n, i) => <NomineeCard key={n.id} nominee={n} index={i} />)}
            </div>

            <div className="text-center mt-10">
              <Button className="bg-gradient-gold text-primary-foreground font-semibold" onClick={() => navigate('/nominees')}>
                View All Nominees <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          <div className="section-divider absolute bottom-0 left-0 right-0" />
        </section>
      )}

      {/* ===== VOTING PROCESS ===== */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">How It Works</Badge>
            <h2 className="text-2xl md:text-4xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
              Voting Process
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Create Account', desc: 'Register for free with your email and phone number', icon: <Users className="w-6 h-6" /> },
              { step: '02', title: 'Choose Nominee', desc: 'Browse categories and find your favorite nominee', icon: <Star className="w-6 h-6" /> },
              { step: '03', title: 'Pay & Vote', desc: `Votes at ${currency}${votingFee} each. Pay via Mobile Money and upload proof`, icon: <Trophy className="w-6 h-6" /> },
              { step: '04', title: 'Votes Added', desc: 'Payment verified within 24 hours, votes automatically added', icon: <Award className="w-6 h-6" /> },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              >
                <div className="glass-card rounded-xl p-6 text-center hover-gold relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-gold text-primary-foreground text-xs font-black px-3 py-1 rounded-full">{s.step}</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3 mt-2 text-primary">
                    {s.icon}
                  </div>
                  <h3 className="font-bold text-sm mb-1.5">{s.title}</h3>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button className="bg-gradient-gold text-primary-foreground font-semibold" size="lg" onClick={() => navigate('/vote')}>
              Start Voting Now <Star className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ===== SPONSORS ===== */}
      {sponsors.length > 0 && (
        <section className="py-16 bg-muted/20 relative">
          <div className="section-divider absolute top-0 left-0 right-0" />
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">Our Sponsors</Badge>
              <h2 className="text-xl md:text-3xl font-black text-gradient-gold" style={{ fontFamily: 'Cinzel, serif' }}>Proud Sponsors</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {sponsors.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                >
                  <div className="glass-card rounded-xl p-4 flex items-center gap-3 hover-gold">
                    {s.logo_url ? (
                      <img src={s.logo_url} alt={s.company_name} className="w-12 h-12 object-contain rounded" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-card flex items-center justify-center text-primary font-bold text-sm">
                        {s.company_name[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-sm">{s.company_name}</div>
                      {s.package && <div className="text-xs text-primary">{s.package}</div>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="secondary" className="border border-primary/30" onClick={() => navigate('/sponsor-registration')}>
                Become a Sponsor <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          <div className="section-divider absolute bottom-0 left-0 right-0" />
        </section>
      )}

      {/* ===== PARTNERS ===== */}
      {partners.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">Our Partners</Badge>
              <h2 className="text-xl md:text-3xl font-black text-gradient-gold" style={{ fontFamily: 'Cinzel, serif' }}>Partners & Collaborators</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {partners.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <div className="glass-card rounded-xl p-3 flex items-center gap-2 hover-gold">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt={p.org_name} className="w-10 h-10 object-contain rounded" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-bold text-xs">
                        {p.org_name[0]}
                      </div>
                    )}
                    <span className="text-sm font-medium">{p.org_name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="secondary" className="border border-primary/30" onClick={() => navigate('/partner-registration')}>
                Become a Partner <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ===== NEWS ===== */}
      {news.length > 0 && (
        <section className="py-20 bg-muted/20 relative">
          <div className="section-divider absolute top-0 left-0 right-0" />
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">Latest Updates</Badge>
              <h2 className="text-2xl md:text-4xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>Latest News</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map((article, i) => (
                <motion.div key={article.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to={`/news/${article.id}`}>
                    <div className="glass-card rounded-xl overflow-hidden hover-gold h-full flex flex-col">
                      {article.image_url ? (
                        <div className="aspect-video overflow-hidden">
                          <img src={article.image_url} alt={article.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-card flex items-center justify-center">
                          <Newspaper className="w-10 h-10 text-primary/30" />
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-1">
                        <div className="text-xs text-muted-foreground mb-2">{new Date(article.created_at).toLocaleDateString()}</div>
                        <h3 className="font-bold text-sm mb-2 text-balance">{article.title}</h3>
                        {article.summary && <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{article.summary}</p>}
                        <div className="text-xs text-primary mt-2 font-medium">Read More →</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="secondary" className="border border-primary/30" onClick={() => navigate('/news')}>
                View All News <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          <div className="section-divider absolute bottom-0 left-0 right-0" />
        </section>
      )}

      {/* ===== CONTACT CTA ===== */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.12), transparent 70%)' }} />
            <div className="relative z-10">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-black text-gradient-gold mb-4 text-balance" style={{ fontFamily: 'Cinzel, serif' }}>
                Be Part of History
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join thousands of fans voting for their favorites at the most prestigious awards in Southern Zambia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                  {settings.help_number ?? '0962267118'}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                  {settings.help_email ?? 'info@tunyaawards.com'}
                </div>
              </div>
              <div className="flex gap-3 justify-center mt-6">
                <Button className="bg-gradient-gold text-primary-foreground font-semibold" onClick={() => navigate('/vote')}>Vote Now</Button>
                <Button variant="secondary" className="border border-primary/30" onClick={() => navigate('/contact')}>Contact Us</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

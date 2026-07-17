import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSettings } from '@/contexts/SettingsContext';
import {
  getCategories,
  getFeaturedNominees,
  getSponsors,
  getPartners,
  getNews,
} from '@/lib/api';
import PublicLayout from '@/components/layouts/PublicLayout';
import NomineeCard from '@/components/common/NomineeCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Camera,
  ChevronRight,
  Clock,
  Crown,
  Laugh,
  Mail,
  Music,
  Newspaper,
  Phone,
  Radio,
  Sparkles,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import type {
  Category,
  News as NewsType,
  Nominee,
  Partner,
  Sponsor,
} from '@/types/types';

const categoryIcons: Record<string, React.ReactNode> = {
  Artist: <Music className="h-5 w-5" />,
  Model: <Crown className="h-5 w-5" />,
  DJ: <Radio className="h-5 w-5" />,
  Comedian: <Laugh className="h-5 w-5" />,
  Photographer: <Camera className="h-5 w-5" />,
  default: <Award className="h-5 w-5" />,
};

function getCategoryIcon(name: string): React.ReactNode {
  const matchedIcon = Object.entries(categoryIcons).find(
    ([key]) => key !== 'default' && name.toLowerCase().includes(key.toLowerCase()),
  );

  return matchedIcon?.[1] ?? categoryIcons.default;
}

function Particles() {
  const particles = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    left: `${(index * 37) % 100}%`,
    top: `${(index * 53) % 100}%`,
    size: `${(index % 6) + 2}px`,
    delay: `${(index % 6) * 0.7}s`,
    duration: `${(index % 4) + 4}s`,
    opacity: 0.25 + (index % 4) * 0.12,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
            opacity: particle.opacity,
          }}
        />
      ))}
    </div>
  );
}

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const difference = new Date(targetDate).getTime() - Date.now();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / 86_400_000),
        hours: Math.floor((difference % 86_400_000) / 3_600_000),
        minutes: Math.floor((difference % 3_600_000) / 60_000),
        seconds: Math.floor((difference % 60_000) / 1_000),
      });
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex justify-center gap-3 md:gap-4">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="glass-dark gold-border min-w-[52px] rounded-lg px-3 py-2 text-center md:min-w-[64px] md:px-4 md:py-3">
            <div className="font-mono text-xl font-bold text-gradient-gold md:text-3xl">
              {String(value).padStart(2, '0')}
            </div>
            <div className="mt-0.5 text-[10px] capitalize tracking-wider text-muted-foreground md:text-xs">
              {unit}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [categories, setCategories] = useState<Category[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [news, setNews] = useState<NewsType[]>([]);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [categoryData, nomineeData, sponsorData, partnerData, newsResponse] =
          await Promise.all([
            getCategories(true),
            getFeaturedNominees(),
            getSponsors(),
            getPartners(),
            getNews(1, 3),
          ]);

        setCategories(categoryData ?? []);
        setNominees(nomineeData ?? []);
        setSponsors(sponsorData ?? []);
        setPartners(partnerData ?? []);
        setNews(newsResponse?.data ?? []);
      } catch (error) {
        console.error('Failed to load home page data:', error);
      }
    };

    void loadHomeData();
  }, []);

  const awardsDate = settings?.awards_night_date ?? '2026-12-31T20:00:00';
  const currency = settings?.currency ?? 'K';
  const votingFee = settings?.voting_fee ?? 10;

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero-bg.jpeg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <Particles />

        <div
          className="absolute left-0 right-0 top-1/4 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(201,162,39,0.3), transparent)',
          }}
        />

        <div
          className="absolute bottom-1/4 left-0 right-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(201,162,39,0.2), transparent)',
          }}
        />

        <div className="container relative z-10 mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 border-primary/30 bg-primary/15 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="mr-1.5 inline h-3.5 w-3.5" />
              Nominations Now Open
            </Badge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mb-6 flex items-center justify-center">
              <div className="gold-glow flex h-20 w-20 items-center justify-center rounded-full bg-gradient-gold md:h-28 md:w-28">
                <Trophy className="h-10 w-10 text-primary-foreground md:h-14 md:w-14" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-3 text-3xl font-black leading-tight text-gradient-gold md:text-5xl lg:text-7xl"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            {settings?.header_text ?? 'TUNYA AWARDS 2026'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mx-auto mb-4 max-w-xl text-base text-muted-foreground md:text-xl"
          >
            Celebrating Excellence in Southern Zambia
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="mb-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Awards Night Countdown
            </div>
            <Countdown targetDate={awardsDate} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              size="lg"
              className="gold-glow bg-gradient-gold px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
              onClick={() => navigate('/vote')}
            >
              <Star className="mr-2 h-4 w-4" />
              Vote Now
            </Button>

            <Button
              size="lg"
              variant="secondary"
              className="border border-primary/30 px-6 py-3 text-sm font-semibold"
              onClick={() => navigate('/register-nominee')}
            >
              <Trophy className="mr-2 h-4 w-4" />
              Register as Nominee
            </Button>

            <Button
              size="lg"
              variant="ghost"
              className="border border-primary/20 px-6 py-3 text-sm font-semibold"
              onClick={() => navigate('/sponsor-registration')}
            >
              <Crown className="mr-2 h-4 w-4" />
              Become a Sponsor
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="relative bg-muted/30 py-20">
        <div className="container mx-auto grid items-center gap-12 px-4 md:grid-cols-2">
          <div>
            <Badge className="mb-4 border-primary/30 bg-primary/15 text-primary">
              About The Awards
            </Badge>

            <h2
              className="mb-5 text-2xl font-black text-gradient-gold md:text-4xl"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Celebrating Southern Zambia&apos;s Finest
            </h2>

            <p className="mb-5 leading-relaxed text-muted-foreground">
              {settings?.about_content ??
                'The TUNYA SOUTHERN AWARDS is the most prestigious awards ceremony in Southern Zambia, celebrating excellence across music, business, entertainment, and more.'}
            </p>

            <div className="grid grid-cols-3 gap-4">
              {[
                ['25+', 'Categories'],
                ['100s', 'Nominees'],
                ['1000s', 'Voters'],
              ].map(([number, label]) => (
                <div key={label} className="glass-card rounded-lg p-3 text-center">
                  <div className="text-xl font-black text-gradient-gold">{number}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl">
            <Trophy className="h-24 w-24 text-primary/30" />
            <div className="glass-dark absolute bottom-4 left-4 right-4 rounded-lg p-3 text-center">
              <div className="text-sm font-semibold text-gradient-gold">
                Awards Night 2026
              </div>
              <div className="text-xs text-muted-foreground">
                Southern Zambia&apos;s Premier Awards
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-3 border-primary/30 bg-primary/15 text-primary">
              Award Categories
            </Badge>
            <h2
              className="mb-3 text-2xl font-black text-gradient-gold md:text-4xl"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              {categories.length} Award Categories
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {categories.slice(0, 10).map((category) => (
              <Link key={category.id} to={`/categories?cat=${category.id}`}>
                <div className="glass-card hover-gold cursor-pointer rounded-xl p-4 text-center">
                  <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                    {getCategoryIcon(category.name)}
                  </div>
                  <div className="text-xs font-medium">
                    {category.name.replace(' Award', '').replace(' of the Year', '')}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="secondary"
              className="border border-primary/30"
              onClick={() => navigate('/categories')}
            >
              View All Categories
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURED NOMINEES */}
      {nominees.length > 0 && (
        <section className="bg-muted/20 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <Badge className="mb-3 border-primary/30 bg-primary/15 text-primary">
                Featured Nominees
              </Badge>
              <h2
                className="text-2xl font-black text-gradient-gold md:text-4xl"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                Top Contenders
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {nominees.map((nominee, index) => (
                <NomineeCard key={nominee.id} nominee={nominee} index={index} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button
                className="bg-gradient-gold font-semibold text-primary-foreground"
                onClick={() => navigate('/nominees')}
              >
                View All Nominees
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* VOTING PROCESS */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-3 border-primary/30 bg-primary/15 text-primary">
              How It Works
            </Badge>
            <h2
              className="text-2xl font-black text-gradient-gold md:text-4xl"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Voting Process
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Create Account',
                description: 'Register for free with your email and phone number.',
                icon: <Users className="h-6 w-6" />,
              },
              {
                step: '02',
                title: 'Choose Nominee',
                description: 'Browse categories and find your favorite nominee.',
                icon: <Star className="h-6 w-6" />,
              },
              {
                step: '03',
                title: 'Pay & Vote',
                description: `Votes cost ${currency}${votingFee} each.`,
                icon: <Trophy className="h-6 w-6" />,
              },
              {
                step: '04',
                title: 'Votes Added',
                description: 'Verified votes are automatically added.',
                icon: <Award className="h-6 w-6" />,
              },
            ].map((item) => (
              <div key={item.step} className="glass-card hover-gold relative rounded-xl p-6 text-center">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-gold px-3 py-1 text-xs font-black text-primary-foreground">
                  {item.step}
                </div>
                <div className="mx-auto mb-3 mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                  {item.icon}
                </div>
                <h3 className="mb-1.5 text-sm font-bold">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS */}
      {news.length > 0 && (
        <section className="bg-muted/20 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <Badge className="mb-3 border-primary/30 bg-primary/15 text-primary">
                Latest Updates
              </Badge>
              <h2
                className="text-2xl font-black text-gradient-gold md:text-4xl"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                Latest News
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {news.map((article) => (
                <Link key={article.id} to={`/news/${article.id}`}>
                  <article className="glass-card hover-gold h-full overflow-hidden rounded-xl">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="aspect-video w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-gradient-card">
                        <Newspaper className="h-10 w-10 text-primary/30" />
                      </div>
                    )}

                    <div className="p-4">
                      <div className="mb-2 text-xs text-muted-foreground">
                        {new Date(article.created_at).toLocaleDateString()}
                      </div>
                      <h3 className="mb-2 text-sm font-bold">{article.title}</h3>
                      {article.summary && (
                        <p className="text-xs text-muted-foreground">{article.summary}</p>
                      )}
                      <div className="mt-3 text-xs font-medium text-primary">Read More →</div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-2xl p-8 text-center md:p-12">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h2
              className="mb-4 text-2xl font-black text-gradient-gold md:text-4xl"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Be Part of History
            </h2>

            <p className="mx-auto mb-8 max-w-lg text-muted-foreground">
              Join thousands of fans voting for their favorites at the most prestigious
              awards in Southern Zambia.
            </p>

            <div className="mb-6 flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground sm:flex-row">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                {settings?.help_number ?? '0962267118'}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                {settings?.help_email ?? 'info@tunyaawards.com'}
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button
                className="bg-gradient-gold font-semibold text-primary-foreground"
                onClick={() => navigate('/vote')}
              >
                Vote Now
              </Button>
              <Button
                variant="secondary"
                className="border border-primary/30"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
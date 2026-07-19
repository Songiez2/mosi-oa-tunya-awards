import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicLayout from '@/components/layouts/PublicLayout';
import { getNominees, getCategories, getSponsors, getPartners, getNews } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Trophy, Award, Crown, Users, Newspaper, X } from 'lucide-react';
import type { Nominee, Category, Sponsor, Partner, News as NewsType } from '@/types/types';

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState<{
    nominees: Nominee[];
    categories: Category[];
    sponsors: Sponsor[];
    partners: Partner[];
    news: NewsType[];
  }>({
    nominees: [],
    categories: [],
    sponsors: [],
    partners: [],
    news: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ nominees: [], categories: [], sponsors: [], partners: [], news: [] });
      return;
    }

    setLoading(true);
    const searchAll = async () => {
      const [nominees, categories, sponsors, partners, news] = await Promise.all([
        getNominees(1, 20, query, 'approved'),
        getCategories(false),
        getSponsors(),
        getPartners(),
        getNews(1, 20),
      ]);

      const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase())
      );
      const filteredSponsors = sponsors.filter(s =>
        s.company_name.toLowerCase().includes(query.toLowerCase())
      );
      const filteredPartners = partners.filter(p =>
        p.org_name.toLowerCase().includes(query.toLowerCase())
      );
      const filteredNews = news.data.filter(n =>
        n.title.toLowerCase().includes(query.toLowerCase()) ||
        (n.summary && n.summary.toLowerCase().includes(query.toLowerCase()))
      );

      setResults({
        nominees: nominees.data,
        categories: filteredCategories,
        sponsors: filteredSponsors,
        partners: filteredPartners,
        news: filteredNews,
      });
      setLoading(false);
    };

    const debounceTimer = setTimeout(searchAll, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const totalResults =
    results.nominees.length +
    results.categories.length +
    results.sponsors.length +
    results.partners.length +
    results.news.length;

  const getTabResults = () => {
    switch (activeTab) {
      case 'nominees':
        return results.nominees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.nominees.map(n => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-4 cursor-pointer hover-gold"
                onClick={() => navigate(`/nominee/${n.id}`)}
              >
                <div className="flex items-center gap-3">
                  {n.profile_picture_url ? (
                    <img src={n.profile_picture_url} alt={n.full_name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold">
                      {n.full_name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{n.full_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{(n.categories as { name?: string } | null)?.name ?? ''}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">No nominees found</div>
        );
      case 'categories':
        return results.categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {results.categories.map(c => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-xl p-4 text-center cursor-pointer hover-gold"
                onClick={() => navigate(`/categories?cat=${c.id}`)}
              >
                <Award className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-sm font-medium">{c.name}</div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">No categories found</div>
        );
      case 'sponsors':
        return results.sponsors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.sponsors.map(s => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-4 cursor-pointer hover-gold"
              >
                <div className="flex items-center gap-3">
                  {s.logo_url ? (
                    <img src={s.logo_url} alt={s.company_name} className="w-12 h-12 object-contain rounded" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-card flex items-center justify-center text-primary font-bold">
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
        ) : (
          <div className="text-center text-muted-foreground py-12">No sponsors found</div>
        );
      case 'partners':
        return results.partners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.partners.map(p => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-4 cursor-pointer hover-gold"
              >
                <div className="flex items-center gap-3">
                  {p.logo_url ? (
                    <img src={p.logo_url} alt={p.org_name} className="w-12 h-12 object-contain rounded" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-bold">
                      {p.org_name[0]}
                    </div>
                  )}
                  <div className="font-semibold text-sm">{p.org_name}</div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">No partners found</div>
        );
      case 'news':
        return results.news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.news.map(n => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl overflow-hidden cursor-pointer hover-gold"
                onClick={() => navigate(`/news/${n.id}`)}
              >
                {n.image_url && (
                  <img src={n.image_url} alt={n.title} className="w-full h-32 object-cover" />
                )}
                <div className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">{new Date(n.created_at).toLocaleDateString()}</div>
                  <div className="font-semibold text-sm">{n.title}</div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">No news found</div>
        );
      default:
        return (
          <div className="space-y-6">
            {results.nominees.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" /> Nominees ({results.nominees.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.nominees.map(n => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card rounded-xl p-4 cursor-pointer hover-gold"
                      onClick={() => navigate(`/nominee/${n.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        {n.profile_picture_url ? (
                          <img src={n.profile_picture_url} alt={n.full_name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold">
                            {n.full_name[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{n.full_name}</div>
                          <div className="text-xs text-muted-foreground truncate">{(n.categories as { name?: string } | null)?.name ?? ''}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            {results.categories.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" /> Categories ({results.categories.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {results.categories.map(c => (
                    <Badge key={c.id} className="cursor-pointer hover:bg-primary/20" onClick={() => navigate(`/categories?cat=${c.id}`)}>
                      {c.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {results.sponsors.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-primary" /> Sponsors ({results.sponsors.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.sponsors.map(s => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card rounded-xl p-4 cursor-pointer hover-gold"
                    >
                      <div className="flex items-center gap-3">
                        {s.logo_url ? (
                          <img src={s.logo_url} alt={s.company_name} className="w-12 h-12 object-contain rounded" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-card flex items-center justify-center text-primary font-bold">
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
              </div>
            )}
            {results.partners.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Partners ({results.partners.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.partners.map(p => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card rounded-xl p-4 cursor-pointer hover-gold"
                    >
                      <div className="flex items-center gap-3">
                        {p.logo_url ? (
                          <img src={p.logo_url} alt={p.org_name} className="w-12 h-12 object-contain rounded" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-bold">
                            {p.org_name[0]}
                          </div>
                        )}
                        <div className="font-semibold text-sm">{p.org_name}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            {results.news.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-primary" /> News ({results.news.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.news.map(n => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card rounded-xl overflow-hidden cursor-pointer hover-gold"
                      onClick={() => navigate(`/news/${n.id}`)}
                    >
                      {n.image_url && (
                        <img src={n.image_url} alt={n.title} className="w-full h-32 object-cover" />
                      )}
                      <div className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">{new Date(n.created_at).toLocaleDateString()}</div>
                        <div className="font-semibold text-sm">{n.title}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 max-w-5xl py-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-gradient-gold mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
              Search
            </h1>
            <p className="text-muted-foreground">Find nominees, categories, sponsors, partners, and news</p>
          </motion.div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              className="pl-12 pr-10 h-12 text-base bg-input border-border"
              placeholder="Search for anything..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {query.length >= 2 && !loading && (
            <div className="mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-muted border border-border">
                  <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
                  <TabsTrigger value="nominees">Nominees ({results.nominees.length})</TabsTrigger>
                  <TabsTrigger value="categories">Categories ({results.categories.length})</TabsTrigger>
                  <TabsTrigger value="sponsors">Sponsors ({results.sponsors.length})</TabsTrigger>
                  <TabsTrigger value="partners">Partners ({results.partners.length})</TabsTrigger>
                  <TabsTrigger value="news">News ({results.news.length})</TabsTrigger>
                </TabsList>
                <TabsContent value={activeTab} className="mt-6">
                  {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Searching...</div>
                  ) : totalResults === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No results found for "{query}"
                    </div>
                  ) : (
                    getTabResults()
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {query.length < 2 && (
            <div className="text-center py-12 text-muted-foreground">
              Enter at least 2 characters to search
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

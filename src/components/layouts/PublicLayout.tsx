import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, User, LogOut, LayoutDashboard, X } from 'lucide-react';

const AWARD_IMG = 'https://miaoda-conversation-file.s3cdn.medo.dev/user-cvrqrcumnmkg/app-cvv0uos78av5/20260709/AWARD.png';

/** Parse "Label:/path,Label2:/path2" or JSON array strings from settings into [name, path][] */
function parseLinks(raw: string | undefined, fallback: string[][]): string[][] {
  if (!raw) return fallback;
  // Coerce non-string values (e.g. arrays/objects stored in DB) to string
  const str = typeof raw === 'string' ? raw : JSON.stringify(raw);
  try {
    const arr = JSON.parse(str);
    if (Array.isArray(arr)) {
      return arr.map((s: string) => {
        const strVal = typeof s === 'string' ? s : String(s);
        const idx = strVal.lastIndexOf(':');
        if (idx > 0) return [strVal.slice(0, idx), strVal.slice(idx)];
        return [strVal, '/'];
      });
    }
  } catch { /* not JSON */ }
  // CSV format: "Home:/,Nominees:/nominees"
  return str.split(',').map(item => {
    const idx = item.lastIndexOf(':');
    if (idx > 0) return [item.slice(0, idx).trim(), item.slice(idx).trim()];
    return [item.trim(), '/'];
  }).filter(([n]) => n.length > 0);
}

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Categories', path: '/categories' },
  { name: 'Nominees', path: '/nominees' },
  { name: 'Vote', path: '/vote' },
  { name: 'Sponsors', path: '/sponsors' },
  { name: 'Partners', path: '/partners' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'News', path: '/news' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-dark shadow-lg' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={AWARD_IMG} alt="TUNYA Awards Trophy" className="h-10 w-auto object-contain" />
            <span className="font-bold text-sm text-gradient-gold hidden md:block truncate max-w-[180px]">
              {settings.header_text ?? 'TUNYA AWARDS 2026'}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  isActive(link.path)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-8 px-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {profile?.full_name?.[0] ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs hidden sm:block truncate max-w-[80px]">{profile?.full_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="h-8 text-xs hidden sm:flex" onClick={() => navigate('/login')}>Login</Button>
                <Button size="sm" className="h-8 text-xs bg-gradient-gold text-primary-foreground font-semibold hidden sm:flex" onClick={() => navigate('/register')}>Register</Button>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden h-8 w-8 p-0">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-sidebar w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
                    <div className="flex items-center gap-2">
                      <img src={AWARD_IMG} alt="TUNYA Awards" className="h-8 w-auto object-contain" />
                      <span className="font-bold text-sm text-gradient-gold">TUNYA AWARDS</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setMobileOpen(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {navLinks.map(link => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                          isActive(link.path) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </nav>
                  <div className="p-4 border-t border-sidebar-border space-y-2">
                    {user ? (
                      <>
                        <div className="text-xs text-muted-foreground px-2 mb-2">Signed in as {profile?.full_name}</div>
                        {isAdmin && (
                          <Button className="w-full" size="sm" variant="secondary" onClick={() => { navigate('/admin'); setMobileOpen(false); }}>
                            <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                          </Button>
                        )}
                        <Button className="w-full" size="sm" variant="ghost" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
                          <LogOut className="w-4 h-4 mr-2" /> Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button className="w-full" size="sm" variant="secondary" onClick={() => { navigate('/login'); setMobileOpen(false); }}>Login</Button>
                        <Button className="w-full bg-gradient-gold text-primary-foreground" size="sm" onClick={() => { navigate('/register'); setMobileOpen(false); }}>Register</Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="min-w-0">{children}</main>

      {/* Footer */}
      <footer className="bg-muted border-t border-border mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={AWARD_IMG} alt="TUNYA Awards" className="h-10 w-auto object-contain" />
                <span className="font-bold text-gradient-gold">{settings.website_name ?? 'TUNYA AWARDS'}</span>
              </div>
              <p className="text-sm text-muted-foreground">{settings.footer_text ?? '© 2026 MOSI-OA - TUNYA SOUTHERN AWARDS'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Quick Links</h4>
              <ul className="space-y-2">
                {parseLinks(settings.quick_links as string | undefined,
                  [['Home', '/'], ['Nominees', '/nominees'], ['Vote', '/vote'], ['Categories', '/categories']]
                ).map(([n, p]) => (
                  <li key={p}><Link to={p} className="text-sm text-muted-foreground hover:text-primary transition-colors">{n}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Support</h4>
              <ul className="space-y-2">
                {parseLinks(settings.support_links as string | undefined,
                  [['About', '/about'], ['Contact', '/contact'], ['FAQ', '/faq'], ['Privacy Policy', '/privacy']]
                ).map(([n, p]) => (
                  <li key={p}><Link to={p} className="text-sm text-muted-foreground hover:text-primary transition-colors">{n}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Contact</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Phone: {settings.help_number ?? '0962267118'}</p>
                <p>Email: {settings.help_email ?? 'info@tunyaawards.com'}</p>
                {settings.office_address && <p>{settings.office_address as string}</p>}
              </div>
            </div>
          </div>
          <div className="section-divider my-8" />
          <p className="text-center text-xs text-muted-foreground">{settings.footer_text ?? '© 2026 MOSI-OA - TUNYA SOUTHERN AWARDS. All rights reserved.'}</p>
        </div>
      </footer>
    </div>
  );
}

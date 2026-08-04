import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Menu, Trophy, LayoutDashboard, Users, Star, Tag, CreditCard,
  Vote, Building2, Handshake, Image, Newspaper, Settings,
  LogOut, Shield, BarChart3, MessageSquare, Bell, X
} from 'lucide-react';
import { toast } from 'sonner';

const sidebarItems = [
  { group: 'Overview', items: [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  ]},
  { group: 'Management', items: [
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Nominees', path: '/admin/nominees', icon: Star },
    { name: 'Categories', path: '/admin/categories', icon: Tag },
    { name: 'Voters', path: '/admin/voters', icon: Vote },
    { name: 'Votes', path: '/admin/votes', icon: Vote },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
  ]},
  { group: 'Applications', items: [
    { name: 'Sponsors', path: '/admin/sponsors', icon: Building2 },
    { name: 'Partners', path: '/admin/partners', icon: Handshake },
  ]},
  { group: 'Content', items: [
    { name: 'Hero Slides', path: '/admin/hero-slides', icon: Image },
    { name: 'Tickets', path: '/admin/tickets', icon: CreditCard },
    { name: 'News', path: '/admin/news', icon: Newspaper },
    { name: 'Gallery', path: '/admin/gallery', icon: Image },
    { name: 'Announcements', path: '/admin/announcements', icon: Bell },
    { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
  ]},
  { group: 'Reports', items: [
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Audit Logs', path: '/admin/audit', icon: Shield },
  ]},
  { group: 'Config', items: [
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ]},
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border shrink-0">
        <Link to="/admin" className="flex items-center gap-2" onClick={onClose}>
          <img src="https://miaoda-conversation-file.s3cdn.medo.dev/user-cvrqrcumnmkg/app-cvv0uos78av5/20260709/AWARD.png" alt="Trophy" className="h-9 w-auto object-contain" />
          <div className="min-w-0">
            <div className="text-xs font-bold text-gradient-gold truncate">TUNYA AWARDS</div>
            <div className="text-[10px] text-muted-foreground">Admin Panel</div>
          </div>
        </Link>
        {onClose && (
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 md:hidden" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Profile */}
      <div className="p-3 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-sidebar-accent">
          <Avatar className="w-7 h-7 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {profile?.full_name?.[0] ?? 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium truncate">{profile?.full_name}</div>
            <Badge variant="outline" className="text-[9px] h-4 px-1 text-primary border-primary/40">{profile?.role}</Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        {sidebarItems.map(group => (
          <div key={group.group}>
            <div className="px-2 mb-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{group.group}</span>
            </div>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors ${
                      active
                        ? 'bg-primary/15 text-primary font-medium'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : ''}`} />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border shrink-0 space-y-1">
        <Link to="/" onClick={onClose} className="flex items-center gap-2.5 px-2.5 py-2 rounded text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors">
          <Trophy className="w-4 h-4 shrink-0" />
          View Site
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile } = useAuth();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-56 bg-sidebar" onOpenAutoFocus={e => e.preventDefault()}>
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Trophy className="w-5 h-5 text-primary shrink-0" />
            <span className="font-bold text-sm text-gradient-gold truncate">TUNYA AWARDS — Admin</span>
          </div>
          <Avatar className="w-7 h-7 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {profile?.full_name?.[0] ?? 'A'}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-w-0 overflow-x-hidden p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

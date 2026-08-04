import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Vote, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Vote, label: 'Vote', path: '/vote' },
    { icon: Ticket, label: 'Tickets', path: '/tickets' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border pb-[env(safe-area-inset-bottom)] glass-dark">
      <div className="flex items-center justify-around h-16 container mx-auto max-w-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-md" />
              )}
              <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

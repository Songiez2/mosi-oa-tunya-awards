import React from 'react';
import { Trophy } from 'lucide-react';

export default function GoldLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <Trophy className="absolute inset-0 m-auto w-5 h-5 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

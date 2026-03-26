'use client';

import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

export function HubHeader() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-white/60 dark:bg-gray-950/60 border-b border-border/30">
      <Link href="/hub" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <span className="font-bold text-lg tracking-tight">SEELD</span>
      </Link>

      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full px-4 py-2 hover:bg-muted/50"
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>לוח בקרה</span>
      </Link>
    </header>
  );
}

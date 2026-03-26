'use client';

import {
  UserPlus, ScanSearch, Lightbulb, FileText, BarChart3,
  Headphones, PenTool, Calendar, type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatTemplate } from '@/types/hub';

const iconMap: Record<string, LucideIcon> = {
  UserPlus, ScanSearch, Lightbulb, FileText, BarChart3,
  Headphones, PenTool, Calendar,
};

interface TemplateCardProps {
  template: ChatTemplate;
  index: number;
  onSelect: (template: ChatTemplate) => void;
}

export function TemplateCard({ template, index, onSelect }: TemplateCardProps) {
  const Icon = iconMap[template.icon] || FileText;

  return (
    <button
      onClick={() => onSelect(template)}
      className={cn(
        'group flex items-center gap-3 p-4 rounded-2xl text-right',
        'bg-background/60 backdrop-blur-sm border border-border/40',
        'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
        'hover:scale-[1.02] active:scale-[0.98]',
        'transition-all duration-300 ease-out',
        'animate-in fade-in zoom-in-95'
      )}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
    >
      <div className={cn(
        'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0',
        'shadow-sm group-hover:shadow-md transition-shadow',
        template.color
      )}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-foreground truncate">{template.title}</span>
        <span className="text-xs text-muted-foreground truncate">{template.description}</span>
      </div>
    </button>
  );
}

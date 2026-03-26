'use client';

import type { ChatTemplate } from '@/types/hub';
import { templates } from './TemplateData';
import { TemplateCard } from './TemplateCard';

interface TemplateGridProps {
  onSelect: (template: ChatTemplate) => void;
}

export function TemplateGrid({ onSelect }: TemplateGridProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {templates.map((template, i) => (
          <TemplateCard
            key={template.id}
            template={template}
            index={i}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

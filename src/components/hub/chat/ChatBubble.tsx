'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/hub';
import { PillButton } from '../shared/PillButton';

interface ChatBubbleProps {
  message: ChatMessage;
  index: number;
}

export function ChatBubble({ message, index }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'justify-start' : 'justify-end'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shrink-0 mt-1 shadow-md">
          <span className="text-white text-xs font-bold">S</span>
        </div>
      )}

      <div className={cn('max-w-[80%] flex flex-col gap-2', isUser ? 'items-start' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted/80 text-foreground rounded-bl-sm backdrop-blur-sm border border-border/30'
          )}
        >
          {message.content}
        </div>

        {/* Action buttons */}
        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {message.actions.map((action, i) => (
              <Link key={i} href={action.href || '#'}>
                <PillButton
                  size="sm"
                  variant={action.variant === 'primary' ? 'dark' : 'light'}
                >
                  {action.label}
                </PillButton>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

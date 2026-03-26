'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'dark' | 'light' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(
  ({ className, variant = 'dark', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-all duration-300',
          'hover:scale-[1.02] active:scale-[0.98]',
          {
            'bg-foreground text-background shadow-lg hover:shadow-xl': variant === 'dark',
            'bg-background text-foreground border-2 border-border hover:border-foreground/30': variant === 'light',
            'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50': variant === 'ghost',
          },
          {
            'px-4 py-2 text-sm gap-1.5': size === 'sm',
            'px-6 py-3 text-sm gap-2': size === 'md',
            'px-8 py-4 text-base gap-2.5': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PillButton.displayName = 'PillButton';

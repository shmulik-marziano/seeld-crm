'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send, Sparkles, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputBarProps {
  onSend: (message: string) => void;
  onToggleTemplates: () => void;
  onClear?: () => void;
  isChatActive: boolean;
  disabled?: boolean;
}

export function ChatInputBar({ onSend, onToggleTemplates, onClear, isChatActive, disabled }: ChatInputBarProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, onSend, disabled]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div
        className={cn(
          'flex items-end gap-2 rounded-full border bg-background/90 backdrop-blur-md shadow-lg',
          'transition-all duration-300',
          'focus-within:shadow-xl focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10',
          'px-3 py-2'
        )}
      >
        {/* Template trigger */}
        <button
          type="button"
          onClick={onToggleTemplates}
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          title="תבניות"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Clear chat */}
        {isChatActive && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="נקה צ'אט"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="שאל אותי כל דבר..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent border-0 outline-none text-sm leading-relaxed py-2 px-1 placeholder:text-muted-foreground/60 min-h-[36px] max-h-[120px]"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className={cn(
            'shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
            value.trim()
              ? 'bg-foreground text-background shadow-md hover:scale-105 active:scale-95'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          <Send className="w-4 h-4 rotate-180" />
        </button>
      </div>

      <p className="text-center text-[11px] text-muted-foreground/50 mt-2">
        SEELD AI - העוזר החכם שלך
      </p>
    </div>
  );
}

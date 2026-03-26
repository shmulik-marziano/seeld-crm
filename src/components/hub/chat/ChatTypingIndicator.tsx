'use client';

export function ChatTypingIndicator() {
  return (
    <div className="flex gap-3 justify-end animate-in fade-in duration-200">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shrink-0 mt-1 shadow-md">
        <span className="text-white text-xs font-bold">S</span>
      </div>
      <div className="bg-muted/80 backdrop-blur-sm border border-border/30 rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

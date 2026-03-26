'use client';

import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/hub';
import { ChatMessages } from './ChatMessages';

interface ChatContainerProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isChatActive: boolean;
}

export function ChatContainer({ messages, isLoading, isChatActive }: ChatContainerProps) {
  return (
    <div
      className={cn(
        'transition-all duration-500 ease-out overflow-hidden',
        isChatActive
          ? 'flex-1 opacity-100'
          : 'max-h-0 opacity-0'
      )}
    >
      <div className="h-full overflow-y-auto px-2 scrollbar-thin">
        <ChatMessages messages={messages} isLoading={isLoading} />
      </div>
    </div>
  );
}

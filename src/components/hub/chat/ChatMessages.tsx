'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types/hub';
import { ChatBubble } from './ChatBubble';
import { ChatTypingIndicator } from './ChatTypingIndicator';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col gap-4 py-4">
      {messages.map((msg, i) => (
        <ChatBubble key={msg.id} message={msg} index={i} />
      ))}
      {isLoading && <ChatTypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}

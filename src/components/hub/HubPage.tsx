'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useChat } from '@/hooks/useChat';
import type { ChatTemplate } from '@/types/hub';

import { OfficeBackground } from './office/OfficeBackground';
import { HubHeader } from './HubHeader';
import { ChatWelcome } from './chat/ChatWelcome';
import { ChatContainer } from './chat/ChatContainer';
import { ChatInputBar } from './chat/ChatInputBar';
import { TemplateGrid } from './templates/TemplateGrid';

interface HubPageProps {
  userName: string;
}

export function HubPage({ userName }: HubPageProps) {
  const { messages, isLoading, isChatActive, sendMessage, selectTemplate, clearChat } = useChat();
  const [showTemplates, setShowTemplates] = useState(true);

  const handleTemplateSelect = (template: ChatTemplate) => {
    selectTemplate(template.id, template.prompt);
    setShowTemplates(false);
  };

  const handleToggleTemplates = () => {
    setShowTemplates((prev) => !prev);
  };

  const handleClear = () => {
    clearChat();
    setShowTemplates(true);
  };

  return (
    <div className="relative flex flex-col h-[100dvh] overflow-hidden">
      <OfficeBackground />

      <div className="relative z-10 flex flex-col h-full">
        <HubHeader />

        {/* Main content area */}
        <div className="flex-1 flex flex-col items-center overflow-hidden">
          {/* Scrollable content */}
          <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col overflow-hidden px-4">
            {/* Welcome section - collapses when chat active */}
            <div
              className={cn(
                'transition-all duration-500 ease-out overflow-hidden shrink-0',
                isChatActive
                  ? 'max-h-0 opacity-0 py-0'
                  : 'max-h-[400px] opacity-100 py-4'
              )}
            >
              <ChatWelcome userName={userName} />
            </div>

            {/* Chat messages */}
            <ChatContainer
              messages={messages}
              isLoading={isLoading}
              isChatActive={isChatActive}
            />

            {/* Templates - shown below welcome or toggled in chat mode */}
            <div
              className={cn(
                'transition-all duration-400 ease-out overflow-hidden shrink-0',
                showTemplates
                  ? 'max-h-[600px] opacity-100 py-4'
                  : 'max-h-0 opacity-0 py-0'
              )}
            >
              <TemplateGrid onSelect={handleTemplateSelect} />
            </div>
          </div>

          {/* Input bar - sticky bottom */}
          <div className="w-full shrink-0 pb-6 pt-3 bg-gradient-to-t from-white/80 via-white/60 to-transparent dark:from-gray-950/80 dark:via-gray-950/60 backdrop-blur-sm">
            <ChatInputBar
              onSend={sendMessage}
              onToggleTemplates={handleToggleTemplates}
              onClear={isChatActive ? handleClear : undefined}
              isChatActive={isChatActive}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

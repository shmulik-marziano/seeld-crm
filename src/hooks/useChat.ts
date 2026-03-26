'use client';

import { useState, useCallback } from 'react';
import type { ChatMessage } from '@/types/hub';

const SMART_RESPONSES: Record<string, { content: string; actions?: ChatMessage['actions'] }> = {
  'customer': {
    content: 'מעולה! בוא ניצור לקוח חדש במערכת. לחץ על הכפתור למטה כדי להתחיל.',
    actions: [{ label: 'צור לקוח חדש', href: '/customers/new', variant: 'primary' }],
  },
  'x-ray': {
    content: 'כלי X-RAY מנתח את תיק הביטוח של הלקוח ומזהה פערים, כפילויות ועמלות גבוהות. בוא נתחיל ניתוח.',
    actions: [{ label: 'פתח X-RAY', href: '/x-ray', variant: 'primary' }],
  },
  'wise': {
    content: 'כלי WISE מייצר המלצות חכמות על בסיס ניתוח X-RAY. בוא נראה מה מומלץ.',
    actions: [{ label: 'פתח WISE', href: '/wise', variant: 'primary' }],
  },
  'stage': {
    content: 'כלי STAGE מאפשר ליצור, לשלוח ולעקוב אחרי הצעות מחיר. מוכן?',
    actions: [{ label: 'פתח STAGE', href: '/stage', variant: 'primary' }],
  },
  'pulse': {
    content: 'כלי PULSE מציג את מדדי הביצועים שלך - לקוחות חדשים, פרמיות, עמלות ופגישות.',
    actions: [{ label: 'פתח PULSE', href: '/pulse', variant: 'primary' }],
  },
  'desk': {
    content: 'כלי DESK מנהל פניות שירות - תביעות, שינויי פוליסה, חיובים ועוד.',
    actions: [{ label: 'פתח DESK', href: '/desk', variant: 'primary' }],
  },
  'sign': {
    content: 'כלי SIGN מנהל חתימות דיגיטליות - ייפוי כוח, הצהרות בריאות, נספחי העברה ועוד.',
    actions: [{ label: 'פתח SIGN', href: '/sign', variant: 'primary' }],
  },
};

function generateResponse(userMessage: string): { content: string; actions?: ChatMessage['actions'] } {
  const lower = userMessage.toLowerCase();

  for (const [key, response] of Object.entries(SMART_RESPONSES)) {
    if (lower.includes(key)) return response;
  }

  // Hebrew keyword matching
  if (lower.includes('לקוח') || lower.includes('חדש')) return SMART_RESPONSES['customer'];
  if (lower.includes('ניתוח') || lower.includes('תיק') || lower.includes('סריקה')) return SMART_RESPONSES['x-ray'];
  if (lower.includes('המלצ')) return SMART_RESPONSES['wise'];
  if (lower.includes('הצעת מחיר') || lower.includes('הצעה')) return SMART_RESPONSES['stage'];
  if (lower.includes('ביצועים') || lower.includes('מדדים') || lower.includes('דוח')) return SMART_RESPONSES['pulse'];
  if (lower.includes('שירות') || lower.includes('פניי') || lower.includes('תביע')) return SMART_RESPONSES['desk'];
  if (lower.includes('חתימה') || lower.includes('מסמך') || lower.includes('ייפוי')) return SMART_RESPONSES['sign'];
  if (lower.includes('פגישה') || lower.includes('יומן')) {
    return {
      content: 'אני יכול לעזור לך עם ניהול פגישות. לחץ למטה לצפייה ביומן הפגישות.',
      actions: [{ label: 'פגישות', href: '/meetings', variant: 'primary' }],
    };
  }
  if (lower.includes('משימה') || lower.includes('workflow')) {
    return {
      content: 'בוא נבדוק את המשימות הפתוחות שלך.',
      actions: [{ label: 'משימות', href: '/workflows', variant: 'primary' }],
    };
  }

  return {
    content: 'אני כאן לעזור! אתה יכול לשאול אותי על ניתוח תיקים, המלצות, הצעות מחיר, ביצועים, פניות שירות או חתימות דיגיטליות. או פשוט בחר אחד מהתבניות למטה.',
  };
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isChatActive = messages.length > 0;

  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(content);
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        actions: response.actions,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 800 + Math.random() * 600);
  }, []);

  const selectTemplate = useCallback((templateId: string, prompt: string) => {
    sendMessage(prompt);
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setIsLoading(false);
  }, []);

  return { messages, isLoading, isChatActive, sendMessage, selectTemplate, clearChat };
}

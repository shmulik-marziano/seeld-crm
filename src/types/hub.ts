export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  templateId?: string;
  actions?: ChatAction[];
  isStreaming?: boolean;
}

export interface ChatAction {
  label: string;
  href?: string;
  variant: 'primary' | 'secondary';
}

export interface ChatTemplate {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: 'customer' | 'policy' | 'analysis' | 'document' | 'meeting' | 'workflow';
  color: string;
  prompt: string;
  linkedTool?: string;
}

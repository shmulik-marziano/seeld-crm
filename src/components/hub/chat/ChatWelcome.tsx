'use client';

import { GradientText } from '../shared/GradientText';

interface ChatWelcomeProps {
  userName: string;
}

export function ChatWelcome({ userName }: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Logo mark */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-primary/20 mb-2">
        <span className="text-white font-bold text-2xl">S</span>
      </div>

      {/* Greeting */}
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
        שלום, <GradientText>{userName}</GradientText>
      </h1>

      <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
        איך אפשר לעזור לך היום?
      </p>
    </div>
  );
}

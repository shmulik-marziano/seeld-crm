'use client';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientText({ children, className = '' }: GradientTextProps) {
  return (
    <span
      className={`bg-clip-text text-transparent bg-gradient-to-l from-primary via-purple-500 to-pink-500 ${className}`}
    >
      {children}
    </span>
  );
}

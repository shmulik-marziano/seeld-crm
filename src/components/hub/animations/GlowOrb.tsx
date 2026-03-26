'use client';

interface GlowOrbProps {
  color: string;
  size: number;
  top: string;
  left: string;
  delay?: number;
}

export function GlowOrb({ color, size, top, left, delay = 0 }: GlowOrbProps) {
  return (
    <div
      className="absolute rounded-full opacity-30 blur-3xl pointer-events-none"
      style={{
        background: color,
        width: size,
        height: size,
        top,
        left,
        animation: `hubFloat 12s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

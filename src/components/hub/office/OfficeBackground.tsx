'use client';

import { GlowOrb } from '../animations/GlowOrb';

export function OfficeBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-b from-white via-gray-50/80 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(220 90% 56%) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating gradient orbs */}
      <GlowOrb
        color="linear-gradient(135deg, hsl(220 90% 70%), hsl(260 75% 68%))"
        size={500}
        top="-10%"
        left="60%"
        delay={0}
      />
      <GlowOrb
        color="linear-gradient(135deg, hsl(290 75% 68%), hsl(350 90% 72%))"
        size={400}
        top="50%"
        left="-5%"
        delay={4}
      />
      <GlowOrb
        color="linear-gradient(135deg, hsl(350 90% 72%), hsl(220 90% 70%))"
        size={350}
        top="70%"
        left="70%"
        delay={8}
      />

      {/* Global keyframes */}
      <style jsx global>{`
        @keyframes hubFloat {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
          }
          33% {
            transform: translateY(-30px) translateX(15px) scale(1.05);
          }
          66% {
            transform: translateY(20px) translateX(-10px) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}

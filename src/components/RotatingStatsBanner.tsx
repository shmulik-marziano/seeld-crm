import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Shield, 
  Award, 
  Users, 
  Zap,
  Target,
  CheckCircle2,
  Star,
  Sparkles,
  BadgeCheck
} from 'lucide-react';

interface StatItem {
  icon: React.ElementType;
  text: string;
  color: string;
}

const allStats: StatItem[] = [
  { icon: Users, text: '+600 לקוחות', color: 'from-primary-500 to-primary-600' },
  { icon: Sparkles, text: 'מנוהל AI', color: 'from-secondary-500 to-secondary-600' },
  { icon: CheckCircle2, text: '100% שקיפות', color: 'from-accent-500 to-accent-600' },
  { icon: BadgeCheck, text: 'מורשה ומוסדר', color: 'from-primary-500 to-secondary-600' },
  { icon: TrendingUp, text: '+1000 פוליסות', color: 'from-secondary-500 to-accent-600' },
  { icon: Zap, text: 'פי 16 תפוקה', color: 'from-accent-500 to-primary-600' },
  { icon: Shield, text: 'מאובטח 100%', color: 'from-primary-600 to-primary-700' },
  { icon: Target, text: '+600 מטרות הושגו', color: 'from-secondary-600 to-secondary-700' },
  { icon: Award, text: 'שירות מצוין', color: 'from-accent-600 to-accent-700' },
  { icon: Star, text: 'דירוג 5 כוכבים', color: 'from-primary-500 to-accent-500' },
];

const RotatingStatsBanner = () => {
  const [currentStats, setCurrentStats] = useState<StatItem[]>([]);
  const [fadeIn, setFadeIn] = useState(true);

  // Select 4 random stats to display
  const selectRandomStats = () => {
    const shuffled = [...allStats].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  };

  useEffect(() => {
    // Initialize with random stats
    setCurrentStats(selectRandomStats());

    // Rotate stats every 4 seconds
    const interval = setInterval(() => {
      setFadeIn(false);
      
      setTimeout(() => {
        setCurrentStats(selectRandomStats());
        setFadeIn(true);
      }, 500); // Wait for fade out before changing content
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 py-4 overflow-hidden relative border-t border-b border-primary-500/20">
      {/* Background Effects */}
      <div className="absolute inset-0 chip-pattern opacity-5" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-full bg-primary-500/5 blur-3xl animate-pulse" />
        <div className="absolute top-0 right-1/4 w-96 h-full bg-secondary-500/5 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Stats Container */}
      <div className="container mx-auto px-4 relative z-10">
        <div 
          className={`flex flex-wrap justify-center items-center gap-6 md:gap-10 transition-all duration-500 ${
            fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {currentStats.map((stat, index) => (
            <div
              key={`${stat.text}-${index}`}
              className="group relative"
              style={{ 
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* Circular Badge */}
              <div className={`
                relative flex items-center gap-3 px-5 py-3 rounded-full
                bg-gradient-to-br ${stat.color}
                shadow-lg hover:shadow-2xl
                transform transition-all duration-300
                hover:scale-110 hover:-translate-y-1
                glass-effect
              `}>
                {/* Glow Effect */}
                <div className={`
                  absolute inset-0 rounded-full bg-gradient-to-br ${stat.color}
                  opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300
                `} />
                
                {/* Icon */}
                <div className="relative z-10 flex-shrink-0">
                  <stat.icon className="text-white drop-shadow-lg" size={22} strokeWidth={2.5} />
                </div>
                
                {/* Text */}
                <span className="relative z-10 text-white font-bold text-sm md:text-base whitespace-nowrap drop-shadow-lg">
                  {stat.text}
                </span>

                {/* Shine Effect */}
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </div>
              </div>

              {/* Pulse Ring */}
              <div className={`
                absolute inset-0 rounded-full bg-gradient-to-br ${stat.color}
                opacity-0 group-hover:opacity-30
                animate-ping
              `} style={{ animationDuration: '2s' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RotatingStatsBanner;

import {
  PiggyBank,
  Wallet,
  TrendingUp,
  Building2,
  HandCoins,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SavingsData {
  grossSavings: number;
  pensionSavings: number;
  severance: number;
  deposits: number;
  taxExempt: number;
  coverage: number;
}

interface SavingsCardsProps {
  data: SavingsData;
  className?: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(value);
};

const cardConfig = [
  {
    key: "grossSavings" as keyof SavingsData,
    title: "חיסכון גולמי",
    icon: PiggyBank,
    color: "blue",
    bgGradient: "from-blue-50 to-blue-100/50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    key: "pensionSavings" as keyof SavingsData,
    title: "חיסכון לקצבה",
    icon: Wallet,
    color: "green",
    bgGradient: "from-green-50 to-green-100/50",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    key: "severance" as keyof SavingsData,
    title: "פיצויים",
    icon: HandCoins,
    color: "purple",
    bgGradient: "from-purple-50 to-purple-100/50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    key: "deposits" as keyof SavingsData,
    title: "מרכז הפקדות",
    icon: Building2,
    color: "orange",
    bgGradient: "from-orange-50 to-orange-100/50",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    key: "taxExempt" as keyof SavingsData,
    title: "פטורים וזכויות",
    icon: TrendingUp,
    color: "teal",
    bgGradient: "from-teal-50 to-teal-100/50",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    key: "coverage" as keyof SavingsData,
    title: "סה״כ כיסויים",
    icon: ShieldCheck,
    color: "red",
    bgGradient: "from-red-50 to-red-100/50",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
];

export const SavingsCards = ({ data, className }: SavingsCardsProps) => {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4", className)}>
      {cardConfig.map((card) => {
        const Icon = card.icon;
        const value = data[card.key];

        return (
          <div
            key={card.key}
            className={cn(
              "savings-card relative overflow-hidden rounded-xl p-5 border border-crm-border-light",
              `bg-gradient-to-br ${card.bgGradient}`
            )}
          >
            {/* Decorative corner */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-white/30 rounded-br-full" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    card.iconBg
                  )}
                >
                  <Icon className={cn("h-5 w-5", card.iconColor)} />
                </div>
              </div>

              <p className="text-sm text-crm-text-secondary mb-1">{card.title}</p>
              <p className="text-xl font-bold text-crm-text-primary">
                {formatCurrency(value)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SavingsCards;

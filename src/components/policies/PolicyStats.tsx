import { Card } from '@/components/ui/card';
import { FileText, DollarSign, Shield, TrendingUp } from 'lucide-react';

interface PolicyStatsProps {
  policies: any[];
}

const PolicyStats = ({ policies }: PolicyStatsProps) => {
  const totalPolicies = policies.length;
  const activePolicies = policies.filter(p => p.status === 'active').length;
  const totalPremium = policies
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + Number(p.premium), 0);
  const totalCoverage = policies
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + Number(p.coverage_amount), 0);

  const stats = [
    {
      icon: FileText,
      label: 'סך הפוליסות',
      value: totalPolicies.toString(),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Shield,
      label: 'פוליסות פעילות',
      value: activePolicies.toString(),
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      icon: DollarSign,
      label: 'פרמיה חודשית',
      value: `₪${totalPremium.toLocaleString()}`,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: TrendingUp,
      label: 'כיסוי כולל',
      value: `₪${(totalCoverage / 1000000).toFixed(1)}M`,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-6 glass-card hover-lift">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={stat.color} size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default PolicyStats;

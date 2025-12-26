import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Users, Brain, ArrowRight } from 'lucide-react';
import FuturisticBackground from '@/components/FuturisticBackground';

const Services = () => {
  const services = [
    {
      icon: User,
      title: 'לקוחות פרטיים',
      description: 'ייעוץ פיננסי מותאם אישית עם AI מתקדם. ביטוח, פנסיה וחיסכון מותאמים לצרכים שלכם.',
      link: '/services/individuals',
      color: 'primary',
      features: [
        'ביטוח חיים ובריאות',
        'תכנון פנסיוני',
        'ייעוץ פיננסי מקיף',
        'ליווי אישי 24/7'
      ]
    },
    {
      icon: Users,
      title: 'סוכני ביטוח',
      description: 'בית תיווך מתקדם לסוכנים עצמאיים. תשתית טכנולוגית וכלי ניהול לקוחות מתקדמים.',
      link: '/services/agents',
      color: 'secondary',
      features: [
        'תשתית טכנולוגית מתקדמת',
        'מערכת CRM משולבת',
        'כלי ניהול לקוחות',
        'תמיכה ושירות מלאים'
      ]
    },
    {
      icon: Brain,
      title: 'מערכת SeeLD AI',
      description: 'טכנולוגיה מהפכנית לפרודוקטיביות x16. בינה מלאכותית לניתוח ואופטימיזציה פיננסית.',
      link: '/services/seeld-ai',
      color: 'accent',
      features: [
        'ניתוח פיננסי אוטומטי',
        'המלצות מותאמות אישית',
        'זיהוי פערי כיסוי',
        'אופטימיזציה של עלויות'
      ]
    }
  ];

  return (
    <div className="flex flex-col relative">
      <FuturisticBackground />
      {/* Hero */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              השירותים שלנו
            </h1>
            <p className="text-xl text-muted-foreground">
              פתרונות פיננסיים מתקדמים לכל צורך - מלקוחות פרטיים ועד סוכנים מקצועיים
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="p-8 hover-lift shadow-soft flex flex-col">
                  <div className={`w-16 h-16 mb-6 rounded-full bg-${service.color}/10 flex items-center justify-center`}>
                    <Icon className={`text-${service.color}`} size={32} />
                  </div>
                  <h3 className="text-2xl font-bold font-heading mb-4">{service.title}</h3>
                  <p className="text-muted-foreground mb-6 flex-grow">{service.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full bg-${service.color}`}></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link to={service.link}>
                      למידע נוסף
                      <ArrowRight className="mr-2" size={18} />
                    </Link>
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-heading mb-6">
              לא בטוחים איזה שירות מתאים לכם?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              צוות המומחים שלנו ישמח לסייע ולהתאים את הפתרון המושלם עבורכם
            </p>
            <Button size="lg" asChild>
              <Link to="/contact">
                צרו קשר עכשיו
                <ArrowRight className="mr-2" size={20} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;

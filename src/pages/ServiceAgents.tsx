import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Laptop, Users, BarChart3, Headphones, CheckCircle2, ArrowRight } from 'lucide-react';
import FuturisticBackground from '@/components/FuturisticBackground';

const ServiceAgents = () => {
  return (
    <div className="flex flex-col relative">
      <FuturisticBackground />
      {/* Hero */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              בית תיווך לסוכני ביטוח
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              תשתית טכנולוגית מתקדמת וכלי ניהול לקוחות לסוכנים עצמאיים
            </p>
            <Button size="lg" asChild className="shadow-primary">
              <Link to="/contact">
                הצטרף כסוכן
                <ArrowRight className="mr-2" size={20} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-heading text-center mb-12">
            מה אנחנו מציעים לסוכנים
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 hover-lift shadow-soft">
              <Laptop className="text-primary mb-4" size={48} />
              <h3 className="text-2xl font-bold font-heading mb-4">תשתית טכנולוגית מתקדמת</h3>
              <p className="text-muted-foreground mb-4">
                פלטפורמה דיגיטלית מלאה עם כל הכלים שאתם צריכים לניהול עסק מצליח.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">מערכת ניהול לקוחות (CRM)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">כלי AI לניתוח פוליסות</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">אוטומציה של תהליכים</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 hover-lift shadow-soft">
              <Users className="text-secondary mb-4" size={48} />
              <h3 className="text-2xl font-bold font-heading mb-4">כלי ניהול לקוחות</h3>
              <p className="text-muted-foreground mb-4">
                מעקב מלא אחר לקוחות, פוליסות ותהליכי מכירה בממשק אחד ופשוט.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-secondary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">דשבורד ניהול מתקדם</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-secondary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">תזכורות אוטומטיות</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-secondary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">ניהול משימות ופגישות</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 hover-lift shadow-soft">
              <BarChart3 className="text-accent mb-4" size={48} />
              <h3 className="text-2xl font-bold font-heading mb-4">מערכת CRM משולבת</h3>
              <p className="text-muted-foreground mb-4">
                כל המידע במקום אחד - לקוחות, פוליסות, עסקאות ודוחות בזמן אמת.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-accent flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">דוחות והתראות בזמן אמת</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-accent flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">ניתוח ביצועים</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-accent flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">תחזיות מכירות</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 hover-lift shadow-soft">
              <Headphones className="text-primary mb-4" size={48} />
              <h3 className="text-2xl font-bold font-heading mb-4">תמיכה ושירות מלאים</h3>
              <p className="text-muted-foreground mb-4">
                צוות תמיכה ייעודי זמין עבורכם לכל שאלה או בעיה.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">תמיכה טכנית 24/7</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">הדרכה והטמעה</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">עדכונים שוטפים</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-heading text-center mb-12">
            למה לבחור ב-SeeLD?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold font-heading text-primary mb-2">x16</div>
              <h3 className="text-lg font-bold font-heading mb-2">פרודוקטיביות</h3>
              <p className="text-sm text-muted-foreground">
                הגדלה משמעותית ביכולת לנהל לקוחות ופוליסות
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold font-heading text-secondary mb-2">100%</div>
              <h3 className="text-lg font-bold font-heading mb-2">אוטומציה</h3>
              <p className="text-sm text-muted-foreground">
                תהליכים אוטומטיים לחיסכון בזמן ומאמץ
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold font-heading text-accent mb-2">24/7</div>
              <h3 className="text-lg font-bold font-heading mb-2">זמינות</h3>
              <p className="text-sm text-muted-foreground">
                המערכת והתמיכה זמינים בכל עת
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-heading mb-6">
              מוכנים להצטרף?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              הצטרפו למאות סוכנים שכבר מנצלים את הכוח של SeeLD
            </p>
            <Button size="lg" asChild className="shadow-primary">
              <Link to="/contact">
                הצטרף עכשיו
                <ArrowRight className="mr-2" size={20} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceAgents;

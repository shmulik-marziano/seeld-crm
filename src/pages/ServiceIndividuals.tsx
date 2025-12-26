import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Heart, TrendingUp, User, CheckCircle2, ArrowRight } from 'lucide-react';
import FuturisticBackground from '@/components/FuturisticBackground';

const ServiceIndividuals = () => {
  return (
    <div className="flex flex-col relative">
      <FuturisticBackground />
      {/* Hero */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              שירותים ללקוחות פרטיים
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              ייעוץ פיננסי מותאם אישית עם טכנולוגיית AI מתקדמת
            </p>
            <Button size="lg" asChild className="shadow-primary">
              <Link to="/contact">
                קבע ייעוץ חינם
                <ArrowRight className="mr-2" size={20} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-heading text-center mb-12">
            השירותים שלנו
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 hover-lift shadow-soft">
              <Shield className="text-primary mb-4" size={48} />
              <h3 className="text-2xl font-bold font-heading mb-4">ביטוח חיים</h3>
              <p className="text-muted-foreground mb-4">
                כיסוי ביטוחי מקיף המותאם לצרכי המשפחה שלך. הגנה פיננסית מלאה למקרים בלתי צפויים.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">ביטוח חיים סטנדרטי ומשכנתא</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">ביטוח אובדן כושר עבודה</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">כיסוי למחלות קשות</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 hover-lift shadow-soft">
              <Heart className="text-secondary mb-4" size={48} />
              <h3 className="text-2xl font-bold font-heading mb-4">ביטוח בריאות</h3>
              <p className="text-muted-foreground mb-4">
                פוליסות בריאות מקיפות המעניקות מענה רפואי מהיר ואיכותי בכל מצב.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-secondary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">ביטוח בריאות משלים</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-secondary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">ביטוח סיעודי</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-secondary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">כיסוי רפואי בחו"ל</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 hover-lift shadow-soft">
              <TrendingUp className="text-accent mb-4" size={48} />
              <h3 className="text-2xl font-bold font-heading mb-4">פנסיה וחיסכון</h3>
              <p className="text-muted-foreground mb-4">
                תכנון פנסיוני חכם לעתיד בטוח. ייעוץ מקצועי לבניית תיק חיסכון אופטימלי.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-accent flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">קרנות פנסיה וביטוח מנהלים</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-accent flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">קופות גמל להשקעה</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-accent flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">תכנון מס והטבות</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 hover-lift shadow-soft">
              <User className="text-primary mb-4" size={48} />
              <h3 className="text-2xl font-bold font-heading mb-4">ייעוץ פיננסי</h3>
              <p className="text-muted-foreground mb-4">
                ליווי פיננסי מקיף ומותאם אישית. ניתוח מצב, תכנון יעדים והשגת יציבות כלכלית.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">ניתוח מצב פיננסי</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">תכנון יעדים כלכליים</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm">ליווי מתמשך</span>
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
            היתרונות שלנו
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="text-primary" size={32} />
              </div>
              <h3 className="text-lg font-bold font-heading mb-2">ניתוח AI מתקדם</h3>
              <p className="text-sm text-muted-foreground">
                המערכת שלנו מנתחת את המצב שלך ומזהה הזדמנויות לחיסכון ושיפור
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
                <CheckCircle2 className="text-secondary" size={32} />
              </div>
              <h3 className="text-lg font-bold font-heading mb-2">שקיפות מלאה</h3>
              <p className="text-sm text-muted-foreground">
                כל המידע והעלויות בפניך בצורה ברורה וללא הפתעות
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <CheckCircle2 className="text-accent" size={32} />
              </div>
              <h3 className="text-lg font-bold font-heading mb-2">ליווי אישי</h3>
              <p className="text-sm text-muted-foreground">
                יועץ אישי מקצועי ללווי אותך לאורך כל הדרך
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
              מוכנים להתחיל?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              קבעו פגישת ייעוץ חינם עם אחד המומחים שלנו
            </p>
            <Button size="lg" asChild className="shadow-primary">
              <Link to="/contact">
                קבע פגישה עכשיו
                <ArrowRight className="mr-2" size={20} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceIndividuals;

import { Card } from '@/components/ui/card';
import { Target, Eye, Award, Heart, Users, Zap } from 'lucide-react';
import FuturisticBackground from '@/components/FuturisticBackground';

const About = () => {
  return (
    <div className="flex flex-col relative">
      <FuturisticBackground />
      {/* Hero */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              אודות SeeLD
            </h1>
            <p className="text-xl text-muted-foreground">
              משנים את עולם הפיננסים בעזרת בינה מלאכותית וטכנולוגיה מתקדמת
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-heading mb-8 text-center">הסיפור שלנו</h2>
            <div className="prose prose-lg max-w-none text-foreground">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                SeeLD נוסדה מתוך הבנה עמוקה שעולם הפיננסים זקוק למהפכה טכנולוגית. ראינו איך טכנולוגיית הבינה המלאכותית יכולה לשנות את הדרך שבה אנשים מקבלים ייעוץ פיננסי ומנהלים את כספם.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                החזון שלנו היה ליצור פלטפורמה שמשלבת את הטכנולוגיה המתקדמת ביותר עם הליווי האנושי המקצועי, כדי לספק ללקוחותינו את השירות הטוב ביותר בשוק.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                היום, אנחנו גאים להוביל את המהפכה הדיגיטלית בעולם הפיננסים הישראלי, ולספק שירותי ייעוץ וניהול פיננסי ללקוחות פרטיים וסוכנים ברחבי הארץ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 hover-lift shadow-soft">
              <Target className="text-primary mb-4" size={48} />
              <h3 className="text-2xl font-bold font-heading mb-4">החזון שלנו</h3>
              <p className="text-muted-foreground leading-relaxed">
                להפוך את הייעוץ הפיננסי לנגיש, שקוף ואפקטיבי לכל אדם בישראל, באמצעות שילוב של טכנולוגיה מתקדמת ומקצועיות אנושית.
              </p>
            </Card>
            
            <Card className="p-8 hover-lift shadow-soft">
              <Eye className="text-secondary mb-4" size={48} />
              <h3 className="text-2xl font-bold font-heading mb-4">המשימה שלנו</h3>
              <p className="text-muted-foreground leading-relaxed">
                לספק פתרונות פיננסיים מותאמים אישית המבוססים על טכנולוגיית AI מתקדמת, תוך שמירה על ערכי שקיפות, מקצועיות ושירות ברמה הגבוהה ביותר.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-heading mb-12 text-center">הערכים שלנו</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 text-center hover-lift shadow-soft">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="text-primary" size={32} />
              </div>
              <h3 className="text-lg font-bold font-heading mb-2">שקיפות</h3>
              <p className="text-sm text-muted-foreground">
                כל המידע והעלויות בפניכם בצורה ברורה ונגישה
              </p>
            </Card>
            
            <Card className="p-6 text-center hover-lift shadow-soft">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
                <Zap className="text-secondary" size={32} />
              </div>
              <h3 className="text-lg font-bold font-heading mb-2">חדשנות</h3>
              <p className="text-sm text-muted-foreground">
                שימוש בטכנולוגיות החדשניות ביותר בשוק
              </p>
            </Card>
            
            <Card className="p-6 text-center hover-lift shadow-soft">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="text-accent" size={32} />
              </div>
              <h3 className="text-lg font-bold font-heading mb-2">מקצועיות</h3>
              <p className="text-sm text-muted-foreground">
                צוות מומחים מנוסה ומיומן בכל תחומי הפיננסים
              </p>
            </Card>
            
            <Card className="p-6 text-center hover-lift shadow-soft">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="text-primary" size={32} />
              </div>
              <h3 className="text-lg font-bold font-heading mb-2">התמקדות בלקוח</h3>
              <p className="text-sm text-muted-foreground">
                הצרכים והיעדים שלכם במרכז כל החלטה
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-heading mb-12 text-center">המספרים מדברים בעד עצמם</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: '₪500M+', label: 'בפוליסות מנוהלות' },
              { value: '5,000+', label: 'לקוחות מרוצים' },
              { value: '98%', label: 'שביעות רצון' },
              { value: '24/7', label: 'שירות זמין' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold font-heading text-primary mb-2">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

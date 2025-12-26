import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calculator, FileText, HelpCircle, Download, ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import FuturisticBackground from '@/components/FuturisticBackground';

const Resources = () => {
  return (
    <div className="flex flex-col relative">
      <FuturisticBackground />
      {/* Hero */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              משאבים ומידע
            </h1>
            <p className="text-xl text-muted-foreground">
              כלים, מחשבונים ומידע שימושי לניהול פיננסי חכם
            </p>
          </div>
        </div>
      </section>

      {/* Calculators */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-heading text-center mb-12">
            מחשבונים פיננסיים
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 text-center hover-lift shadow-soft">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Calculator className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-4">מחשבון פנסיה</h3>
              <p className="text-sm text-muted-foreground mb-6">
                חשבו כמה תצטרכו לחסוך לפנסיה בריאה
              </p>
              <Button variant="outline" className="w-full">
                לחץ לחישוב
                <ArrowRight className="mr-2" size={18} />
              </Button>
            </Card>

            <Card className="p-8 text-center hover-lift shadow-soft">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
                <Calculator className="text-secondary" size={32} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-4">מחשבון ביטוח</h3>
              <p className="text-sm text-muted-foreground mb-6">
                חשבו את הכיסוי הביטוחי הנדרש למשפחתכם
              </p>
              <Button variant="outline" className="w-full">
                לחץ לחישוב
                <ArrowRight className="mr-2" size={18} />
              </Button>
            </Card>

            <Card className="p-8 text-center hover-lift shadow-soft">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <Calculator className="text-accent" size={32} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-4">מחשבון משכנתא</h3>
              <p className="text-sm text-muted-foreground mb-6">
                חשבו את ההחזר החודשי והעלות הכוללת
              </p>
              <Button variant="outline" className="w-full">
                לחץ לחישוב
                <ArrowRight className="mr-2" size={18} />
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Blog/Articles Preview */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-heading text-center mb-12">
            מאמרים וטיפים
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: 'כיצד לבחור ביטוח חיים נכון',
                excerpt: 'מדריך מקיף לבחירת פוליסת ביטוח חיים המתאימה לצרכים שלכם',
                icon: BookOpen,
                color: 'primary'
              },
              {
                title: 'תכנון פנסיוני חכם',
                excerpt: 'כל מה שצריך לדעת על חיסכון לפנסיה והבטחת עתיד כלכלי',
                icon: FileText,
                color: 'secondary'
              },
              {
                title: 'ניהול תיק השקעות',
                excerpt: 'עקרונות בסיסיים לבניית תיק השקעות מאוזן ומניב',
                icon: BookOpen,
                color: 'accent'
              }
            ].map((article, index) => {
              const Icon = article.icon;
              return (
                <Card key={index} className="p-6 hover-lift shadow-soft cursor-pointer">
                  <Icon className={`text-${article.color} mb-4`} size={40} />
                  <h3 className="text-xl font-bold font-heading mb-3">{article.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{article.excerpt}</p>
                  <Button variant="link" className="p-0">
                    קרא עוד
                    <ArrowRight className="mr-2" size={16} />
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-heading text-center mb-4">
            שאלות נפוצות
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            תשובות לשאלות הנפוצות ביותר
          </p>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg px-6 shadow-soft">
                <AccordionTrigger className="text-right hover:no-underline">
                  מה זה SeeLD AI ואיך זה עובד?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  SeeLD AI היא מערכת בינה מלאכותית מתקדמת שמנתחת את המצב הפיננסי שלך ומספקת המלצות מותאמות אישית. המערכת סורקת את כל הפוליסות והחיסכון שלך, מזהה פערים והזדמנויות, ומציעה פתרונות אופטימליים.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-lg px-6 shadow-soft">
                <AccordionTrigger className="text-right hover:no-underline">
                  האם השירות בתשלום?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  הייעוץ הראשוני וניתוח המצב הפיננסי הם ללא עלות. לאחר מכן, נציע לכם תוכנית התאמה אישית על פי הצרכים שלכם.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-lg px-6 shadow-soft">
                <AccordionTrigger className="text-right hover:no-underline">
                  כמה זמן לוקח התהליך?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  הניתוח הראשוני לוקח כמה דקות בלבד. תהליך מלא של בחינה והתאמת פתרונות יכול לקחת מספר ימים, תלוי במורכבות המצב.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-lg px-6 shadow-soft">
                <AccordionTrigger className="text-right hover:no-underline">
                  האם המידע שלי מאובטח?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  בהחלט. אנחנו משתמשים בטכנולוגיות אבטחה מתקדמות ביותר להגנה על המידע שלכם. כל הנתונים מוצפנים ונשמרים על פי תקני האבטחה הגבוהים ביותר.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-lg px-6 shadow-soft">
                <AccordionTrigger className="text-right hover:no-underline">
                  איך אני יכול להתחיל?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  פשוט לחצו על "התחל עכשיו" או "קבע פגישה" בכל דף באתר, ומלאו את הפרטים הבסיסיים. אנחנו ניצור איתכם קשר בהקדם.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Downloads */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-heading text-center mb-12">
            מדריכים להורדה
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              'מדריך לבחירת ביטוח חיים',
              'תכנון פנסיוני - המדריך המלא',
              'טיפים לחיסכון חכם',
              'הבנת פוליסות ביטוח'
            ].map((guide, index) => (
              <Card key={index} className="p-6 flex items-center justify-between hover-lift shadow-soft cursor-pointer">
                <div className="flex items-center gap-3">
                  <FileText className="text-primary" size={24} />
                  <span className="font-medium">{guide}</span>
                </div>
                <Button size="icon" variant="ghost">
                  <Download size={20} />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Resources;

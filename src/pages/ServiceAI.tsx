import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Coins, 
  FileText, 
  Search, 
  BarChart3, 
  Bell,
  Users,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Download
} from 'lucide-react';
import FuturisticBackground from '@/components/FuturisticBackground';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const ServiceAI = () => {
  const heroSection = useScrollAnimation({ threshold: 0.2, animationType: 'zoom-in' });
  const problemSection = useScrollAnimation({ threshold: 0.15, animationType: 'slide-from-left' });
  const solutionSection = useScrollAnimation({ threshold: 0.15, animationType: 'slide-from-right' });
  const architectureSection = useScrollAnimation({ threshold: 0.15, animationType: 'scale-in' });
  const featuresSection = useScrollAnimation({ threshold: 0.15, animationType: 'fade-in-up' });
  const ctaSection = useScrollAnimation({ threshold: 0.2, animationType: 'zoom-in' });

  return (
    <div className="flex flex-col relative">
      <FuturisticBackground />
      {/* Hero */}
      <section 
        ref={heroSection.elementRef}
        className={`py-20 bg-gradient-to-br from-primary-50 via-white to-accent-50 transition-all duration-700 ${
          heroSection.isVisible ? `opacity-100 ${heroSection.animationClass}` : 'opacity-0'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-primary-100">
                <Bot className="text-primary-600 icon-bounce" size={64} />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              מערכת SeelD AI
            </h1>
            <p className="text-2xl text-primary-600 font-semibold mb-4">
              המערכת שמגדילה סוכן אחד ל-16
            </p>
            <p className="text-xl text-neutral-700 mb-8 leading-relaxed">
              ארכיטקטורה ייחודית שמתחילה מהכסף ובונה אחורה. לא עוד כלי - מהפכה אמיתית.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section 
        ref={problemSection.elementRef}
        className={`py-20 bg-white transition-all duration-700 ${
          problemSection.isVisible ? `opacity-100 ${problemSection.animationClass}` : 'opacity-0'
        }`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-4">
            למה התעשייה תקועה בשנות ה-90?
          </h2>
          <p className="text-center text-neutral-600 mb-12 max-w-2xl mx-auto">
            זה לא בגלל שהסוכנים רעים. זה בגלל שהמערכות גרועות.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { stat: '85%', label: 'מזמן הסוכן', sub: 'עבודה אדמיניסטרטיבית' },
              { stat: '48h', label: 'זמן ממוצע', sub: 'לענות ללקוח' },
              { stat: '30%', label: 'מהעמלות', sub: 'אובדות בגלל מעקב ידני' },
              { stat: '0%', label: 'שקיפות', sub: 'בתהליך' },
            ].map((item, index) => (
              <Card key={index} className="p-6 text-center border-2 border-destructive/50 bg-destructive/5 hover-lift">
                <AlertCircle className="text-destructive mx-auto mb-3 icon-pulse" size={32} />
                <div className="text-3xl font-bold text-destructive mb-2">{item.stat}</div>
                <p className="text-sm font-semibold text-neutral-900 mb-1">{item.label}</p>
                <p className="text-xs text-neutral-600">{item.sub}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Three Unique Props */}
      <section 
        ref={solutionSection.elementRef}
        className={`py-20 bg-neutral-50 transition-all duration-700 ${
          solutionSection.isVisible ? `opacity-100 ${solutionSection.animationClass}` : 'opacity-0'
        }`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-4">
            SeelD AI - לא עוד כלי. מהפכה.
          </h2>
          <p className="text-center text-neutral-600 mb-12 max-w-2xl mx-auto">
            שלוש חידושים שמשנים את כללי המשחק
          </p>
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Prop 1 */}
            <Card className="p-8 md:p-10 border-2 border-primary-400 bg-gradient-to-br from-primary-400 to-primary-600 text-white">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white text-primary-600 flex items-center justify-center text-2xl font-bold shadow-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold font-heading mb-4">
                    מהכסף אחורה (From Money Backwards)
                  </h3>
                  <p className="text-lg text-white/90 mb-6 leading-relaxed">
                    רוב המערכות מתחילות מהלקוח. אנחנו מתחילים מהעמלה ועוקבים אחורה. למה? כי העמלה היא האמת.
                  </p>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
                    <div className="flex items-center justify-center gap-4 text-lg font-semibold">
                      <span>עמלה</span>
                      <ArrowRight size={20} />
                      <span>פוליסה</span>
                      <ArrowRight size={20} />
                      <span>לקוח</span>
                      <ArrowRight size={20} />
                      <span>ליד</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Prop 2 */}
            <Card className="p-8 md:p-10 border-2 border-secondary-400 bg-gradient-to-br from-secondary-400 to-secondary-600 text-white">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white text-secondary-600 flex items-center justify-center text-2xl font-bold shadow-lg">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold font-heading mb-4">
                    AI-Native, לא Bolt-On
                  </h3>
                  <p className="text-lg text-white/90 leading-relaxed">
                    לא הוספנו צ'אטבוט למערכת ישנה. בנינו מאפס עם AI בליבה של הארכיטקטורה.
                  </p>
                </div>
              </div>
            </Card>

            {/* Prop 3 */}
            <Card className="p-8 md:p-10 border-2 border-accent-400 bg-gradient-to-br from-accent-400 to-accent-600 text-white">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white text-accent-600 flex items-center justify-center text-2xl font-bold shadow-lg">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold font-heading mb-4">
                    16x Productivity
                  </h3>
                  <p className="text-lg text-white/90 mb-6 leading-relaxed">
                    סוכן אחד + SeelD AI = תפוקה של 16 סוכנים רגילים. לא אגדה. מתמטיקה.
                  </p>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20 text-center">
                    <div className="text-2xl font-bold">
                      1 סוכן × SeelD AI = 16 סוכנים
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Six Features */}
      <section 
        ref={featuresSection.elementRef}
        className={`py-20 bg-white transition-all duration-700 ${
          featuresSection.isVisible ? `opacity-100 ${featuresSection.animationClass}` : 'opacity-0'
        }`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-12">
            היכולות של המערכת
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 hover-scale border-2">
              <Coins className="text-primary-600 mb-4 icon-spin" size={40} />
              <h3 className="text-xl font-bold font-heading mb-3">Commission Intelligence</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                עקיבת עמלות בזמן אמת עם אינטגרציה בנקאית, זיהוי הזדמנויות, חיזוי הכנסות.
              </p>
            </Card>

            <Card className="p-6 hover-scale border-2">
              <Bot className="text-secondary-600 mb-4 icon-bounce" size={40} />
              <h3 className="text-xl font-bold font-heading mb-3">Ra'am AI Assistant</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                תקשורת 24/7 עם לקוחות, איסוף מסמכים אוטומטי, מענה לשאלות, תזמון פגישות.
              </p>
            </Card>

            <Card className="p-6 hover-scale border-2">
              <FileText className="text-accent-600 mb-4 icon-pulse" size={40} />
              <h3 className="text-xl font-bold font-heading mb-3">Smart Forms</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                מילוי אוטומטי, חתימה אלקטרונית, שליחה ישירה למבטחים, מעקב סטטוס.
              </p>
            </Card>

            <Card className="p-6 hover-scale border-2">
              <Search className="text-primary-600 mb-4 icon-bounce" size={40} />
              <h3 className="text-xl font-bold font-heading mb-3">Portfolio Analyzer</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                סריקת כיסויים, זיהוי פערים, חישוב הזדמנויות חיסכון, הכנת חומרים לפגישה.
              </p>
            </Card>

            <Card className="p-6 hover-scale border-2">
              <BarChart3 className="text-secondary-600 mb-4 icon-pulse" size={40} />
              <h3 className="text-xl font-bold font-heading mb-3">Command Center</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                דשבורד סוכן, מחזור חיי לקוח, אנליטיקת הכנסות, אוטומציה, התראות הזדמנויות.
              </p>
            </Card>

            <Card className="p-6 hover-scale border-2">
              <Bell className="text-accent-600 mb-4 icon-bounce" size={40} />
              <h3 className="text-xl font-bold font-heading mb-3">Smart Alerts</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                לעולם לא תפספס הזדמנות - התראות פרואקטיביות על בסיס AI.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-4">
            איך זה עובד? מליד לעמלה - אוטומטי
          </h2>
          <p className="text-center text-neutral-600 mb-12 max-w-2xl mx-auto">
            תשעה שלבים שמתרחשים ברקע בזמן שאתם מתמקדים בלקוחות
          </p>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute right-8 top-8 bottom-8 w-0.5 bg-primary-200 hidden md:block" />
              
              <div className="space-y-6">
                {[
                  { icon: Users, text: 'ליד חדש נכנס למערכת', animation: 'icon-bounce' },
                  { icon: Bot, text: 'Ra\'am מזהה ואוסף מסמכים', animation: 'icon-pulse' },
                  { icon: Search, text: 'AI מנתח תיק', animation: 'icon-spin' },
                  { icon: FileText, text: 'הסוכן בודק ומאשר', animation: 'icon-pulse' },
                  { icon: MessageSquare, text: 'הכנה אוטומטית לפגישה', animation: 'icon-bounce' },
                  { icon: Users, text: 'הסוכן פוגש לקוח (טאץ\' אנושי)', animation: 'icon-bounce' },
                  { icon: FileText, text: 'טפסים ממולאים ונשלחים', animation: 'icon-pulse' },
                  { icon: Coins, text: 'עמלה נעקבת אוטומטית', animation: 'icon-spin' },
                  { icon: TrendingUp, text: 'מעקב שוטף ו-upsells', animation: 'icon-bounce' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 relative">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-primary z-10">
                      <item.icon size={28} className={item.animation} />
                    </div>
                    <Card className="flex-1 p-4 border-2">
                      <p className="font-medium">{item.text}</p>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={ctaSection.elementRef}
        className={`py-20 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 transition-all duration-700 ${
          ctaSection.isVisible ? `opacity-100 ${ctaSection.animationClass}` : 'opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6 text-white">
            מוכנים לחוות את המהפכה?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            בקש הדגמה חיה או הורד את ה-Pitch Deck
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button size="lg" variant="secondary" className="text-lg shadow-xl" asChild>
              <Link to="/contact">
                בקש הדגמה חיה
                <ArrowRight className="mr-2" size={20} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg border-2 border-white text-white hover:bg-white/10" asChild>
              <Link to="/contact">
                הורד Pitch Deck
                <Download className="mr-2" size={20} />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-white/80">
            למשקיעים: שוק של $92.6B, טרקשן מוכח, צוות מנוסה
          </p>
        </div>
      </section>
    </div>
  );
};

export default ServiceAI;

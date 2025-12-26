import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import FuturisticBackground from '@/components/FuturisticBackground';
import StockMarketBanner from '@/components/StockMarketBanner';
import { Testimonials } from '@/components/Testimonials';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  Users2,
  Handshake,
  Bot,
  Users,
  Zap,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Brain,
  Shield,
  Eye,
  Calendar,
  Search,
  FileCheck,
  Sprout,
  Home as HomeIcon,
  Castle,
  Calculator
} from 'lucide-react';

const Home = () => {
  const heroSection = useScrollAnimation({ threshold: 0.2, animationType: 'zoom-in' });
  const socialProof = useScrollAnimation({ threshold: 0.2, animationType: 'fade-in-up' });
  const pillars = useScrollAnimation({ threshold: 0.15, animationType: 'scale-in' });
  const services = useScrollAnimation({ threshold: 0.15, animationType: 'slide-from-left' });
  const whySeeLD = useScrollAnimation({ threshold: 0.15, animationType: 'slide-from-right' });
  const howItWorks = useScrollAnimation({ threshold: 0.15, animationType: 'fade-in-up' });
  const cta = useScrollAnimation({ threshold: 0.2, animationType: 'zoom-in' });
  const testimonials = useScrollAnimation({ threshold: 0.15, animationType: 'rotate-in' });

  return (
    <div className="flex flex-col min-h-screen relative">
      <FuturisticBackground />
      
      {/* Stock Market Banner */}
      <StockMarketBanner />
      
      {/* Hero Section with Trust Badges and Floating Blobs */}
      <section 
        ref={heroSection.elementRef}
        className={`relative overflow-hidden py-16 md:py-24 lg:py-32 bg-gradient-to-br from-primary-50 via-white to-secondary-50 transition-all duration-700 ${
          heroSection.isVisible ? `opacity-100 ${heroSection.animationClass}` : 'opacity-0'
        }`}
      >
        {/* Animated Floating Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-4 leading-tight">
              העתיד של הייעוץ הפיננסי{' '}
              <span className="text-primary-600">כבר כאן</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-600 font-medium mb-6">
              ai PowerD By UMN
            </p>
            <p className="text-lg md:text-xl text-neutral-700 mb-8 leading-relaxed max-w-3xl mx-auto">
              סוכנות פיננסים וביטוח חדשנית שמשלבת מומחיות אנושית עם כוח הבינה המלאכותית. אנחנו לא רק מייעצים - אנחנו מהפכים את הדרך שבה מנהלים את העתיד הפיננסי שלכם.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="text-lg shadow-primary hover:shadow-xl transition-all" asChild>
                <Link to="/contact">
                  התחל עכשיו - יעוץ חינם
                  <ArrowRight className="mr-2" size={20} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg border-2" asChild>
                <Link to="/services/seeld-ai">גלה את SeelD AI</Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base">
              {[
                { icon: CheckCircle2, text: 'מורשה' },
                { icon: CheckCircle2, text: '600+ לקוחות' },
                { icon: CheckCircle2, text: 'מנוהל AI' },
                { icon: CheckCircle2, text: '100% שקיפות' },
              ].map((badge, index) => (
                <div key={index} className="flex items-center gap-2 text-neutral-700">
                  <badge.icon className="text-primary-600 icon-pulse" size={20} />
                  <span className="font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section 
        ref={socialProof.elementRef}
        className={`py-16 bg-white transition-all duration-700 ${
          socialProof.isVisible ? `opacity-100 ${socialProof.animationClass}` : 'opacity-0'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Users, stat: '600+', label: 'לקוחות מרוצים', animation: 'icon-bounce' },
              { icon: Zap, stat: '16x', label: 'תפוקה גבוהה', animation: 'icon-pulse' },
              { icon: Clock, stat: '80%', label: 'חיסכון בזמן', animation: 'icon-spin' },
              { icon: TrendingUp, stat: '100%', label: 'שקיפות מלאה', animation: 'icon-bounce' },
            ].map((item, index) => (
              <Card key={index} className="p-6 text-center hover-scale border-2">
                <item.icon className={`text-primary-600 mx-auto mb-3 ${item.animation}`} size={40} />
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">{item.stat}</div>
                <p className="text-sm text-neutral-600">{item.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Three Business Pillars */}
      <section 
        ref={pillars.elementRef}
        className={`py-20 bg-neutral-50 transition-all duration-700 ${
          pillars.isVisible ? `opacity-100 ${pillars.animationClass}` : 'opacity-0'
        }`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-4">
            שלושת עמודי התווך שלנו
          </h2>
          <p className="text-center text-neutral-600 mb-12 max-w-2xl mx-auto">
            שלושה שירותים משלימים, חזון אחד - להפוך את הפיננסים שלכם לפשוטים, שקופים ומניבים
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/services/individuals" className="group">
              <Card className="p-8 h-full hover-scale border-2 hover:border-primary-400 transition-all bg-gradient-to-br from-primary-400 to-primary-600 text-white">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Users2 size={32} className="icon-bounce" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-heading mb-4 text-center">
                  שירותי ייעוץ לפרטיים
                </h3>
                <p className="text-white/90 mb-6 text-center leading-relaxed">
                  תכנון פנסיוני, פיננסי ופרישה מותאם אישית. אנחנו לא רק מוכרים פוליסות - אנחנו מתכננים את העתיד שלכם.
                </p>
                <Button variant="secondary" className="w-full group-hover:shadow-lg transition-all">
                  למד עוד
                  <ArrowRight className="mr-2" size={18} />
                </Button>
              </Card>
            </Link>
            
            <Link to="/services/agents" className="group">
              <Card className="p-8 h-full hover-scale border-2 hover:border-secondary-400 transition-all bg-gradient-to-br from-secondary-400 to-secondary-600 text-white">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Handshake size={32} className="icon-pulse" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-heading mb-4 text-center">
                  בית סוכן לסוכנים
                </h3>
                <p className="text-white/90 mb-6 text-center leading-relaxed">
                  תשתית מלאה לסוכני ביטוח עצמאיים. תתמקדו במה שאתם אוהבים - אנחנו נדאג לשאר.
                </p>
                <Button variant="secondary" className="w-full group-hover:shadow-lg transition-all">
                  הצטרף אלינו
                  <ArrowRight className="mr-2" size={18} />
                </Button>
              </Card>
            </Link>
            
            <Link to="/services/seeld-ai" className="group">
              <Card className="p-8 h-full hover-scale border-2 hover:border-accent-400 transition-all bg-gradient-to-br from-accent-400 to-accent-600 text-white">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Bot size={32} className="icon-spin" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-heading mb-4 text-center">
                  מערכת SeelD AI
                </h3>
                <p className="text-white/90 mb-6 text-center leading-relaxed">
                  פלטפורמה מהפכנית המגדילה פי 16 את התפוקה. ארכיטקטורה ייחודית שמתחילה מהכסף ובונה אחורה.
                </p>
                <Button variant="secondary" className="w-full group-hover:shadow-lg transition-all">
                  ראה הדגמה
                  <ArrowRight className="mr-2" size={18} />
                </Button>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Cards Section */}
      <section 
        ref={services.elementRef}
        className={`py-20 bg-white relative transition-all duration-700 ${
          services.isVisible ? `opacity-100 ${services.animationClass}` : 'opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-4">
            שירותי ייעוץ מקיפים
          </h2>
          <p className="text-center text-neutral-600 mb-12 max-w-2xl mx-auto">
            פתרונות פיננסיים מותאמים אישית לכל שלב בחיים
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="p-8 hover-scale border-2 glass-card">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <Sprout className="text-primary-600 icon-bounce" size={48} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-center">השקעות אלטרנטיביות</h3>
              <p className="text-neutral-600 leading-relaxed text-center text-sm">
                השקעות חכמות מעבר לדרכים המסורתיות
              </p>
            </Card>
            
            <Card className="p-8 hover-scale border-2 glass-card">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center">
                <HomeIcon className="text-secondary-600 icon-pulse" size={48} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-center">הגנות למשפחה</h3>
              <p className="text-neutral-600 leading-relaxed text-center text-sm">
                ביטוח מקיף לשקט נפשי מלא
              </p>
            </Card>
            
            <Card className="p-8 hover-scale border-2 glass-card">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent-100 to-accent-200 flex items-center justify-center">
                <Castle className="text-accent-600 icon-spin" size={48} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-center">תכנון פיננסי</h3>
              <p className="text-neutral-600 leading-relaxed text-center text-sm">
                אסטרטגיה ארוכת טווח להצלחה כלכלית
              </p>
            </Card>
            
            <Card className="p-8 hover-scale border-2 glass-card">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-100 to-accent-200 flex items-center justify-center">
                <Calculator className="text-primary-600 icon-bounce" size={48} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-center">תכנון פרישה</h3>
              <p className="text-neutral-600 leading-relaxed text-center text-sm">
                הבטחת עתיד כלכלי יציב ומאובטח
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Why SeeLD Section */}
      <section 
        ref={whySeeLD.elementRef}
        className={`py-20 bg-neutral-50 relative chip-pattern transition-all duration-700 ${
          whySeeLD.isVisible ? `opacity-100 ${whySeeLD.animationClass}` : 'opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-4">
            למה SeeLD שונה?
          </h2>
          <p className="text-center text-neutral-600 mb-12 max-w-2xl mx-auto">
            ארבעה דברים שמבדילים אותנו מהשאר
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 hover-scale border-2 glass-card">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-6">
                <Brain className="text-primary-600 icon-pulse" size={32} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3">AI-Native Architecture</h3>
              <p className="text-neutral-600 leading-relaxed">
                לא הוספנו AI למערכת ישנה - בנינו מאפס עם בינה מלאכותית בליבה
              </p>
            </Card>
            
            <Card className="p-8 hover-scale border-2 glass-card">
              <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mb-6">
                <TrendingUp className="text-secondary-600 icon-spin" size={32} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3">From Money Backwards</h3>
              <p className="text-neutral-600 leading-relaxed">
                מתחילים מעקיבת עמלות בזמן אמת, בונים אחורה לרכישת לקוח
              </p>
            </Card>
            
            <Card className="p-8 hover-scale border-2 glass-card">
              <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mb-6">
                <Shield className="text-accent-600 icon-bounce" size={32} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3">Human + AI</h3>
              <p className="text-neutral-600 leading-relaxed">
                הטכנולוגיה עושה 80% מהעבודה, המומחים שלנו מספקים 100% מהערך
              </p>
            </Card>
            
            <Card className="p-8 hover-scale border-2 glass-card">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-6">
                <Eye className="text-primary-600 icon-pulse" size={32} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3">Complete Transparency</h3>
              <p className="text-neutral-600 leading-relaxed">
                כל פוליסה, כל עמלה, כל המלצה - שקופים ומוסברים לחלוטין
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section 
        ref={howItWorks.elementRef}
        className={`py-20 bg-neutral-50 transition-all duration-700 ${
          howItWorks.isVisible ? `opacity-100 ${howItWorks.animationClass}` : 'opacity-0'
        }`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-4">
            איך זה עובד?
          </h2>
          <p className="text-center text-neutral-600 mb-12 max-w-2xl mx-auto">
            שלושה שלבים פשוטים לעתיד פיננסי מאובטח
          </p>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {[
                { 
                  step: 1, 
                  icon: Calendar, 
                  title: 'קבע פגישה', 
                  desc: 'שיחת ייעוץ חינם בת 30 דקות. אנחנו מקשיבים, מבינים, שואלים.',
                  color: 'primary',
                  animation: 'icon-bounce'
                },
                { 
                  step: 2, 
                  icon: Search, 
                  title: 'ניתוח AI', 
                  desc: 'המערכת שלנו מנתחת את התיק הקיים שלך, מזהה פערים והזדמנויות לחיסכון.',
                  color: 'secondary',
                  animation: 'icon-spin'
                },
                { 
                  step: 3, 
                  icon: FileCheck, 
                  title: 'תכנית מותאמת', 
                  desc: 'מקבלים תכנית פעולה מפורטת + מעקב שוטף. אנחנו לא נעלמים אחרי החתימה.',
                  color: 'accent',
                  animation: 'icon-pulse'
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-6 items-start animate-slide-in-right" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-${item.color}-600 flex items-center justify-center text-white shadow-${item.color}`}>
                    <item.icon size={28} className={item.animation} />
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-${item.color}-600 font-bold text-2xl`}>{item.step}</span>
                      <h3 className="text-xl font-bold font-heading">{item.title}</h3>
                    </div>
                    <p className="text-neutral-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={cta.elementRef}
        className={`py-20 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 transition-all duration-700 ${
          cta.isVisible ? `opacity-100 ${cta.animationClass}` : 'opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6 text-white">
            מוכנים להתחיל?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            הצטרפו למאות לקוחות מרוצים ותתחילו לנהל את הכספים שלכם בצורה חכמה יותר
          </p>
          <Button size="lg" variant="secondary" className="text-lg shadow-xl hover:scale-105 transition-all" asChild>
            <Link to="/contact">
              התחל עכשיו - ללא עלות
              <ArrowRight className="mr-2" size={20} />
            </Link>
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <div 
        ref={testimonials.elementRef}
        className={`transition-all duration-700 ${
          testimonials.isVisible ? `opacity-100 ${testimonials.animationClass}` : 'opacity-0'
        }`}
      >
        <Testimonials />
      </div>
    </div>
  );
};

export default Home;

import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Youtube, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#f8f9fa] border-t border-[#e0e4e8] mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-baseline gap-2 group">
              <span className="text-3xl font-bold tracking-tight text-[#1a2840] transition-colors group-hover:text-[#0f1c2e]" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>
                SeeLD
              </span>
              <span className="text-[9px] font-extralight tracking-wide text-[#5a6a7a] uppercase transition-colors group-hover:text-[#4fb9b8]" style={{ fontFamily: '"Inter", "Helvetica", sans-serif', fontWeight: '200' }}>
                FinancE & inS
              </span>
            </Link>
            <p className="text-sm text-[#5a6a7a] leading-relaxed" style={{ fontFamily: '"Inter", sans-serif' }}>
              העתיד של הייעוץ הפיננסי - מונע AI. ניהול פיננסי חכם עם טכנולוגיית בינה מלאכותית מתקדמת.
            </p>
            <div className="flex gap-3 flex-wrap">
              <a href="#" className="text-[#5a6a7a] hover:text-[#4fb9b8] transition-colors" aria-label="Facebook">
                <Facebook size={18} className="icon-bounce" />
              </a>
              <a href="#" className="text-[#5a6a7a] hover:text-[#4fb9b8] transition-colors" aria-label="Instagram">
                <Instagram size={18} className="icon-pulse" />
              </a>
              <a href="#" className="text-[#5a6a7a] hover:text-[#4fb9b8] transition-colors" aria-label="LinkedIn">
                <Linkedin size={18} className="icon-bounce" />
              </a>
              <a href="#" className="text-[#5a6a7a] hover:text-[#4fb9b8] transition-colors" aria-label="Twitter">
                <Twitter size={18} className="icon-pulse" />
              </a>
              <a href="#" className="text-[#5a6a7a] hover:text-[#4fb9b8] transition-colors" aria-label="YouTube">
                <Youtube size={18} className="icon-bounce" />
              </a>
              <a href="#" className="text-[#5a6a7a] hover:text-[#4fb9b8] transition-colors" aria-label="WhatsApp">
                <MessageCircle size={18} className="icon-pulse" />
              </a>
              <a href="#" className="text-[#5a6a7a] hover:text-[#4fb9b8] transition-colors" aria-label="Telegram">
                <Send size={18} className="icon-bounce" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-[#1a2840]" style={{ fontFamily: '"Playfair Display", serif' }}>קישורים מהירים</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-[#5a6a7a] hover:text-[#4fb9b8] transition-colors" style={{ fontFamily: '"Inter", sans-serif' }}>
                  עמוד הבית
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-[#5a6a7a] hover:text-[#4fb9b8] transition-colors" style={{ fontFamily: '"Inter", sans-serif' }}>
                  אודות
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-[#5a6a7a] hover:text-[#4fb9b8] transition-colors" style={{ fontFamily: '"Inter", sans-serif' }}>
                  שירותים
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-sm text-[#5a6a7a] hover:text-[#4fb9b8] transition-colors" style={{ fontFamily: '"Inter", sans-serif' }}>
                  משאבים
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4 text-[#1a2840]" style={{ fontFamily: '"Playfair Display", serif' }}>שירותים</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services/individuals" className="text-sm text-[#5a6a7a] hover:text-[#4fb9b8] transition-colors" style={{ fontFamily: '"Inter", sans-serif' }}>
                  לקוחות פרטיים
                </Link>
              </li>
              <li>
                <Link to="/services/agents" className="text-sm text-[#5a6a7a] hover:text-[#4fb9b8] transition-colors" style={{ fontFamily: '"Inter", sans-serif' }}>
                  סוכני ביטוח
                </Link>
              </li>
              <li>
                <Link to="/services/seeld-ai" className="text-sm text-[#5a6a7a] hover:text-[#4fb9b8] transition-colors" style={{ fontFamily: '"Inter", sans-serif' }}>
                  מערכת SeeLD AI
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-[#5a6a7a] hover:text-[#4fb9b8] transition-colors" style={{ fontFamily: '"Inter", sans-serif' }}>
                  צור קשר
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4 text-[#1a2840]" style={{ fontFamily: '"Playfair Display", serif' }}>הישארו מעודכנים</h3>
            <p className="text-sm text-[#5a6a7a] mb-4" style={{ fontFamily: '"Inter", sans-serif' }}>
              הירשמו לניוזלטר שלנו לקבלת עדכונים וטיפים פיננסיים
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="כתובת אימייל" 
                className="flex-1 border-[#e0e4e8] focus:border-[#4fb9b8] bg-white"
                style={{ fontFamily: '"Inter", sans-serif' }}
              />
              <Button size="icon" className="shrink-0 bg-[#1a2840] hover:bg-[#4fb9b8] transition-colors">
                <Mail size={18} className="icon-pulse" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#e0e4e8] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#5a6a7a]" style={{ fontFamily: '"Inter", sans-serif' }}>
            © {currentYear} SeeLD. כל הזכויות שמורות
          </p>
          <div className="flex gap-6 text-sm text-[#5a6a7a]" style={{ fontFamily: '"Inter", sans-serif' }}>
            <a href="#" className="hover:text-[#4fb9b8] transition-colors">
              תנאי שימוש
            </a>
            <a href="#" className="hover:text-[#4fb9b8] transition-colors">
              מדיניות פרטיות
            </a>
            <a href="#" className="hover:text-[#4fb9b8] transition-colors">
              הצהרת נגישות
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

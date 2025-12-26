import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import NotificationBell from './notifications/NotificationBell';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'עמוד הבית' },
    { to: '/about', label: 'אודות' },
    { to: '/services', label: 'שירותים' },
    { to: '/resources', label: 'משאבים' },
    { to: '/contact', label: 'צור קשר' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-[#1a2840] transition-colors group-hover:text-[#0f1c2e]" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>
                SeeLD
              </span>
              <span className="text-[10px] font-extralight tracking-wide text-[#5a6a7a] uppercase transition-colors group-hover:text-[#4fb9b8]" style={{ fontFamily: '"Inter", "Helvetica", sans-serif', fontWeight: '200' }}>
                FinancE & inS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.to) ? 'text-primary' : 'text-foreground/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Personal Areas */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && <NotificationBell />}
            <Button variant="outline" asChild className="border-primary/30 hover:bg-primary/10">
              <Link to="/client/auth">איזור אישי ללקוחות</Link>
            </Button>
            <Button asChild className="shadow-primary bg-gradient-to-r from-primary to-accent">
              <Link to="/agent/auth">איזור אישי לסוכנים</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
            aria-label="תפריט"
          >
            {isMenuOpen ? <X size={24} className="icon-spin" /> : <Menu size={24} className="icon-bounce" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background animate-slide-up">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm font-medium py-2 ${
                  isActive(link.to) ? 'text-primary' : 'text-foreground/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t">
              <Button variant="outline" asChild className="w-full border-primary/30">
                <Link to="/client/auth" onClick={() => setIsMenuOpen(false)}>איזור אישי ללקוחות</Link>
              </Button>
              <Button asChild className="w-full bg-gradient-to-r from-primary to-accent">
                <Link to="/agent/auth" onClick={() => setIsMenuOpen(false)}>איזור אישי לסוכנים</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

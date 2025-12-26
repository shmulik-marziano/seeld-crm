import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';
import FuturisticBackground from '@/components/FuturisticBackground';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('הפנייה נשלחה בהצלחה! ניצור איתך קשר בקרוב.');
    setIsSubmitting(false);
    
    // Reset form
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="flex flex-col relative">
      <FuturisticBackground />
      {/* Hero */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              צור קשר
            </h1>
            <p className="text-xl text-muted-foreground">
              נשמח לענות על כל שאלה ולעזור לכם למצוא את הפתרון המושלם
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="lg:col-span-2 p-8 shadow-soft">
              <h2 className="text-2xl font-bold font-heading mb-6">שלחו לנו הודעה</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">שם מלא *</Label>
                    <Input id="name" required placeholder="הזן שם מלא" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">טלפון *</Label>
                    <Input id="phone" type="tel" required placeholder="050-1234567" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">אימייל *</Label>
                  <Input id="email" type="email" required placeholder="your@email.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service">סוג שירות</Label>
                  <Select required>
                    <SelectTrigger id="service">
                      <SelectValue placeholder="בחר סוג שירות" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">לקוח פרטי</SelectItem>
                      <SelectItem value="agent">סוכן ביטוח</SelectItem>
                      <SelectItem value="pension">פנסיה וחיסכון</SelectItem>
                      <SelectItem value="consultation">ייעוץ כללי</SelectItem>
                      <SelectItem value="other">אחר</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">הודעה</Label>
                  <Textarea 
                    id="message" 
                    rows={5} 
                    placeholder="ספר לנו איך נוכל לעזור..."
                  />
                </div>
                
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full shadow-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'שולח...' : 'שלח פנייה'}
                  <Send className="mr-2" size={20} />
                </Button>
              </form>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="p-6 shadow-soft">
                <h3 className="text-xl font-bold font-heading mb-4">פרטי התקשרות</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="text-primary flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-medium">טלפון</p>
                      <a href="tel:03-1234567" className="text-muted-foreground hover:text-primary transition-colors">
                        03-1234567
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="text-primary flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-medium">אימייל</p>
                      <a href="mailto:info@seeld.co.il" className="text-muted-foreground hover:text-primary transition-colors">
                        info@seeld.co.il
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="text-primary flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-medium">כתובת</p>
                      <p className="text-muted-foreground">
                        תל אביב, ישראל
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="text-primary flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-medium">שעות פעילות</p>
                      <p className="text-muted-foreground">
                        א׳-ה׳: 9:00-18:00
                        <br />
                        ו׳: 9:00-13:00
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-subtle shadow-soft">
                <h3 className="text-xl font-bold font-heading mb-3">זמינים 24/7</h3>
                <p className="text-sm text-muted-foreground">
                  המערכת שלנו זמינה בכל עת. השאירו פרטים ונחזור אליכם בהקדם האפשרי.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <Card className="h-96 flex items-center justify-center shadow-soft">
            <div className="text-center text-muted-foreground">
              <MapPin size={48} className="mx-auto mb-4 opacity-50" />
              <p>מיקום המשרד במפה</p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Contact;

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  rating: number;
  text: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "דוד כהן",
    role: "סוכן ביטוח עצמאי",
    image: "/placeholder.svg",
    rating: 5,
    text: "SeelD שינתה לי את החיים. מה שלקח לי 4 שעות - עכשיו לוקח 10 שניות. הפרודוקטיביות שלי עלתה פי 16 ממש.",
  },
  {
    id: 2,
    name: "שרה לוי",
    role: "לקוחה פרטית",
    image: "/placeholder.svg",
    rating: 5,
    text: "סוף סוף מישהו שמבין מה זה שקיפות אמיתית. ה-AI של SeelD מצא לי חיסכון של ₪2,400 בשנה שאף אחד לא מצא לי.",
  },
  {
    id: 3,
    name: "מיכאל אברהם",
    role: "סוכן ביטוח מוביל",
    image: "/placeholder.svg",
    rating: 5,
    text: "הארכיטקטורה 'From Money Backwards' היא גאונית. עקיבת עמלות בזמן אמת חוסכת לי כאבי ראש ענקיים.",
  },
  {
    id: 4,
    name: "רונית ישראלי",
    role: "לקוחה פרטית",
    image: "/placeholder.svg",
    rating: 5,
    text: "Ra'am הצ'אטבוט עונה לי 24/7 ונותן המלצות מדויקות. אני מרגישה שיש לי יועץ פיננסי אישי שתמיד פה.",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--secondary)/0.08),transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-l from-primary via-secondary to-accent bg-clip-text text-transparent">
            מה הלקוחות שלנו אומרים
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            אלפי לקוחות וסוכנים כבר חוו את המהפכה הפיננסית
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-xl hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] group"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardContent className="p-6 relative z-10">
                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-accent text-accent"
                    />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-foreground/90 mb-6 text-sm leading-relaxed min-h-[120px]">
                  "{testimonial.text}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-primary/20">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-right">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>

              {/* Tech pattern overlay */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            רוצים להצטרף למהפכה? <span className="text-primary font-semibold">דברו איתנו עוד היום</span>
          </p>
        </div>
      </div>
    </section>
  );
};

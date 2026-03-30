import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "SEELD — ביטוח, פנסיה וחיסכון עם מישהו שמכיר אותך",
  description: "סוכנות ביטוח דיגיטלית ועצמאית — שקיפות מלאה, ייעוץ אישי וטכנולוגיה מתקדמת",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="font-heebo antialiased min-h-screen bg-background">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

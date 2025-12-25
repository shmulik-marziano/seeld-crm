import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "SEELD CRM - מערכת ניהול לקוחות",
  description: "מערכת CRM לסוכנות ביטוח SEELD",
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

'use client';

import Link from 'next/link';
import {
  Shield, TrendingDown, ArrowLeftRight, Sparkles, CheckCircle2,
  Building2, PiggyBank, GraduationCap, Wallet, FileText,
  ArrowLeft, Phone, MessageCircle,
} from 'lucide-react';

/* ─── design tokens matching seeld.co.il ─── */
const colors = {
  navy: '#1E3A5F',
  steel: '#4A90A4',
  orange: '#F5A623',
  bg: '#FAFBFC',
  bgSoft: '#F4F7FA',
  textDark: '#1a1a2e',
  textMuted: '#6b7280',
  border: '#e2e8f0',
  white: '#ffffff',
  green: '#10b981',
  red: '#ef4444',
};

/* ─── data ─── */
const summaryTable = [
  { product: 'פנסיה', from: 'הראל', to: 'כלל', feeOld: '0.15% + 1.5%', feeNew: '0.1% + 1.1%' },
  { product: 'השתלמות ×4', from: 'אנליסט', to: 'הראל פיננסים', feeOld: '0.7%', feeNew: '0.65%' },
  { product: 'גמל להשקעה', from: 'אנליסט', to: 'הראל פיננסים', feeOld: '0.7%', feeNew: '0.65%' },
  { product: 'פוליסה פיננסית', from: '—', to: 'הראל (חדש)', feeOld: '—', feeNew: '—' },
];

export function RecommendationReport() {
  return (
    <div className="min-h-screen" style={{ background: colors.bg, fontFamily: "'Heebo', sans-serif" }}>
      {/* ─── Header ─── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          borderColor: colors.border,
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: `linear-gradient(135deg, ${colors.navy}, ${colors.steel})` }}
            >
              S
            </div>
            <span className="font-bold text-lg" style={{ color: colors.navy }}>SEELD</span>
          </div>
          <Link
            href="/hub"
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-all hover:bg-gray-100"
            style={{ color: colors.textMuted }}
          >
            <span>חזרה</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* ─── Hero ─── */}
        <div
          className="rounded-2xl p-8 md:p-12 mb-8 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.steel})`,
            boxShadow: '0 12px 40px rgba(30,58,95,0.25)',
          }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-10" style={{ background: colors.orange }} />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full opacity-10" style={{ background: colors.steel }} />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5" style={{ color: colors.orange }} />
              <span className="text-sm font-medium opacity-80">סיכום המלצה</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">פולינה צטלמן</h1>
            <p className="text-base opacity-70">ניתוח מקיף של תיק הביטוח והפיננסים — המלצות לשיפור תנאים והפחתת עלויות</p>
          </div>
        </div>

        {/* ─── Cards ─── */}
        <div className="space-y-6">

          {/* 1. קרן פנסיה */}
          <RecommendationCard
            icon={<PiggyBank className="w-6 h-6" />}
            iconBg={colors.navy}
            number="1"
            title="קרן פנסיה מקיפה"
            badge={{ text: 'ניוד', color: colors.orange }}
          >
            <InfoRow label="מצב נוכחי" value="הראל" />
            <InfoRow label="צבירה" value="371,663 ₪" highlight />
            <InfoRow label='דמ"נ נוכחי' value='0.15% צבירה + 1.5% הפקדה' />

            <Divider />

            <div className="rounded-xl p-4 mb-3" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: colors.green }} />
                <span className="font-bold text-base" style={{ color: '#166534' }}>המלצה: ניוד לכלל</span>
              </div>
              <p className="text-sm" style={{ color: '#166534' }}>
                דמ&quot;נ <strong>0.1% צבירה + 1.1% הפקדה</strong>
              </p>
            </div>

            <div className="rounded-xl p-4 mb-3" style={{ background: colors.bgSoft }}>
              <p className="text-sm font-medium mb-2" style={{ color: colors.textDark }}>מסלולי השקעה:</p>
              <div className="flex flex-col gap-1.5">
                <TrackPill label="50% כלל פנסיה משולב סחיר" code="14232" />
                <TrackPill label="50% כלל פנסיה מניות סחיר" code="15432" />
              </div>
            </div>

            <Reason text="תנאים אטרקטיביים ביותר מבין החברות שנבדקו, ביצועים מובילים בטבלאות" />
          </RecommendationCard>

          {/* 2. קרנות השתלמות */}
          <RecommendationCard
            icon={<GraduationCap className="w-6 h-6" />}
            iconBg={colors.steel}
            number="2"
            title="קרנות השתלמות (4 קופות)"
            badge={{ text: 'איחוד + ניוד', color: colors.steel }}
          >
            <InfoRow label="מצב נוכחי" value="אנליסט" />
            <InfoRow label="צבירה כוללת" value="111,354 ₪" highlight />
            <InfoRow label="מסלול" value="מניות" />
            <InfoRow label='דמ"נ נוכחי' value="0.7%" />

            <Divider />

            <div className="rounded-xl p-4 mb-3" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: colors.green }} />
                <span className="font-bold text-base" style={{ color: '#166534' }}>המלצה: איחוד וניוד להראל פיננסים</span>
              </div>
              <p className="text-sm" style={{ color: '#166534' }}>
                דמ&quot;נ <strong>0.65%</strong> | מסלול מניות
              </p>
            </div>

            <Reason text='מנהל השקעות חדש בהראל, כשנה וחצי בתפקיד, מוביל טבלאות תשואה במסלולי מניות. איחוד הקרנות מאפשר הוזלת דמ"נ.' />

            <Note text="קרן חמישית במגדל (צבירה אפסית) — ללא טיפול" />
          </RecommendationCard>

          {/* 3. קופת גמל */}
          <RecommendationCard
            icon={<Wallet className="w-6 h-6" />}
            iconBg="#7c3aed"
            number="3"
            title="קופת גמל להשקעה"
            badge={{ text: 'ניוד', color: colors.orange }}
          >
            <InfoRow label="מצב נוכחי" value="אנליסט" />
            <InfoRow label="צבירה" value="94,448 ₪" highlight />
            <InfoRow label="מסלול" value="מניות" />
            <InfoRow label='דמ"נ נוכחי' value="0.7%" />

            <Divider />

            <div className="rounded-xl p-4 mb-3" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: colors.green }} />
                <span className="font-bold text-base" style={{ color: '#166534' }}>המלצה: ניוד להראל פיננסים</span>
              </div>
              <p className="text-sm" style={{ color: '#166534' }}>
                דמ&quot;נ <strong>0.65%</strong> | מסלול מניות
              </p>
            </div>

            <Reason text="זהה לקרנות ההשתלמות — ביצועים מובילים ומנהל השקעות חדש בהראל" />
          </RecommendationCard>

          {/* 4. מוצר חדש */}
          <RecommendationCard
            icon={<Sparkles className="w-6 h-6" />}
            iconBg={colors.green}
            number="4"
            title="מוצר חדש — פוליסה פיננסית"
            badge={{ text: 'חדש', color: colors.green }}
          >
            <InfoRow label="חברה" value="הראל" />
            <InfoRow label="מסלול" value="מניות" />
            <InfoRow label="הפקדה חודשית" value="1,000 ₪" highlight />

            <div className="flex items-center gap-2 mt-3 px-4 py-2.5 rounded-full text-sm font-medium" style={{ background: '#ecfdf5', color: '#166534' }}>
              <CheckCircle2 className="w-4 h-4" />
              <span>סטטוס: נפתחה</span>
            </div>
          </RecommendationCard>
        </div>

        {/* ─── Summary Table ─── */}
        <div
          className="mt-10 rounded-2xl overflow-hidden"
          style={{
            background: colors.white,
            boxShadow: '0 2px 12px rgba(30,58,95,0.08)',
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="px-6 py-5 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${colors.navy}, ${colors.steel})` }}
              >
                <ArrowLeftRight className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: colors.textDark }}>סיכום שינויים</h2>
                <p className="text-xs" style={{ color: colors.textMuted }}>כל ההמלצות במבט אחד</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: colors.bgSoft }}>
                  <th className="text-right px-6 py-3 font-semibold" style={{ color: colors.textMuted }}>מוצר</th>
                  <th className="text-right px-6 py-3 font-semibold" style={{ color: colors.textMuted }}>מ-</th>
                  <th className="text-right px-6 py-3 font-semibold" style={{ color: colors.textMuted }}>ל-</th>
                  <th className="text-right px-6 py-3 font-semibold" style={{ color: colors.textMuted }}>דמ&quot;נ ישן</th>
                  <th className="text-right px-6 py-3 font-semibold" style={{ color: colors.textMuted }}>דמ&quot;נ חדש</th>
                </tr>
              </thead>
              <tbody>
                {summaryTable.map((row, i) => (
                  <tr
                    key={i}
                    className="transition-colors hover:bg-gray-50"
                    style={{ borderBottom: i < summaryTable.length - 1 ? `1px solid ${colors.border}` : 'none' }}
                  >
                    <td className="px-6 py-4 font-semibold" style={{ color: colors.textDark }}>{row.product}</td>
                    <td className="px-6 py-4" style={{ color: colors.textMuted }}>{row.from}</td>
                    <td className="px-6 py-4 font-medium" style={{ color: colors.navy }}>{row.to}</td>
                    <td className="px-6 py-4" style={{ color: colors.red }}>{row.feeOld}</td>
                    <td className="px-6 py-4 font-semibold" style={{ color: colors.green }}>{row.feeNew}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── CTA ─── */}
        <div
          className="mt-10 rounded-2xl p-8 text-center text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.steel})`,
            boxShadow: '0 12px 40px rgba(30,58,95,0.2)',
          }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10" style={{ background: colors.orange }} />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10" style={{ background: colors.steel }} />

          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">יש שאלות? אנחנו כאן</h3>
            <p className="text-sm opacity-70 mb-6">שמוליק מרציאנו — סוכן ביטוח מורשה</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a
                href="tel:052-309-7444"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{ background: colors.orange, color: colors.white }}
              >
                <Phone className="w-4 h-4" />
                052-309-7444
              </a>
              <a
                href="https://wa.me/972523097444"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.15)', color: colors.white, border: '1px solid rgba(255,255,255,0.25)' }}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* ─── Official Footer ─── */}
        <div
          className="mt-10 rounded-2xl p-6 md:p-8"
          style={{
            background: colors.white,
            boxShadow: '0 2px 12px rgba(30,58,95,0.08)',
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
                style={{
                  background: `linear-gradient(135deg, ${colors.navy}, ${colors.steel})`,
                  boxShadow: '0 4px 16px rgba(30,58,95,0.2)',
                }}
              >
                S
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xl" style={{ color: colors.navy }}>SEELD</span>
                  <span className="text-sm" style={{ color: colors.textMuted }}>פיננסים וביטוח</span>
                </div>
                <p className="text-xs" style={{ color: colors.textMuted }}>🌿 הביטוח שלך, במקום אחד</p>
              </div>
            </div>

            {/* Official details */}
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4" style={{ color: colors.navy }} />
                <span className="text-sm font-semibold" style={{ color: colors.textDark }}>עורך המסמך</span>
              </div>
              <p className="text-sm font-bold" style={{ color: colors.navy }}>סו&quot;ב שמוליק מרציאנו</p>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>מ.ר 138666</p>
            </div>
          </div>

          {/* Disclaimer line */}
          <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
            <p className="text-[11px] leading-relaxed text-center" style={{ color: colors.textMuted }}>
              מסמך זה הופק על ידי SEELD — סוכנות ביטוח דיגיטלית ועצמאית. האמור במסמך אינו מהווה ייעוץ פנסיוני או המלצה אישית כהגדרתם בחוק. ההמלצות מבוססות על ניתוח מקצועי של התיק הקיים ותנאי השוק הנוכחיים.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center pb-10">
          <p className="text-xs" style={{ color: colors.textMuted }}>© SEELD {new Date().getFullYear()} | כל הזכויות שמורות</p>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

function RecommendationCard({
  icon,
  iconBg,
  number,
  title,
  badge,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  number: string;
  title: string;
  badge: { text: string; color: string };
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-6 md:p-8 transition-shadow hover:shadow-lg"
      style={{
        background: colors.white,
        boxShadow: '0 2px 12px rgba(30,58,95,0.08)',
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
            style={{ background: iconBg }}
          >
            {icon}
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: colors.textMuted }}>המלצה {number}</p>
            <h3 className="text-lg font-bold" style={{ color: colors.textDark }}>{title}</h3>
          </div>
        </div>
        <span
          className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
          style={{ background: badge.color }}
        >
          {badge.text}
        </span>
      </div>

      {children}
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const isStatus = label === 'מצב נוכחי';
  return (
    <div
      className="flex items-center justify-between py-2.5 px-3 text-sm rounded-lg"
      style={{
        borderBottom: isStatus ? 'none' : `1px solid ${colors.border}20`,
        background: isStatus ? colors.bgSoft : 'transparent',
        marginBottom: isStatus ? '4px' : '0',
      }}
    >
      <span className={isStatus ? 'font-bold' : ''} style={{ color: isStatus ? colors.textDark : colors.textMuted }}>{label}</span>
      <span
        className={highlight ? 'font-bold text-base' : isStatus ? 'font-bold' : 'font-medium'}
        style={{ color: highlight ? colors.navy : isStatus ? colors.navy : colors.textDark }}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px" style={{ background: colors.border }} />
      <TrendingDown className="w-4 h-4" style={{ color: colors.green }} />
      <span className="text-xs font-medium" style={{ color: colors.green }}>הפחתת עלויות</span>
      <div className="flex-1 h-px" style={{ background: colors.border }} />
    </div>
  );
}

function Reason({ text }: { text: string }) {
  return (
    <div className="flex gap-2 mt-3 text-sm" style={{ color: colors.textMuted }}>
      <Building2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: colors.steel }} />
      <p><strong style={{ color: colors.textDark }}>נימוק:</strong> {text}</p>
    </div>
  );
}

function Note({ text }: { text: string }) {
  return (
    <div
      className="flex gap-2 mt-3 text-sm px-4 py-3 rounded-xl"
      style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}
    >
      <FileText className="w-4 h-4 shrink-0 mt-0.5" />
      <p><strong>הערה:</strong> {text}</p>
    </div>
  );
}

function TrackPill({ label, code }: { label: string; code: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm" style={{ background: colors.white, border: `1px solid ${colors.border}` }}>
      <span style={{ color: colors.textDark }}>{label}</span>
      <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: colors.bgSoft, color: colors.textMuted }}>{code}</span>
    </div>
  );
}

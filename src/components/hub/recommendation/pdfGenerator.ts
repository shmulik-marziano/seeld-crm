import {
  type RecommendationFormData, type ProductType,
  getProductGroup, getProductLabel,
} from '@/types/recommendation';

/* ─── Brand colors from seeld.co.il design system ─── */
const BRAND = {
  primary: '#2563eb',       // brand-blue (HSL 220 90% 56%)
  primaryDark: '#1e40af',   // darker blue
  primaryLight: '#dbeafe',  // blue-50
  green: '#10b981',         // brand-green
  greenDark: '#065f46',
  greenLight: '#ecfdf5',
  greenBorder: '#a7f3d0',
  foreground: '#0f172a',    // text dark
  muted: '#64748b',         // text muted
  border: '#e2e8f0',
  bg: '#ffffff',
  bgSoft: '#f8fafc',
  destructive: '#ef4444',
};

function fmt(val: string, suffix?: string): string {
  if (!val.trim()) return '';
  if (suffix === '₪') {
    const n = Number(val.replace(/,/g, ''));
    if (!isNaN(n)) return n.toLocaleString('he-IL') + ' ₪';
  }
  if (suffix === '%') return val + '%';
  return val;
}

function row(label: string, value: string, suffix?: string): string {
  const display = fmt(value, suffix);
  if (!display) return '';
  return `<tr><td class="label">${label}</td><td class="value">${display}</td></tr>`;
}

export function generateRecommendationPDF(form: RecommendationFormData) {
  const group = getProductGroup(form.productType as ProductType);
  const productLabel = getProductLabel(form.productType as ProductType);
  const date = new Date().toLocaleDateString('he-IL');

  let currentRows = '';
  let recommendedRows = '';

  if (group === 'savings') {
    const c = form.savingsCurrent;
    const r = form.savingsRecommended;
    currentRows = [
      row('חברה', c.company),
      row('מסלול', c.trackName),
      row('צבירה נוכחית', c.accumulation, '₪'),
      row('הפקדה חודשית', c.monthlyDeposit, '₪'),
      row('דמי ניהול מצבירה', c.feeAccumulation, '%'),
      row('דמי ניהול מהפקדה', c.feeDeposit, '%'),
      row('תשואה שנה אחרונה', c.yearReturn, '%'),
    ].join('');
    recommendedRows = [
      row('חברה מומלצת', r.company),
      row('מסלול מומלץ', r.trackName),
      row('צבירה להעברה', r.transferAmount, '₪'),
      row('הפקדה חודשית מומלצת', r.monthlyDeposit, '₪'),
      row('דמי ניהול מצבירה', r.feeAccumulation, '%'),
      row('דמי ניהול מהפקדה', r.feeDeposit, '%'),
      row('תשואה שנה אחרונה', r.yearReturn, '%'),
    ].join('');
  } else {
    const c = form.insuranceCurrent;
    const r = form.insuranceRecommended;
    currentRows = [
      row('חברה', c.company),
      row('סוג כיסוי', c.coverageType),
      row('סכום כיסוי', c.coverageAmount, '₪'),
      row('פרמיה חודשית', c.monthlyPremium, '₪'),
      row('תקופת ביטוח', c.insurancePeriod),
    ].join('');
    recommendedRows = [
      row('חברה מומלצת', r.company),
      row('סוג כיסוי מומלץ', r.coverageType),
      row('סכום כיסוי מומלץ', r.coverageAmount, '₪'),
      row('פרמיה חודשית מומלצת', r.monthlyPremium, '₪'),
      row('תקופת ביטוח מומלצת', r.insurancePeriod),
    ].join('');
  }

  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<title>המלצה — ${form.client.fullName} | SEELD</title>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
@page { size: A4; margin: 16mm 18mm; }
* { margin:0; padding:0; box-sizing:border-box; }
body {
  font-family: 'Heebo', sans-serif;
  color: ${BRAND.foreground};
  line-height: 1.7;
  font-size: 14px;
  direction: rtl;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.page { max-width: 660px; margin: 0 auto; padding: 16px 0; }

/* ═══ Header ═══ */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 18px;
  border-bottom: 2px solid ${BRAND.primary};
  margin-bottom: 28px;
}
.brand { display: flex; align-items: center; gap: 10px; }
.brand-logo {
  width: 34px; height: 34px;
  background: ${BRAND.primary};
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: 800; font-size: 16px;
}
.brand-name { font-size: 20px; font-weight: 800; color: ${BRAND.primary}; letter-spacing: -0.3px; }
.brand-sub { font-size: 10px; color: ${BRAND.muted}; font-weight: 400; }
.meta { text-align: left; font-size: 11px; color: ${BRAND.muted}; line-height: 1.6; }

/* ═══ Title ═══ */
.title { text-align: center; margin-bottom: 28px; }
.title h1 { font-size: 22px; font-weight: 800; color: ${BRAND.foreground}; margin-bottom: 8px; }
.title .badge {
  display: inline-block;
  background: ${BRAND.primary};
  color: white;
  padding: 5px 18px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

/* ═══ Client ═══ */
.client {
  display: flex; gap: 32px; justify-content: center;
  background: ${BRAND.bgSoft};
  border: 1px solid ${BRAND.border};
  border-radius: 10px;
  padding: 14px 28px;
  margin-bottom: 28px;
}
.client-item { font-size: 13px; color: ${BRAND.muted}; }
.client-item strong { color: ${BRAND.foreground}; font-weight: 600; }

/* ═══ Section ═══ */
.section { margin-bottom: 24px; }
.section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.section-dot { width: 10px; height: 10px; border-radius: 50%; }
.section-label { font-size: 15px; font-weight: 700; color: ${BRAND.foreground}; }

/* ═══ Table ═══ */
table { width: 100%; border-collapse: collapse; }
td { padding: 9px 14px; font-size: 13px; border-bottom: 1px solid ${BRAND.border}; }
td.label { color: ${BRAND.muted}; width: 42%; font-weight: 400; }
td.value { color: ${BRAND.foreground}; font-weight: 600; }

/* ═══ Reasoning ═══ */
.reasoning {
  background: ${BRAND.bgSoft};
  border: 1px solid ${BRAND.border};
  border-radius: 10px;
  padding: 18px 22px;
  border-right: 3px solid ${BRAND.primary};
  font-size: 13px;
  font-weight: 300;
  line-height: 1.9;
  color: ${BRAND.foreground};
}
.reasoning strong { font-weight: 600; color: ${BRAND.primary}; }

/* ═══ Footer ═══ */
.footer {
  margin-top: 36px;
  padding-top: 16px;
  border-top: 1.5px solid ${BRAND.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.footer-brand { display: flex; align-items: center; gap: 8px; }
.footer-logo {
  width: 22px; height: 22px;
  background: ${BRAND.primary};
  border-radius: 5px;
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: 700; font-size: 10px;
}
.footer-name { font-size: 13px; font-weight: 700; color: ${BRAND.primary}; }
.footer-agent { text-align: left; font-size: 11px; color: ${BRAND.muted}; line-height: 1.5; }
.footer-agent strong { color: ${BRAND.foreground}; }
.disclaimer {
  margin-top: 14px;
  text-align: center;
  font-size: 9.5px;
  color: #94a3b8;
  line-height: 1.7;
}
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="brand">
      <div class="brand-logo">S</div>
      <div>
        <div class="brand-name">SEELD</div>
        <div class="brand-sub">ביטוח, חיסכון ופנסיה</div>
      </div>
    </div>
    <div class="meta">
      <div>תאריך: ${date}</div>
      <div>מוצר: ${productLabel}</div>
    </div>
  </div>

  <!-- Title -->
  <div class="title">
    <h1>המלצה אישית ללקוח</h1>
    <span class="badge">${productLabel}</span>
  </div>

  <!-- Client -->
  <div class="client">
    <div class="client-item"><strong>שם:</strong> ${form.client.fullName}</div>
    <div class="client-item"><strong>ת.ז:</strong> ${form.client.idNumber}</div>
    <div class="client-item"><strong>טלפון:</strong> ${form.client.phone}</div>
  </div>

  <!-- Current -->
  <div class="section">
    <div class="section-head">
      <div class="section-dot" style="background:${BRAND.primary}"></div>
      <div class="section-label">מצב קיים</div>
    </div>
    <table>${currentRows}</table>
  </div>

  <!-- Recommended -->
  <div class="section">
    <div class="section-head">
      <div class="section-dot" style="background:${BRAND.green}"></div>
      <div class="section-label">ההמלצה שלנו</div>
    </div>
    <table>${recommendedRows}</table>
  </div>

  <!-- Reasoning -->
  <div class="section">
    <div class="section-head">
      <div class="section-dot" style="background:${BRAND.primaryDark}"></div>
      <div class="section-label">נימוק ההמלצה</div>
    </div>
    <div class="reasoning">
      <strong>נימוק:</strong> ${form.reasoning}
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-brand">
      <div class="footer-logo">S</div>
      <span class="footer-name">SEELD</span>
    </div>
    <div class="footer-agent">
      <strong>סו"ב שמוליק מרציאנו</strong> | מ.ר 138666<br>
      SEELD Finance & Insurance
    </div>
  </div>

  <div class="disclaimer">
    מסמך זה הופק דיגיטלית והוא מהווה ייעוץ פיננסי אישי. ההמלצות מבוססות על ניתוח מקצועי של התיק הקיים ותנאי השוק הנוכחיים.
  </div>

</div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('אנא אפשר חלונות קופצים כדי לייצר PDF');
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    setTimeout(() => printWindow.print(), 300);
  };
}

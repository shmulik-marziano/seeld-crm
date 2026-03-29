import {
  type RecommendationFormData, type ProductType,
  getProductGroup, getProductLabel,
} from '@/types/recommendation';

function fmt(val: string, suffix?: string): string {
  if (!val.trim()) return '—';
  if (suffix === '₪') {
    const n = Number(val.replace(/,/g, ''));
    if (!isNaN(n)) return n.toLocaleString('he-IL') + ' ₪';
  }
  if (suffix === '%') return val + '%';
  return val;
}

function row(label: string, value: string, suffix?: string): string {
  const display = fmt(value, suffix);
  if (display === '—') return '';
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
<title>המלצה אישית — ${form.client.fullName} | SEELD</title>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
@page { size: A4; margin: 14mm 16mm; }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Heebo',sans-serif; color:#1a2e35; line-height:1.7; font-size:14px; direction:rtl;
  -webkit-print-color-adjust:exact; print-color-adjust:exact; }

.page { max-width:700px; margin:0 auto; padding:20px 0; }

/* Header */
.doc-header { display:flex; align-items:center; justify-content:space-between; padding-bottom:20px;
  border-bottom:2px solid #0d4f4f; margin-bottom:28px; }
.brand { display:flex; align-items:center; gap:10px; }
.brand svg { width:32px; height:32px; }
.brand-name { font-size:20px; font-weight:800; color:#0d4f4f; }
.brand-sub { font-size:10px; color:#8896a4; }
.doc-meta { text-align:left; font-size:11px; color:#8896a4; line-height:1.6; }

/* Title */
.doc-title { text-align:center; margin-bottom:28px; }
.doc-title h1 { font-size:22px; font-weight:800; color:#0d4f4f; margin-bottom:4px; }
.doc-title .product-badge { display:inline-block; background:#0d4f4f; color:#fff;
  padding:4px 16px; border-radius:16px; font-size:12px; font-weight:600; }

/* Client */
.client-bar { display:flex; gap:32px; justify-content:center; background:#f7f9fb;
  border-radius:10px; padding:14px 24px; margin-bottom:28px; }
.client-item { font-size:13px; color:#4a5568; }
.client-item strong { color:#0d4f4f; font-weight:700; }

/* Sections */
.section { margin-bottom:24px; }
.section-title { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
.section-dot { width:10px; height:10px; border-radius:50%; }
.section-label { font-size:15px; font-weight:700; color:#0d4f4f; }

/* Table */
table { width:100%; border-collapse:collapse; }
td { padding:8px 14px; font-size:13px; border-bottom:1px solid #e8edf2; }
td.label { color:#8896a4; width:40%; font-weight:400; }
td.value { color:#1a2e35; font-weight:600; }

/* Reasoning */
.reasoning { background:#f7f9fb; border-radius:10px; padding:16px 20px;
  border-right:3px solid #4A90A4; font-size:13px; font-weight:300;
  line-height:1.9; color:#1a2e35; }
.reasoning strong { font-weight:600; color:#0d4f4f; }

/* Footer */
.doc-footer { margin-top:36px; padding-top:16px; border-top:1.5px solid #e8edf2;
  display:flex; align-items:center; justify-content:space-between; }
.footer-brand { display:flex; align-items:center; gap:8px; }
.footer-brand svg { width:20px; height:20px; }
.footer-brand span { font-size:13px; font-weight:700; color:#0d4f4f; }
.footer-agent { text-align:left; font-size:11px; color:#8896a4; line-height:1.5; }
.footer-agent strong { color:#0d4f4f; }
.disclaimer { margin-top:14px; text-align:center; font-size:9.5px; color:#aab4be; line-height:1.7; }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="doc-header">
    <div class="brand">
      <svg viewBox="0 0 40 40" fill="none"><path d="M20 4C20 4 8 18 8 26a12 12 0 0 0 24 0C32 18 20 4 20 4z" fill="#0d4f4f"/><circle cx="16" cy="24" r="2" fill="#5ec6c6" opacity="0.6"/><circle cx="22" cy="20" r="1.5" fill="#7bc67e" opacity="0.5"/></svg>
      <div>
        <div class="brand-name">SEELD</div>
        <div class="brand-sub">ביטוח, חיסכון ופנסיה</div>
      </div>
    </div>
    <div class="doc-meta">
      <div>תאריך: ${date}</div>
      <div>מוצר: ${productLabel}</div>
    </div>
  </div>

  <!-- Title -->
  <div class="doc-title">
    <h1>המלצה אישית ללקוח</h1>
    <span class="product-badge">${productLabel}</span>
  </div>

  <!-- Client -->
  <div class="client-bar">
    <div class="client-item"><strong>שם:</strong> ${form.client.fullName}</div>
    <div class="client-item"><strong>ת.ז:</strong> ${form.client.idNumber}</div>
    <div class="client-item"><strong>טלפון:</strong> ${form.client.phone}</div>
  </div>

  <!-- Current -->
  <div class="section">
    <div class="section-title">
      <div class="section-dot" style="background:#4A90A4"></div>
      <div class="section-label">מצב קיים</div>
    </div>
    <table>${currentRows}</table>
  </div>

  <!-- Recommended -->
  <div class="section">
    <div class="section-title">
      <div class="section-dot" style="background:#10b981"></div>
      <div class="section-label">ההמלצה שלנו</div>
    </div>
    <table>${recommendedRows}</table>
  </div>

  <!-- Reasoning -->
  <div class="section">
    <div class="section-title">
      <div class="section-dot" style="background:#0d4f4f"></div>
      <div class="section-label">נימוק ההמלצה</div>
    </div>
    <div class="reasoning">
      <strong>נימוק:</strong> ${form.reasoning}
    </div>
  </div>

  <!-- Footer -->
  <div class="doc-footer">
    <div class="footer-brand">
      <svg viewBox="0 0 40 40" fill="none"><path d="M20 4C20 4 8 18 8 26a12 12 0 0 0 24 0C32 18 20 4 20 4z" fill="#0d4f4f"/></svg>
      <span>SEELD</span>
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

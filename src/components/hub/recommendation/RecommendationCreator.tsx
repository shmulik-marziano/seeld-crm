'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, FileDown, Shield, User, Package, ClipboardList,
  Lightbulb, MessageSquareText,
} from 'lucide-react';
import {
  PRODUCT_TYPES, getProductGroup, getProductLabel,
  EMPTY_FORM,
  type RecommendationFormData, type ProductType,
} from '@/types/recommendation';
import { generateRecommendationPDF } from './pdfGenerator';

/* ─── Design tokens ─── */
const C = {
  teal: '#0d4f4f', tealLight: '#4A90A4', orange: '#F5A623',
  bg: '#FAFBFC', bgSoft: '#F4F7FA', textDark: '#1a2e35',
  textBody: '#4a5568', textMuted: '#8896a4', border: '#e8edf2',
  white: '#ffffff', green: '#10b981', red: '#ef4444',
};

export function RecommendationCreator() {
  const [form, setForm] = useState<RecommendationFormData>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const group = form.productType ? getProductGroup(form.productType as ProductType) : null;

  /* ─── helpers ─── */
  function set<K extends keyof RecommendationFormData>(
    section: K,
    field: string,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [section]: typeof prev[section] === 'object'
        ? { ...(prev[section] as Record<string, string>), [field]: value }
        : value,
    }));
    setErrors((prev) => { const n = { ...prev }; delete n[`${String(section)}.${field}`]; return n; });
  }

  function setField(key: keyof RecommendationFormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.client.fullName.trim()) e['client.fullName'] = 'שדה חובה';
    if (!form.client.idNumber.trim()) e['client.idNumber'] = 'שדה חובה';
    if (!form.client.phone.trim()) e['client.phone'] = 'שדה חובה';
    if (!form.productType) e['productType'] = 'יש לבחור סוג מוצר';
    if (!form.reasoning.trim()) e['reasoning'] = 'יש להזין נימוק';

    if (group === 'savings') {
      if (!form.savingsCurrent.company.trim()) e['savingsCurrent.company'] = 'שדה חובה';
      if (!form.savingsRecommended.company.trim()) e['savingsRecommended.company'] = 'שדה חובה';
    }
    if (group === 'insurance') {
      if (!form.insuranceCurrent.company.trim()) e['insuranceCurrent.company'] = 'שדה חובה';
      if (!form.insuranceRecommended.company.trim()) e['insuranceRecommended.company'] = 'שדה חובה';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleGeneratePDF() {
    if (!validate()) return;
    generateRecommendationPDF(form);
  }

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "'Heebo', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <path d="M20 4C20 4 8 18 8 26a12 12 0 0 0 24 0C32 18 20 4 20 4z" fill={C.teal} />
              <circle cx="16" cy="24" r="2" fill="#5ec6c6" opacity="0.6" />
              <circle cx="22" cy="20" r="1.5" fill="#7bc67e" opacity="0.5" />
            </svg>
            <span className="font-bold text-lg" style={{ color: C.teal }}>SEELD</span>
          </div>
          <Link href="/hub" className="flex items-center gap-2 text-sm px-4 py-2 rounded-full hover:bg-gray-100 transition-colors" style={{ color: C.textMuted }}>
            <span>חזרה</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: C.teal }}>יצירת מסמך המלצה</h1>
          <p className="text-sm" style={{ color: C.textMuted }}>הזן את פרטי הלקוח וההמלצה — המערכת תייצר PDF ממותג</p>
        </div>

        {/* ═══ 1. Client Info ═══ */}
        <Section icon={<User className="w-5 h-5" />} title="פרטי לקוח" color={C.teal}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="שם מלא" value={form.client.fullName} onChange={(v) => set('client', 'fullName', v)} error={errors['client.fullName']} required />
            <Field label="תעודת זהות" value={form.client.idNumber} onChange={(v) => set('client', 'idNumber', v)} error={errors['client.idNumber']} required inputMode="numeric" />
            <Field label="טלפון" value={form.client.phone} onChange={(v) => set('client', 'phone', v)} error={errors['client.phone']} required inputMode="tel" />
          </div>
        </Section>

        {/* ═══ 2. Product Type ═══ */}
        <Section icon={<Package className="w-5 h-5" />} title="סוג מוצר" color={C.orange}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRODUCT_TYPES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setField('productType', p.value)}
                className="px-4 py-3 rounded-xl text-sm font-medium transition-all border"
                style={{
                  background: form.productType === p.value ? C.teal : C.white,
                  color: form.productType === p.value ? C.white : C.textDark,
                  borderColor: form.productType === p.value ? C.teal : C.border,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          {errors['productType'] && <p className="text-xs mt-2" style={{ color: C.red }}>{errors['productType']}</p>}
        </Section>

        {/* ═══ 3. Current State ═══ */}
        {group === 'savings' && (
          <Section icon={<ClipboardList className="w-5 h-5" />} title="מצב קיים" color={C.tealLight}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="חברה נוכחית" value={form.savingsCurrent.company} onChange={(v) => set('savingsCurrent', 'company', v)} error={errors['savingsCurrent.company']} required />
              <Field label="שם מסלול נוכחי" value={form.savingsCurrent.trackName} onChange={(v) => set('savingsCurrent', 'trackName', v)} />
              <Field label="צבירה נוכחית" value={form.savingsCurrent.accumulation} onChange={(v) => set('savingsCurrent', 'accumulation', v)} suffix="₪" inputMode="numeric" />
              <Field label="הפקדה חודשית" value={form.savingsCurrent.monthlyDeposit} onChange={(v) => set('savingsCurrent', 'monthlyDeposit', v)} suffix="₪" inputMode="numeric" />
              <Field label="דמי ניהול מצבירה" value={form.savingsCurrent.feeAccumulation} onChange={(v) => set('savingsCurrent', 'feeAccumulation', v)} suffix="%" inputMode="decimal" />
              <Field label="דמי ניהול מהפקדה" value={form.savingsCurrent.feeDeposit} onChange={(v) => set('savingsCurrent', 'feeDeposit', v)} suffix="%" inputMode="decimal" />
              <Field label="תשואה שנה אחרונה" value={form.savingsCurrent.yearReturn} onChange={(v) => set('savingsCurrent', 'yearReturn', v)} suffix="%" inputMode="decimal" />
            </div>
          </Section>
        )}

        {group === 'insurance' && (
          <Section icon={<ClipboardList className="w-5 h-5" />} title="מצב קיים" color={C.tealLight}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="חברה נוכחית" value={form.insuranceCurrent.company} onChange={(v) => set('insuranceCurrent', 'company', v)} error={errors['insuranceCurrent.company']} required />
              <Field label="סוג כיסוי" value={form.insuranceCurrent.coverageType} onChange={(v) => set('insuranceCurrent', 'coverageType', v)} />
              <Field label="סכום כיסוי" value={form.insuranceCurrent.coverageAmount} onChange={(v) => set('insuranceCurrent', 'coverageAmount', v)} suffix="₪" inputMode="numeric" />
              <Field label="פרמיה חודשית" value={form.insuranceCurrent.monthlyPremium} onChange={(v) => set('insuranceCurrent', 'monthlyPremium', v)} suffix="₪" inputMode="numeric" />
              <Field label="תקופת ביטוח" value={form.insuranceCurrent.insurancePeriod} onChange={(v) => set('insuranceCurrent', 'insurancePeriod', v)} />
            </div>
          </Section>
        )}

        {/* ═══ 4. Recommendation ═══ */}
        {group === 'savings' && (
          <Section icon={<Lightbulb className="w-5 h-5" />} title="ההמלצה שלנו" color={C.green}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="חברה מומלצת" value={form.savingsRecommended.company} onChange={(v) => set('savingsRecommended', 'company', v)} error={errors['savingsRecommended.company']} required />
              <Field label="שם מסלול מומלץ" value={form.savingsRecommended.trackName} onChange={(v) => set('savingsRecommended', 'trackName', v)} />
              <Field label="צבירה להעברה" value={form.savingsRecommended.transferAmount} onChange={(v) => set('savingsRecommended', 'transferAmount', v)} suffix="₪" inputMode="numeric" />
              <Field label="הפקדה חודשית מומלצת" value={form.savingsRecommended.monthlyDeposit} onChange={(v) => set('savingsRecommended', 'monthlyDeposit', v)} suffix="₪" inputMode="numeric" />
              <Field label="דמי ניהול מצבירה מומלצים" value={form.savingsRecommended.feeAccumulation} onChange={(v) => set('savingsRecommended', 'feeAccumulation', v)} suffix="%" inputMode="decimal" />
              <Field label="דמי ניהול מהפקדה מומלצים" value={form.savingsRecommended.feeDeposit} onChange={(v) => set('savingsRecommended', 'feeDeposit', v)} suffix="%" inputMode="decimal" />
              <Field label="תשואה שנה אחרונה" value={form.savingsRecommended.yearReturn} onChange={(v) => set('savingsRecommended', 'yearReturn', v)} suffix="%" inputMode="decimal" />
            </div>
          </Section>
        )}

        {group === 'insurance' && (
          <Section icon={<Lightbulb className="w-5 h-5" />} title="ההמלצה שלנו" color={C.green}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="חברה מומלצת" value={form.insuranceRecommended.company} onChange={(v) => set('insuranceRecommended', 'company', v)} error={errors['insuranceRecommended.company']} required />
              <Field label="סוג כיסוי מומלץ" value={form.insuranceRecommended.coverageType} onChange={(v) => set('insuranceRecommended', 'coverageType', v)} />
              <Field label="סכום כיסוי מומלץ" value={form.insuranceRecommended.coverageAmount} onChange={(v) => set('insuranceRecommended', 'coverageAmount', v)} suffix="₪" inputMode="numeric" />
              <Field label="פרמיה חודשית מומלצת" value={form.insuranceRecommended.monthlyPremium} onChange={(v) => set('insuranceRecommended', 'monthlyPremium', v)} suffix="₪" inputMode="numeric" />
              <Field label="תקופת ביטוח מומלצת" value={form.insuranceRecommended.insurancePeriod} onChange={(v) => set('insuranceRecommended', 'insurancePeriod', v)} />
            </div>
          </Section>
        )}

        {/* ═══ 5. Reasoning ═══ */}
        {form.productType && (
          <Section icon={<MessageSquareText className="w-5 h-5" />} title="נימוק ההמלצה" color={C.teal}>
            <textarea
              value={form.reasoning}
              onChange={(e) => setField('reasoning', e.target.value)}
              rows={4}
              placeholder="הסבר בקצרה למה מומלץ לבצע את השינוי..."
              className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-colors"
              style={{ border: `1.5px solid ${errors['reasoning'] ? C.red : C.border}`, background: C.white, color: C.textDark }}
              onFocus={(e) => (e.target.style.borderColor = C.teal)}
              onBlur={(e) => (e.target.style.borderColor = errors['reasoning'] ? C.red : C.border)}
            />
            {errors['reasoning'] && <p className="text-xs mt-1" style={{ color: C.red }}>{errors['reasoning']}</p>}
          </Section>
        )}

        {/* ═══ 6. Actions ═══ */}
        {form.productType && (
          <div className="mt-8 flex justify-center pb-16">
            <button
              type="button"
              onClick={handleGeneratePDF}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-xl text-base font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: C.teal, boxShadow: '0 8px 24px rgba(13,79,79,0.2)' }}
            >
              <FileDown className="w-5 h-5" />
              יצירת PDF
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

function Section({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl p-6" style={{ background: C.white, border: `1px solid ${C.border}`, boxShadow: '0 1px 6px rgba(13,79,79,0.04)' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ background: color }}>{icon}</div>
        <h2 className="text-base font-bold" style={{ color: C.teal }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  label, value, onChange, error, required, suffix, inputMode,
}: {
  label: string; value: string; onChange: (v: string) => void;
  error?: string; required?: boolean; suffix?: string; inputMode?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: C.textBody }}>
        {label} {required && <span style={{ color: C.red }}>*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode={inputMode as React.HTMLAttributes<HTMLInputElement>['inputMode']}
          className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
          style={{ border: `1.5px solid ${error ? C.red : C.border}`, background: C.white, color: C.textDark }}
          onFocus={(e) => (e.target.style.borderColor = C.teal)}
          onBlur={(e) => (e.target.style.borderColor = error ? C.red : C.border)}
        />
        {suffix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: C.textMuted }}>{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs mt-1" style={{ color: C.red }}>{error}</p>}
    </div>
  );
}

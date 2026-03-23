import { Product, ProductType, Customer, NeedsAssessment, FamilyMember } from "@/types/database";

// === סוגי ממצאים ===
export type FindingType = 'gap' | 'duplicate' | 'high_fee' | 'coverage_mismatch' | 'no_beneficiary' | 'outdated' | 'optimization';
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface XRayFinding {
  id: string;
  type: FindingType;
  severity: FindingSeverity;
  title: string;
  description: string;
  category: string;
  estimatedImpact?: number; // חיסכון שנתי משוער בש"ח
  affectedProducts?: string[];
  recommendation?: string;
}

export interface XRayReport {
  customerId: string;
  customerName: string;
  analyzedAt: string;
  score: number; // 0-100 ציון בריאות התיק
  findings: XRayFinding[];
  summary: {
    totalProducts: number;
    activeProducts: number;
    totalPremium: number;
    totalBalance: number;
    avgManagementFee: number;
    gapsCount: number;
    duplicatesCount: number;
    highFeesCount: number;
    estimatedSavings: number;
  };
  categories: {
    pension: XRayCategoryStatus;
    savings: XRayCategoryStatus;
    lifeInsurance: XRayCategoryStatus;
    healthInsurance: XRayCategoryStatus;
    propertyInsurance: XRayCategoryStatus;
  };
}

export interface XRayCategoryStatus {
  name: string;
  status: 'complete' | 'partial' | 'missing';
  products: Product[];
  findings: XRayFinding[];
}

// === ניתוח ===

const PRODUCT_CATEGORIES: Record<string, ProductType[]> = {
  pension: ['pension', 'provident', 'study_fund', 'managers'],
  savings: ['provident', 'study_fund'],
  lifeInsurance: ['life', 'critical_illness', 'personal_accident'],
  healthInsurance: ['health'],
  propertyInsurance: ['car', 'home', 'business', 'mortgage', 'travel'],
};

const FEE_THRESHOLDS: Partial<Record<ProductType, number>> = {
  pension: 1.5,
  provident: 1.0,
  study_fund: 0.8,
  managers: 2.0,
};

const ESSENTIAL_PRODUCTS: ProductType[] = ['pension', 'life', 'health'];

let findingCounter = 0;
function generateFindingId(): string {
  findingCounter++;
  return `finding-${Date.now()}-${findingCounter}`;
}

export function analyzePortfolio(
  customer: Customer,
  products: Product[],
  familyMembers: FamilyMember[],
  needsAssessment: NeedsAssessment | null
): XRayReport {
  findingCounter = 0;
  const activeProducts = products.filter(p => p.status === 'active');
  const findings: XRayFinding[] = [];

  // 1. בדיקת פערים - מוצרים חיוניים חסרים
  findings.push(...checkGaps(activeProducts, customer, needsAssessment));

  // 2. בדיקת כפילויות
  findings.push(...checkDuplicates(activeProducts));

  // 3. בדיקת דמי ניהול גבוהים
  findings.push(...checkHighFees(activeProducts));

  // 4. בדיקת התאמת כיסוי
  findings.push(...checkCoverageMismatch(activeProducts, customer, familyMembers));

  // 5. בדיקת מוצרים ישנים
  findings.push(...checkOutdatedProducts(activeProducts));

  // חישובי סיכום
  const totalPremium = activeProducts.reduce((sum, p) => sum + (p.premium_monthly || 0), 0);
  const totalBalance = activeProducts.reduce((sum, p) => sum + (p.balance || 0), 0);
  const feesProducts = activeProducts.filter(p => p.management_fee != null && p.management_fee > 0);
  const avgFee = feesProducts.length > 0
    ? feesProducts.reduce((sum, p) => sum + (p.management_fee || 0), 0) / feesProducts.length
    : 0;

  const gapsCount = findings.filter(f => f.type === 'gap').length;
  const duplicatesCount = findings.filter(f => f.type === 'duplicate').length;
  const highFeesCount = findings.filter(f => f.type === 'high_fee').length;
  const estimatedSavings = findings.reduce((sum, f) => sum + (f.estimatedImpact || 0), 0);

  // חישוב ציון בריאות
  const score = calculateHealthScore(findings, activeProducts);

  // סטטוס קטגוריות
  const categories = buildCategoryStatus(activeProducts, findings);

  return {
    customerId: customer.id,
    customerName: `${customer.first_name} ${customer.last_name}`,
    analyzedAt: new Date().toISOString(),
    score,
    findings,
    summary: {
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      totalPremium,
      totalBalance,
      avgManagementFee: Math.round(avgFee * 100) / 100,
      gapsCount,
      duplicatesCount,
      highFeesCount,
      estimatedSavings,
    },
    categories,
  };
}

function checkGaps(
  products: Product[],
  customer: Customer,
  needs: NeedsAssessment | null
): XRayFinding[] {
  const findings: XRayFinding[] = [];
  const productTypes = new Set(products.map(p => p.type));

  for (const essential of ESSENTIAL_PRODUCTS) {
    if (!productTypes.has(essential)) {
      const labels: Record<string, string> = {
        pension: 'פנסיה',
        life: 'ביטוח חיים',
        health: 'ביטוח בריאות',
      };
      findings.push({
        id: generateFindingId(),
        type: 'gap',
        severity: 'critical',
        title: `חסר ${labels[essential] || essential}`,
        description: `ללקוח אין ${labels[essential] || essential} פעיל. זהו מוצר חיוני שכל אדם צריך.`,
        category: 'פערים',
        recommendation: `יש לבדוק ולהמליץ על ${labels[essential]} מתאים`,
      });
    }
  }

  // בדיקה לפי מצב משפחתי
  if (customer.marital_status === 'married' && !productTypes.has('life')) {
    // already caught above, but add context about family
  }

  // בדיקה לפי הכנסה
  if (customer.monthly_income && customer.monthly_income > 15000) {
    if (!productTypes.has('study_fund')) {
      findings.push({
        id: generateFindingId(),
        type: 'gap',
        severity: 'high',
        title: 'חסרה קרן השתלמות',
        description: `הכנסה של ${customer.monthly_income.toLocaleString()} ₪ - מומלץ קרן השתלמות לחיסכון והטבות מס`,
        category: 'פערים',
        estimatedImpact: Math.min(customer.monthly_income * 0.075 * 12, 18000),
        recommendation: 'פתיחת קרן השתלמות תאפשר הטבת מס משמעותית',
      });
    }
  }

  // בדיקה לפי צרכים
  if (needs) {
    if (needs.insurance_critical_illness && !productTypes.has('critical_illness')) {
      findings.push({
        id: generateFindingId(),
        type: 'gap',
        severity: 'high',
        title: 'חסר ביטוח מחלות קשות',
        description: 'הלקוח הביע צורך בביטוח מחלות קשות אך אין לו כיסוי פעיל',
        category: 'פערים',
        recommendation: 'יש להציע ביטוח מחלות קשות בהתאם לצרכים',
      });
    }
    if (needs.insurance_nursing && !productTypes.has('health')) {
      findings.push({
        id: generateFindingId(),
        type: 'gap',
        severity: 'medium',
        title: 'חסר כיסוי סיעודי',
        description: 'הלקוח הביע צורך בכיסוי סיעודי',
        category: 'פערים',
        recommendation: 'בדיקת אפשרויות ביטוח סיעודי',
      });
    }
  }

  return findings;
}

function checkDuplicates(products: Product[]): XRayFinding[] {
  const findings: XRayFinding[] = [];
  const byType = new Map<ProductType, Product[]>();

  for (const product of products) {
    const list = byType.get(product.type) || [];
    list.push(product);
    byType.set(product.type, list);
  }

  const labels: Record<string, string> = {
    pension: 'פנסיה',
    provident: 'קופת גמל',
    study_fund: 'קרן השתלמות',
    life: 'ביטוח חיים',
    health: 'ביטוח בריאות',
    managers: 'ביטוח מנהלים',
  };

  byType.forEach((prods: Product[], type: ProductType) => {
    if (prods.length > 1) {
      // פנסיה כפולה - בעיה רצינית
      const severity: FindingSeverity = type === 'pension' ? 'high' : 'medium';
      const totalPremium = prods.reduce((s: number, p: Product) => s + (p.premium_monthly || 0), 0);
      const companies = prods.map((p: Product) => p.company || 'לא ידוע').join(', ');

      findings.push({
        id: generateFindingId(),
        type: 'duplicate',
        severity,
        title: `כפילות ב${labels[type] || type}`,
        description: `נמצאו ${prods.length} מוצרי ${labels[type] || type} פעילים (${companies}). פרמיה כוללת: ${totalPremium.toLocaleString()} ₪`,
        category: 'כפילויות',
        affectedProducts: prods.map((p: Product) => p.id),
        estimatedImpact: Math.round(totalPremium * 0.2 * 12), // 20% חיסכון אפשרי
        recommendation: `ריכוז ל${labels[type]} אחד יכול לחסוך בדמי ניהול ופרמיות`,
      });
    }
  });

  return findings;
}

function checkHighFees(products: Product[]): XRayFinding[] {
  const findings: XRayFinding[] = [];

  for (const product of products) {
    if (product.management_fee == null) continue;

    const threshold = FEE_THRESHOLDS[product.type];
    if (threshold && product.management_fee > threshold) {
      const excessFee = product.management_fee - threshold;
      const balance = product.balance || 0;
      const annualExcess = Math.round(balance * (excessFee / 100));

      const labels: Record<string, string> = {
        pension: 'פנסיה',
        provident: 'קופת גמל',
        study_fund: 'קרן השתלמות',
        managers: 'ביטוח מנהלים',
      };

      findings.push({
        id: generateFindingId(),
        type: 'high_fee',
        severity: product.management_fee > threshold * 1.5 ? 'high' : 'medium',
        title: `דמי ניהול גבוהים ב${labels[product.type] || product.type}`,
        description: `דמי ניהול ${product.management_fee}% (סף מומלץ: ${threshold}%) ב-${product.company || 'לא ידוע'}`,
        category: 'דמי ניהול',
        affectedProducts: [product.id],
        estimatedImpact: annualExcess > 0 ? annualExcess : undefined,
        recommendation: `ניתן להוריד ל-${threshold}% באותה חברה או לעבור לחברה מתחרה`,
      });
    }
  }

  return findings;
}

function checkCoverageMismatch(
  products: Product[],
  customer: Customer,
  familyMembers: FamilyMember[]
): XRayFinding[] {
  const findings: XRayFinding[] = [];
  const hasChildren = familyMembers.some(m => m.relationship === 'child');
  const hasSpouse = familyMembers.some(m => m.relationship === 'spouse');
  const lifeProducts = products.filter(p => p.type === 'life');

  // בדיקת גובה ביטוח חיים מול הכנסה
  if (customer.monthly_income && lifeProducts.length > 0) {
    const totalLifePremium = lifeProducts.reduce((s, p) => s + (p.premium_monthly || 0), 0);
    const income = customer.monthly_income;

    // אם משלם מאוד מעט ביחס להכנסה ויש תלויים
    if ((hasChildren || hasSpouse) && totalLifePremium < income * 0.02) {
      findings.push({
        id: generateFindingId(),
        type: 'coverage_mismatch',
        severity: 'medium',
        title: 'כיסוי ביטוח חיים נמוך ביחס למשפחה',
        description: `משפחה עם ${hasChildren ? 'ילדים' : 'בן/בת זוג'} - מומלץ לבדוק אם סכום הכיסוי מספיק`,
        category: 'התאמת כיסוי',
        recommendation: 'מומלץ לבדוק גובה הכיסוי ביחס לצרכי המשפחה',
      });
    }
  }

  // בדיקת ביטוח דירה
  const hasHome = products.some(p => p.type === 'home');
  if (!hasHome && customer.address_street) {
    findings.push({
      id: generateFindingId(),
      type: 'gap',
      severity: 'medium',
      title: 'חסר ביטוח דירה',
      description: `הלקוח גר ב-${customer.address_city || 'כתובת ידועה'} אך אין ביטוח דירה`,
      category: 'פערים',
      recommendation: 'מומלץ לבדוק צורך בביטוח דירה/תכולה',
    });
  }

  return findings;
}

function checkOutdatedProducts(products: Product[]): XRayFinding[] {
  const findings: XRayFinding[] = [];
  const now = new Date();

  for (const product of products) {
    if (product.start_date) {
      const startDate = new Date(product.start_date);
      const yearsOld = (now.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

      if (yearsOld > 10 && ['pension', 'life', 'managers'].includes(product.type)) {
        findings.push({
          id: generateFindingId(),
          type: 'outdated',
          severity: 'low',
          title: `מוצר ותיק - ${product.company || product.type}`,
          description: `מוצר בן ${Math.floor(yearsOld)} שנים. מומלץ לבדוק אם התנאים עדיין תחרותיים`,
          category: 'מוצרים ותיקים',
          affectedProducts: [product.id],
          recommendation: 'בדיקת שוק ועדכון תנאים בהתאם',
        });
      }
    }
  }

  return findings;
}

function calculateHealthScore(findings: XRayFinding[], products: Product[]): number {
  if (products.length === 0) return 0;

  let score = 100;

  for (const finding of findings) {
    switch (finding.severity) {
      case 'critical': score -= 20; break;
      case 'high': score -= 12; break;
      case 'medium': score -= 6; break;
      case 'low': score -= 3; break;
    }
  }

  return Math.max(0, Math.min(100, score));
}

function buildCategoryStatus(products: Product[], findings: XRayFinding[]): XRayReport['categories'] {
  const makeStatus = (name: string, types: ProductType[]): XRayCategoryStatus => {
    const categoryProducts = products.filter(p => types.includes(p.type));
    const categoryFindings = findings.filter(f =>
      f.affectedProducts?.some(id => categoryProducts.some(p => p.id === id)) ||
      f.category === name
    );

    let status: 'complete' | 'partial' | 'missing' = 'missing';
    if (categoryProducts.length > 0) {
      status = categoryFindings.some(f => f.severity === 'critical') ? 'partial' : 'complete';
    }

    return { name, status, products: categoryProducts, findings: categoryFindings };
  };

  return {
    pension: makeStatus('פנסיה וחיסכון', PRODUCT_CATEGORIES.pension),
    savings: makeStatus('חיסכון והשקעות', PRODUCT_CATEGORIES.savings),
    lifeInsurance: makeStatus('ביטוח חיים', PRODUCT_CATEGORIES.lifeInsurance),
    healthInsurance: makeStatus('ביטוח בריאות', PRODUCT_CATEGORIES.healthInsurance),
    propertyInsurance: makeStatus('ביטוח רכוש', PRODUCT_CATEGORIES.propertyInsurance),
  };
}

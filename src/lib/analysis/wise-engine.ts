import { XRayReport, XRayFinding, FindingSeverity } from "./xray-engine";
import { Product, ProductType, Customer } from "@/types/database";

// === סוגי המלצות ===
export type RecommendationPriority = 'mandatory' | 'high' | 'medium' | 'service';
export type RecommendationAction = 'open_new' | 'close' | 'transfer' | 'upgrade' | 'reduce_fee' | 'increase_coverage' | 'review';

export interface WiseRecommendation {
  id: string;
  priority: RecommendationPriority;
  action: RecommendationAction;
  title: string;
  description: string;
  reasoning: string;
  category: string;
  estimatedSavings?: number;
  estimatedCost?: number;
  relatedFindingIds: string[];
  suggestedCompanies?: string[];
  steps: string[];
  timeframe: string;
}

export interface WiseReport {
  customerId: string;
  customerName: string;
  generatedAt: string;
  xrayScore: number;
  projectedScore: number; // ציון צפוי אחרי יישום ההמלצות
  recommendations: WiseRecommendation[];
  summary: {
    totalRecommendations: number;
    mandatoryCount: number;
    estimatedTotalSavings: number;
    estimatedTotalCost: number;
    topPriority: string;
  };
}

// === חברות ביטוח ===
const COMPANIES: Record<string, string[]> = {
  pension: ['מנורה', 'הראל', 'מגדל', 'כלל', 'הפניקס', 'מיטב', 'אלטשולר שחם'],
  life: ['מנורה', 'הראל', 'מגדל', 'כלל', 'הפניקס', 'איילון'],
  health: ['מנורה', 'הראל', 'מגדל', 'כלל', 'הפניקס'],
  provident: ['מנורה', 'הראל', 'מגדל', 'מיטב', 'אלטשולר שחם', 'ילין לפידות', 'מור'],
  study_fund: ['מנורה', 'הראל', 'מגדל', 'מיטב', 'אלטשולר שחם', 'ילין לפידות'],
};

let recCounter = 0;
function generateRecId(): string {
  recCounter++;
  return `rec-${Date.now()}-${recCounter}`;
}

export function generateRecommendations(
  xrayReport: XRayReport,
  customer: Customer,
  products: Product[]
): WiseReport {
  recCounter = 0;
  const recommendations: WiseRecommendation[] = [];

  // עבור כל ממצא - ייצר המלצה
  for (const finding of xrayReport.findings) {
    const rec = findingToRecommendation(finding, customer, products);
    if (rec) {
      recommendations.push(rec);
    }
  }

  // מיין לפי עדיפות
  const priorityOrder: Record<RecommendationPriority, number> = {
    mandatory: 0,
    high: 1,
    medium: 2,
    service: 3,
  };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const estimatedTotalSavings = recommendations.reduce((s, r) => s + (r.estimatedSavings || 0), 0);
  const estimatedTotalCost = recommendations.reduce((s, r) => s + (r.estimatedCost || 0), 0);
  const mandatoryCount = recommendations.filter(r => r.priority === 'mandatory').length;

  // חישוב ציון צפוי
  const projectedScore = Math.min(100, xrayReport.score + recommendations.length * 5);

  return {
    customerId: xrayReport.customerId,
    customerName: xrayReport.customerName,
    generatedAt: new Date().toISOString(),
    xrayScore: xrayReport.score,
    projectedScore,
    recommendations,
    summary: {
      totalRecommendations: recommendations.length,
      mandatoryCount,
      estimatedTotalSavings,
      estimatedTotalCost,
      topPriority: mandatoryCount > 0 ? 'חובה לטפל מיידית' : 'המלצות לשיפור',
    },
  };
}

function findingToRecommendation(
  finding: XRayFinding,
  customer: Customer,
  products: Product[]
): WiseRecommendation | null {
  switch (finding.type) {
    case 'gap':
      return gapToRecommendation(finding, customer);
    case 'duplicate':
      return duplicateToRecommendation(finding, products);
    case 'high_fee':
      return highFeeToRecommendation(finding, products);
    case 'coverage_mismatch':
      return coverageToRecommendation(finding);
    case 'outdated':
      return outdatedToRecommendation(finding);
    default:
      return null;
  }
}

function gapToRecommendation(finding: XRayFinding, customer: Customer): WiseRecommendation {
  const isEssential = finding.severity === 'critical';
  const productType = guessProductType(finding.title);

  return {
    id: generateRecId(),
    priority: isEssential ? 'mandatory' : 'high',
    action: 'open_new',
    title: `פתיחת ${finding.title.replace('חסר ', '').replace('חסרה ', '')}`,
    description: finding.description,
    reasoning: isEssential
      ? 'מוצר חיוני שחובה שיהיה לכל אדם - פער קריטי בתיק'
      : 'מוצר מומלץ שישפר את הכיסוי הכולל',
    category: finding.category,
    estimatedCost: estimateProductCost(productType, customer),
    relatedFindingIds: [finding.id],
    suggestedCompanies: productType ? COMPANIES[productType] : undefined,
    steps: [
      'איסוף מידע ונתוני בריאות',
      'השוואת מחירים בין חברות',
      'הצגת הצעה ללקוח',
      'חתימה ושליחה לחברה',
    ],
    timeframe: isEssential ? 'מיידי - תוך שבוע' : 'תוך חודש',
  };
}

function duplicateToRecommendation(finding: XRayFinding, products: Product[]): WiseRecommendation {
  const affectedProducts = products.filter(p => finding.affectedProducts?.includes(p.id));
  const companies = affectedProducts.map(p => p.company || 'לא ידוע');

  return {
    id: generateRecId(),
    priority: 'high',
    action: 'transfer',
    title: `ריכוז ${finding.title.replace('כפילות ב', '')}`,
    description: `ריכוז מ-${affectedProducts.length} מוצרים למוצר אחד כדי לחסוך בדמי ניהול ופרמיות`,
    reasoning: `כפילות גורמת לתשלום יתר בדמי ניהול ולפיזור לא יעיל של החיסכון. ריכוז ימקסם את התשואה.`,
    category: finding.category,
    estimatedSavings: finding.estimatedImpact,
    relatedFindingIds: [finding.id],
    suggestedCompanies: companies,
    steps: [
      'בחירת החברה עם התנאים הטובים ביותר',
      'בדיקת עלויות העברה וקנסות',
      'הכנת טופסי העברה',
      'חתימת הלקוח',
      'מעקב אחר השלמת ההעברה',
    ],
    timeframe: 'תוך חודשיים',
  };
}

function highFeeToRecommendation(finding: XRayFinding, products: Product[]): WiseRecommendation {
  return {
    id: generateRecId(),
    priority: 'medium',
    action: 'reduce_fee',
    title: `הורדת ${finding.title}`,
    description: finding.description,
    reasoning: 'דמי ניהול גבוהים שוחקים את התשואה לאורך שנים. הורדה תחסוך סכומים משמעותיים.',
    category: finding.category,
    estimatedSavings: finding.estimatedImpact,
    relatedFindingIds: [finding.id],
    steps: [
      'פנייה לחברה הנוכחית לבקשת הורדה',
      'אם סירוב - השוואת הצעות מחברות מתחרות',
      'הצגת ההצעה ללקוח',
      'ביצוע העברה או עדכון',
    ],
    timeframe: 'תוך חודש',
  };
}

function coverageToRecommendation(finding: XRayFinding): WiseRecommendation {
  return {
    id: generateRecId(),
    priority: 'medium',
    action: 'increase_coverage',
    title: `עדכון ${finding.title}`,
    description: finding.description,
    reasoning: 'הכיסוי הנוכחי לא מתאים לצרכים. עדכון ישפר את ההגנה הביטוחית.',
    category: finding.category,
    relatedFindingIds: [finding.id],
    steps: [
      'בדיקת גובה הכיסוי הנוכחי',
      'חישוב הכיסוי הנדרש לפי צרכי המשפחה',
      'הצגת הפער ללקוח',
      'עדכון או פתיחת כיסוי נוסף',
    ],
    timeframe: 'תוך חודש',
  };
}

function outdatedToRecommendation(finding: XRayFinding): WiseRecommendation {
  return {
    id: generateRecId(),
    priority: 'service',
    action: 'review',
    title: `סקירת ${finding.title}`,
    description: finding.description,
    reasoning: 'מוצרים ותיקים עלולים להיות עם תנאים פחות טובים מהנהוג היום. סקירה תבדוק אם שווה לעדכן.',
    category: finding.category,
    relatedFindingIds: [finding.id],
    steps: [
      'בדיקת תנאי המוצר הנוכחיים',
      'השוואה לשוק הנוכחי',
      'אם יש שיפור משמעותי - המלצה להעברה',
    ],
    timeframe: 'תוך שלושה חודשים',
  };
}

function guessProductType(title: string): string | null {
  if (title.includes('פנסיה')) return 'pension';
  if (title.includes('חיים')) return 'life';
  if (title.includes('בריאות')) return 'health';
  if (title.includes('השתלמות')) return 'study_fund';
  if (title.includes('גמל')) return 'provident';
  if (title.includes('מחלות')) return 'life';
  if (title.includes('סיעודי')) return 'health';
  if (title.includes('דירה')) return 'home';
  return null;
}

function estimateProductCost(type: string | null, customer: Customer): number | undefined {
  const income = customer.monthly_income || 10000;
  switch (type) {
    case 'pension': return Math.round(income * 0.186); // 18.6% הפרשות
    case 'life': return Math.round(income * 0.03);
    case 'health': return 200;
    case 'study_fund': return Math.round(income * 0.075);
    case 'provident': return Math.round(income * 0.05);
    default: return undefined;
  }
}

/* ─── Product types ─── */
export const PRODUCT_TYPES = [
  { value: 'pension', label: 'קרן פנסיה', group: 'savings' },
  { value: 'hishtalmut', label: 'קרן השתלמות', group: 'savings' },
  { value: 'gemel', label: 'קופת גמל', group: 'savings' },
  { value: 'financial_policy', label: 'פוליסה פיננסית', group: 'savings' },
  { value: 'health', label: 'ביטוח בריאות', group: 'insurance' },
  { value: 'life', label: 'ביטוח חיים', group: 'insurance' },
  { value: 'mortgage_life', label: 'ביטוח חיים למשכנתא', group: 'insurance' },
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number]['value'];
export type ProductGroup = 'savings' | 'insurance';

export function getProductGroup(type: ProductType): ProductGroup {
  return PRODUCT_TYPES.find((p) => p.value === type)!.group;
}

export function getProductLabel(type: ProductType): string {
  return PRODUCT_TYPES.find((p) => p.value === type)!.label;
}

/* ─── Form data ─── */
export interface ClientInfo {
  fullName: string;
  idNumber: string;
  phone: string;
}

export interface SavingsCurrent {
  company: string;
  trackName: string;
  accumulation: string;
  monthlyDeposit: string;
  feeAccumulation: string;
  feeDeposit: string;
  yearReturn: string;
}

export interface SavingsRecommended {
  company: string;
  trackName: string;
  transferAmount: string;
  monthlyDeposit: string;
  feeAccumulation: string;
  feeDeposit: string;
  yearReturn: string;
}

export interface InsuranceCurrent {
  company: string;
  coverageType: string;
  coverageAmount: string;
  monthlyPremium: string;
  insurancePeriod: string;
}

export interface InsuranceRecommended {
  company: string;
  coverageType: string;
  coverageAmount: string;
  monthlyPremium: string;
  insurancePeriod: string;
}

export interface RecommendationFormData {
  client: ClientInfo;
  productType: ProductType | '';
  savingsCurrent: SavingsCurrent;
  savingsRecommended: SavingsRecommended;
  insuranceCurrent: InsuranceCurrent;
  insuranceRecommended: InsuranceRecommended;
  reasoning: string;
}

export const EMPTY_FORM: RecommendationFormData = {
  client: { fullName: '', idNumber: '', phone: '' },
  productType: '',
  savingsCurrent: { company: '', trackName: '', accumulation: '', monthlyDeposit: '', feeAccumulation: '', feeDeposit: '', yearReturn: '' },
  savingsRecommended: { company: '', trackName: '', transferAmount: '', monthlyDeposit: '', feeAccumulation: '', feeDeposit: '', yearReturn: '' },
  insuranceCurrent: { company: '', coverageType: '', coverageAmount: '', monthlyPremium: '', insurancePeriod: '' },
  insuranceRecommended: { company: '', coverageType: '', coverageAmount: '', monthlyPremium: '', insurancePeriod: '' },
  reasoning: '',
};

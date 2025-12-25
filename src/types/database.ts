export type UserRole = 'admin' | 'manager' | 'agent';

export type ProductType =
  | 'pension'
  | 'provident'
  | 'study_fund'
  | 'managers'
  | 'life'
  | 'health'
  | 'critical_illness'
  | 'personal_accident'
  | 'mortgage'
  | 'travel'
  | 'car'
  | 'home'
  | 'business';

export type ProductStatus = 'active' | 'inactive' | 'pending' | 'cancelled';

export type DocumentType =
  | 'clearing_report'
  | 'appendix_a'
  | 'appendix_b'
  | 'appendix_e'
  | 'policy'
  | 'poa'
  | 'remote_signature'
  | 'other';

export type ActivityType =
  | 'call'
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'meeting'
  | 'document'
  | 'status_change'
  | 'note';

export type WorkflowStatus = 'open' | 'in_progress' | 'waiting' | 'completed' | 'cancelled';

export type WorkflowPriority = 'low' | 'medium' | 'high' | 'urgent';

export type MeetingType = 'phone' | 'in_person' | 'video';

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  birth_date?: string;
  gender?: string;
  marital_status?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address_city?: string;
  address_street?: string;
  address_number?: string;
  is_confidential: boolean;
  quality_score?: number;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  customer_id: string;
  type: ProductType;
  company?: string;
  policy_number?: string;
  status: ProductStatus;
  start_date?: string;
  end_date?: string;
  premium_monthly?: number;
  balance?: number;
  management_fee?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  customer_id: string;
  type: DocumentType;
  name: string;
  file_path: string;
  password_protected: boolean;
  sent_at?: string;
  viewed_at?: string;
  created_at: string;
}

export interface Activity {
  id: string;
  customer_id: string;
  type: ActivityType;
  description?: string;
  created_by?: string;
  created_at: string;
}

export interface Workflow {
  id: string;
  customer_id: string;
  type: string;
  status: WorkflowStatus;
  priority: WorkflowPriority;
  assigned_to?: string;
  due_date?: string;
  steps: WorkflowStep[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  completed: boolean;
  completed_at?: string;
}

export interface Meeting {
  id: string;
  customer_id: string;
  type: MeetingType;
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  summary?: string;
  next_steps?: string;
  status: MeetingStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyRelation {
  id: string;
  customer_id: string;
  related_customer_id: string;
  relation_type: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message?: string;
  type: string;
  is_read: boolean;
  related_id?: string;
  created_at: string;
}

// Helper types for forms
export interface CustomerFormData {
  first_name: string;
  last_name: string;
  id_number: string;
  birth_date?: string;
  gender?: string;
  marital_status?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address_city?: string;
  address_street?: string;
  address_number?: string;
  is_confidential?: boolean;
  quality_score?: number;
}

export interface ProductFormData {
  customer_id: string;
  type: ProductType;
  company?: string;
  policy_number?: string;
  status?: ProductStatus;
  start_date?: string;
  end_date?: string;
  premium_monthly?: number;
  balance?: number;
  management_fee?: number;
  notes?: string;
}

// Hebrew labels
export const productTypeLabels: Record<ProductType, string> = {
  pension: 'פנסיה',
  provident: 'קופת גמל',
  study_fund: 'קרן השתלמות',
  managers: 'ביטוח מנהלים',
  life: 'ביטוח חיים',
  health: 'ביטוח בריאות',
  critical_illness: 'מחלות קשות',
  personal_accident: 'תאונות אישיות',
  mortgage: 'ביטוח משכנתא',
  travel: 'ביטוח נסיעות',
  car: 'ביטוח רכב',
  home: 'ביטוח דירה',
  business: 'ביטוח עסק',
};

export const productStatusLabels: Record<ProductStatus, string> = {
  active: 'פעיל',
  inactive: 'לא פעיל',
  pending: 'בהמתנה',
  cancelled: 'מבוטל',
};

export const documentTypeLabels: Record<DocumentType, string> = {
  clearing_report: 'דוח סליקה',
  appendix_a: 'נספח א',
  appendix_b: 'נספח ב',
  appendix_e: 'נספח ה',
  policy: 'פוליסה',
  poa: 'ייפוי כוח',
  remote_signature: 'חתימה מרחוק',
  other: 'אחר',
};

export const activityTypeLabels: Record<ActivityType, string> = {
  call: 'שיחה',
  email: 'אימייל',
  sms: 'SMS',
  whatsapp: 'וואטסאפ',
  meeting: 'פגישה',
  document: 'מסמך',
  status_change: 'שינוי סטטוס',
  note: 'הערה',
};

export const workflowStatusLabels: Record<WorkflowStatus, string> = {
  open: 'פתוח',
  in_progress: 'בטיפול',
  waiting: 'ממתין',
  completed: 'הושלם',
  cancelled: 'בוטל',
};

export const workflowPriorityLabels: Record<WorkflowPriority, string> = {
  low: 'נמוך',
  medium: 'בינוני',
  high: 'גבוה',
  urgent: 'דחוף',
};

export const meetingTypeLabels: Record<MeetingType, string> = {
  phone: 'טלפוני',
  in_person: 'פרונטלי',
  video: 'וידאו',
};

export const meetingStatusLabels: Record<MeetingStatus, string> = {
  scheduled: 'מתוכנן',
  completed: 'הושלם',
  cancelled: 'בוטל',
  no_show: 'לא הגיע',
};

export const userRoleLabels: Record<UserRole, string> = {
  admin: 'מנהל מערכת',
  manager: 'מנהל',
  agent: 'סוכן',
};

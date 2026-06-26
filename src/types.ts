/**
 * PHASE 10D - UNIVERSAL INTERACTIONS ENHANCEMENT
 * Extended types for multi-industry lead management
 */

// ============================================================================
// LEAD DATA STRUCTURE
// ============================================================================

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  service?: string;
  value?: number;
  status?: 'active' | 'won' | 'lost';
  source?: string;
  createdAt: string;
  updatedAt?: string;
  notes?: Note[];
  communicationHistory?: any[];
  customFields?: Record<string, any>;
  files?: LeadFile[];
  assignedTo?: string;
  workspaceId?: string;
  nextFollowUpDate?: string;
  lastContactDate?: string;
  followUpStage?: number;
  interactions?: InteractionRecord[];  // NEW: Universal interaction history
  [key: string]: any; // Allow dynamic fields
}

export interface Note {
  id?: string;
  text: string;
  timestamp?: string;
  author?: string;
}

export interface LeadFile {
  url: string;
  name: string;
  size?: number;
  uploadedAt?: string;
}

// ============================================================================
// PIPELINE & WORKSPACE STRUCTURES
// ============================================================================

export interface PipelineStage {
  id: string;
  name: string;
  color?: string;
  order?: number;
}

export interface Tenant {
  id: string;
  name: string;
  workspaceId?: string;
  [key: string]: any;
}

export interface IndustryConfig {
  id: string;
  name: string;
  icon?: string;
  customFields?: any[];
  pipelineStages?: PipelineStage[];
  [key: string]: any;
}

export type QuickActionType = 'email' | 'whatsapp' | 'sms' | 'call';

// ============================================================================
// AUTOMATION SETTINGS
// ============================================================================

export interface AutomationSettings {
  followUp1Delay: number; // days until follow-up #1
  followUp2Delay: number; // days until follow-up #2
  finalFollowUpDelay: number; // days until final follow-up
  lostReviewDelay: number; // days until lost review
}

// Default automation settings
export const DEFAULT_AUTOMATION_SETTINGS: AutomationSettings = {
  followUp1Delay: 3,
  followUp2Delay: 3,
  finalFollowUpDelay: 5,
  lostReviewDelay: 7,
};

// ============================================================================
// FOLLOW-UP METRICS
// ============================================================================

export interface FollowUpMetrics {
  newLeads: number;
  followUp1Due: number;
  followUp2Due: number;
  finalFollowUpDue: number;
  lostReviewDue: number;
  overdueCount: number;
  dueToday: number;
  totalFollowUpsDue: number;
}

// ============================================================================
// FOLLOW-UP UPDATE
// ============================================================================

export interface FollowUpUpdate {
  stage: number;
  nextFollowUpDate: string;
  lastContactDate: string;
}

// ============================================================================
// FOLLOW-UP STATUS
// ============================================================================

export interface FollowUpStatus {
  stage: number;
  stageName: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  daysUntilFollowUp?: number;
  isOverdue: boolean;
  daysOverdue?: number;
  communicationCount: number;
}
export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface StageTemplate {
  whatsapp: string;
  email: EmailTemplate;
}

export interface OutreachTemplates {
  introduction: StageTemplate;
  firstFollowUp: StageTemplate;
  secondFollowUp: StageTemplate;
  finalFollowUp: StageTemplate;
}
export const TEMPLATE_STAGES = [
  { id: 'introduction', label: 'Introduction', icon: '👋' },
  { id: 'firstFollowUp', label: 'First Follow-Up', icon: '📞' },
  { id: 'secondFollowUp', label: 'Second Follow-Up', icon: '🔔' },
  { id: 'finalFollowUp', label: 'Final Follow-Up', icon: '⏰' }
] as const;

// ============================================================================
// UNIVERSAL INTERACTION TYPES
// ============================================================================

export type InteractionType = 
  | 'phone_call'
  | 'whatsapp'
  | 'email'
  | 'sms'
  | 'meeting'
  | 'video_meeting'
  | 'site_visit'
  | 'property_showing'
  | 'demo'
  | 'presentation'
  | 'proposal_sent'
  | 'quote_sent'
  | 'invoice_sent'
  | 'document_collection'
  | 'payment_reminder'
  | 'payment_received'
  | 'contract_signed'
  | 'follow_up'
  | 'task'
  | 'other';

export interface InteractionRecord {
  id: string;
  type: InteractionType;
  date: string;
  time?: string;
  notes?: string;
  outcome?: string;
  status?: string;
  nextScheduledActivity?: string;
  nextScheduledDate?: string;
  createdAt: string;
  createdBy?: string;
}

export const INTERACTION_TYPES: Array<{ type: InteractionType; label: string; icon: string }> = [
  { type: 'phone_call', label: 'Phone Call', icon: '📞' },
  { type: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { type: 'email', label: 'Email', icon: '📧' },
  { type: 'sms', label: 'SMS', icon: '💌' },
  { type: 'meeting', label: 'Meeting', icon: '🤝' },
  { type: 'video_meeting', label: 'Video Meeting', icon: '📹' },
  { type: 'site_visit', label: 'Site Visit', icon: '🏠' },
  { type: 'property_showing', label: 'Property Showing', icon: '🏘️' },
  { type: 'demo', label: 'Demo', icon: '🎯' },
  { type: 'presentation', label: 'Presentation', icon: '📊' },
  { type: 'proposal_sent', label: 'Proposal Sent', icon: '📄' },
  { type: 'quote_sent', label: 'Quote Sent', icon: '💵' },
  { type: 'invoice_sent', label: 'Invoice Sent', icon: '📋' },
  { type: 'document_collection', label: 'Document Collection', icon: '📁' },
  { type: 'payment_reminder', label: 'Payment Reminder', icon: '⏰' },
  { type: 'payment_received', label: 'Payment Received', icon: '✅' },
  { type: 'contract_signed', label: 'Contract Signed', icon: '✍️' },
  { type: 'follow_up', label: 'Follow-up', icon: '📌' },
  { type: 'task', label: 'Task', icon: '✓' },
  { type: 'other', label: 'Other', icon: '📝' },
];
/**
 * PHASE 10D - EXTEND src/types.ts WITH THESE TYPES
 * 
 * Add these to the end of your existing types.ts file
 */

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
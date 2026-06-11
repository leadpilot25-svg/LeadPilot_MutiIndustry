/**
 * PHASE 10D - EXTEND src/utils/followUpAutomation.ts
 * 
 * Add these functions to your existing followUpAutomation.ts file
 */

import {
  Lead,
  AutomationSettings,
  FollowUpMetrics,
  DEFAULT_AUTOMATION_SETTINGS,
} from '../types';

// ============================================================================
// CALCULATE NEXT FOLLOW-UP DATE
// ============================================================================

export function calculateNextFollowUpDate(
  currentStage: number,
  automationSettings: AutomationSettings
): string {
  const delays: Record<number, number> = {
    0: automationSettings.followUp1Delay,
    1: automationSettings.followUp2Delay,
    2: automationSettings.finalFollowUpDelay,
    3: automationSettings.lostReviewDelay,
  };

  const delayDays = delays[currentStage] || 3;
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + delayDays);
  nextDate.setHours(0, 0, 0, 0);

  return nextDate.toISOString();
}

// ============================================================================
// GET FOLLOW-UPS DUE TODAY
// ============================================================================

export function getFollowUpsDueToday(leads: Lead[]): Lead[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return leads.filter(lead => {
    if (!lead.nextFollowUpDate || lead.followUpStage === 5) return false;
    const followUpDate = new Date(lead.nextFollowUpDate);
    followUpDate.setHours(0, 0, 0, 0);
    return followUpDate.getTime() === today.getTime();
  });
}

// ============================================================================
// GET OVERDUE FOLLOW-UPS
// ============================================================================

export function getOverdueFollowUps(leads: Lead[]): Array<Lead & { daysOverdue: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return leads
    .filter(lead => {
      if (!lead.nextFollowUpDate || lead.followUpStage === 5) return false;
      const followUpDate = new Date(lead.nextFollowUpDate);
      followUpDate.setHours(0, 0, 0, 0);
      return followUpDate.getTime() < today.getTime();
    })
    .map(lead => {
      const followUpDate = new Date(lead.nextFollowUpDate!);
      const daysOverdue = Math.floor(
        (today.getTime() - followUpDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return { ...lead, daysOverdue };
    });
}

// ============================================================================
// GET FOLLOW-UP METRICS
// ============================================================================

export function getFollowUpMetrics(leads: Lead[]): FollowUpMetrics {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const metrics: FollowUpMetrics = {
    newLeads: 0,
    followUp1Due: 0,
    followUp2Due: 0,
    finalFollowUpDue: 0,
    lostReviewDue: 0,
    overdueCount: 0,
    dueToday: 0,
    totalFollowUpsDue: 0,
  };

  leads.forEach(lead => {
    // Count by stage
    if (lead.followUpStage === 0) metrics.newLeads++;
    if (lead.followUpStage === 1) metrics.followUp1Due++;
    if (lead.followUpStage === 2) metrics.followUp2Due++;
    if (lead.followUpStage === 3 || lead.followUpStage === 4) metrics.finalFollowUpDue++;
    if (lead.followUpStage === 5) metrics.lostReviewDue++;

    // Count overdue and due today
    if (lead.nextFollowUpDate && lead.followUpStage !== 5) {
      const followUpDate = new Date(lead.nextFollowUpDate);
      followUpDate.setHours(0, 0, 0, 0);

      if (followUpDate.getTime() === today.getTime()) {
        metrics.dueToday++;
      } else if (followUpDate.getTime() < today.getTime()) {
        metrics.overdueCount++;
      }
    }
  });

  metrics.totalFollowUpsDue =
    metrics.followUp1Due + metrics.followUp2Due + metrics.finalFollowUpDue;

  return metrics;
}

// ============================================================================
// GET DAYS UNTIL FOLLOW-UP
// ============================================================================

export function getDaysUntilFollowUp(nextFollowUpDate?: string): number | null {
  if (!nextFollowUpDate) return null;

  const followUpDate = new Date(nextFollowUpDate);
  const today = new Date();

  followUpDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = followUpDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

// ============================================================================
// FORMAT DAYS UNTIL FOLLOW-UP
// ============================================================================

export function formatDaysUntilFollowUp(daysUntil: number | null): string {
  if (daysUntil === null) return 'No follow-up scheduled';
  if (daysUntil === 0) return 'Due today';
  if (daysUntil === 1) return 'Due tomorrow';
  if (daysUntil < 0) return `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}`;
  return `In ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
}

// ============================================================================
// AUTO-ADVANCE FOLLOW-UP STAGE
// ============================================================================

export function advanceFollowUpStageAndCalculateDate(
  lead: Lead,
  automationSettings: AutomationSettings
): Partial<Lead> {
  const currentStage = lead.followUpStage || 0;
  const newStage = Math.min(currentStage + 1, 5);

  const now = new Date().toISOString();
  const nextDate =
    newStage < 5 ? calculateNextFollowUpDate(newStage, automationSettings) : undefined;

  return {
    followUpStage: newStage,
    lastContactDate: now,
    nextFollowUpDate: nextDate,
  };
}

// ============================================================================
// VALIDATE FOLLOW-UP DATE OVERRIDE
// ============================================================================

export function validateFollowUpDateOverride(date: string): { valid: boolean; warning?: string } {
  const selectedDate = new Date(date);
  const today = new Date();

  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return { valid: true, warning: 'This date is in the past' };
  }

  return { valid: true };
}

// ============================================================================
// GET FOLLOW-UP STAGE NAME
// ============================================================================

export function getFollowUpStageName(stage: number | undefined): string {
  switch (stage) {
    case 0:
      return 'New';
    case 1:
      return 'Initial Contact';
    case 2:
      return 'Follow-up #1';
    case 3:
      return 'Follow-up #2';
    case 4:
      return 'Final Follow-up';
    case 5:
      return 'Lost Review';
    default:
      return 'Unknown';
  }
}

// ============================================================================
// GET FOLLOW-UP STATUS
// ============================================================================

export function getFollowUpStatus(lead: Lead): {
  stage: number;
  stageName: string;
  daysUntil: number | null;
  isOverdue: boolean;
  daysOverdue: number;
} {
  const stage = lead.followUpStage || 0;
  const stageName = getFollowUpStageName(stage);
  const daysUntil = getDaysUntilFollowUp(lead.nextFollowUpDate);
  const isOverdue = daysUntil !== null && daysUntil < 0;
  const daysOverdue = isOverdue ? Math.abs(daysUntil!) : 0;

  return {
    stage,
    stageName,
    daysUntil,
    isOverdue,
    daysOverdue,
  };
}
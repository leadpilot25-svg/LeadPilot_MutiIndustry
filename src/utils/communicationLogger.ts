/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Communication Logger Utility
 * Handles logging and tracking of all communications with leads
 */

import {
  Lead,
  CommunicationRecord,
  FollowUpTemplate,
  CommunicationType,
  CommunicationSummary,
} from '../types';
import { replaceTemplateVariables, extractTemplateVariables } from './templateEngine';

/**
 * Create a communication record
 * @param lead Lead being communicated with
 * @param type Type of communication
 * @param template Template used
 * @param content Actual message sent
 * @param agentId Agent ID
 * @param notes Additional notes
 * @returns Communication record
 */
export function createCommunicationRecord(
  lead: Lead,
  type: CommunicationType,
  template: FollowUpTemplate | null,
  content: string,
  agentId?: string,
  notes?: string
): CommunicationRecord {
  // Extract which variables were used
  const variables = extractTemplateVariables(template?.content || '');
  const variablesUsed: Record<string, string> = {};
  
  variables.forEach(variable => {
    const varName = variable.slice(1, -1); // Remove { and }
    const value = (lead as any)[varName] || '';
    variablesUsed[variable] = value;
  });

  return {
    id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    leadId: lead.id,
    type,
    templateId: template?.id,
    templateName: template?.name,
    content,
    sentAt: new Date().toISOString(),
    deliveryStatus: 'sent',
    agentId,
    notes,
    variablesUsed: Object.keys(variablesUsed).length > 0 ? variablesUsed : undefined,
  };
}

/**
 * Log communication to lead's history
 * @param lead Lead to update
 * @param record Communication record to add
 * @returns Updated lead
 */
export function logCommunication(lead: Lead, record: CommunicationRecord): Lead {
  const history = lead.communicationHistory || [];
  
  return {
    ...lead,
    communicationHistory: [...history, record],
    lastContactDate: record.sentAt,
  };
}

/**
 * Get communication history summary
 * @param lead Lead object
 * @returns Summary of communications
 */
export function getCommunicationSummary(lead: Lead): CommunicationSummary {
  const history = lead.communicationHistory || [];
  const byType: Record<CommunicationType, number> = {
    whatsapp: 0,
    email: 0,
    sms: 0,
    call: 0,
    manual: 0,
  };

  history.forEach(record => {
    byType[record.type]++;
  });

  return {
    totalCount: history.length,
    byType,
    lastCommunication: history[history.length - 1],
    nextFollowUp: lead.nextFollowUpDate ? {
      id: `future_${lead.id}`,
      type: 'manual',
      content: `Next follow-up scheduled for ${new Date(lead.nextFollowUpDate).toLocaleDateString()}`,
      sentAt: lead.nextFollowUpDate,
      deliveryStatus: 'pending',
    } : undefined,
  };
}

/**
 * Get communications of specific type
 * @param lead Lead object
 * @param type Communication type
 * @returns Filtered communication records
 */
export function getCommunicationsByType(
  lead: Lead,
  type: CommunicationType
): CommunicationRecord[] {
  const history = lead.communicationHistory || [];
  return history.filter(record => record.type === type);
}

/**
 * Get communications within date range
 * @param lead Lead object
 * @param startDate ISO date string
 * @param endDate ISO date string
 * @returns Filtered records
 */
export function getCommunicationsByDateRange(
  lead: Lead,
  startDate: string,
  endDate: string
): CommunicationRecord[] {
  const history = lead.communicationHistory || [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  return history.filter(record => {
    const recordDate = new Date(record.sentAt);
    return recordDate >= start && recordDate <= end;
  });
}

/**
 * Get successful communications
 * @param lead Lead object
 * @returns Successful records only
 */
export function getSuccessfulCommunications(lead: Lead): CommunicationRecord[] {
  const history = lead.communicationHistory || [];
  return history.filter(record => 
    record.deliveryStatus === 'sent' || record.deliveryStatus === 'delivered'
  );
}

/**
 * Get failed communications
 * @param lead Lead object
 * @returns Failed records only
 */
export function getFailedCommunications(lead: Lead): CommunicationRecord[] {
  const history = lead.communicationHistory || [];
  return history.filter(record => record.deliveryStatus === 'failed');
}

/**
 * Update communication delivery status
 * @param lead Lead object
 * @param communicationId Communication ID
 * @param newStatus New delivery status
 * @returns Updated lead
 */
export function updateCommunicationStatus(
  lead: Lead,
  communicationId: string,
  newStatus: 'sent' | 'delivered' | 'failed' | 'pending'
): Lead {
  const history = lead.communicationHistory || [];
  
  const updated = history.map(record => 
    record.id === communicationId
      ? { ...record, deliveryStatus: newStatus }
      : record
  );

  return {
    ...lead,
    communicationHistory: updated,
  };
}

/**
 * Add notes to communication
 * @param lead Lead object
 * @param communicationId Communication ID
 * @param notes Notes to add
 * @returns Updated lead
 */
export function addCommunicationNotes(
  lead: Lead,
  communicationId: string,
  notes: string
): Lead {
  const history = lead.communicationHistory || [];
  
  const updated = history.map(record =>
    record.id === communicationId
      ? { ...record, notes: (record.notes ? record.notes + '\n' : '') + notes }
      : record
  );

  return {
    ...lead,
    communicationHistory: updated,
  };
}

/**
 * Clear communication history (use with caution!)
 * @param lead Lead object
 * @returns Lead with empty communication history
 */
export function clearCommunicationHistory(lead: Lead): Lead {
  return {
    ...lead,
    communicationHistory: [],
  };
}

/**
 * Get communication statistics for lead
 * @param lead Lead object
 * @returns Statistics
 */
export function getCommunicationStats(lead: Lead): {
  totalCount: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  averageResponseTime?: number;
  mostUsedChannel: CommunicationType | null;
} {
  const history = lead.communicationHistory || [];
  const successCount = history.filter(r => 
    r.deliveryStatus === 'sent' || r.deliveryStatus === 'delivered'
  ).length;
  const failureCount = history.filter(r => r.deliveryStatus === 'failed').length;
  const successRate = history.length > 0 ? (successCount / history.length) * 100 : 0;

  // Find most used channel
  const channelCounts: Record<CommunicationType, number> = {
    whatsapp: 0,
    email: 0,
    sms: 0,
    call: 0,
    manual: 0,
  };
  
  history.forEach(record => {
    channelCounts[record.type]++;
  });

  const mostUsedChannel = (Object.entries(channelCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] as CommunicationType) || null;

  return {
    totalCount: history.length,
    successCount,
    failureCount,
    successRate: Math.round(successRate),
    mostUsedChannel,
  };
}

/**
 * Export communication history as CSV
 * @param lead Lead object
 * @returns CSV string
 */
export function exportCommunicationHistoryCSV(lead: Lead): string {
  const history = lead.communicationHistory || [];
  
  const headers = ['Date', 'Type', 'Template', 'Status', 'Content', 'Notes'];
  const rows = history.map(record => [
    new Date(record.sentAt).toLocaleString(),
    record.type.toUpperCase(),
    record.templateName || '-',
    record.deliveryStatus,
    `"${record.content.replace(/"/g, '""')}"`, // Escape quotes
    record.notes ? `"${record.notes.replace(/"/g, '""')}"` : '-',
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Quick Actions Utility
 * Handles execution of quick actions (WhatsApp, Email, SMS, Call)
 */

import {
  Lead,
  FollowUpTemplate,
  QuickActionType,
  QuickActionResult,
} from '../types';
import { replaceTemplateVariables } from './templateEngine';
import { advanceFollowUpStage } from './followUpAutomation';
import { createCommunicationRecord, logCommunication } from './communicationLogger';

/**
 * Execute WhatsApp action
 * @param lead Lead to contact
 * @param template WhatsApp template
 * @param agentName Agent name
 * @returns Result
 */
export function executeWhatsAppAction(
  lead: Lead,
  template: FollowUpTemplate,
  agentName: string = 'Agent'
): QuickActionResult {
  try {
    // Replace variables
    const message = replaceTemplateVariables(template.content, lead, agentName);
    
    // Encode for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const phone = lead.phone.replace(/\D/g, ''); // Remove non-digits
    
    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    // Create communication record
    const updatedLead = advanceFollowUpStage(lead);
    const record = createCommunicationRecord(
      updatedLead,
      'whatsapp',
      template,
      message,
      undefined,
      'Sent via WhatsApp'
    );
    const finalLead = logCommunication(updatedLead, record);
    
    return {
      success: true,
      leadId: lead.id,
      actionType: 'whatsapp',
      communicationRecord: record,
      newFollowUpStage: finalLead.followUpStage,
      nextFollowUpDate: finalLead.nextFollowUpDate,
    };
  } catch (error) {
    return {
      success: false,
      leadId: lead.id,
      actionType: 'whatsapp',
      error: `WhatsApp action failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Execute Email action
 * @param lead Lead to contact
 * @param template Email template
 * @param agentName Agent name
 * @returns Result
 */
export function executeEmailAction(
  lead: Lead,
  template: FollowUpTemplate,
  agentName: string = 'Agent'
): QuickActionResult {
  try {
    // Replace variables
    const content = replaceTemplateVariables(template.content, lead, agentName);
    
    // Parse subject and body (subject is first line)
    const lines = content.split('\n');
    const subjectLine = lines.find(line => line.startsWith('Subject:'));
    const subject = subjectLine ? subjectLine.replace('Subject:', '').trim() : template.name;
    
    const bodyStartIndex = subjectLine ? lines.indexOf(subjectLine) + 1 : 0;
    const body = lines.slice(bodyStartIndex).join('\n').trim();
    
    // Encode for mailto
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    
    // Open email composer
    const mailtoUrl = `mailto:${lead.email}?subject=${encodedSubject}&body=${encodedBody}`;
    window.location.href = mailtoUrl;
    
    // Create communication record
    const updatedLead = advanceFollowUpStage(lead);
    const record = createCommunicationRecord(
      updatedLead,
      'email',
      template,
      body,
      undefined,
      `Subject: ${subject}`
    );
    const finalLead = logCommunication(updatedLead, record);
    
    return {
      success: true,
      leadId: lead.id,
      actionType: 'email',
      communicationRecord: record,
      newFollowUpStage: finalLead.followUpStage,
      nextFollowUpDate: finalLead.nextFollowUpDate,
    };
  } catch (error) {
    return {
      success: false,
      leadId: lead.id,
      actionType: 'email',
      error: `Email action failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Execute SMS action
 * @param lead Lead to contact
 * @param template SMS template
 * @param agentName Agent name
 * @returns Result
 */
export function executeSMSAction(
  lead: Lead,
  template: FollowUpTemplate,
  agentName: string = 'Agent'
): QuickActionResult {
  try {
    // Replace variables
    const message = replaceTemplateVariables(template.content, lead, agentName);
    
    // Encode for SMS
    const encodedMessage = encodeURIComponent(message);
    const phone = lead.phone.replace(/\D/g, ''); // Remove non-digits
    
    // Open SMS composer
    const smsUrl = `sms:${phone}?body=${encodedMessage}`;
    window.location.href = smsUrl;
    
    // Create communication record
    const updatedLead = advanceFollowUpStage(lead);
    const record = createCommunicationRecord(
      updatedLead,
      'sms',
      template,
      message,
      undefined,
      'Sent via SMS'
    );
    const finalLead = logCommunication(updatedLead, record);
    
    return {
      success: true,
      leadId: lead.id,
      actionType: 'sms',
      communicationRecord: record,
      newFollowUpStage: finalLead.followUpStage,
      nextFollowUpDate: finalLead.nextFollowUpDate,
    };
  } catch (error) {
    return {
      success: false,
      leadId: lead.id,
      actionType: 'sms',
      error: `SMS action failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Execute Call Script action (doesn't actually call, just logs)
 * @param lead Lead to contact
 * @param template Call script template
 * @param agentName Agent name
 * @param callNotes Notes from the call
 * @returns Result
 */
export function executeCallScriptAction(
  lead: Lead,
  template: FollowUpTemplate,
  agentName: string = 'Agent',
  callNotes: string = ''
): QuickActionResult {
  try {
    // Replace variables
    const script = replaceTemplateVariables(template.content, lead, agentName);
    
    // Create communication record
    const updatedLead = advanceFollowUpStage(lead);
    const record = createCommunicationRecord(
      updatedLead,
      'call',
      template,
      script,
      undefined,
      callNotes || 'Call completed'
    );
    const finalLead = logCommunication(updatedLead, record);
    
    return {
      success: true,
      leadId: lead.id,
      actionType: 'call',
      communicationRecord: record,
      newFollowUpStage: finalLead.followUpStage,
      nextFollowUpDate: finalLead.nextFollowUpDate,
    };
  } catch (error) {
    return {
      success: false,
      leadId: lead.id,
      actionType: 'call',
      error: `Call action failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Execute any quick action
 * @param actionType Type of action
 * @param lead Lead to contact
 * @param template Template to use
 * @param agentName Agent name
 * @param additionalData Additional data (e.g., call notes)
 * @returns Result
 */
export function executeQuickAction(
  actionType: QuickActionType,
  lead: Lead,
  template: FollowUpTemplate,
  agentName: string = 'Agent',
  additionalData?: any
): QuickActionResult {
  switch (actionType) {
    case 'whatsapp':
      return executeWhatsAppAction(lead, template, agentName);
    
    case 'email':
      return executeEmailAction(lead, template, agentName);
    
    case 'sms':
      return executeSMSAction(lead, template, agentName);
    
    case 'call':
      return executeCallScriptAction(
        lead,
        template,
        agentName,
        additionalData?.callNotes
      );
    
    default:
      return {
        success: false,
        leadId: lead.id,
        actionType,
        error: `Unknown action type: ${actionType}`,
      };
  }
}

/**
 * Validate if action can be executed
 * @param lead Lead to validate
 * @param actionType Action type
 * @returns Validation result
 */
export function validateQuickActionExecutability(
  lead: Lead,
  actionType: QuickActionType
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields based on action type
  switch (actionType) {
    case 'whatsapp':
      if (!lead.phone) errors.push('Phone number is required for WhatsApp');
      break;
    
    case 'sms':
      if (!lead.phone) errors.push('Phone number is required for SMS');
      break;
    
    case 'email':
      if (!lead.email) errors.push('Email address is required for Email');
      break;
    
    case 'call':
      if (!lead.phone) errors.push('Phone number is required for Call');
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get action button label with icon
 * @param actionType Action type
 * @returns Label with icon
 */
export function getActionButtonLabel(actionType: QuickActionType): string {
  const labels: Record<QuickActionType, string> = {
    whatsapp: '💬 WhatsApp',
    email: '✉️ Email',
    sms: '📱 SMS',
    call: '📞 Call',
  };
  return labels[actionType];
}

/**
 * Get action button color
 * @param actionType Action type
 * @returns Tailwind color class
 */
export function getActionButtonColor(actionType: QuickActionType): string {
  const colors: Record<QuickActionType, string> = {
    whatsapp: 'bg-green-600 hover:bg-green-700',
    email: 'bg-blue-600 hover:bg-blue-700',
    sms: 'bg-purple-600 hover:bg-purple-700',
    call: 'bg-red-600 hover:bg-red-700',
  };
  return colors[actionType];
}

/**
 * Check if all quick actions are available for a lead
 * @param lead Lead to check
 * @returns Object with availability status for each action
 */
export function getAvailableQuickActions(
  lead: Lead
): Record<QuickActionType, boolean> {
  return {
    whatsapp: !!lead.phone,
    email: !!lead.email,
    sms: !!lead.phone,
    call: !!lead.phone,
  };
}


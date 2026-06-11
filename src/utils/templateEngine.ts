/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Template Engine Utility
 * Handles variable replacement, validation, and template processing
 */

import { Lead, FollowUpTemplate } from '../types';

/**
 * Replace template variables with lead data
 * @param template Template content string with {variables}
 * @param lead Lead object with data
 * @param agentName Agent name (optional)
 * @returns Template with replaced variables
 */
export function replaceTemplateVariables(
  template: string,
  lead: Lead,
  agentName: string = 'Agent'
): string {
  let content = template;

  // Create replacement map
  const replacements: Record<string, string> = {
    '{name}': lead.name || 'there',
    '{email}': lead.email || '[email]',
    '{phone}': lead.phone || '[phone]',
    '{company}': lead.company || 'your company',
    '{service}': lead.service || 'our service',
    '{value}': lead.value?.toString() || '0',
    '{agentName}': agentName || 'Agent',
  };

  // Replace all variables
  Object.entries(replacements).forEach(([variable, value]) => {
    const regex = new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(regex, value);
  });

  return content;
}

/**
 * Extract variables from template content
 * @param template Template content string
 * @returns Array of variable names found
 */
export function extractTemplateVariables(template: string): string[] {
  const variableRegex = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const matches = template.matchAll(variableRegex);
  const variables = new Set<string>();

  for (const match of matches) {
    variables.add(`{${match[1]}}`);
  }

  return Array.from(variables).sort();
}

/**
 * Validate template content and variables
 * @param template Template content to validate
 * @returns Validation result object
 */
export function validateTemplate(template: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  variables: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if template is empty
  if (!template || template.trim().length === 0) {
    errors.push('Template content cannot be empty');
  }

  // Check for unmatched braces
  const openBraces = (template.match(/\{/g) || []).length;
  const closeBraces = (template.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push('Unmatched braces in template');
  }

  // Extract variables
  const variables = extractTemplateVariables(template);

  // Validate variable names
  const validVariables = ['{name}', '{email}', '{phone}', '{company}', '{service}', '{value}', '{agentName}'];
  variables.forEach(variable => {
    if (!validVariables.includes(variable)) {
      warnings.push(`Unknown variable: ${variable}`);
    }
  });

  // Check template length
  if (template.length > 5000) {
    warnings.push('Template is quite long (>5000 characters)');
  }

  // Check if template has required variables
  const hasNameVariable = variables.includes('{name}');
  if (!hasNameVariable) {
    warnings.push('Template should include {name} for personalization');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    variables,
  };
}

/**
 * Sanitize template content
 * @param template Template content to sanitize
 * @returns Sanitized template
 */
export function sanitizeTemplate(template: string): string {
  if (!template) return '';

  // Remove any HTML/script tags
  let sanitized = template.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]+>/g, '');

  // Trim whitespace but preserve line breaks for readability
  sanitized = sanitized.split('\n').map(line => line.trim()).join('\n');

  return sanitized;
}

/**
 * Create a preview of template with sample data
 * @param template Template content
 * @param sampleLead Sample lead data
 * @param agentName Agent name
 * @returns Preview string
 */
export function createTemplatePreview(
  template: string,
  sampleLead: Partial<Lead> = {},
  agentName: string = 'Your Name'
): string {
  const mockLead: Lead = {
    id: 'sample_1',
    name: sampleLead.name || 'John Smith',
    email: sampleLead.email || 'john@example.com',
    phone: sampleLead.phone || '+1-555-0123',
    company: sampleLead.company || 'Acme Corp',
    service: sampleLead.service || 'Sales Enablement',
    value: sampleLead.value || 50000,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nextFollowUp: '',
    source: 'demo',
  };

  return replaceTemplateVariables(template, mockLead, agentName);
}

/**
 * Count characters in template (for SMS length estimation)
 * @param template Template content
 * @param lead Lead data for variable replacement
 * @returns Character count
 */
export function getTemplateLength(template: string, lead: Lead): number {
  const replaced = replaceTemplateVariables(template, lead);
  return replaced.length;
}

/**
 * Estimate SMS segments needed (160 chars per segment)
 * @param template Template content
 * @param lead Lead data
 * @returns Number of SMS segments
 */
export function estimateSMSSegments(template: string, lead: Lead): number {
  const length = getTemplateLength(template, lead);
  const segmentLength = 160;
  return Math.ceil(length / segmentLength);
}

/**
 * Get template variable count
 * @param template Template content
 * @returns Count of variables
 */
export function getVariableCount(template: string): number {
  return extractTemplateVariables(template).length;
}

/**
 * Compare two templates for differences
 * @param template1 First template
 * @param template2 Second template
 * @returns Difference summary
 */
export function compareTemplates(template1: string, template2: string): {
  identical: boolean;
  lengthDifference: number;
  contentChanged: boolean;
  variableDifferences: string[];
} {
  const vars1 = new Set(extractTemplateVariables(template1));
  const vars2 = new Set(extractTemplateVariables(template2));

  const variableDifferences: string[] = [];
  vars1.forEach(v => !vars2.has(v) && variableDifferences.push(`Removed: ${v}`));
  vars2.forEach(v => !vars1.has(v) && variableDifferences.push(`Added: ${v}`));

  return {
    identical: template1 === template2,
    lengthDifference: template2.length - template1.length,
    contentChanged: template1.trim() !== template2.trim(),
    variableDifferences,
  };
}

/**
 * Duplicate template with new name
 * @param template Original template
 * @param newName New template name
 * @returns New template object
 */
export function duplicateTemplate(
  template: FollowUpTemplate,
  newName: string
): FollowUpTemplate {
  return {
    ...template,
    id: `${template.id}_${Date.now()}`,
    name: newName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}


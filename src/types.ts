/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  author: string;
}

export interface LeadFile {
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  stageId: string;
  createdAt: string;
  lastContacted: string;
  status: 'active' | 'archived' | 'won';
  value: number; // Potential monetary value
  customFields: Record<string, string | number | boolean>;
  notes: Note[];
  tasks: Task[];
  assignedTo?: string;
  assignedToName?: string;
  files?: LeadFile[];
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'date';
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface PipelineStage {
  id: string;
  label: string;
  color: string; // Tailwind color class or hex, e.g. 'bg-emerald-500'
}

export interface MetricDefinition {
  key: string;
  label: string;
  prefix?: string;
  suffix?: string;
  type: 'sum' | 'count' | 'average';
  sourceField?: 'value' | string; // Field to aggregate on
  description: string;
}

export interface IndustryConfig {
  id: string;
  name: string;
  iconName: string; // Identifier for Lucide icon
  tagline: string;
  leadLabel: string; // e.g. "Buyer", "Prospect", "Querent", "Rider"
  valueLabel: string; // e.g. "Estimated Value", "Estimated Premium", "Coaching Budget", "Fare"
  stages: PipelineStage[];
  customFields: FieldDefinition[];
  metrics: MetricDefinition[];
  suggestedSources: string[];
  todayFollowupsLabel?: string;
  missedFollowupsLabel?: string;
  meetingsTodayLabel?: string;
  closedDealsLabel?: string;
}

export interface Tenant {
  id: string;
  company_name: string;
  industryId: string;
  logoEmoji: string;
  subscription_plan: 'Starter' | 'Professional' | 'Enterprise';
  status: 'active' | 'suspended';
  assignedOwner: string;
}


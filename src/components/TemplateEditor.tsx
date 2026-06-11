/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Template Editor Component
 * Form for creating and editing templates with live preview
 */

import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  FollowUpTemplate,
} from '../types';
import {
  extractTemplateVariables,
  validateTemplate,
  createTemplatePreview,
} from '../utils/templateEngine';
import TemplatePreview from './TemplatePreview';

interface TemplateEditorProps {
  template: FollowUpTemplate | null;
  isNew: boolean;
  type: 'whatsapp' | 'email' | 'sms' | 'call';
  onSave: (template: FollowUpTemplate) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function TemplateEditor({
  template,
  isNew,
  type,
  onSave,
  onCancel,
  isLoading,
  error,
}: TemplateEditorProps) {
  const [name, setName] = useState(template?.name || '');
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(template?.stage || 0);
  const [content, setContent] = useState(template?.content || '');
  const [showPreview, setShowPreview] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const stageOptions = [
    { value: 0, label: 'Initial Contact' },
    { value: 1, label: 'Follow-Up #1' },
    { value: 2, label: 'Follow-Up #2' },
    { value: 3, label: 'Final Follow-Up' },
  ];

  const variables = useMemo(() => extractTemplateVariables(content), [content]);
  const validation = useMemo(() => validateTemplate(content), [content]);

  const previewTemplate: FollowUpTemplate = {
    id: template?.id || 'preview',
    type,
    stage,
    name: name || 'Preview',
    content,
    variables,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleSave = async () => {
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Template name is required');
      return;
    }

    if (!content.trim()) {
      setValidationError('Template content is required');
      return;
    }

    if (!validation.valid) {
      setValidationError(validation.errors[0] || 'Invalid template');
      return;
    }

    const newTemplate: FollowUpTemplate = {
      id: template?.id || `${type}_${stage}_${Date.now()}`,
      type,
      stage,
      name,
      content,
      variables,
      isDefault: false,
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSave(newTemplate);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to save template');
    }
  };

  const insertVariable = (variable: string) => {
    const newContent = content + variable;
    setContent(newContent);
  };

  const sampleVariables = [
    { key: '{name}', description: 'Lead name' },
    { key: '{email}', description: 'Email address' },
    { key: '{phone}', description: 'Phone number' },
    { key: '{company}', description: 'Company name' },
    { key: '{service}', description: 'Service type' },
    { key: '{value}', description: 'Deal value' },
    { key: '{agentName}', description: 'Agent name' },
  ];

  if (showPreview) {
    return (
      <TemplatePreview
        template={previewTemplate}
        onClose={() => setShowPreview(false)}
        onEdit={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isNew ? 'Create Template' : 'Edit Template'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {type === 'whatsapp' && 'WhatsApp Message'}
                {type === 'email' && 'Email Message'}
                {type === 'sms' && 'SMS Message'}
                {type === 'call' && 'Call Script'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mx-4 md:mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex gap-3">
            <LucideIcons.AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {validationError && (
        <div className="mx-4 md:mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex gap-3">
            <LucideIcons.AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">{validationError}</div>
          </div>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="mx-4 md:mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex gap-3">
            <LucideIcons.AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-700">
              {validation.warnings.map((w, i) => (
                <div key={i}>{w}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Name */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Initial Contact"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
              />
              <p className="text-xs text-gray-500 mt-1">Give this template a descriptive name</p>
            </div>

            {/* Stage Selection */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Follow-up Stage
              </label>
              <div className="grid grid-cols-2 gap-3">
                {stageOptions.map(option => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="stage"
                      value={option.value}
                      checked={stage === option.value}
                      onChange={() => setStage(option.value as 0 | 1 | 2 | 3)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Template Content */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Template Content
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Enter your template content. Use variables like {name}, {email}, {phone}, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 font-mono text-sm resize-none"
                rows={type === 'call' ? 12 : 6}
              />
              <p className="text-xs text-gray-500 mt-2">
                {type === 'call'
                  ? 'Write clear, conversational call scripts'
                  : 'Keep messages concise and personalized'}
              </p>

              {type === 'sms' && (
                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <LucideIcons.Info className="w-3 h-3 inline mr-1" />
                    Current length: {content.length} characters
                    {content.length > 160 && ` (${Math.ceil(content.length / 160)} SMS messages)`}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isLoading || !name.trim() || !content.trim()}
                className="flex-1 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LucideIcons.Loader className="w-4 h-4 inline mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <LucideIcons.Save className="w-4 h-4 inline mr-2" />
                    Save Template
                  </>
                )}
              </button>
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <LucideIcons.Eye className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Variables Reference */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <LucideIcons.Zap className="w-4 h-4 text-yellow-500" />
                Available Variables
              </h3>
              <div className="space-y-2">
                {sampleVariables.map(variable => (
                  <div key={variable.key}>
                    <button
                      onClick={() => insertVariable(variable.key)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <div className="font-mono text-sm text-indigo-600 font-semibold">
                        {variable.key}
                      </div>
                      <div className="text-xs text-gray-600">{variable.description}</div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">Content Length</p>
                  <p className="text-lg font-semibold text-gray-900">{content.length}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div
                      className={`h-1 rounded-full transition-colors ${
                        content.length === 0
                          ? 'bg-gray-300'
                          : content.length < 100
                          ? 'bg-green-500'
                          : content.length < 300
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min((content.length / 500) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600">Variables Used</p>
                  <p className="text-lg font-semibold text-gray-900">{variables.length}</p>
                </div>

                {type === 'sms' && (
                  <div>
                    <p className="text-xs text-gray-600">SMS Segments</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {Math.ceil(content.length / 160) || 0}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Format Tips */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">Tips</h3>
              <ul className="text-xs text-blue-800 space-y-2">
                <li className="flex gap-2">
                  <LucideIcons.Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Use variables to personalize messages</span>
                </li>
                <li className="flex gap-2">
                  <LucideIcons.Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Keep messages professional yet friendly</span>
                </li>
                <li className="flex gap-2">
                  <LucideIcons.Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Use line breaks for readability</span>
                </li>
                {type === 'sms' && (
                  <li className="flex gap-2">
                    <LucideIcons.Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Keep SMS under 160 characters when possible</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
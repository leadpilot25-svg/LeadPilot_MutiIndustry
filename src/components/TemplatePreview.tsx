/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Template Preview Component
 * Display template with sample variables replaced
 */

import React, { useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  FollowUpTemplate,
  Lead,
} from '../types';
import {
  replaceTemplateVariables,
  createTemplatePreview,
} from '../utils/templateEngine';

interface TemplatePreviewProps {
  template: FollowUpTemplate;
  onClose: () => void;
  onEdit?: () => void;
}

const sampleLead: Lead = {
  id: 'sample_1',
  name: 'John Smith',
  email: 'john@example.com',
  phone: '+1-555-0123',
  company: 'Acme Corp',
  service: 'Sales Enablement',
  value: 50000,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  nextFollowUp: '',
  source: 'demo',
};

export default function TemplatePreview({
  template,
  onClose,
  onEdit,
}: TemplatePreviewProps) {
  const preview = useMemo(
    () => replaceTemplateVariables(template.content, sampleLead, 'Sarah Johnson'),
    [template.content]
  );

  const stageLabel = (stage: number): string => {
    switch (stage) {
      case 0:
        return 'Initial Contact';
      case 1:
        return 'Follow-Up #1';
      case 2:
        return 'Follow-Up #2';
      case 3:
        return 'Final Follow-Up';
      default:
        return 'Unknown';
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <LucideIcons.MessageCircle className="w-5 h-5 text-green-600" />;
      case 'email':
        return <LucideIcons.Mail className="w-5 h-5 text-blue-600" />;
      case 'sms':
        return <LucideIcons.Phone className="w-5 h-5 text-purple-600" />;
      case 'call':
        return <LucideIcons.Mic className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return 'WhatsApp';
      case 'email':
        return 'Email';
      case 'sms':
        return 'SMS';
      case 'call':
        return 'Call Script';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {typeIcon(template.type)}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{template.name}</h2>
              <p className="text-sm text-gray-600">
                {typeLabel(template.type)} • {stageLabel(template.stage)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LucideIcons.X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sample Data */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-900 mb-3">SAMPLE DATA (for preview)</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-blue-700 font-medium">Name</p>
                <p className="text-blue-600">{sampleLead.name}</p>
              </div>
              <div>
                <p className="text-blue-700 font-medium">Email</p>
                <p className="text-blue-600">{sampleLead.email}</p>
              </div>
              <div>
                <p className="text-blue-700 font-medium">Phone</p>
                <p className="text-blue-600">{sampleLead.phone}</p>
              </div>
              <div>
                <p className="text-blue-700 font-medium">Company</p>
                <p className="text-blue-600">{sampleLead.company}</p>
              </div>
              <div>
                <p className="text-blue-700 font-medium">Service</p>
                <p className="text-blue-600">{sampleLead.service}</p>
              </div>
              <div>
                <p className="text-blue-700 font-medium">Agent</p>
                <p className="text-blue-600">Sarah Johnson</p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">PREVIEW</p>
            <div
              className={`rounded-lg p-6 whitespace-pre-wrap break-words text-sm leading-relaxed ${
                template.type === 'whatsapp'
                  ? 'bg-green-50 text-gray-900 border border-green-200'
                  : template.type === 'email'
                  ? 'bg-blue-50 text-gray-900 border border-blue-200'
                  : template.type === 'sms'
                  ? 'bg-purple-50 text-gray-900 border border-purple-200'
                  : 'bg-gray-50 text-gray-900 border border-gray-200'
              }`}
            >
              {preview}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-600 font-medium">Content Length</p>
              <p className="text-lg font-semibold text-gray-900">{preview.length}</p>
              {template.type === 'sms' && (
                <p className="text-xs text-gray-600 mt-1">
                  {Math.ceil(preview.length / 160)} SMS segment
                  {Math.ceil(preview.length / 160) > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Variables Used</p>
              <p className="text-lg font-semibold text-gray-900">{template.variables.length}</p>
            </div>
          </div>

          {/* Variables Reference */}
          {template.variables.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-3">Variables in Template</p>
              <div className="flex flex-wrap gap-2">
                {template.variables.map((variable, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded font-mono text-xs border border-gray-300"
                  >
                    {variable}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <LucideIcons.Edit className="w-4 h-4" />
              Edit Template
            </button>
          )}
          <button
            onClick={() => {
              navigator.clipboard.writeText(preview);
              alert('Template copied to clipboard!');
            }}
            className="px-6 py-2.5 border border-indigo-300 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors flex items-center gap-2"
          >
            <LucideIcons.Copy className="w-4 h-4" />
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
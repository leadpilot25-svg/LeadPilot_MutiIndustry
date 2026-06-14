/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Quick Action Modal Component
 * Preview and edit templates before sending via WhatsApp, Email, SMS
 */

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Lead,
  QuickActionType,
  FollowUpTemplate,
} from '../types';
import {
  replaceTemplateVariables,
  estimateSMSSegments,
} from '../utils/templateEngine';

interface QuickActionModalProps {
  lead: Lead;
  actionType: QuickActionType;
  template?: FollowUpTemplate;
  onClose: () => void;
 onSend?: (
  content: string,
  notes?: string,
  nextFollowUpDate?: string
) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function QuickActionModal({
  lead,
  actionType,
  template,
  onClose,
  onSend,
  isLoading,
  error,
}: QuickActionModalProps) {
  const [isEditing, setIsEditing] = useState(false);
 const [editedContent, setEditedContent] = useState(
  template?.content ||
  `Hi ${lead.name},

Thank you for your interest.

Just checking in to see if you have any questions.

Regards,
LeadPilot Team`
);
  const [notes, setNotes] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
  actionType === 'email'
    ? new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    : ''
);
const setFollowUpDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);

  setNextFollowUpDate(
    date.toISOString().split('T')[0]
  );
};
const replacedContent = isEditing
  ? editedContent
  : replaceTemplateVariables(
      template?.content || '',
      lead,
      'Agent'
    );
  const typeIcon = {
    whatsapp: { icon: LucideIcons.MessageCircle, label: 'WhatsApp', color: 'green' },
    email: { icon: LucideIcons.Mail, label: 'Email', color: 'blue' },
    sms: { icon: LucideIcons.Phone, label: 'SMS', color: 'purple' },
    call: { icon: LucideIcons.Mic, label: 'Call', color: 'red' },
  };

  const typeConfig = typeIcon[actionType];
  const TypeIcon = typeConfig.icon;

const handleSend = async () => {
  try {

    if (actionType === 'whatsapp') {
      const phone = lead.phone?.replace(/\D/g, '');

      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(
          isEditing ? editedContent : replacedContent
        )}`,
        '_blank'
      );
console.log('NEXT FOLLOWUP:', nextFollowUpDate);
      onClose();
      return;
    }

    if (actionType === 'email') {
      window.location.href =
        `mailto:${lead.email}` +
        `?subject=${encodeURIComponent('Follow Up')}` +
        `&body=${encodeURIComponent(
          isEditing ? editedContent : replacedContent
        )}`;

      onClose();
      return;
    }

    if (actionType === 'sms') {
      window.location.href =
        `sms:${lead.phone}?body=${encodeURIComponent(
          isEditing ? editedContent : replacedContent
        )}`;

      onClose();
      return;
    }

   if (onSend) {
  await onSend(
    isEditing ? editedContent : replacedContent,
    notes,
    nextFollowUpDate
  );
}

    onClose();

  } catch (err) {
    console.error(err);
  }
};

  const isValidForSending = actionType === 'whatsapp'
    ? lead.phone?.length > 0
    : actionType === 'sms'
    ? lead.phone?.length > 0
    : actionType === 'email'
    ? lead.email?.length > 0
    : true;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${typeConfig.color}-50`}>
              <TypeIcon className={`w-5 h-5 text-${typeConfig.color}-600`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{typeConfig.label}</h2>
              <p className="text-sm text-gray-600">
  {template?.name || 'Quick Action'}
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
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Lead Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-900 mb-3">RECIPIENT</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-blue-700 font-medium">Name</p>
                <p className="text-blue-600">{lead.name}</p>
              </div>
              {actionType === 'email' && (
                <div>
                  <p className="text-blue-700 font-medium">Email</p>
                  <p className="text-blue-600">{lead.email || 'N/A'}</p>
                </div>
              )}
              {(actionType === 'sms' || actionType === 'whatsapp') && (
                <div>
                  <p className="text-blue-700 font-medium">Phone</p>
                  <p className="text-blue-600">{lead.phone || 'N/A'}</p>
                </div>
              )}
              {lead.company && (
                <div>
                  <p className="text-blue-700 font-medium">Company</p>
                  <p className="text-blue-600">{lead.company}</p>
                </div>
              )}
          </div>
</div>

{/* Follow-Up Date */}
<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
  <label className="block text-sm font-semibold mb-2">
    Next Follow-Up Date
  </label>

  <div className="flex gap-2 mb-3 flex-wrap">
    <button
      type="button"
      onClick={() => setFollowUpDays(1)}
      className="px-3 py-1 bg-blue-100 rounded-lg text-xs"
    >
      +1 Day
    </button>

    <button
      type="button"
      onClick={() => setFollowUpDays(3)}
      className="px-3 py-1 bg-green-100 rounded-lg text-xs"
    >
      +3 Days
    </button>

    <button
      type="button"
      onClick={() => setFollowUpDays(7)}
      className="px-3 py-1 bg-yellow-100 rounded-lg text-xs"
    >
      +7 Days
    </button>

    <button
      type="button"
      onClick={() => setFollowUpDays(14)}
      className="px-3 py-1 bg-purple-100 rounded-lg text-xs"
    >
      +14 Days
    </button>
  </div>

  <input
    type="date"
    value={nextFollowUpDate}
    onChange={(e) => setNextFollowUpDate(e.target.value)}
    className="w-full border border-gray-300 rounded-lg p-2"
  />
</div>

{/* Error Alert */}
{error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex gap-3">
                <LucideIcons.AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          {/* Message Preview/Editor */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900">MESSAGE</p>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {isEditing ? 'Done Editing' : 'Edit Message'}
              </button>
            </div>

            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 font-mono text-sm resize-none"
                rows={6}
              />
            ) : (
              <div
                className={`p-4 rounded-lg whitespace-pre-wrap break-words text-sm leading-relaxed border ${
                  actionType === 'whatsapp'
                    ? 'bg-green-50 border-green-200 text-gray-900'
                    : actionType === 'email'
                    ? 'bg-blue-50 border-blue-200 text-gray-900'
                    : actionType === 'sms'
                    ? 'bg-purple-50 border-purple-200 text-gray-900'
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                {replacedContent}
              </div>
            )}
          </div>

          {/* SMS Stats */}
          {actionType === 'sms' && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs text-purple-700">
                <LucideIcons.Info className="w-3 h-3 inline mr-1" />
                <strong>Length:</strong> {replacedContent.length} characters
                {' | '}
                <strong>Segments:</strong> {estimateSMSSegments(replacedContent, lead)}
              </p>
            </div>
          )}

          {/* Notes (for call scripts or reference) */}
          {(actionType === 'call' || actionType === 'sms') && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={actionType === 'call' ? 'Add call notes after completing the call...' : 'Add any notes...'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-sm resize-none"
                rows={3}
              />
            </div>
          )}

          {/* Info Message */}
          {!isValidForSending && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex gap-3">
                <LucideIcons.AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  {actionType === 'email' && 'Email address is missing for this lead'}
                  {(actionType === 'whatsapp' || actionType === 'sms') && 'Phone number is missing for this lead'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || !isValidForSending}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <LucideIcons.Loader className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <LucideIcons.Send className="w-4 h-4" />
                Send via {typeConfig.label}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
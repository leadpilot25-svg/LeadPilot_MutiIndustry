/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * LeadDetailModal Component - PHASE 10 INTEGRATED
 * Complete lead detail view with actions, communications, and quick actions
 */

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Lead,
  QuickActionType,
} from '../types';
import CommunicationHistory from './CommunicationHistory';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (leadData: Partial<Lead>) => void;
  onQuickAction?: (action: QuickActionType) => void;
  templates?: any;
}

export default function LeadDetailModal({
  lead,
  onClose,
  onUpdate,
  onQuickAction,
  templates,
}: LeadDetailModalProps) {
  const [currentTab, setCurrentTab] = useState<'details' | 'communications' | 'history'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
const [selectedAction, setSelectedAction] = useState<'email' | 'whatsapp' | 'sms' | null>(null);
const [selectedTemplateId, setSelectedTemplateId] = useState('');
const [nextFollowUpDate, setNextFollowUpDate] = useState(
  new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]
);
const [editData, setEditData] = useState({
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company || '',
    service: lead.service || '',
    value: lead.value || 0,
    status: lead.status || 'active',
    source: lead.source || '',
    nextFollowUpDate: lead.customFields?.nextFollowUpDate || '',
    followUpStage: lead.customFields?.followUpStage || 0,
    notes: lead.notes || [],
  });

const handleSaveChanges = () => {
  onUpdate({
    ...lead,
    ...editData,
    customFields: {
      ...(lead.customFields || {}),
      nextFollowUpDate: editData.nextFollowUpDate,
      followUpStage: editData.followUpStage,
    },
    notes: editData.notes,
  });

  setIsEditing(false);
};

  const getFollowUpStageName = (stage: number | undefined): string => {
    switch (stage) {
      case 0:
        return 'New Lead';
      case 1:
        return 'Initial Contact Sent';
      case 2:
        return 'Follow-up #1 Sent';
      case 3:
        return 'Follow-up #2 Sent';
      case 4:
        return 'Final Follow-up Sent';
      case 5:
        return 'Lost';
      default:
        return 'New Lead';
    }
  };

  const getFollowUpStageBadgeColor = (stage: number | undefined): string => {
    switch (stage) {
      case 0:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 1:
      case 2:
      case 3:
      case 4:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 5:
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const daysUntilFollowUp = lead.nextFollowUpDate
    ? Math.ceil((new Date(lead.nextFollowUpDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{lead.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{lead.company}</p>

            {/* Quick Actions Buttons */}
            <div className="flex gap-2 flex-wrap mt-4">
              <button
                onClick={() => onQuickAction?.('call')}
                disabled={!lead.phone}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LucideIcons.Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Call</span>
              </button>
              <button
                onClick={() => {
setSelectedAction('whatsapp');
setNextFollowUpDate('');
setShowTemplateModal(true);
  setShowTemplateModal(true);
}}
                disabled={!lead.phone}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LucideIcons.MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
              <button
               onClick={() => {
  setSelectedAction('email');

setNextFollowUpDate(
  new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]
);

setShowTemplateModal(true);
  setShowTemplateModal(true);
}}

                disabled={!lead.email}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LucideIcons.Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Email</span>
              </button>
              <button
                onClick={() => {
setSelectedAction('sms');
setNextFollowUpDate('');
setShowTemplateModal(true);
  setShowTemplateModal(true);
}}
                disabled={!lead.phone}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LucideIcons.Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">SMS</span>
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <LucideIcons.X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Follow-up Information */}
        <div className="bg-indigo-50 border-b border-indigo-200 px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-indigo-700 font-semibold">FOLLOW-UP STAGE</p>
              <p className="text-lg font-bold text-indigo-900 mt-1">
                {getFollowUpStageName(lead.followUpStage)}
              </p>
            </div>
            <div>
              <p className="text-xs text-indigo-700 font-semibold">LAST CONTACT</p>
              <p className="text-lg font-bold text-indigo-900 mt-1">
                {lead.lastContactDate
                  ? new Date(lead.lastContactDate).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
            {lead.nextFollowUpDate && (
              <div>
                <p className="text-xs text-indigo-700 font-semibold">NEXT FOLLOW-UP</p>
                <p className={`text-lg font-bold mt-1 ${
                  daysUntilFollowUp && daysUntilFollowUp <= 0
                    ? 'text-red-600'
                    : daysUntilFollowUp && daysUntilFollowUp <= 2
                    ? 'text-orange-600'
                    : 'text-green-600'
                }`}>
                  {new Date(lead.nextFollowUpDate).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-indigo-700 font-semibold">COMMUNICATIONS</p>
              <p className="text-lg font-bold text-indigo-900 mt-1">
                {(lead.communicationHistory || []).length}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 flex gap-4">
          <button
            onClick={() => setCurrentTab('details')}
            className={`py-4 px-2 border-b-2 font-medium transition-colors ${
              currentTab === 'details'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Details
          </button>
          
          <button
            onClick={() => setCurrentTab('history')}
            className={`py-4 px-2 border-b-2 font-medium transition-colors ${
              currentTab === 'history'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Timeline
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentTab === 'details' && (
            <div className="space-y-6">
              {!isEditing ? (
                <>
                  {/* Display Mode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">NAME</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{lead.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">EMAIL</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{lead.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">PHONE</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{lead.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">COMPANY</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{lead.company || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">SERVICE</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{lead.service || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">VALUE</p>
                      <p className="text-lg font-semibold text-indigo-600 mt-1">
                        ${lead.value?.toLocaleString() || '0'}
                      </p>
                    </div>
                 </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">STATUS</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${
                        lead.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : lead.status === 'closed'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {lead.status?.charAt(0).toUpperCase() + lead.status?.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">SOURCE</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{lead.source || '-'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-semibold">FOLLOW-UP STAGE</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 border ${getFollowUpStageBadgeColor(lead.customFields?.followUpStage)}`}>
                      {getFollowUpStageName(lead.customFields?.followUpStage)}
                    </span>
                  </div>

                  {lead.customFields?.nextFollowUpDate && (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">NEXT FOLLOW-UP DATE</p>
                      <p className={`text-lg font-semibold mt-1 ${
                        lead.customFields?.nextFollowUpDate && new Date(lead.customFields.nextFollowUpDate) < new Date()
                          ? 'text-red-600'
                          : 'text-indigo-600'
                      }`}>
                        {new Date(lead.customFields.nextFollowUpDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    <LucideIcons.Edit className="w-4 h-4" />
                    Edit Lead
                  </button>
                </>
              ) : (
                <>
                  {/* Edit Mode */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Name</label>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                      <input
                        type="email"
                        value={editData.email}
                        onChange={e => setEditData({ ...editData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={e => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Company</label>
                      <input
                        type="text"
                        value={editData.company}
                        onChange={e => setEditData({ ...editData, company: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Service</label>
                      <input
                        type="text"
                        value={editData.service}
                        onChange={e => setEditData({ ...editData, service: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Value</label>
                      <input
                        type="number"
                        value={editData.value}
                        onChange={e => setEditData({ ...editData, value: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                      />
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Status</label>
                      <select
                        value={editData.status}
                        onChange={e => setEditData({ ...editData, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                      >
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Source</label>
                      <input
                        type="text"
                        value={editData.source}
                        onChange={e => setEditData({ ...editData, source: e.target.value })}
                        placeholder="e.g., Website, Referral, Cold Call"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Follow-Up Management</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Follow-Up Date</label>
                        <input
                          type="date"
                          value={editData.nextFollowUpDate}
                          onChange={e => setEditData({ ...editData, nextFollowUpDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Follow-Up Stage</label>
                        <select
                          value={editData.followUpStage}
                          onChange={e => setEditData({ ...editData, followUpStage: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                        >
                          <option value={0}>New Lead</option>
                          <option value={1}>Initial Contact Sent</option>
                          <option value={2}>Follow-up #1 Sent</option>
                          <option value={3}>Follow-up #2 Sent</option>
                          <option value={4}>Final Follow-up Sent</option>
                          <option value={5}>Won</option>
                          <option value={6}>Lost</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Internal Notes</label>
                        <textarea
                          value={editData.notes && editData.notes.length > 0 ? editData.notes[0]?.content || '' : ''}
                          onChange={e => {
                            const newNote = {
                              id: editData.notes && editData.notes.length > 0 ? editData.notes[0].id : `note-${Date.now()}`,
                              content: e.target.value,
                              createdAt: editData.notes && editData.notes.length > 0 ? editData.notes[0].createdAt : new Date().toISOString().split('T')[0],
                              author: editData.notes && editData.notes.length > 0 ? editData.notes[0].author : 'Current User'
                            };
                            setEditData({ ...editData, notes: [newNote] });
                          }}
                          placeholder="Add internal notes about this lead..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 h-24"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveChanges}
                      className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          

          {currentTab === 'history' && (
            <div className="text-center py-8">
              <LucideIcons.Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Activity Timeline</p>
              <p className="text-sm text-gray-500 mt-1">Timeline view coming soon</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
      {showTemplateModal && selectedAction && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
      <h3 className="text-lg font-bold mb-4">
        Select {selectedAction} Template
      </h3>

      <select
        value={selectedTemplateId}
        onChange={(e) => setSelectedTemplateId(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2 mb-4"
      >
        <option value="">Choose Template</option>

        {(templates?.[selectedAction] || []).map((t: any) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <div className="mt-4">
  <label className="block text-sm font-medium mb-2">
    Next Follow-Up Date
  </label>

  <input
    type="date"
    value={nextFollowUpDate}
    onChange={(e) => setNextFollowUpDate(e.target.value)}
    className="w-full border border-gray-300 rounded-lg p-2"
  />
</div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowTemplateModal(false)}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            const template =
              templates?.[selectedAction]?.find(
                (t: any) => t.id === selectedTemplateId
              );

            if (!template) {
              alert('Please select a template');
              return;
            }

       const content = template.content
  .replace(/{{name}}/g, lead.name || '')
  .replace(/{{email}}/g, lead.email || '')
  .replace(/{{phone}}/g, lead.phone || '');

if (selectedAction === 'email') {
  window.location.href =
    `mailto:${lead.email}?subject=${encodeURIComponent(template.name)}&body=${encodeURIComponent(content)}`;
}

if (selectedAction === 'whatsapp') {
  window.open(
    `https://wa.me/${lead.phone}?text=${encodeURIComponent(content)}`,
    '_blank'
  );
}

if (selectedAction === 'sms') {
  window.location.href =
    `sms:${lead.phone}?body=${encodeURIComponent(content)}`;
}
onUpdate({
  customFields: {
    ...lead.customFields,
    nextFollowUpDate,
    lastContactType: selectedAction,
    lastContactDate: new Date().toISOString().split('T')[0],
  }
});
setShowTemplateModal(false);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { IndustryConfig, Lead } from '../types';
import * as LucideIcons from 'lucide-react';
import QuickActionModal from './QuickActionModal';

type SortField = 'name' | 'phone' | 'value' | 'createdAt' | 'nextFollowUpDate';
type SortOrder = 'asc' | 'desc';

interface LeadTableProps {
  config: IndustryConfig;
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  searchQuery?: string;
  marketRegion?: 'USA' | 'IND';
  onAddMultiLeads?: (leads: Lead[]) => void;
 dashboardFilter?: string;
  currentView?: 'kanban' | 'table';
  onViewChange?: (view: 'kanban' | 'table') => void;
  onUpdateLead?: (lead: Lead) => Promise<void>;
}

export default function LeadTable({
  config,
  leads,
  onSelectLead,
  onUpdateLead,
  onDeleteLead,
  searchQuery = '',
  marketRegion = 'USA',
  onAddMultiLeads,
  dashboardFilter
}: LeadTableProps) {
  console.log('LEADTABLE RECEIVED:', leads.length, dashboardFilter);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [csvInput, setCsvInput] = useState('');
  const [showCsvImport, setShowCsvImport] = useState(false);
 const [selectedLeadForAction, setSelectedLeadForAction] = useState<Lead | null>(null);
const [selectedActionType, setSelectedActionType] = useState<'email' | 'whatsapp' | 'sms' | 'call' | null>(null);
const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  // ✅ SAFE: Filter with null checks for all properties
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Safe property access with defaults - NEVER call methods on undefined
      const name = (lead.name || '').toLowerCase();
      const phone = (lead.phone || '').toLowerCase();
      const email = (lead.email || '').toLowerCase();
      const source = (lead.source || '').toLowerCase();
      const status = (lead.status || '').toLowerCase();
      const query = (searchQuery || '').toLowerCase();

      // Search across multiple fields safely
      const matchesSearch =
        name.includes(query) ||
        phone.includes(query) ||
        email.includes(query) ||
        source.includes(query);

      return matchesSearch;
    });
  }, [leads, searchQuery]);

  // ✅ SAFE: Sort with null-safe comparisons
  const sortedLeads = useMemo(() => {
    const sorted = [...filteredLeads].sort((a, b) => {
      let aVal: any = '';
      let bVal: any = '';

      switch (sortField) {
        case 'name':
          aVal = (a.name || '').toLowerCase();
          bVal = (b.name || '').toLowerCase();
          break;
        case 'phone':
          aVal = (a.phone || '').toLowerCase();
          bVal = (b.phone || '').toLowerCase();
          break;
        case 'value':
          aVal = a.value || 0;
          bVal = b.value || 0;
          break;
        case 'createdAt':
          aVal = a.createdAt || '';
          bVal = b.createdAt || '';
          break;
        case 'nextFollowUpDate':
          aVal = a.customFields?.nextFollowUpDate || '';
          bVal = b.customFields?.nextFollowUpDate || '';
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredLeads, sortField, sortOrder]);

  // ✅ SAFE: Handle CSV import with null-safe parsing
 const handleCsvFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const text = e.target?.result as string;

    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const newLeads: Lead[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/,|\t/).map(v => v.trim());

      newLeads.push({
        id: `import-${Date.now()}-${i}`,
        name: values[headers.indexOf('name')] || '',
        phone: values[headers.indexOf('phone')] || '',
        email: values[headers.indexOf('email')] || '',
        source: 'CSV Import',
        status: 'active',
        stageId: config.stages[0]?.id || 'stage_1',
        value: 0,
        createdAt: new Date().toISOString().split('T')[0],
        lastContacted: new Date().toISOString().split('T')[0],
        notes: [],
        tasks: [],
        files: [],
        customFields: {
          followUpStage: 0,
          nextFollowUpDate: ''
        },
        assignedTo: '',
        assignedToName: ''
      });
    }

    onAddMultiLeads?.(newLeads);
    alert(`${newLeads.length} leads imported successfully`);
  };

  reader.readAsText(file);
};

 
  // ✅ SAFE: Get status color with null-safe access
  const getStatusColor = (status: string | undefined) => {
    const safeStatus = (status || '').toLowerCase();
    
    switch (safeStatus) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'won':
      case 'closed':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'lost':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'paused':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  // Quick action handlers
  const handleCall = (e: React.MouseEvent, phone: string | undefined) => {
    e.stopPropagation();
    if (!phone) {
      alert('No phone number available');
      return;
    }
    window.location.href = `tel:${phone}`;
  };

const handleWhatsApp = (e: React.MouseEvent, lead: Lead) => {
  e.stopPropagation();

  console.log('WHATSAPP LEAD:', lead);

  if (!lead.phone) {
    alert('No phone number available');
    return;
  }

  setSelectedLeadForAction(lead);
  setSelectedActionType('whatsapp');
  setShowQuickActionModal(true);
};

const handleSMS = (e: React.MouseEvent, lead: Lead) => {
  e.stopPropagation();

  if (!lead.phone) {
    alert('No phone number available');
    return;
  }

  setSelectedLeadForAction(lead);
  setSelectedActionType('sms');
  setShowQuickActionModal(true);
};
  

const handleEmail = (e: React.MouseEvent, lead: Lead) => {
  e.stopPropagation();

  if (!lead.email || lead.email === '-') {
    alert('No email address available');
    return;
  }

  setSelectedLeadForAction(lead);
  setSelectedActionType('email');
  setShowQuickActionModal(true);
};

const handleViewDetails = (e: React.MouseEvent, lead: Lead) => {
  e.stopPropagation();
  onSelectLead(lead);
};
  return (
  <div className="space-y-4">
      {/* CSV Import Controls */}
      {onAddMultiLeads && (
     <div className="flex gap-2 items-center">
  <input
    type="file"
    accept=".csv"
    onChange={handleCsvFileUpload}
    id="csv-upload"
    className="hidden"
  />

  <label
    htmlFor="csv-upload"
    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
  >
    <LucideIcons.Upload className="w-4 h-4" />
    <span>Bulk Import CSV</span>
  </label>
</div>
      )}

      {/* CSV Import Form */}
      {showCsvImport && onAddMultiLeads && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-3">
          <div>
            <label className="text-xs font-bold text-emerald-900 block mb-2">
              <div className="bg-blue-50 p-3 rounded-lg text-xs text-slate-700 mb-3">
  <strong>Example:</strong><br/>
  Name,Phone,Email<br/>
  John Doe,917736037807,john@test.com
</div>
             📥 Import Leads from Excel / CSV
            </label>
           
            <textarea
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
             placeholder="Name,Phone,Email
John Doe,917736037807,john@test.com
Jane Smith,9876543210,jane@test.com"

              className="w-full text-xs border border-emerald-200 rounded-xl p-3 font-mono focus:outline-none focus:border-emerald-500 h-24"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCsvImport}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
            >
              Import
            </button>
            <button
              onClick={() => setShowCsvImport(false)}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <p className="text-xs text-slate-500 mt-2">
✅ Copy rows directly from Excel<br/>
Required: Name, Phone<br/>
Optional: Email
</p>

      {/* ===== DESKTOP TABLE VIEW (md and up) ===== */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-3xl border border-gray-150/40 shadow-3xs">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 border-b border-gray-150">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => {
                    setSortField('name');
                    setSortOrder(sortField === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                >
                  Name
                  {sortField === 'name' && (
                    <LucideIcons.ChevronDown
                      className={`w-3 h-3 transition-transform ${sortOrder === 'desc' ? '' : 'rotate-180'}`}
                    />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => {
                    setSortField('phone');
                    setSortOrder(sortField === 'phone' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                >
                  Phone
                  {sortField === 'phone' && (
                    <LucideIcons.ChevronDown
                      className={`w-3 h-3 transition-transform ${sortOrder === 'desc' ? '' : 'rotate-180'}`}
                    />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-bold text-slate-700">Email</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-bold text-slate-700">Status</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-bold text-slate-700">Source</span>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => {
                    setSortField('nextFollowUpDate');
                    setSortOrder(sortField === 'nextFollowUpDate' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                >
                  Next Follow-up
                  {sortField === 'nextFollowUpDate' && (
                    <LucideIcons.ChevronDown
                      className={`w-3 h-3 transition-transform ${sortOrder === 'desc' ? '' : 'rotate-180'}`}
                    />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <span className="text-xs font-bold text-slate-700">Quick Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150">
            {sortedLeads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-xs text-gray-500">
                  No leads found. Try adjusting your search or filters.
                </td>
              </tr>
            ) : (
              sortedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {/* Name Column */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline text-left"
                    >
                      {lead.name || 'Unnamed Lead'}
                    </button>
                  </td>

                  {/* Phone Column */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600">
                      {lead.phone || '-'}
                    </span>
                  </td>

                  {/* Email Column */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600">
                      {lead.email ? (
                        <a
                          href={`mailto:${lead.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-indigo-600 hover:underline"
                        >
                          {lead.email}
                        </a>
                      ) : (
                        '-'
                      )}
                    </span>
                  </td>

                  {/* Status Column */}
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-block ${getStatusColor(
                        lead.status
                      )}`}
                    >
                      {lead.status ? (lead.status.charAt(0).toUpperCase() + lead.status.slice(1)) : 'Unknown'}
                    </span>
                  </td>

                  {/* Source Column */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600">
                      {lead.source || '-'}
                    </span>
                  </td>

                  {/* Next Follow-up Date Column */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600">
                      {lead.customFields?.nextFollowUpDate ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                          <LucideIcons.Calendar className="w-3 h-3" />
                          {lead.customFields.nextFollowUpDate}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </span>
                  </td>

                  {/* Quick Actions Column */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5 relative">
                      {/* Call Button */}
                      <button
                        onClick={(e) => handleCall(e, lead.phone)}
                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg border border-transparent hover:border-green-200 transition-all"
                        title="Call lead"
                      >
                        <LucideIcons.Phone className="w-4 h-4" />
                      </button>

                      {/* WhatsApp Button */}
                      <button
onClick={(e) => handleWhatsApp(e, lead)}
className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-200 transition-all"
                        title="Send WhatsApp"
                      >
                        <LucideIcons.MessageCircle className="w-4 h-4" />
                      </button>

                      {/* SMS Button */}
                      <button
onClick={(e) => handleSMS(e, lead)}
className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200 transition-all"
                        title="Send SMS"
                      >
                        <LucideIcons.Mail className="w-4 h-4" />
                      </button>

                      {/* Email Button */}
                      <button
                      onClick={(e) => handleEmail(e, lead)}
                        className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg border border-transparent hover:border-purple-200 transition-all"
                        title="Send email"
                      >
                        <LucideIcons.Send className="w-4 h-4" />
                      </button>

                      {/* View Details Button */}
                      <button
                        onClick={(e) => handleViewDetails(e, lead)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-200 transition-all"
                        title="View full details"
                      >
                        <LucideIcons.Eye className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this lead?')) {
                            onDeleteLead(lead.id);
                          }
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all"
                        title="Delete lead"
                      >
                        <LucideIcons.Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== MOBILE CARD VIEW (below md) ===== */}
      <div className="md:hidden space-y-3">
        {sortedLeads.length === 0 ? (
          <div className="text-center text-xs text-gray-500 py-8">
            No leads found. Try adjusting your search or filters.
          </div>
        ) : (
          sortedLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white border border-gray-150/40 rounded-2xl p-4 shadow-2xs space-y-3"
            >
              {/* Lead Info Section */}
              <div className="space-y-2">
                {/* Name */}
                <button
                  onClick={() => onSelectLead(lead)}
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline text-left w-full"
                >
                  {lead.name || 'Unnamed Lead'}
                </button>

                {/* Phone with icon */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <LucideIcons.Phone className="w-4 h-4 text-gray-400" />
                  <span>{lead.phone || '-'}</span>
                </div>

                {/* Email with icon */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <LucideIcons.Mail className="w-4 h-4 text-gray-400" />
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-indigo-600 hover:underline break-all"
                    >
                      {lead.email}
                    </a>
                  ) : (
                    <span>-</span>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Status:</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${getStatusColor(
                      lead.status
                    )}`}
                  >
                    {lead.status ? (lead.status.charAt(0).toUpperCase() + lead.status.slice(1)) : 'Unknown'}
                  </span>
                </div>

                {/* Next Follow-up Date */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Follow-up:</span>
                  {lead.customFields?.nextFollowUpDate ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-xs font-semibold">
                      <LucideIcons.Calendar className="w-3 h-3" />
                      {lead.customFields.nextFollowUpDate}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-150" />

              {/* Quick Actions Section */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block">Actions</span>

                {/* Action Buttons Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Call Button */}
                  <button
                    onClick={(e) => handleCall(e, lead.phone)}
                    className="flex items-center justify-center gap-1.5 p-2.5 bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 rounded-lg transition-all active:scale-95"
                    title="Call lead"
                  >
                    <LucideIcons.Phone className="w-4 h-4" />
                    <span className="text-xs font-bold">Call</span>
                  </button>

                  {/* WhatsApp Button */}
                  <button
onClick={(e) => handleWhatsApp(e, lead)}
className="flex items-center justify-center gap-1.5 p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-lg transition-all active:scale-95"
                    title="Send WhatsApp"
                  >
                    <LucideIcons.MessageCircle className="w-4 h-4" />
                    <span className="text-xs font-bold">WhatsApp</span>
                  </button>

                  {/* SMS Button */}
                  <button
onClick={(e) => handleSMS(e, lead)}
className="flex items-center justify-center gap-1.5 p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg transition-all active:scale-95"
                    title="Send SMS"
                  >
                    <LucideIcons.MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-bold">SMS</span>
                  </button>

                  {/* Email Button */}
                  <button
                  onClick={(e) => handleEmail(e, lead)}
                    className="flex items-center justify-center gap-1.5 p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 rounded-lg transition-all active:scale-95"
                    title="Send email"
                  >
                    <LucideIcons.Send className="w-4 h-4" />
                    <span className="text-xs font-bold">Email</span>
                  </button>
                </div>

                {/* Full Width Buttons Row */}
                <div className="grid grid-cols-2 gap-2">
                  {/* View Details Button */}
                  <button
                    onClick={(e) => handleViewDetails(e, lead)}
                    className="flex items-center justify-center gap-1.5 p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg transition-all active:scale-95"
                    title="View full details"
                  >
                    <LucideIcons.Eye className="w-4 h-4" />
                    <span className="text-xs font-bold">Details</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this lead?')) {
                        onDeleteLead(lead.id);
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 p-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-all active:scale-95"
                    title="Delete lead"
                  >
                    <LucideIcons.Trash2 className="w-4 h-4" />
                    <span className="text-xs font-bold">Delete</span>
                  </button>
                </div>
              </div>
            </div>
                   ))
        )}
      </div>

  {/* Summary */}
<div className="text-xs text-gray-500 px-4 md:px-0">
  Showing {sortedLeads.length} of {leads.length} leads
</div>

{showQuickActionModal && selectedLeadForAction && (
  <QuickActionModal
    lead={selectedLeadForAction}
    actionType={selectedActionType}
    onClose={() => setShowQuickActionModal(false)}
  onSend={async (content, notes, nextFollowUpDate) => {

  console.log('SENDING:', content);
  console.log('NOTES:', notes);
  console.log('FOLLOWUP:', nextFollowUpDate);
console.log('LEAD ID:', selectedLeadForAction?.id);
console.log('DATE:', nextFollowUpDate);
  const updatedLead = {
  ...selectedLeadForAction,

  lastContacted: new Date().toISOString(),

  lastContactMethod: selectedActionType,

  customFields: {
    ...selectedLeadForAction.customFields,
    nextFollowUpDate
  }
};

  console.log('UPDATED LEAD:', updatedLead);

  if (onUpdateLead) {
    await onUpdateLead(updatedLead);
    console.log('SAVED TO FIRESTORE:', updatedLead);
  }


            setShowQuickActionModal(false);
          }}
        />
      )}
    </div>
  );
}
 
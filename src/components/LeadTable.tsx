/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phase 8: Lead Table Redesign
 * Professional SaaS-style table with improved spacing, hierarchy, and mobile responsiveness
 */

import React, { useState } from 'react';
import { Lead, IndustryConfig } from '../types';
import * as LucideIcons from 'lucide-react';

interface LeadTableProps {
  leads: Lead[];
  config: IndustryConfig;
  onSelectLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  activeFilter?: string;
}

export default function LeadTable({ leads, config, onSelectLead, onDeleteLead, activeFilter }: LeadTableProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Get status color styling
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'active': 'bg-green-50 text-green-700 border border-green-200',
      'pending': 'bg-amber-50 text-amber-700 border border-amber-200',
      'closed': 'bg-gray-50 text-gray-700 border border-gray-200',
      'lead': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      'prospect': 'bg-blue-50 text-blue-700 border border-blue-200',
    };
    return statusMap[status.toLowerCase()] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  // Format currency
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Filter leads based on activeFilter
  const filteredLeads = leads.filter(lead => {
    if (!activeFilter) return true;
    if (activeFilter === 'total') return true;
    if (activeFilter === 'open') return lead.status === 'active';
    if (activeFilter === 'closed') return lead.status === 'closed';
    if (activeFilter === 'today') return new Date(lead.createdAt).toDateString() === new Date().toDateString();
    return true;
  });

  return (
    <div className="w-full">
      {/* Table Container */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-xs">
        <table className="w-full border-collapse">
          {/* Table Header - Sticky */}
          <thead className="sticky top-0 z-10 bg-white border-b border-gray-200">
            <tr>
              <th className="px-3 md:px-4 py-3 text-xs font-semibold text-gray-700 text-left tracking-wide">
                {config.leadLabel}
              </th>
              <th className="hidden md:table-cell px-3 md:px-4 py-3 text-xs font-semibold text-gray-700 text-left tracking-wide">
                Status
              </th>
              <th className="hidden lg:table-cell px-3 md:px-4 py-3 text-xs font-semibold text-gray-700 text-left tracking-wide">
                {config.valueLabel}
              </th>
              <th className="hidden lg:table-cell px-3 md:px-4 py-3 text-xs font-semibold text-gray-700 text-left tracking-wide">
                Source
              </th>
              <th className="px-3 md:px-4 py-3 text-xs font-semibold text-gray-700 text-right tracking-wide">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 md:px-4 py-8 md:py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <LucideIcons.InboxIcon className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">No leads found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or create a new lead</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-all duration-150 cursor-pointer ${
                    selectedLeadId === lead.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''
                  }`}
                  onClick={() => {
                    setSelectedLeadId(lead.id);
                    onSelectLead(lead);
                  }}
                >
                  {/* Lead Name - Primary Column */}
                  <td className="px-3 md:px-4 py-3 md:py-4">
                    <div className="flex flex-col">
                      <div className="font-semibold text-sm text-gray-900 leading-snug">
                        {lead.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 font-normal">
                        {lead.email}
                      </div>
                      <div className="text-xs text-gray-500 font-normal hidden md:block mt-0.5">
                        {lead.phone}
                      </div>
                      {/* Mobile Status Badge */}
                      <div className="md:hidden mt-1.5">
                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status Badge - Desktop Only */}
                  <td className="hidden md:table-cell px-3 md:px-4 py-3 md:py-4">
                    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>

                  {/* Value */}
                  <td className="hidden lg:table-cell px-3 md:px-4 py-3 md:py-4 text-sm font-semibold text-gray-900 font-mono">
                    {formatValue(lead.value)}
                  </td>

                  {/* Source */}
                  <td className="hidden lg:table-cell px-3 md:px-4 py-3 md:py-4 text-sm text-gray-600">
                    {lead.source}
                  </td>

                  {/* Actions */}
                  <td className="px-3 md:px-4 py-3 md:py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLead(lead);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                        title="View details"
                      >
                        <LucideIcons.Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete ${lead.name}?`)) {
                            onDeleteLead(lead.id);
                          }
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                        title="Delete lead"
                      >
                        <LucideIcons.Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer - Lead Count */}
      <div className="mt-3 flex items-center justify-between px-3 md:px-4 py-2">
        <p className="text-xs text-gray-600 font-medium">
          Showing <span className="font-semibold text-gray-900">{filteredLeads.length}</span> of <span className="font-semibold text-gray-900">{leads.length}</span> leads
        </p>
      </div>
    </div>
  );
}
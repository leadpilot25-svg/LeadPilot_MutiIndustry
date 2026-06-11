/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Communication History Component
 * Timeline view of all communications with a lead
 */

import React, { useMemo, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Lead,
  CommunicationType,
  CommunicationFilter,
} from '../types';
import {
  getCommunicationsByType,
  getCommunicationsByDateRange,
  getCommunicationStats,
  exportCommunicationHistoryCSV,
} from '../utils/communicationLogger';

interface CommunicationHistoryProps {
  lead: Lead;
  onClose?: () => void;
}

export default function CommunicationHistory({
  lead,
  onClose,
}: CommunicationHistoryProps) {
  const [filterType, setFilterType] = useState<CommunicationType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const communications = useMemo(() => {
    let filtered = lead.communicationHistory || [];

    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.type === filterType);
    }

    return filtered.sort((a, b) => {
      const aTime = new Date(a.sentAt).getTime();
      const bTime = new Date(b.sentAt).getTime();
      return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
    });
  }, [lead.communicationHistory, filterType, sortOrder]);

  const stats = useMemo(() => getCommunicationStats(lead), [lead]);

  const typeConfig = {
    whatsapp: { icon: LucideIcons.MessageCircle, label: 'WhatsApp', color: 'green', bg: 'bg-green-50' },
    email: { icon: LucideIcons.Mail, label: 'Email', color: 'blue', bg: 'bg-blue-50' },
    sms: { icon: LucideIcons.Phone, label: 'SMS', color: 'purple', bg: 'bg-purple-50' },
    call: { icon: LucideIcons.Mic, label: 'Call', color: 'red', bg: 'bg-red-50' },
    manual: { icon: LucideIcons.FileText, label: 'Manual', color: 'gray', bg: 'bg-gray-50' },
  };

  const handleExport = () => {
    const csv = exportCommunicationHistoryCSV(lead);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lead.name}-communications.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Communication History</h2>
            <p className="text-sm text-gray-600 mt-1">All interactions with {lead.name}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LucideIcons.X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 font-semibold">TOTAL</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCount}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-700 font-semibold">SUCCESSFUL</p>
            <p className="text-2xl font-bold text-green-700">{stats.successCount}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-xs text-red-700 font-semibold">FAILED</p>
            <p className="text-2xl font-bold text-red-700">{stats.failureCount}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-700 font-semibold">SUCCESS RATE</p>
            <p className="text-2xl font-bold text-blue-700">{stats.successRate}%</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-gray-200 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {(['whatsapp', 'email', 'sms', 'call'] as CommunicationType[]).map(type => {
            const config = typeConfig[type];
            const Icon = config.icon;
            const count = (lead.communicationHistory || []).filter(c => c.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                  filterType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{config.label} ({count})</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <LucideIcons.Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Communications List */}
      <div className="flex-1 overflow-y-auto p-6">
        {communications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <LucideIcons.MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No communications yet</p>
            <p className="text-sm text-gray-500 mt-1">Start by sending a message using Quick Actions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {communications.map((comm, idx) => {
              const config = typeConfig[comm.type];
              const Icon = config.icon;
              const commDate = new Date(comm.sentAt);
              const isToday = commDate.toDateString() === new Date().toDateString();
              const dateStr = isToday ? commDate.toLocaleTimeString() : commDate.toLocaleDateString();

              return (
                <div
                  key={comm.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${config.bg}`}>
                        <Icon className={`w-5 h-5 text-${config.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{config.label}</p>
                          {comm.templateName && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {comm.templateName}
                            </span>
                          )}
                          <span className={`px-2 py-1 border rounded text-xs font-medium ${getStatusColor(comm.deliveryStatus)}`}>
                            {comm.deliveryStatus}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{dateStr}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-3 pl-11">
                    <p className="text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap">
                      {comm.content}
                    </p>
                  </div>

                  {/* Metadata */}
                  {(comm.notes || Object.keys(comm.variablesUsed || {}).length > 0) && (
                    <div className="pl-11 space-y-2 text-xs text-gray-600">
                      {comm.notes && (
                        <div>
                          <p className="font-medium text-gray-700">Notes:</p>
                          <p>{comm.notes}</p>
                        </div>
                      )}
                      {comm.variablesUsed && Object.keys(comm.variablesUsed).length > 0 && (
                        <div>
                          <p className="font-medium text-gray-700">Variables:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Object.entries(comm.variablesUsed).map(([key, value]) => (
                              <span key={key} className="bg-gray-100 px-2 py-1 rounded">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
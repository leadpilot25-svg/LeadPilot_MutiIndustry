/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * FollowUp Dashboard Component - PHASE 10D
 * Shows all follow-up metrics and status
 */

import React, { useMemo, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Lead, QuickActionType } from '../types';

interface FollowUpDashboardProps {
  leads: Lead[];
  onQuickAction: (lead: Lead, action: QuickActionType) => void;
  onEditLead: (lead: Lead) => void;
  onClose?: () => void;
}

export default function FollowUpDashboard({
  leads,
  onQuickAction,
  onEditLead,
  onClose,
}: FollowUpDashboardProps) {
  const [activeTab, setActiveTab] = useState<'due-today' | 'overdue' | 'upcoming' | 'by-stage'>('due-today');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const categorizedLeads = useMemo(() => {
    const dueToday: Lead[] = [];
    const overdue: Array<Lead & { daysOverdue: number }> = [];
    const upcoming: Array<Lead & { daysUntil: number }> = [];

    leads.forEach(lead => {
      if (!lead.nextFollowUpDate || lead.followUpStage === 5) return;

      const followUpDate = new Date(lead.nextFollowUpDate);
      followUpDate.setHours(0, 0, 0, 0);
      
      const diffTime = followUpDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        dueToday.push(lead);
      } else if (diffDays < 0) {
        overdue.push({ ...lead, daysOverdue: Math.abs(diffDays) });
      } else {
        upcoming.push({ ...lead, daysUntil: diffDays });
      }
    });

    overdue.sort((a, b) => b.daysOverdue - a.daysOverdue);
    upcoming.sort((a, b) => a.daysUntil - b.daysUntil);

    return { dueToday, overdue, upcoming };
  }, [leads]);

  const byStage = useMemo(() => {
    const stages: Record<number, Lead[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
    };

    leads.forEach(lead => {
      if (lead.followUpStage !== undefined && lead.followUpStage < 5) {
        stages[lead.followUpStage]?.push(lead);
      }
    });

    return stages;
  }, [leads]);

  const getFollowUpLabel = (stage: number | undefined): string => {
    switch (stage) {
      case 0:
        return 'New';
      case 1:
        return 'Initial Sent';
      case 2:
        return 'Follow-up #1';
      case 3:
        return 'Follow-up #2';
      case 4:
        return 'Final Sent';
      default:
        return 'Unknown';
    }
  };

  const getFollowUpColor = (stage: number | undefined): string => {
    switch (stage) {
      case 0:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 1:
      case 2:
      case 3:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 4:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getOverdueColor = (daysOverdue: number): string => {
    if (daysOverdue >= 7) return 'text-red-900 bg-red-100';
    if (daysOverdue >= 3) return 'text-red-700 bg-red-50';
    return 'text-orange-700 bg-orange-50';
  };

  const LeadRow = ({ lead, daysInfo }: { lead: Lead; daysInfo?: { daysOverdue?: number; daysUntil?: number } }) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50">
      <div className="flex-1">
        <button
          onClick={() => onEditLead(lead)}
          className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
        >
          {lead.name}
        </button>
        <p className="text-sm text-gray-600 mt-1">{lead.company || 'No company'}</p>
      </div>
      <div className="flex items-center gap-3 ml-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getFollowUpColor(lead.followUpStage)}`}>
          {getFollowUpLabel(lead.followUpStage)}
        </span>
        {daysInfo?.daysOverdue !== undefined && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOverdueColor(daysInfo.daysOverdue)}`}>
            Overdue {daysInfo.daysOverdue}d
          </span>
        )}
        {daysInfo?.daysUntil !== undefined && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
            In {daysInfo.daysUntil}d
          </span>
        )}
      </div>
      <div className="flex gap-2 ml-4">
        <button
          onClick={() => onQuickAction(lead, 'whatsapp')}
          disabled={!lead.phone}
          title="WhatsApp"
          className="p-2 hover:bg-green-50 rounded text-green-600 disabled:opacity-50"
        >
          <LucideIcons.MessageCircle className="w-4 h-4" />
        </button>
        <button
          onClick={() => onQuickAction(lead, 'email')}
          disabled={!lead.email}
          title="Email"
          className="p-2 hover:bg-blue-50 rounded text-blue-600 disabled:opacity-50"
        >
          <LucideIcons.Mail className="w-4 h-4" />
        </button>
        <button
          onClick={() => onQuickAction(lead, 'sms')}
          disabled={!lead.phone}
          title="SMS"
          className="p-2 hover:bg-purple-50 rounded text-purple-600 disabled:opacity-50"
        >
          <LucideIcons.Smartphone className="w-4 h-4" />
        </button>
        <button
          onClick={() => onQuickAction(lead, 'call')}
          disabled={!lead.phone}
          title="Call"
          className="p-2 hover:bg-red-50 rounded text-red-600 disabled:opacity-50"
        >
          <LucideIcons.Phone className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Follow-Up Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">Manage all follow-ups in one place</p>
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
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 grid grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-600 font-semibold">DUE TODAY</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{categorizedLeads.dueToday.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 font-semibold">OVERDUE</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{categorizedLeads.overdue.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 font-semibold">UPCOMING</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{categorizedLeads.upcoming.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 font-semibold">TOTAL</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">
            {categorizedLeads.dueToday.length + categorizedLeads.overdue.length + categorizedLeads.upcoming.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 flex gap-4">
        <button
          onClick={() => setActiveTab('due-today')}
          className={`py-4 px-2 border-b-2 font-medium transition-colors ${
            activeTab === 'due-today'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Due Today ({categorizedLeads.dueToday.length})
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`py-4 px-2 border-b-2 font-medium transition-colors ${
            activeTab === 'overdue'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Overdue ({categorizedLeads.overdue.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`py-4 px-2 border-b-2 font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming ({categorizedLeads.upcoming.length})
        </button>
        <button
          onClick={() => setActiveTab('by-stage')}
          className={`py-4 px-2 border-b-2 font-medium transition-colors ${
            activeTab === 'by-stage'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          By Stage
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'due-today' && (
          <div className="bg-white">
            {categorizedLeads.dueToday.length === 0 ? (
              <div className="text-center py-12">
                <LucideIcons.CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No follow-ups due today</p>
                <p className="text-sm text-gray-500 mt-1">Great work staying on top of things!</p>
              </div>
            ) : (
              categorizedLeads.dueToday.map(lead => (
                <LeadRow key={lead.id} lead={lead} />
              ))
            )}
          </div>
        )}

        {activeTab === 'overdue' && (
          <div className="bg-white">
            {categorizedLeads.overdue.length === 0 ? (
              <div className="text-center py-12">
                <LucideIcons.CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No overdue follow-ups</p>
                <p className="text-sm text-gray-500 mt-1">All follow-ups are on track</p>
              </div>
            ) : (
              categorizedLeads.overdue.map(lead => (
                <LeadRow key={lead.id} lead={lead} daysInfo={{ daysOverdue: lead.daysOverdue }} />
              ))
            )}
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="bg-white">
            {categorizedLeads.upcoming.length === 0 ? (
              <div className="text-center py-12">
                <LucideIcons.CheckCircle className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No upcoming follow-ups</p>
                <p className="text-sm text-gray-500 mt-1">All leads are current</p>
              </div>
            ) : (
              categorizedLeads.upcoming.map(lead => (
                <LeadRow key={lead.id} lead={lead} daysInfo={{ daysUntil: lead.daysUntil }} />
              ))
            )}
          </div>
        )}

        {activeTab === 'by-stage' && (
          <div className="bg-white space-y-6 p-6">
            {[0, 1, 2, 3, 4].map(stage => (
              <div key={stage}>
                <h3 className={`text-sm font-semibold mb-3 px-3 py-2 rounded-lg ${getFollowUpColor(stage)}`}>
                  {getFollowUpLabel(stage)} ({byStage[stage].length})
                </h3>
                {byStage[stage].length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No leads in this stage</p>
                ) : (
                  <div className="space-y-2">
                    {byStage[stage].map(lead => (
                      <LeadRow key={lead.id} lead={lead} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
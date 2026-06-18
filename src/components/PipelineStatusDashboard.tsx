/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PipelineStatusDashboard Component
 * Industry-aware pipeline status visualization with lead counting and filtering
 * Uses config.statuses for ALL industries (no stages, no stageId)
 */

import React from 'react';
import { IndustryConfig, Lead } from '../types';

interface PipelineStatusDashboardProps {
  config: IndustryConfig;
  leads: Lead[];
  onFilterClick: (filter: string) => void;
  activeFilter?: string;
}

export default function PipelineStatusDashboard({
  config,
  leads,
  onFilterClick,
  activeFilter
}: PipelineStatusDashboardProps) {
  
  // Count leads by status - SAME FOR ALL INDUSTRIES
  const getStatusCount = (status: string): number => {
    return leads.filter(lead => 
      lead.status?.toLowerCase().trim() === status.toLowerCase().trim()
    ).length;
  };

  // Get total leads
  const totalLeads = leads.length;

  // Get background color for status card
  const getStatusCardColor = (status: string, isActive: boolean): string => {
    const statusLower = status.toLowerCase();
    
    if (isActive) {
      // Active state colors
      if (statusLower.includes('active')) return 'bg-green-100 border-green-400 border-2';
      if (statusLower.includes('closed')) return 'bg-blue-100 border-blue-400 border-2';
      if (statusLower.includes('lost')) return 'bg-red-100 border-red-400 border-2';
      if (statusLower.includes('won')) return 'bg-emerald-100 border-emerald-400 border-2';
      if (statusLower.includes('policy')) return 'bg-purple-100 border-purple-400 border-2';
      if (statusLower.includes('reading') || statusLower.includes('seeker')) return 'bg-pink-100 border-pink-400 border-2';
      if (statusLower.includes('contract') || statusLower.includes('under')) return 'bg-cyan-100 border-cyan-400 border-2';
      if (statusLower.includes('completed') || statusLower.includes('repeat')) return 'bg-amber-100 border-amber-400 border-2';
      if (statusLower.includes('cancelled')) return 'bg-gray-100 border-gray-400 border-2';
      if (statusLower.includes('contacted')) return 'bg-blue-100 border-blue-400 border-2';
      if (statusLower.includes('meeting')) return 'bg-cyan-100 border-cyan-400 border-2';
      if (statusLower.includes('visit') && statusLower.includes('scheduled')) return 'bg-purple-100 border-purple-400 border-2';
      if (statusLower.includes('postponed')) return 'bg-yellow-100 border-yellow-400 border-2';
      if (statusLower.includes('booked')) return 'bg-amber-100 border-amber-400 border-2';
      return 'bg-indigo-100 border-indigo-400 border-2';
    } else {
      // Inactive state colors
      if (statusLower.includes('active')) return 'bg-green-50 border-green-200 border';
      if (statusLower.includes('closed')) return 'bg-blue-50 border-blue-200 border';
      if (statusLower.includes('lost')) return 'bg-red-50 border-red-200 border';
      if (statusLower.includes('won')) return 'bg-emerald-50 border-emerald-200 border';
      if (statusLower.includes('policy')) return 'bg-purple-50 border-purple-200 border';
      if (statusLower.includes('reading') || statusLower.includes('seeker')) return 'bg-pink-50 border-pink-200 border';
      if (statusLower.includes('contract') || statusLower.includes('under')) return 'bg-cyan-50 border-cyan-200 border';
      if (statusLower.includes('completed') || statusLower.includes('repeat')) return 'bg-amber-50 border-amber-200 border';
      if (statusLower.includes('cancelled')) return 'bg-gray-50 border-gray-200 border';
      if (statusLower.includes('contacted')) return 'bg-blue-50 border-blue-200 border';
      if (statusLower.includes('meeting')) return 'bg-cyan-50 border-cyan-200 border';
      if (statusLower.includes('visit') && statusLower.includes('scheduled')) return 'bg-purple-50 border-purple-200 border';
      if (statusLower.includes('postponed')) return 'bg-yellow-50 border-yellow-200 border';
      if (statusLower.includes('booked')) return 'bg-amber-50 border-amber-200 border';
      return 'bg-slate-50 border-slate-200 border';
    }
  };

  // Get text color for status
  const getStatusTextColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('active')) return 'text-green-700';
    if (statusLower.includes('closed')) return 'text-blue-700';
    if (statusLower.includes('lost')) return 'text-red-700';
    if (statusLower.includes('won')) return 'text-emerald-700';
    if (statusLower.includes('policy')) return 'text-purple-700';
    if (statusLower.includes('reading') || statusLower.includes('seeker')) return 'text-pink-700';
    if (statusLower.includes('contract') || statusLower.includes('under')) return 'text-cyan-700';
    if (statusLower.includes('completed') || statusLower.includes('repeat')) return 'text-amber-700';
    if (statusLower.includes('cancelled')) return 'text-gray-700';
    if (statusLower.includes('contacted')) return 'text-blue-700';
    if (statusLower.includes('meeting')) return 'text-cyan-700';
    if (statusLower.includes('visit') && statusLower.includes('scheduled')) return 'text-purple-700';
    if (statusLower.includes('postponed')) return 'text-yellow-700';
    if (statusLower.includes('booked')) return 'text-amber-700';
    return 'text-indigo-700';
  };

  // Get progress bar color
  const getProgressColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('active')) return 'bg-green-500';
    if (statusLower.includes('closed')) return 'bg-blue-500';
    if (statusLower.includes('lost')) return 'bg-red-500';
    if (statusLower.includes('won')) return 'bg-emerald-500';
    if (statusLower.includes('policy')) return 'bg-purple-500';
    if (statusLower.includes('reading') || statusLower.includes('seeker')) return 'bg-pink-500';
    if (statusLower.includes('contract') || statusLower.includes('under')) return 'bg-cyan-500';
    if (statusLower.includes('completed') || statusLower.includes('repeat')) return 'bg-amber-500';
    if (statusLower.includes('cancelled')) return 'bg-gray-500';
    if (statusLower.includes('contacted')) return 'bg-blue-500';
    if (statusLower.includes('meeting')) return 'bg-cyan-500';
    if (statusLower.includes('visit') && statusLower.includes('scheduled')) return 'bg-purple-500';
    if (statusLower.includes('postponed')) return 'bg-yellow-500';
    if (statusLower.includes('booked')) return 'bg-amber-500';
    return 'bg-indigo-500';
  };

  // Check if statuses exist
  if (!config?.statuses || config.statuses.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Pipeline Status Distribution
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          Total Leads: <span className="font-semibold">{totalLeads}</span>
        </p>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {config.statuses.map(status => {
          const count = getStatusCount(status);
          const filterKey = `status_${status}`;
          const isActive = activeFilter === filterKey;
          const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;

          return (
            <button
              key={status}
              onClick={() => onFilterClick(filterKey)}
              className={`p-4 rounded-lg transition-colors text-left cursor-pointer hover:shadow-md ${getStatusCardColor(status, isActive)}`}
            >
              {/* Status Name */}
              <div className="flex items-start justify-between mb-2">
                <h4 className={`font-semibold text-sm ${getStatusTextColor(status)} flex-1`}>
                  {status}
                </h4>
                <span className={`text-lg font-bold ml-2 ${getStatusTextColor(status)}`}>
                  {count}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-300 rounded-full h-2 mb-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${getProgressColor(status)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Percentage */}
              <p className="text-xs text-gray-600 font-medium">
                {percentage}% of pipeline
              </p>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {totalLeads === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">No leads found</p>
        </div>
      )}
    </div>
  );
}
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * FollowUp Overdue Banner Component - PHASE 10D
 */

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

interface FollowUpOverdueBannerProps {
  overdueCount: number;
  dueTodayCount: number;
  onNavigate: () => void;
}

export default function FollowUpOverdueBanner({
  overdueCount,
  dueTodayCount,
  onNavigate,
}: FollowUpOverdueBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || (overdueCount === 0 && dueTodayCount === 0)) {
    return null;
  }

  const hasOverdue = overdueCount > 0;
  const hasDueToday = dueTodayCount > 0;

  const bgColor = hasOverdue ? 'bg-red-50' : 'bg-amber-50';
  const borderColor = hasOverdue ? 'border-red-200' : 'border-amber-200';
  const textColor = hasOverdue ? 'text-red-800' : 'text-amber-800';
  const buttonColor = hasOverdue ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700';
  const Icon = hasOverdue ? LucideIcons.AlertTriangle : LucideIcons.Clock;

  return (
    <div className={`${bgColor} border-b ${borderColor}`}>
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Icon className={`w-6 h-6 ${hasOverdue ? 'text-red-600' : 'text-amber-600'} flex-shrink-0`} />
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              {hasOverdue && (
                <span className={`font-semibold ${textColor}`}>
                  {overdueCount} overdue follow-up{overdueCount !== 1 ? 's' : ''}
                </span>
              )}
              {hasDueToday && (
                <span className={`font-semibold ${textColor}`}>
                  {dueTodayCount} due today
                </span>
              )}
            </div>
            <p className={`text-sm ${textColor} mt-1`}>
              {hasOverdue && !hasDueToday && 'Review and complete these follow-ups now.'}
              {!hasOverdue && hasDueToday && "Don't miss your follow-ups today."}
              {hasOverdue && hasDueToday && 'Check your follow-ups dashboard to stay on track.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <button
            onClick={onNavigate}
            className={`px-4 py-2 ${buttonColor} text-white rounded-lg font-medium transition-colors flex items-center gap-2`}
          >
            <LucideIcons.ChevronRight className="w-4 h-4" />
            View Dashboard
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className={`p-2 ${hasOverdue ? 'hover:bg-red-100' : 'hover:bg-amber-100'} rounded-lg transition-colors`}
          >
            <LucideIcons.X className={`w-5 h-5 ${hasOverdue ? 'text-red-600' : 'text-amber-600'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
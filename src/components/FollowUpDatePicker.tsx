/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * FollowUp Date Picker Component - PHASE 10D
 */

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

interface FollowUpDatePickerProps {
  currentDate?: string;
  suggestedDate?: string;
  onDateSelect: (date: string) => void;
  onClose?: () => void;
}

export default function FollowUpDatePicker({
  currentDate,
  suggestedDate,
  onDateSelect,
  onClose,
}: FollowUpDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(currentDate || suggestedDate || '');
  const [useCustom, setUseCustom] = useState(!suggestedDate && !currentDate);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const formatDate = (date: Date): string => date.toISOString().split('T')[0];

  const quickOptions = [
    { label: 'Today', date: formatDate(today), icon: LucideIcons.Calendar },
    { label: 'Tomorrow', date: formatDate(tomorrow), icon: LucideIcons.ArrowRight },
    { label: 'Next Week', date: formatDate(nextWeek), icon: LucideIcons.ArrowRight },
  ];

  const handleSelect = (date: string) => {
    setSelectedDate(date);
    onDateSelect(date);
    onClose?.();
  };

  const formatDisplayDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Next Follow-Up</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LucideIcons.X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Current Date */}
          {currentDate && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 font-semibold">Current Date</p>
              <p className="text-sm font-semibold text-blue-900 mt-1">{formatDisplayDate(currentDate)}</p>
            </div>
          )}

          {/* Suggested Date */}
          {suggestedDate && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700 font-semibold">Suggested Date</p>
              <p className="text-sm font-semibold text-green-900 mt-1">{formatDisplayDate(suggestedDate)}</p>
            </div>
          )}

          {/* Quick Options */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700 uppercase">Quick Select</p>
            {quickOptions.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.label}
                  onClick={() => handleSelect(option.date)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-colors ${
                    selectedDate === option.date
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-gray-600">{formatDisplayDate(option.date)}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Date */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700 uppercase">Custom Date</p>
            <input
              type="date"
              value={useCustom ? selectedDate : ''}
              onChange={e => {
                setSelectedDate(e.target.value);
                setUseCustom(true);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
            />
            {useCustom && selectedDate && (
              <button
                onClick={() => handleSelect(selectedDate)}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <LucideIcons.Check className="w-4 h-4" />
                Set to {formatDisplayDate(selectedDate)}
              </button>
            )}
          </div>

          {/* Warning */}
          {selectedDate && new Date(selectedDate) < new Date() && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex gap-2">
                <LucideIcons.AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700">
                  This date is in the past. You can set it, but consider using today or a future date.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end bg-gray-50">
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
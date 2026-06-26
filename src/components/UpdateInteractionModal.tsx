/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UpdateInteractionModal Component
 * Universal interaction recording for all industries
 */

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { InteractionType, INTERACTION_TYPES } from '../types';

interface UpdateInteractionModalProps {
  leadName: string;
  onClose: () => void;
  onSubmit: (interaction: {
    type: InteractionType;
    date: string;
    time?: string;
    notes?: string;
    outcome?: string;
    status?: string;
    nextScheduledActivity?: string;
    nextScheduledDate?: string;
  }) => void;
}

export default function UpdateInteractionModal({
  leadName,
  onClose,
  onSubmit,
}: UpdateInteractionModalProps) {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<InteractionType | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    notes: '',
    outcome: '',
    status: '',
    nextScheduledActivity: '',
    nextScheduledDate: '',
  });

  const getIconForType = (type: InteractionType): string => {
    const config = INTERACTION_TYPES.find(t => t.type === type);
    return config?.icon || '📝';
  };

  const getLabelForType = (type: InteractionType): string => {
    const config = INTERACTION_TYPES.find(t => t.type === type);
    return config?.label || type;
  };

  const handleSelectType = (type: InteractionType) => {
    setSelectedType(type);
    setStep('details');
  };

  const handleSubmit = () => {
    if (!selectedType) {
      alert('Please select an interaction type');
      return;
    }

    if (!formData.date) {
      alert('Please select a date');
      return;
    }

    onSubmit({
      type: selectedType,
      date: formData.date,
      time: formData.time || undefined,
      notes: formData.notes || undefined,
      outcome: formData.outcome || undefined,
      status: formData.status || undefined,
      nextScheduledActivity: formData.nextScheduledActivity || undefined,
      nextScheduledDate: formData.nextScheduledDate || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">📝 Update Interaction</h2>
            <p className="text-sm text-gray-600 mt-1">{leadName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LucideIcons.X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'type' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 font-medium mb-6">
                Select the type of interaction:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {INTERACTION_TYPES.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => handleSelectType(type)}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="font-medium text-gray-900">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Back Button */}
              <button
                onClick={() => setStep('type')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <LucideIcons.ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {/* Selected Interaction Type */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <span className="text-3xl">{getIconForType(selectedType!)}</span>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Selected Interaction</p>
                  <p className="text-lg font-bold text-gray-900">
                    {getLabelForType(selectedType!)}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Time (optional)
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="What happened during this interaction?"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              {/* Outcome */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Outcome (optional)
                </label>
                <input
                  type="text"
                  value={formData.outcome}
                  onChange={(e) =>
                    setFormData({ ...formData, outcome: e.target.value })
                  }
                  placeholder="e.g., Interested, Not Interested, Needs Follow-up"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Status (optional)
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                >
                  <option value="">Select Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Next Scheduled Activity */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Next Scheduled Activity (optional)
                </label>
                <input
                  type="text"
                  value={formData.nextScheduledActivity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nextScheduledActivity: e.target.value,
                    })
                  }
                  placeholder="e.g., Demo, Meeting, Follow-up Call"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              {/* Next Scheduled Date */}
              {formData.nextScheduledActivity && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Next Scheduled Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.nextScheduledDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nextScheduledDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {step === 'details' && (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Save Interaction
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
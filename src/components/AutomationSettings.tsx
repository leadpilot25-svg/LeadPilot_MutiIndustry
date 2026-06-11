/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Automation Settings Component - PHASE 10D
 */

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { AutomationSettings } from '../types';

interface AutomationSettingsProps {
  settings: AutomationSettings;
  onSave: (settings: AutomationSettings) => void;
  onClose: () => void;
}

const DEFAULT_SETTINGS: AutomationSettings = {
  followUp1Delay: 3,
  followUp2Delay: 3,
  finalFollowUpDelay: 5,
  lostReviewDelay: 7,
};

export default function AutomationSettingsPanel({
  settings,
  onSave,
  onClose,
}: AutomationSettingsProps) {
  const [formData, setFormData] = useState<AutomationSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    setFormData(DEFAULT_SETTINGS);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Automation Settings</h2>
            <p className="text-sm text-gray-600 mt-1">Configure follow-up delays</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LucideIcons.X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Save Status */}
          {isSaved && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <LucideIcons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium text-green-700">Settings saved successfully!</span>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <LucideIcons.Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">How it works:</p>
                <p>After a communication is sent, the next follow-up date is automatically calculated based on these delays.</p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-6">
            {/* Follow-Up #1 Delay */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Initial Contact → Follow-Up #1
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.followUp1Delay}
                  onChange={e =>
                    setFormData({ ...formData, followUp1Delay: parseInt(e.target.value) || 1 })
                  }
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                />
                <span className="text-sm text-gray-600">days</span>
              </div>
            </div>

            {/* Follow-Up #2 Delay */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Follow-Up #1 → Follow-Up #2
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.followUp2Delay}
                  onChange={e =>
                    setFormData({ ...formData, followUp2Delay: parseInt(e.target.value) || 1 })
                  }
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                />
                <span className="text-sm text-gray-600">days</span>
              </div>
            </div>

            {/* Final Follow-Up Delay */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Follow-Up #2 → Final Follow-Up
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.finalFollowUpDelay}
                  onChange={e =>
                    setFormData({ ...formData, finalFollowUpDelay: parseInt(e.target.value) || 1 })
                  }
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                />
                <span className="text-sm text-gray-600">days</span>
              </div>
            </div>

            {/* Lost Review Delay */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Final Follow-Up → Lost Review
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.lostReviewDelay}
                  onChange={e =>
                    setFormData({ ...formData, lostReviewDelay: parseInt(e.target.value) || 1 })
                  }
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                />
                <span className="text-sm text-gray-600">days</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-2">Total Follow-Up Cycle:</p>
            <p className="text-2xl font-bold text-indigo-600">
              {formData.followUp1Delay + formData.followUp2Delay + formData.finalFollowUpDelay + formData.lostReviewDelay}{' '}
              <span className="text-sm text-gray-600">days</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-between bg-gray-50">
          <button
            onClick={handleReset}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Restore Defaults
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <LucideIcons.Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
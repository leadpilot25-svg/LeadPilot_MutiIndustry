/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Call Script Modal Component
 * Large readable display of call scripts during phone calls
 */

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Lead,
  FollowUpTemplate,
} from '../types';
import {
  replaceTemplateVariables,
} from '../utils/templateEngine';

interface CallScriptModalProps {
  lead: Lead;
  template: FollowUpTemplate;
  onClose: () => void;
  onComplete: (notes: string) => Promise<void>;
  isLoading: boolean;
}

export default function CallScriptModal({
  lead,
  template,
  onClose,
  onComplete,
  isLoading,
}: CallScriptModalProps) {
  const [notes, setNotes] = useState('');
  const [startTime] = useState(new Date());
  const [duration, setDuration] = React.useState(0);

  const script = replaceTemplateVariables(template.content, lead, 'You');

  // Update duration every second
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDuration(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = async () => {
    try {
      await onComplete(notes);
      onClose();
    } catch (err) {
      // Error handled by parent
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[95vh] overflow-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50">
              <LucideIcons.Mic className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Call Script</h2>
              <p className="text-sm text-gray-600">{lead.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LucideIcons.X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Lead Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-semibold">NAME</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{lead.name}</p>
            </div>
            {lead.company && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold">COMPANY</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{lead.company}</p>
              </div>
            )}
            {lead.phone && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold">PHONE</p>
                <p className="text-lg font-bold text-gray-900 mt-1 font-mono">{lead.phone}</p>
              </div>
            )}
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-xs text-red-600 font-semibold">CALL DURATION</p>
              <p className="text-lg font-bold text-red-600 mt-1 font-mono">{formatDuration(duration)}</p>
            </div>
          </div>

          {/* Script Display - Large and Readable */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-8">
            <div className="whitespace-pre-wrap break-words text-xl leading-relaxed text-gray-900 font-mono">
              {script}
            </div>
          </div>

          {/* Call Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              📝 Call Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What was discussed? Any objections? Next steps?..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-base resize-none"
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-2">
              Add details about the call to help with follow-ups
            </p>
          </div>

          {/* Tips Section */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <LucideIcons.CheckCircle className="w-5 h-5" />
              Call Tips
            </h3>
            <ul className="text-sm text-green-800 space-y-2">
              <li className="flex gap-2">
                <span>✓</span>
                <span>Speak slowly and clearly</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Listen more than you talk</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Take notes during the call</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Confirm next steps before hanging up</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Close
          </button>
          <button
            onClick={handleComplete}
            disabled={isLoading}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <LucideIcons.Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <LucideIcons.CheckCircle className="w-4 h-4" />
                Complete Call
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * FollowUp Timeline Component - PHASE 10D UPDATED
 * Visual timeline of lead follow-up history with universal interaction types
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Lead, INTERACTION_TYPES } from '../types';

interface FollowUpTimelineProps {
  lead: Lead;
  onClose?: () => void;
}

export default function FollowUpTimeline({ lead, onClose }: FollowUpTimelineProps) {
  const stages = [
    { id: 0, label: 'New Lead', icon: LucideIcons.Users, color: 'blue' },
    { id: 1, label: 'Initial Contact', icon: LucideIcons.Send, color: 'indigo' },
    { id: 2, label: 'Follow-up #1', icon: LucideIcons.MessageCircle, color: 'indigo' },
    { id: 3, label: 'Follow-up #2', icon: LucideIcons.MessageCircle, color: 'indigo' },
    { id: 4, label: 'Final Follow-up', icon: LucideIcons.AlertCircle, color: 'orange' },
    { id: 5, label: 'Lost Review', icon: LucideIcons.XCircle, color: 'red' },
  ];

  const getStageDate = (stageId: number): string | null => {
    if (stageId === 0) return lead.createdAt;
    if (stageId === lead.followUpStage) return lead.lastContactDate || null;
    return null;
  };

  const isCompleted = (stageId: number) => stageId < (lead.followUpStage || 0);
  const isCurrent = (stageId: number) => stageId === (lead.followUpStage || 0);

  const getInteractionIcon = (type: string): string => {
    const config = INTERACTION_TYPES.find(t => t.type === type);
    return config?.icon || '📝';
  };

  const getInteractionLabel = (type: string): string => {
    const config = INTERACTION_TYPES.find(t => t.type === type);
    return config?.label || type;
  };

  // Sort interactions by date (most recent first)
  const sortedInteractions = lead.interactions 
    ? [...lead.interactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Timeline</h2>
            <p className="text-sm text-gray-600 mt-1">{lead.name}</p>
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

        {/* Timeline Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="space-y-12">
            {/* Stage Timeline Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Pipeline Stages</h3>
              <div className="space-y-6">
                {stages.map((stage, idx) => {
                  const Icon = stage.icon;
                  const completed = isCompleted(stage.id);
                  const current = isCurrent(stage.id);
                  const date = getStageDate(stage.id);

                  return (
                    <div key={stage.id} className="flex gap-4">
                      {/* Timeline Line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white transition-all ${
                            current
                              ? `bg-${stage.color}-600 ring-4 ring-${stage.color}-200`
                              : completed
                              ? `bg-${stage.color}-600`
                              : `bg-gray-300`
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {idx < stages.length - 1 && (
                          <div
                            className={`w-1 h-12 mt-2 ${completed ? `bg-${stage.color}-600` : 'bg-gray-300'}`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 py-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3
                              className={`text-lg font-semibold ${
                                completed || current ? 'text-gray-900' : 'text-gray-500'
                              }`}
                            >
                              {stage.label}
                            </h3>
                            {date && (
                              <p className="text-sm text-gray-600 mt-1">
                                {new Date(date).toLocaleDateString()} at{' '}
                                {new Date(date).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            )}
                            {!date && !completed && !current && (
                              <p className="text-sm text-gray-400 mt-1">Not yet reached</p>
                            )}
                            {current && !date && (
                              <p className="text-sm text-amber-600 mt-1">Currently here</p>
                            )}
                          </div>
                          {completed && (
                            <LucideIcons.Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                          )}
                          {current && (
                            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Universal Interactions Section */}
            {sortedInteractions.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">All Interactions</h3>
                <div className="space-y-4">
                  {sortedInteractions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl flex-shrink-0">
                          {getInteractionIcon(interaction.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {getInteractionLabel(interaction.type)}
                            </h4>
                            <span className="text-sm text-gray-600">
                              {new Date(interaction.date).toLocaleDateString()}
                              {interaction.time && ` at ${interaction.time}`}
                            </span>
                          </div>
                          {interaction.notes && (
                            <p className="text-sm text-gray-700 mb-2">{interaction.notes}</p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs">
                            {interaction.outcome && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                Outcome: {interaction.outcome}
                              </span>
                            )}
                            {interaction.status && (
                              <span className={`px-2 py-1 rounded ${
                                interaction.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : interaction.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                Status: {interaction.status}
                              </span>
                            )}
                          </div>
                          {interaction.nextScheduledActivity && (
                            <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-200">
                              📅 Next: {interaction.nextScheduledActivity}
                              {interaction.nextScheduledDate && ` on ${new Date(interaction.nextScheduledDate).toLocaleDateString()}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Timeline Info</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Lead created: {new Date(lead.createdAt).toLocaleDateString()}</li>
              {lead.lastContactDate && (
                <li>• Last contact: {new Date(lead.lastContactDate).toLocaleDateString()}</li>
              )}
              {lead.nextFollowUpDate && (
                <li>• Next activity: {new Date(lead.nextFollowUpDate).toLocaleDateString()}</li>
              )}
              <li>• Total communications: {(lead.communicationHistory || []).length}</li>
              <li>• Total interactions: {sortedInteractions.length}</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-end bg-gray-50">
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
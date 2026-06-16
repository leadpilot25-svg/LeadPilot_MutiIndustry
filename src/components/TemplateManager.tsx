/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Template Manager Component
 * Settings page for managing WhatsApp, Email, SMS, and Call Script templates
 */

import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { GlobalTemplates, FollowUpTemplate } from '../templateTypes';
import { DEFAULT_TEMPLATES } from '../defaultTemplates';
import TemplateEditor from './TemplateEditor';


interface TemplateManagerProps {
  templates: GlobalTemplates | null;
  onSaveTemplate: (template: FollowUpTemplate) => Promise<void>;
  onDeleteTemplate: (templateId: string, type: string) => Promise<void>;
  onClose?: () => void;
}

export default function TemplateManager({
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  onClose,
}: TemplateManagerProps) {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email' | 'sms' | 'call'>('whatsapp');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<FollowUpTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentTemplates = useMemo(() => {
    console.log('templates=', templates);
    console.log('activeTab=', activeTab);
    

    if (!templates) return [];

    const typeTemplates = templates[activeTab] || [];

    console.log('typeTemplates=', typeTemplates);

    return typeTemplates.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, activeTab, searchQuery]);

  const handleSaveTemplate = async (template: FollowUpTemplate) => {
    try {
      setIsLoading(true);
      setError(null);
      await onSaveTemplate(template);
      setSuccess(editingTemplate ? 'Template updated successfully!' : 'Template created successfully!');
      setEditingTemplate(null);
      setIsCreatingNew(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      setIsLoading(true);
      setError(null);
      await onDeleteTemplate(templateId, activeTab);
      setSuccess('Template deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateTemplate = (template: FollowUpTemplate) => {
    const newTemplate: FollowUpTemplate = {
      ...template,
      id: `${template.id}_${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingTemplate(newTemplate);
    setIsCreatingNew(true);
  };

  const stageLabel = (stage: number): string => {
    switch (stage) {
      case 0:
        return 'Initial Contact';
      case 1:
        return 'Follow-Up #1';
      case 2:
        return 'Follow-Up #2';
      case 3:
        return 'Final Follow-Up';
      default:
        return 'Unknown';
    }
  };

  const tabConfig = [
    { id: 'whatsapp', label: 'WhatsApp', icon: LucideIcons.MessageCircle },
    { id: 'email', label: 'Email', icon: LucideIcons.Mail },
    { id: 'sms', label: 'SMS', icon: LucideIcons.Phone },
    { id: 'call', label: 'Call Scripts', icon: LucideIcons.Mic },
  ] as const;

  if (editingTemplate || isCreatingNew) {
    return (
      <TemplateEditor
        template={editingTemplate}
        isNew={isCreatingNew}
        type={activeTab}
        onSave={handleSaveTemplate}
        onCancel={() => {
          setEditingTemplate(null);
          setIsCreatingNew(false);
        }}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full px-4 md:px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Template Manager</h1>
              <p className="text-sm text-gray-600 mt-1">
                Create and manage communication templates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mx-4 md:mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex gap-3">
            <LucideIcons.AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="mx-4 md:mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex gap-3">
            <LucideIcons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-700">{success}</div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {tabConfig.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search and Create */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <LucideIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-9 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-sm"
            />
          </div>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setIsCreatingNew(true);
            }}
            className="flex items-center justify-center gap-2 px-4 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            <LucideIcons.Plus className="w-4 h-4" />
            <span>New Template</span>
          </button>
        </div>

        {/* Templates Grid */}
   {currentTemplates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentTemplates.map(template => (
              <div
                key={template.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {template.stage ? stageLabel(template.stage) : 'General Template'}
                    </p>
                  </div>
                  {template.isDefault && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium whitespace-nowrap">
                      Default
                    </span>
                  )}
                </div>

                {/* Content Preview */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.content}</p>

                {/* Variables */}
                {template.variables?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-medium mb-2">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono"
                        >
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LucideIcons.Edit className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <LucideIcons.Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    disabled={isLoading}
                    title="Delete"
                  >
                    <LucideIcons.Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reset to Defaults Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            onClick={() => {
              if (window.confirm('Reset all templates to defaults? This cannot be undone.')) {
                // Implementation would restore default templates
              }
            }}
          >
            <LucideIcons.RotateCcw className="w-4 h-4 inline mr-2" />
            Reset to Default Templates
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { OutreachTemplates, TEMPLATE_STAGES } from '../types';
import * as LucideIcons from 'lucide-react';

interface OutreachTemplatesManagerProps {
  workspaceId: string;
  industryId: string;
  defaultTemplates: OutreachTemplates;
  onTemplatesSaved?: (templates: OutreachTemplates) => void;
}

type StageKey = 'introduction' | 'firstFollowUp' | 'secondFollowUp' | 'finalFollowUp';

export default function OutreachTemplatesManager({
  workspaceId,
  industryId,
  defaultTemplates,
  onTemplatesSaved
}: OutreachTemplatesManagerProps) {
  const [selectedStage, setSelectedStage] = useState<StageKey>('introduction');
  const [templates, setTemplates] = useState<OutreachTemplates>(defaultTemplates);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  // Load templates from localStorage on mount
  useEffect(() => {
    const storageKey = `leadpilot_outreach_templates_${workspaceId}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTemplates(parsed);
      } catch (err) {
        console.error('Failed to parse saved templates:', err);
        setTemplates(defaultTemplates);
      }
    } else {
      // Initialize with defaults from industry
      setTemplates(defaultTemplates);
    }
  }, [workspaceId, defaultTemplates]);

  const handleWhatsAppChange = (value: string) => {
    setTemplates({
      ...templates,
      [selectedStage]: {
        ...templates[selectedStage],
        whatsapp: value
      }
    });
  };

  const handleEmailSubjectChange = (value: string) => {
    setTemplates({
      ...templates,
      [selectedStage]: {
        ...templates[selectedStage],
        email: {
          ...templates[selectedStage].email,
          subject: value
        }
      }
    });
  };

  const handleEmailBodyChange = (value: string) => {
    setTemplates({
      ...templates,
      [selectedStage]: {
        ...templates[selectedStage],
        email: {
          ...templates[selectedStage].email,
          body: value
        }
      }
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      const storageKey = `leadpilot_outreach_templates_${workspaceId}`;
      localStorage.setItem(storageKey, JSON.stringify(templates));
      setSavedMessage('✅ Templates saved successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setSavedMessage(''), 3000);
      
      if (onTemplatesSaved) {
        onTemplatesSaved(templates);
      }
    } catch (err) {
      console.error('Failed to save templates:', err);
      setSavedMessage('❌ Failed to save templates');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all templates to industry defaults? This cannot be undone.')) {
      setTemplates(defaultTemplates);
      setSavedMessage('🔄 Templates reset to defaults');
      setTimeout(() => setSavedMessage(''), 3000);
    }
  };

const currentStage = templates?.[selectedStage];
if (!currentStage) {
  return (
    <div className="p-6">
      Loading templates...
    </div>
  );
}
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h4 className="text-base font-bold text-slate-900">Outreach Templates</h4>
          <p className="text-xs text-slate-500 mt-1">
            Customize templates for each follow-up stage by industry
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-slate-400">Industry: {industryId}</p>
          <p className="text-[10px] font-mono text-slate-400">Workspace: {workspaceId.slice(0, 12)}...</p>
        </div>
      </div>

      {/* Stage Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Select Stage</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {TEMPLATE_STAGES.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id as StageKey)}
              className={`p-3 rounded-xl text-center border-2 transition-all ${
                selectedStage === stage.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <span className="text-lg block mb-1">{stage.icon}</span>
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {stage.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* WhatsApp Template Editor */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="text-lg">💬</span>
          <h5 className="text-sm font-bold text-slate-900">WhatsApp Template</h5>
        </div>

        <textarea
          value={currentStage.whatsapp}
          onChange={(e) => handleWhatsAppChange(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          rows={5}
          placeholder="Enter WhatsApp message template..."
        />

        <div className="bg-slate-50 p-3 rounded-lg text-[10px] text-slate-600 leading-relaxed">
          <strong className="text-slate-900 block mb-1">Available placeholders:</strong>
          <code className="font-mono text-slate-700">
            {'{name}'} {'{email}'} {'{phone}'} {'{company}'} {'{city}'} {'{source}'}
          </code>
        </div>
      </div>

      {/* Email Template Editor */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="text-lg">📧</span>
          <h5 className="text-sm font-bold text-slate-900">Email Template</h5>
        </div>

        {/* Email Subject */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Subject Line</label>
          <input
            type="text"
            value={currentStage.email.subject}
            onChange={(e) => handleEmailSubjectChange(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="Enter email subject..."
          />
        </div>

        {/* Email Body */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Email Body</label>
          <textarea
            value={currentStage.email.body}
            onChange={(e) => handleEmailBodyChange(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            rows={8}
            placeholder="Enter email body template..."
          />
        </div>

        <div className="bg-slate-50 p-3 rounded-lg text-[10px] text-slate-600 leading-relaxed">
          <strong className="text-slate-900 block mb-1">Available placeholders:</strong>
          <code className="font-mono text-slate-700">
            {'{name}'} {'{email}'} {'{phone}'} {'{company}'} {'{city}'} {'{source}'}
          </code>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-slate-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <LucideIcons.Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <LucideIcons.Save className="w-4 h-4" />
              Save Templates
            </>
          )}
        </button>

        <button
          onClick={handleResetToDefaults}
          className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
        >
          <LucideIcons.RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Success/Error Message */}
      {savedMessage && (
        <div
          className={`p-3 rounded-lg text-sm font-bold text-center ${
            savedMessage.includes('✅')
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {savedMessage}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
        <div className="flex gap-3">
          <LucideIcons.Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800">
            <strong className="block mb-1">Templates are saved per workspace.</strong>
            <p>
              Changes made here only affect {'{name}'} workspace. Each workspace can have its own
              customized templates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
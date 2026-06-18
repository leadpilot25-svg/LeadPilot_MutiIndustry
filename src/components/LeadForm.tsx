/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { IndustryConfig, Lead, FieldDefinition } from '../types';
import * as LucideIcons from 'lucide-react';
import { getCurrencySymbol } from '../lib/currencyUtils';

interface LeadFormProps {
  config: IndustryConfig;
  initialStageId: string;
  onClose: () => void;
  onSubmit: (leadData: Omit<Lead, 'id' | 'createdAt' | 'lastContacted' | 'notes' | 'tasks'> & { noteText?: string }) => void;
  marketRegion?: 'USA' | 'IND' | 'EUR';
}

export default function LeadForm({ config, initialStageId, onClose, onSubmit, marketRegion = 'USA' }: LeadFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState(config.suggestedSources[0] || 'Direct Website');
  const [value, setValue] = useState<number>(1000); // monetary estimator value
  const [stageId, setStageId] = useState(initialStageId);
  const [noteText, setNoteText] = useState('');
  
  // Custom fields dictionary state
  const [customFields, setCustomFields] = useState<Record<string, string | number | boolean>>({});

    // Reset custom fields when industry config changes or initial state changes
  useEffect(() => {
    const defaults: Record<string, string | number | boolean> = {};
    config.customFields.forEach(field => {
      if (field.type === 'select' && field.options) {
        defaults[field.key] = field.options[0];
      } else if (field.type === 'number') {
        defaults[field.key] = 0;
      } else if (field.type === 'boolean') {
        defaults[field.key] = false;
      } else {
        defaults[field.key] = '';
      }
    });

    // Handle regional default entries if India region is active
    if (marketRegion === 'IND') {
      defaults.indiaState = 'Delhi';
      defaults.indiaGst = 'Unregistered';
    }

    // Scheduling and followups state variables
    defaults.nextFollowUpDate = '';
    defaults.followUpTimeSlot = '10:00 AM - 12:00 PM';
    defaults.followUpTaskDesc = 'Corporate client feedback review';

    // Provide premium default values depending on mock scenarios
    if (config.id === 'real-estate') {
      setValue();
      defaults.preferredLocation = '';
    } else if (config.id === 'insurance') {
      setValue(4500);
      defaults.coverageCapacity = 1000000;
    } else if (config.id === 'tarot-coaching') {
      setValue(250);
      defaults.cosmicZodiacSign = 'Leo';
    } else if (config.id === 'taxi') {
      setValue(0);
      defaults.pickupAddress = '';
      defaults.destinationAddress = '';
    } else if (config.id === 'creative-agency') {
      setValue(120000);
    } else {
      setValue(50000);
    }

    setCustomFields(defaults);
    setStageId(initialStageId);
  }, [config, initialStageId, marketRegion]);

  const handleCustomFieldChange = (key: string, val: string | number | boolean) => {
    setCustomFields(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      source,
      value: Number(value),
      stageId,
      status: 'active',
      customFields,
      noteText: noteText.trim() || ""
    });
  };

  return (
    <div id="lead-form-modal-container" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all overflow-y-auto">
      <div 
        id="lead-form-drawer" 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-lg relative border border-gray-200 overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-gray-200 flex items-center justify-between bg-white">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider block w-fit mb-1">
              Add New {config.leadLabel}
            </span>
            <h4 className="text-xl font-bold font-sans text-gray-900">
              New lead Intake Profile
            </h4>
          </div>
          <button 
            id="close-lead-form-btn"
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <LucideIcons.Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 font-sans">
          
          {/* Section 1: Standard Contact Identity */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase text-gray-500 tracking-wider">
              1. Basic Identity Details
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Johnathan Wilde"
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-gray-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-gray-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(555) 808-1234"
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-gray-800 font-medium"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Industry Specific Fields */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase text-gray-500 tracking-wider">
              2. Industry Custom Fields ({config.name})
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {config.customFields.map((field) => (
                <div key={field.key} className={field.type === 'text' ? 'col-span-1 md:col-span-2' : ''}>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                    {field.label} {field.required && '*'}
                  </label>

                  {field.type === 'select' && field.options && (
                    <select
                      required={field.required}
                      value={String(customFields[field.key] ?? '')}
                      onChange={e => handleCustomFieldChange(field.key, e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-gray-800 font-medium"
                    >
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {field.type === 'text' && (
                    <input
                      type="text"
                      required={field.required}
                      value={String(customFields[field.key] ?? '')}
                      onChange={e => handleCustomFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-gray-800 font-medium"
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      required={field.required}
                      value={Number(customFields[field.key] ?? 0)}
                      onChange={e => handleCustomFieldChange(field.key, Number(e.target.value))}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-gray-800 font-medium"
                    />
                  )}

                  {field.type === 'date' && (
                    <input
                      type="date"
                      required={field.required}
                      value={String(customFields[field.key] ?? '')}
                      onChange={e => handleCustomFieldChange(field.key, e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-gray-800 font-medium"
                    />
                  )}
                </div>
              ))}

              
            </div>
          </div>

          <hr className="border-gray-100" />

    {/* Section 3: CRM pipeline values & notes - Hide for Real Estate */}
{config.id !== 'real-estate' && (
  <div className="space-y-3">
    <h5 className="text-xs font-bold uppercase text-gray-500 tracking-wider">
      3. Channel & Estimated Pipeline
    </h5>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <div>
        <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
          Target Pipeline Stage
        </label>
        <select
          value={stageId}
          onChange={e => setStageId(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-gray-800 font-medium"
        >
          {config.stages.map(st => (
            <option key={st.id} value={st.id}>{st.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
          {config.valueLabel} ({getCurrencySymbol(marketRegion)})
        </label>
        <input
          type="number"
          value={value}
          onChange={e => setValue(Number(e.target.value))}
          placeholder="Projected numeric value"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-gray-800 font-mono font-medium"
        />
      </div>
    </div>
  </div>
)}

{/* Lead Referrer / Source - Show for ALL */}
<div className="space-y-3">
  <div className="col-span-1 md:col-span-2">
    <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
      Lead Referrer / Source
    </label>
    <select
      value={source}
      onChange={e => setSource(e.target.value)}
      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-gray-800 font-medium"
    >
      {config.suggestedSources.map(src => (
        <option key={src} value={src}>{src}</option>
      ))}
      <option value="Manual Addition">Manual Addition</option>
    </select>
  </div>

  <div>
    <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
      Initial Consultant Notes
    </label>
    <textarea
      value={noteText}
      onChange={e => setNoteText(e.target.value)}
      placeholder="Write any background notes, customer demands, or initial conversations..."
      rows={3}
      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-gray-800 font-medium resize-none"
    />
  </div>
</div>

          <hr className="border-gray-100" />

          {/* Section 4: Scheduling & client follow-up */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <LucideIcons.CalendarClock className="w-4 h-4 text-indigo-600" />
              <h5 className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                4. Scheduling & Follow-up Agenda
              </h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 font-sans">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                  Next Scheduled Contact Date
                </label>
                <input
                  type="date"
                  value={String(customFields.nextFollowUpDate ?? '')}
                  onChange={e => handleCustomFieldChange('nextFollowUpDate', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-gray-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                  Scheduled Action Time Slot
                </label>
                <select
                  value={String(customFields.followUpTimeSlot ?? '10:00 AM - 12:00 PM')}
                  onChange={e => handleCustomFieldChange('followUpTimeSlot', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-gray-800 font-medium"
                >
                  <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM (Early catchup)</option>
                  <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM (Mid Morning briefing)</option>
                  <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM (Lunch session)</option>
                  <option value="02:00 PM - 04:50 PM">02:00 PM - 04:50 PM (Afternoon sprint)</option>
                  <option value="05:00 PM - 07:00 PM">05:00 PM - 07:00 PM (Late checkout wrap-up)</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                  Short Follow-up action task reminder
                </label>
                <input
                  type="text"
                  value={String(customFields.followUpTaskDesc ?? '')}
                  placeholder="e.g. Present digital marketing SOW options / draft graphic brief review"
                  onChange={e => handleCustomFieldChange('followUpTaskDesc', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-gray-800 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 sticky bottom-0 bg-white border-t border-gray-200 mt-4 px-4 md:px-5">
            <button
              id="cancel-form-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              id="submit-form-btn"
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-semibold shadow-sm text-sm"
            >
              Confirm Lead Intake
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
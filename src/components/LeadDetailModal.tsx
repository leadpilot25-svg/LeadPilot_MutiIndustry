/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { IndustryConfig, Lead, Task, Note, LeadFile } from '../types';
import * as LucideIcons from 'lucide-react';
import QuickCommunicationHub from './QuickCommunicationHub';

interface LeadDetailModalProps {
  config: IndustryConfig;
  lead: Lead;
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
  marketRegion?: 'USA' | 'IND' | 'EUR';
  teamAgents?: { uid: string; displayName: string; email: string }[];
  currentUserRole?: 'owner' | 'agent';
  isTeamMode?: boolean;
  onUploadFile?: (leadId: string, file: File) => Promise<void>;
  onDeleteFile?: (leadId: string, fileIndex: number, fileUrl: string) => Promise<void>;
  isUploadingFile?: boolean;
}

export default function LeadDetailModal({ 
  config, 
  lead, 
  onClose, 
  onUpdateLead, 
  marketRegion = 'USA',
  teamAgents = [],
  currentUserRole = 'owner',
  isTeamMode = false,
  onUploadFile,
  onDeleteFile,
  isUploadingFile = false
}: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'tasks' | 'notes' | 'actions' | 'files'>('details');
  const [newNoteText, setNewNoteText] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editedLead, setEditedLead] = useState<Lead>(lead);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    setEditedLead(lead);
  }, [lead]);

  // Custom Action States
  const [tarotCard, setTarotCard] = useState<{ name: string; meaning: string; advice: string } | null>(null);
  const [underwritingResult, setUnderwritingResult] = useState<{ score: string; multiplier: number; reason: string } | null>(null);
  const [taxiFareVoucher, setTaxiFareVoucher] = useState<{ distance: string; trafficMultiplier: number; totalFare: number; driverName: string } | null>(null);
  const [showingDate, setShowingDate] = useState('');
  const [showingScheduled, setShowingScheduled] = useState(false);
  const [crmSyncStatus, setCrmSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');

  // Format money helper (Localizes currency appropriately)
  const formatValue = (val: number) => {
    if (marketRegion === 'IND') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(val);
    }
    if (marketRegion === 'EUR') {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(val);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Vehicle rate constants for Taxi auto-fill
  const TAXI_VEHICLE_RATES: Record<string, number> = {
    'Hatchback': 15,
    'Sedan': 18,
    'SUV': 25,
    'Van': 30,
    'Luxury': 45,
    'Mini Bus': 50
  };

  const calculateTaxiFareDetail = (updatedFields: Record<string, any>) => {
    const distance = updatedFields.distanceKm ?? editedLead.customFields.distanceKm;
    const rate = updatedFields.ratePerKm ?? editedLead.customFields.ratePerKm;
    
    if (distance && rate && distance > 0 && rate > 0) {
      return Math.round(distance * rate);
    }
    return 0;
  };

  const handleDetailCustomFieldChange = (key: string, val: string | number | boolean) => {
    const updatedFields: Record<string, any> = { [key]: val };

    // For Taxi: auto-fill ratePerKm when vehicleClass changes
    if (config.id === 'taxi' && key === 'vehicleClass') {
      const defaultRate = TAXI_VEHICLE_RATES[String(val)];
      if (defaultRate) {
        updatedFields.ratePerKm = defaultRate;
      }
    }

    setEditedLead({
      ...editedLead,
      customFields: {
        ...editedLead.customFields,
        ...updatedFields
      }
    });

    // For Taxi: recalculate fare when distance, rate, or vehicle type changes
    if (config.id === 'taxi' && ['distanceKm', 'ratePerKm', 'vehicleClass'].includes(key)) {
      const newFare = calculateTaxiFareDetail(updatedFields);
      setEditedLead(prev => ({
        ...prev,
        value: newFare
      }));
    }
  };

  const handleSaveChanges = () => {
    onUpdateLead(editedLead);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  // Save communication interaction touchpoint notes
  const handleLogInteraction = (author: string, type: 'call' | 'whatsapp' | 'sms' | 'email', notes: string) => {
    const newNote: Note = {
      id: `note-comm-${Date.now()}`,
      content: notes,
      createdAt: new Date().toISOString().split('T')[0],
      author: author
    };
    onUpdateLead({
      ...editedLead,
      notes: [newNote, ...editedLead.notes],
      lastContacted: new Date().toISOString().split('T')[0]
    });
  };

  // Add notes handler
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      content: newNoteText.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      author: 'Steward Agent'
    };

    const updatedLead: Lead = {
      ...editedLead,
      notes: [newNote, ...editedLead.notes],
      lastContacted: new Date().toISOString().split('T')[0]
    };

    onUpdateLead(updatedLead);
    setNewNoteText('');
  };

  // Toggle tasks check
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = editedLead.tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    const updatedLead: Lead = {
      ...editedLead,
      tasks: updatedTasks
    };

    onUpdateLead(updatedLead);
  };

  // Add new tasks
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false
    };

    const updatedLead: Lead = {
      ...editedLead,
      tasks: [...editedLead.tasks, newTask]
    };

    onUpdateLead(updatedLead);
    setNewTaskTitle('');
  };

  // Quick Action: Draw Tarot Card (Tarot Astrology Focus)
  const drawTarotCard = () => {
    const cards = [
      {
        name: 'The Magician (I)',
        meaning: 'Manifestation, creative power, alignment of intention and cosmic resources.',
        advice: `Advise ${editedLead.name} to focus their daily crystal meditations on unlocking their throat chakra to express this block.`
      },
      {
        name: 'The High Priestess (II)',
        meaning: 'Intuition, sacred secrets, subconscious wisdom, spiritual retreat.',
        advice: `This seeker is undergoing an intense kundalini awakening. Suggest a 3-day social media detox before their live reading.`
      },
      {
        name: 'The Empress (III)',
        meaning: 'Abundance, feminine energy, nurturing, creativity, motherhood/growth.',
        advice: `The Taurus influence is extremely potent. Recommend anchoring their financial goals in practical green candles during the next full moon.`
      },
      {
        name: 'The Star (XVII)',
        meaning: 'Hope, celestial protection, rejuvenation, divine inspiration.',
        advice: `A glowing star in their romantic house. Confirm to ${editedLead.name} that their spiritual twin-flame alignment is progressing beautifully.`
      },
      {
        name: 'The Sun (XIX)',
        meaning: 'Success, vital warmth, glowing confidence, absolute abundance.',
        advice: `Ultimate positive card! They are 100% ready to upgrade to your premium $2,400 Cosmic Retainer package immediately.`
      }
    ];

    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    setTarotCard(randomCard);

    // Auto append as note inside CRM
    const newNote: Note = {
      id: `tarot-note-${Date.now()}`,
      content: `🔮 Oracle Reading Drawn: "${randomCard.name}". Guidance: ${randomCard.advice}`,
      createdAt: new Date().toISOString().split('T')[0],
      author: 'Oracle Advisor'
    };

    onUpdateLead({
      ...editedLead,
      notes: [newNote, ...editedLead.notes]
    });
  };

  // Quick Action: Run Underwriting Scanner (Insurance Focus)
  const runUnderwritingScanner = () => {
    const riskScores = ['Low Preferred Risk Class', 'Standard Healthy Risk Class', 'Moderate Substandard Risk Class'];
    const multiplierRates = [0.85, 1.0, 1.45];
    const reasons = [
      'Verified non-smoker, active gym membership, stellar health diagnostics.',
      'Average metrics, slight cardiovascular background noted in history.',
      'Elevated health premium due to heavy limit coverage desired & policy size.'
    ];

    const randomIdx = Math.floor(Math.random() * riskScores.length);
    const chosenScore = riskScores[randomIdx];
    const chosenMult = multiplierRates[randomIdx];
    const chosenReason = reasons[randomIdx];

    setUnderwritingResult({
      score: chosenScore,
      multiplier: chosenMult,
      reason: chosenReason
    });

    const newNote: Note = {
      id: `ins-note-${Date.now()}`,
      content: `🛡️ Simulated Underwriting Result: "${chosenScore}". Premium Adjustment Factor: x${chosenMult}. Reason: ${chosenReason}`,
      createdAt: new Date().toISOString().split('T')[0],
      author: 'Underwriter Bot'
    };

    onUpdateLead({
      ...editedLead,
      notes: [newNote, ...editedLead.notes]
    });
  };

  // Quick Action: Calculate Route Fare Voucher (Taxi Focus)
  const calculateRouteFare = () => {
    const distances = ['12.4 miles', '25.8 miles', '8.1 miles', '42.5 miles'];
    const multipliers = [1.0, 1.5, 1.2, 1.8]; // traffic multipliers
    const drivers = ['Chauffeur Carlos (ID: 309)', 'Chauffeur Sophia (ID: 112)', 'Chauffeur James (ID: 802)', 'Chauffeur Elena (ID: 412)'];

    const idx = Math.floor(Math.random() * distances.length);
    const textDist = distances[idx];
    const mult = multipliers[idx];
    const rawVal = editedLead.value;
    const computedTotal = Math.round(rawVal * mult);

    setTaxiFareVoucher({
      distance: textDist,
      trafficMultiplier: mult,
      totalFare: computedTotal,
      driverName: drivers[idx]
    });

    const symbol = marketRegion === 'IND' ? '₹' : (marketRegion === 'EUR' ? '€' : '$');
    const newNote: Note = {
      id: `taxi-note-${Date.now()}`,
      content: `🚖 Route Voucher Generated. Route distance: ${textDist} (Surge traffic factor: x${mult}). Assigned dispatch: ${drivers[idx]}. Net adjusted fare: ${symbol}${computedTotal}.`,
      createdAt: new Date().toISOString().split('T')[0],
      author: 'Logistics Dispatcher'
    };

    onUpdateLead({
      ...editedLead,
      notes: [newNote, ...editedLead.notes],
      value: computedTotal
    });
  };

  // Quick Action: Book showing slot (Real Estate Focus)
  const scheduleRealEstateShowing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showingDate) return;

    setShowingScheduled(true);

    const newNote: Note = {
      id: `re-showing-note-${Date.now()}`,
      content: `🏠 Showing confirmed for: "${editedLead.customFields.preferredLocation}". Date/Time: ${showingDate}. Property Category: ${editedLead.customFields.propertyType}.`,
      createdAt: new Date().toISOString().split('T')[0],
      author: 'Broker Steward'
    };

    onUpdateLead({
      ...editedLead,
      notes: [newNote, ...editedLead.notes]
    });
  };

  // Quick Action: CRM webhook sync
  const triggerCrmWebhookSync = () => {
    setCrmSyncStatus('syncing');
    
    setTimeout(() => {
      setCrmSyncStatus('synced');
      
      const newNote: Note = {
        id: `webhook-note-${Date.now()}`,
        content: `🌐 JSON webhook dispatched safely to system handler endpoint: https://api.crmpilotv2.io/leads/sync?id=${editedLead.id}`,
        createdAt: new Date().toISOString().split('T')[0],
        author: 'System API Gate'
      };

      onUpdateLead({
        ...editedLead,
        notes: [newNote, ...editedLead.notes]
      });
    }, 1500);
  };

  return (
    <div id="lead-detail-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-teal-500 via-indigo-600 to-violet-700 p-6 text-white relative">
          <button 
            id="close-detail-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
          >
            <LucideIcons.Plus className="w-5 h-5 rotate-45" />
          </button>

          <div className="space-y-1">
            <span className="text-[10px] font-bold bg-white/25 text-white border border-white/20 px-2 rounded font-sans uppercase tracking-widest">
              {config.name} • Active Lead Tracker
            </span>
            <h3 className="text-2xl font-bold font-sans tracking-tight">{editedLead.name}</h3>
            <p className="text-sm text-teal-100 opacity-90">{editedLead.email} • {editedLead.phone}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto no-scrollbar">
          {[
            { id: 'details', label: 'Client Profile', icon: LucideIcons.User },
            { id: 'tasks', label: 'Tasks & Followups', icon: LucideIcons.CheckSquare },
            { id: 'notes', label: 'History Feed', icon: LucideIcons.ClipboardList },
            { id: 'actions', label: `${config.leadLabel} Actions`, icon: LucideIcons.Sparkles },
            { id: 'files', label: 'Attachments', icon: LucideIcons.Paperclip }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 text-center text-sm font-semibold border-b-2 flex items-center justify-center gap-2 transition-all ${
                  activeTab === tab.id 
                    ? 'border-emerald-600 text-emerald-700 bg-white' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[350px] max-h-[50vh]">
          
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div id="details-tab-panel" className="space-y-6 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Standard Card Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Standard Contact data</h4>
                  
                  <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                      <label id="lbl-edit-lead-name" htmlFor="edit-lead-name" className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Full Name</label>
                      <input
                        id="edit-lead-name"
                        type="text"
                        value={editedLead.name || ''}
                        onChange={(e) => setEditedLead({ ...editedLead, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-800 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label id="lbl-edit-lead-phone" htmlFor="edit-lead-phone" className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Phone Number</label>
                        <input
                          id="edit-lead-phone"
                          type="tel"
                          value={editedLead.phone || ''}
                          onChange={(e) => setEditedLead({ ...editedLead, phone: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label id="lbl-edit-lead-email" htmlFor="edit-lead-email" className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Email Address</label>
                        <input
                          id="edit-lead-email"
                          type="email"
                          value={editedLead.email || ''}
                          onChange={(e) => setEditedLead({ ...editedLead, email: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-800 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label id="lbl-edit-lead-source" htmlFor="edit-lead-source" className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Lead Source</label>
                        <select
                          id="edit-lead-source"
                          value={editedLead.source || ''}
                          onChange={(e) => setEditedLead({ ...editedLead, source: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-800 font-medium"
                        >
                          {config.suggestedSources.map(src => (
                            <option key={src} value={src}>{src}</option>
                          ))}
                          <option value="Manual Addition">Manual Addition</option>
                          <option value="Direct Website">Direct Website</option>
                          <option value="Google Ads">Google Ads</option>
                          <option value="Referral">Referral</option>
                        </select>
                      </div>
                      <div>
                        <label id="lbl-edit-lead-value" htmlFor="edit-lead-value" className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                          Value ({marketRegion === 'IND' ? '₹' : (marketRegion === 'EUR' ? '€' : '$')})
                        </label>
                        <input
                          id="edit-lead-value"
                          type="number"
                          value={editedLead.value || 0}
                          onChange={(e) => setEditedLead({ ...editedLead, value: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-800 font-mono font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label id="lbl-edit-lead-status" htmlFor="edit-lead-status" className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Lead Status</label>
                        <select
                          id="edit-lead-status"
                          value={editedLead.status || 'active'}
                          onChange={(e) => setEditedLead({ ...editedLead, status: e.target.value as 'active' | 'archived' | 'won' })}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-800 font-medium"
                        >
                          <option value="active">Active</option>
                          <option value="won">Won (Closed Deal)</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      <div>
                        <label id="lbl-edit-lead-stage" htmlFor="edit-lead-stage" className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Pipeline Stage</label>
                        <select
                          id="edit-lead-stage"
                          value={editedLead.stageId || ''}
                          onChange={(e) => setEditedLead({ ...editedLead, stageId: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-800 font-medium"
                        >
                          {config.stages.map(stage => (
                            <option key={stage.id} value={stage.id}>{stage.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[10px] text-gray-400 font-mono pt-1">
                      <div>
                        <span>Created: {lead.createdAt}</span>
                      </div>
                      <div>
                        <span>Last Touch: {lead.lastContacted}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Industry Specific Fields */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Industry specific configurations</h4>
                  
                  <div className="space-y-3 bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100/50">
                    {config.customFields.map((field) => {
                      const val = editedLead.customFields[field.key] ?? '';
                      return (
                        <div key={field.key} className="flex flex-col text-xs pb-1 border-b border-emerald-100/20 last:border-0 last:pb-0">
                          <label id={`lbl-edit-custom-${field.key}`} htmlFor={`edit-custom-${field.key}`} className="block text-[10px] uppercase font-bold text-emerald-800 mb-1">
                            {field.label} {field.required && '*'}
                          </label>

                          {field.type === 'select' && field.options && (
                            <select
                              id={`edit-custom-${field.key}`}
                              required={field.required}
                              value={String(val)}
                              onChange={(e) => handleDetailCustomFieldChange(field.key, e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-800 font-medium"
                            >
                              {field.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )}

                          {field.type === 'text' && (
                            <input
                              id={`edit-custom-${field.key}`}
                              type="text"
                              required={field.required}
                              value={String(val)}
                              onChange={(e) => handleDetailCustomFieldChange(field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-800 font-medium"
                            />
                          )}

                          {field.type === 'number' && (
                            <input
                              id={`edit-custom-${field.key}`}
                              type="number"
                              required={field.required}
                              value={Number(val)}
                              onChange={(e) => handleDetailCustomFieldChange(field.key, Number(e.target.value))}
                              placeholder={field.placeholder}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-800 font-medium font-mono"
                            />
                          )}

                          {field.type === 'date' && (
                            <input
                              id={`edit-custom-${field.key}`}
                              type="date"
                              required={field.required}
                              value={String(val)}
                              onChange={(e) => handleDetailCustomFieldChange(field.key, e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-800 font-medium"
                            />
                          )}

                          {field.type === 'boolean' && (
                            <div className="flex items-center gap-2 py-1">
                              <input
                                id={`edit-custom-${field.key}`}
                                type="checkbox"
                                checked={Boolean(val)}
                                onChange={(e) => handleDetailCustomFieldChange(field.key, e.target.checked)}
                                className="w-4.5 h-4.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                              />
                              <span className="text-gray-600 font-medium font-sans">Active</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Regional India Client Specifications info box (exclude Taxi) */}
                {(marketRegion === 'IND' || editedLead.customFields.indiaState) && config.id !== 'taxi' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-indigo-700 tracking-wider flex items-center gap-1">
                      <span>🇮🇳 Indian Localization Records</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3 bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100/50 text-xs">
                      <div className="flex flex-col">
                        <span id="lbl-edit-india-state" className="text-[10px] uppercase font-bold text-indigo-700 mb-1">Territory State</span>
                        <select
                          id="edit-india-state"
                          value={String(editedLead.customFields.indiaState ?? 'Delhi')}
                          onChange={(e) => setEditedLead({
                            ...editedLead,
                            customFields: {
                              ...editedLead.customFields,
                              indiaState: e.target.value
                            }
                          })}
                          className="w-full px-2 py-1 text-xs bg-white border border-indigo-200 rounded-xl text-indigo-950 font-semibold"
                        >
                          <option value="Delhi">Delhi NCR</option>
                          <option value="Maharashtra">Maharashtra (Mumbai/Pune)</option>
                          <option value="Karnataka">Karnataka (Bengaluru)</option>
                          <option value="Telangana">Telangana (Hyderabad)</option>
                          <option value="Tamil Nadu">Tamil Nadu (Chennai)</option>
                          <option value="Haryana">Haryana (Gurugram)</option>
                          <option value="Uttar Pradesh">Uttar Pradesh (Noida)</option>
                          <option value="Gujarat">Gujarat (Ahmedabad/GIFT City)</option>
                          <option value="West Bengal">West Bengal (Kolkata)</option>
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <span id="lbl-edit-india-gst" className="text-[10px] uppercase font-bold text-indigo-700 mb-1">GST Identification</span>
                        <select
                          id="edit-india-gst"
                          value={String(editedLead.customFields.indiaGst ?? 'Unregistered')}
                          onChange={(e) => setEditedLead({
                            ...editedLead,
                            customFields: {
                              ...editedLead.customFields,
                              indiaGst: e.target.value
                            }
                          })}
                          className="w-full px-2 py-1 text-xs bg-white border border-indigo-200 rounded-xl text-indigo-950 font-semibold"
                        >
                          <option value="Unregistered">Unregistered Business Client</option>
                          <option value="Regular Taxpayer">Regular GST Taxpayer (18% Service Invoice)</option>
                          <option value="Composition Scheme">Composition scheme (Lower Levy Rate)</option>
                          <option value="Exempt Entity">Exempt / Govt / NGO Entity</option>
                          <option value="SEZ Client">SEZ developer (Zero Rated Export)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scheduled Followups & Tasks Desk */}
                <div className="space-y-3 col-span-1 md:col-span-2">
                  <h4 className="text-xs font-bold uppercase text-amber-700 tracking-wider flex items-center gap-1.5">
                    <LucideIcons.Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>📅 Client Follow-up Schedule</span>
                  </h4>
                  <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-100/50 text-xs space-y-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span id="lbl-edit-followup-date" className="block text-[10px] uppercase font-bold text-amber-800 mb-1">Contact Date</span>
                      <input
                        id="edit-followup-date"
                        type="date"
                        value={String(editedLead.customFields.nextFollowUpDate ?? '')}
                        onChange={(e) => setEditedLead({
                          ...editedLead,
                          customFields: {
                            ...editedLead.customFields,
                            nextFollowUpDate: e.target.value
                          }
                        })}
                        className="w-full px-2 py-1.5 text-xs bg-white border border-amber-200 rounded-xl font-medium text-gray-800"
                      />
                    </div>
                    <div>
                      <span id="lbl-edit-followup-timeslot" className="block text-[10px] uppercase font-bold text-amber-800 mb-1">Time Constraint</span>
                      <select
                        id="edit-followup-timeslot"
                        value={String(editedLead.customFields.followUpTimeSlot ?? '10:00 AM - 12:00 PM')}
                        onChange={(e) => setEditedLead({
                          ...editedLead,
                          customFields: {
                            ...editedLead.customFields,
                            followUpTimeSlot: e.target.value
                          }
                        })}
                        className="w-full px-2 py-1.5 text-xs bg-white border border-amber-200 rounded-xl font-medium text-gray-800"
                      >
                        <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM (Early catchup)</option>
                        <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM (Mid Morning briefing)</option>
                        <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM (Lunch session)</option>
                        <option value="02:00 PM - 04:50 PM">02:00 PM - 04:50 PM (Afternoon sprint)</option>
                        <option value="05:00 PM - 07:00 PM">05:00 PM - 07:00 PM (Late checkout wrap-up)</option>
                      </select>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <span id="lbl-edit-followup-taskdesc" className="block text-[10px] uppercase font-bold text-amber-800 mb-1">Follow-up action task reminder</span>
                      <input
                        id="edit-followup-taskdesc"
                        type="text"
                        value={String(editedLead.customFields.followUpTaskDesc ?? '')}
                        onChange={(e) => setEditedLead({
                          ...editedLead,
                          customFields: {
                            ...editedLead.customFields,
                            followUpTaskDesc: e.target.value
                          }
                        })}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-amber-200 rounded-xl font-medium text-amber-950"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Lead Assignment Section (Team Mode Only) */}
              {isTeamMode && (
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase text-indigo-700 tracking-wider flex items-center gap-1.5">
                      <LucideIcons.ShieldAlert className="w-4 h-4 text-indigo-600" />
                      <span>Workspace Member Assignment</span>
                    </h4>
                    <p className="text-xs text-gray-400">Determine which representative manages this client dossier.</p>
                  </div>
                  {currentUserRole === 'owner' ? (
                    <div className="w-full md:w-64 max-w-full shrink-0">
                      <select
                        id="edit-lead-assignment"
                        value={editedLead.assignedTo || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setEditedLead({
                              ...editedLead,
                              assignedTo: undefined,
                              assignedToName: undefined
                            });
                            onUpdateLead({
                              ...editedLead,
                              assignedTo: undefined,
                              assignedToName: undefined
                            });
                          } else {
                            const selectedAgent = teamAgents.find(a => a.uid === val);
                            const updated = {
                              ...editedLead,
                              assignedTo: val,
                              assignedToName: selectedAgent ? selectedAgent.displayName : 'Unknown Agent'
                            };
                            setEditedLead(updated);
                            onUpdateLead(updated);
                          }
                        }}
                        className="w-full text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2 bg-white text-slate-800 transition-all focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Unassigned (Open Pool)</option>
                        {teamAgents.map((agent) => (
                          <option key={agent.uid} value={agent.uid}>
                            {agent.displayName} ({agent.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-white border border-indigo-100 text-xs font-bold rounded-2xl flex items-center gap-2">
                      <span className="text-gray-400 font-sans font-medium">Assigned To:</span>
                      <span className="text-indigo-950">{editedLead.assignedToName || 'Unassigned (Open Pool)'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Save Button for Profile Updates */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                {saveSuccess && (
                  <span id="save-success-indicator" className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1.5 animate-pulse">
                    <LucideIcons.CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Lead profile successfully updated!</span>
                  </span>
                )}
                <button
                  id="save-lead-details-btn"
                  onClick={handleSaveChanges}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <LucideIcons.Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
              
              {/* Quick Communication Hub - One-Tap outreach portal */}
              <QuickCommunicationHub 
                config={config} 
                lead={editedLead} 
                marketRegion={marketRegion}
                onLogInteraction={handleLogInteraction} 
              />
            </div>
          )}

          {/* TAB 2: TASKS */}
          {activeTab === 'tasks' && (
            <div id="tasks-tab-panel" className="space-y-6 font-sans">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Process Checklist pipeline tasks</h4>
                <span className="text-xs text-gray-400 font-mono">{lead.tasks.filter(t=>t.completed).length} / {lead.tasks.length} Completed</span>
              </div>

              {/* Task Checklist list */}
              <div className="space-y-2">
                {lead.tasks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                    No pending tasks created. Create checklist points below to keep this candidate warm.
                  </div>
                ) : (
                  lead.tasks.map((task) => (
                    <div 
                      key={task.id} 
                      className={`flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 transition-colors ${
                        task.completed ? 'opacity-60 bg-gray-100/40' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                        className="w-4.5 h-4.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                      />
                      <span className={`text-sm text-gray-800 font-sans ${task.completed ? 'line-through' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="flex gap-2" id="add-task-form">
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Schedule subsequent consulting follow up call..."
                  className="flex-1 px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-800"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1 shrink-0"
                >
                  <LucideIcons.Plus className="w-4 h-4" /> Add
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: NOTES */}
          {activeTab === 'notes' && (
            <div id="notes-tab-panel" className="space-y-6 font-sans">
              <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Chronological timeline & activity notes</h4>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2" id="add-note-form">
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Record call summary, meeting outlines, or general logs for this candidate..."
                  rows={2}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-800"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Post Log Entry
                  </button>
                </div>
              </form>

              {/* Activity Feed List */}
              <div className="space-y-3">
                {lead.notes.length === 0 ? (
                  <p className="text-xs text-center text-gray-400 p-8 border border-dashed border-gray-100 rounded-xl">
                    Activity feed is currently empty.
                  </p>
                ) : (
                  lead.notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 border border-gray-100/70 rounded-2xl p-4 space-y-1 relative">
                      <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                        <span>{note.author}</span>
                        <span>{note.createdAt}</span>
                      </div>
                      <p className="text-sm text-gray-700 font-sans leading-relaxed pt-1 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACTIONS */}
          {activeTab === 'actions' && (
            <div id="actions-tab-panel" className="space-y-6 font-sans">
              <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                Industry-Specific Quick Action Tools
              </h4>

              {/* Real Estate Custom Actions */}
              {config.id === 'real-estate' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <LucideIcons.Calendar className="w-5 h-5 text-emerald-600" />
                      <h5 className="font-semibold text-sm text-emerald-900">Schedule Private Showing Flight</h5>
                    </div>
                    <form onSubmit={scheduleRealEstateShowing} className="flex gap-2 flex-wrap items-end">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Date & Hour</label>
                        <input
                          type="datetime-local"
                          required
                          value={showingDate}
                          onChange={(e) => setShowingDate(e.target.value)}
                          className="w-full px-3.5 py-1.5 text-xs border border-gray-200 rounded-xl bg-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shrink-0"
                      >
                        Confirm Booking
                      </button>
                    </form>
                    {showingScheduled && (
                      <div className="text-xs text-emerald-800 bg-emerald-100 p-2.5 rounded-xl font-medium animate-pulse">
                        ✔ Showing Scheduled! Broker agent notified. An automated calendar item has been injected into history feed notes.
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-gray-200 flex justify-between items-center">
                    <div>
                      <h5 className="font-semibold text-sm text-gray-800">Generate Client Property Brief SHEET</h5>
                      <p className="text-xs text-gray-400">Compiles neighborhood diagnostics and pre-approval checklists.</p>
                    </div>
                    <button
                      onClick={() => alert(`Generated buyer packet for ${lead.name} representing ${lead.customFields.preferredLocation}.`)}
                      className="p-2.5 bg-white hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 text-xs font-semibold"
                    >
                      Launch PDF
                    </button>
                  </div>
                </div>
              )}

              {/* Insurance Materialized Actions */}
              {config.id === 'insurance' && (
                <div className="space-y-4">
                  <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-3">
                    <div className="flex items-center gap-2">
                      <LucideIcons.ShieldAlert className="w-5 h-5 text-indigo-600" />
                      <h5 className="font-semibold text-sm text-indigo-900">Run Underwriting Medical & Risk Scan</h5>
                    </div>
                    <p className="text-xs text-gray-500">
                      Cross-references life insurance liability limits and preexisting options to evaluate premium adjusters.
                    </p>
                    <button
                      onClick={runUnderwritingScanner}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-semibold"
                    >
                      Scan Applicant Risk
                    </button>

                    {underwritingResult && (
                      <div className="bg-white p-4 rounded-xl border border-indigo-150 space-y-2 mt-4">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-gray-400">Underwriting Assessment:</span>
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{underwritingResult.score}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-gray-400">Premium Cost Scale:</span>
                          <span className="font-bold text-gray-800 font-mono">x{underwritingResult.multiplier} Base Rate</span>
                        </div>
                        <p className="text-xs text-gray-600 italic">" {underwritingResult.reason} "</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tarot Astro Arcana Magic Actions */}
              {config.id === 'tarot-coaching' && (
                <div className="space-y-4">
                  <div className="bg-violet-50/50 p-5 rounded-2xl border border-violet-100 space-y-3">
                    <div className="flex items-center gap-2">
                      <LucideIcons.Sparkles className="w-5 h-5 text-violet-600" />
                      <h5 className="font-semibold text-sm text-violet-900">Draw Oracle Guidance Arcana for Reader</h5>
                    </div>
                    <p className="text-xs text-gray-500">
                      Instantly draw a focal Tarot Card to guide this Querent's energetic blockages before the scheduled consultation.
                    </p>
                    <button
                      onClick={drawTarotCard}
                      className="px-4 py-2.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-semibold"
                    >
                      Draw Sacred Tarot Card
                    </button>

                    {tarotCard && (
                      <div className="bg-white p-4 rounded-xl border border-violet-150 space-y-2 mt-4 animate-fade-in">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-gray-400">Tarot Card Selected:</span>
                          <span className="font-bold text-violet-800 bg-violet-50 px-2 py-0.5 rounded italic">🔮 {tarotCard.name}</span>
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold text-gray-400 block mb-0.5">Cosmic Meaning:</span>
                          <span className="text-gray-700">{tarotCard.meaning}</span>
                        </div>
                        <div className="text-xs bg-slate-50 p-2 rounded border border-gray-100">
                          <span className="font-bold text-emerald-800 block mb-0.5">Consultant Advice Hint:</span>
                          <span className="text-gray-600 italic">{tarotCard.advice}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Taxi / Logistics Chauffeur Custom Actions */}
              {config.id === 'taxi' && (
                <div className="space-y-4">
                  <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <LucideIcons.Car className="w-5 h-5 text-amber-600" />
                      <h5 className="font-semibold text-sm text-amber-900">Dispatcher Chauffeur Routing Voucher</h5>
                    </div>
                    <p className="text-xs text-gray-500 col-span-2">
                      Calculates dispatch road metrics, selects executive drivers, and locks in fare rates based on traffic conditions.
                    </p>
                    <button
                      onClick={calculateRouteFare}
                      className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-gray-900 rounded-xl text-xs font-bold shadow-sm"
                    >
                      Issue Trip Dispatch Voucher
                    </button>

                    {taxiFareVoucher && (
                      <div className="bg-white p-4 rounded-xl border border-amber-200 mt-4 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-gray-400">Assigned Chauffeur:</span>
                          <span className="font-bold text-gray-800">{taxiFareVoucher.driverName}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-gray-400 font-sans">Route Distance:</span>
                          <span className="font-semibold text-gray-800 font-mono">{taxiFareVoucher.distance}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-gray-400">Traffic Surge Multiplier:</span>
                          <span className="font-semibold text-gray-700 font-mono">x{taxiFareVoucher.trafficMultiplier}</span>
                        </div>
                        <div className="flex justify-between text-xs pt-1.5 border-t border-gray-100">
                          <span className="font-bold text-gray-900">Total Charged Fare:</span>
                          <span className="font-extrabold text-emerald-700 text-sm font-mono">{formatValue(taxiFareVoucher.totalFare)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* B2B / General Enterprise Custom Actions */}
              {config.id === 'custom-crm' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <LucideIcons.Briefcase className="w-5 h-5 text-slate-700" />
                      <h5 className="font-semibold text-sm text-slate-900">Trigger API Real-Time Webhook</h5>
                    </div>
                    <p className="text-xs text-gray-500">
                      Dispatches a secure JSON payload containing target entity details to configure automated onboarding procedures.
                    </p>
                    
                    <button
                      onClick={triggerCrmWebhookSync}
                      disabled={crmSyncStatus === 'syncing'}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {crmSyncStatus === 'syncing' ? 'Syncing...' : 'Sync Account to External Systems'}
                    </button>

                    {crmSyncStatus === 'synced' && (
                      <div className="text-xs text-emerald-800 bg-emerald-100 p-2.5 rounded-xl font-medium animate-pulse">
                        🌐 Sync complete! System returned status "200: OK". Integration payload logged in history feed.
                      </div>
                    )}
                  </div>
                </div>
              )}

               {/* Creative Agency Industry Actions */}
              {config.id === 'creative-agency' && (
                <div className="space-y-4 font-sans">
                  <div className="bg-gradient-to-br from-indigo-50 to-pink-50/50 p-5 rounded-2xl border border-indigo-150 space-y-4">
                    <div className="flex items-center gap-2">
                      <LucideIcons.Brush className="w-5 h-5 text-indigo-700" />
                      <h5 className="font-semibold text-sm text-indigo-950">Artisan Creative Pitch Generator</h5>
                    </div>
                    <p className="text-xs text-gray-500">
                      Compiles customized brand aesthetic guidelines, scope of work (SOW) benchmarks, and graphic project schedules.
                    </p>
                    
                    <button
                      onClick={() => {
                        const strategies = [
                          "Visual Revamp Focus: Direct modern minimalism, utilizing deep dark charcoal palettes paired with neon accents. Ideal for digital marketing campaigns.",
                          "Brand Identity Overhaul: Vintage modern typography, featuring serif headings (like Playfair) with clean off-white layouts to establish timeless heritage.",
                          "Social Growth Blitz: Staggered story layouts, high-contrast Reels vectors, and JetBrains Mono overlays to command instant modern screen engagement.",
                          "Full Funnel Digital SOW: Retainer-tier digital marketing across Instagram and Google Maps grounding, targeting 3.5x CTR increases."
                        ];
                        const randomSol = strategies[Math.floor(Math.random() * strategies.length)];
                        
                        // Append as note
                        const newNote: Note = {
                          id: `creative-pitch-${Date.now()}`,
                          content: `🎨 Prepared Proposal Roadmap Idea: "${randomSol}"`,
                          createdAt: new Date().toISOString().split('T')[0],
                          author: 'Design Director AI'
                        };
                        
                        onUpdateLead({
                          ...lead,
                          notes: [newNote, ...lead.notes]
                        });
                        alert(`Successfully drafted brand concept roadmap brief and appended to notes timeline!`);
                      }}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                    >
                      Draft Custom SOW Concept brief
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: FILES */}
          {activeTab === 'files' && (
            <div id="files-tab-panel" className="space-y-6 font-sans animate-fade-in">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Lead Files & Attachments</h4>
                  <p className="text-xs text-gray-500">Manage PDFs, agreements, proposals, and images attached to this lead dossier.</p>
                </div>
                <LucideIcons.Paperclip className="w-5 h-5 text-gray-400" />
              </div>

              {/* Upload Dropzone Selector */}
              <div className="bg-neutral-50 rounded-2xl p-6 border border-dashed border-gray-300 flex flex-col items-center justify-center space-y-3 relative text-center">
                <input
                  type="file"
                  id="lead-file-upload-input"
                  accept=".pdf,.docx,image/*"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (files && files.length > 0 && onUploadFile) {
                      await onUploadFile(lead.id, files[0]);
                    }
                  }}
                  disabled={isUploadingFile}
                  className="hidden"
                />
                <label
                  htmlFor="lead-file-upload-input"
                  className={`px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer select-none transition-all ${isUploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUploadingFile ? (
                    <>
                      <LucideIcons.Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading chosen file...</span>
                    </>
                  ) : (
                    <>
                      <LucideIcons.UploadCloud className="w-4 h-4" />
                      <span>Choose / Upload Document</span>
                    </>
                  )}
                </label>
                <p className="text-[10px] text-gray-400 font-medium">Supports PDF, DOCX, PNG, JPG, JPEG (Max 10MB)</p>
              </div>

              {/* Attachments List */}
              <div className="space-y-3">
                {(!lead.files || lead.files.length === 0) ? (
                  <div className="text-center p-8 border border-dashed border-gray-100 rounded-2xl text-gray-400 text-xs">
                    <LucideIcons.FolderOpen className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
                    <span>No files attached yet.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {lead.files.map((file, idx) => {
                      const isImage = file.type?.startsWith('image/') || file.name.match(/\.(png|jpg|jpeg|gif)$/i);
                      const isPdf = file.type?.includes('pdf') || file.name.match(/\.pdf$/i);
                      const FileIcon = isImage 
                        ? LucideIcons.Image 
                        : isPdf 
                          ? LucideIcons.FileText 
                          : LucideIcons.FileArchive;

                      return (
                        <div key={idx} className="flex items-center justify-between p-3.5 bg-white border border-gray-150 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 border border-gray-100 rounded-xl bg-gray-50 text-indigo-600 shrink-0">
                              <FileIcon className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-gray-800 line-clamp-1">{file.name}</p>
                              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-sans">
                                <span>{(file.size / 1024).toFixed(1)} KB</span>
                                <span>•</span>
                                <span>{file.uploadedAt}</span>
                                <span>•</span>
                                <span className="font-medium text-slate-500">By {file.uploadedBy}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              referrerPolicy="no-referrer"
                              className="p-1.5 hover:bg-gray-100 text-slate-700 rounded-lg transition-colors flex items-center justify-center"
                              title="Preview or Download file"
                            >
                              <LucideIcons.ExternalLink className="w-4 h-4" />
                            </a>

                            {(currentUserRole === 'owner' || true) && (
                              <button
                                onClick={async () => {
                                  if (confirm('Are you sure you want to delete this file attachment? This operation is irreversible.')) {
                                    if (onDeleteFile) {
                                      await onDeleteFile(lead.id, idx, file.url);
                                    }
                                  }
                                }}
                                className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors flex items-center justify-center"
                                title="Delete file"
                              >
                                <LucideIcons.Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer info lock */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-[10px] text-gray-400 font-mono flex justify-between items-center">
          <span>PIPELINE CLIENT ID: {lead.id}</span>
          <span>CREATIVE ENGINE PILOT V2</span>
        </div>

      </div>
    </div>
  );
}
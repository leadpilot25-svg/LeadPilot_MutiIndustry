/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { IndustryConfig, Lead, PipelineStage } from '../types';
import * as LucideIcons from 'lucide-react';

interface PipelineBoardProps {
  config: IndustryConfig;
  leads: Lead[];
  onMoveLead: (leadId: string, targetStageId: string) => void;
  onSelectLead: (lead: Lead) => void;
  onQuickAdd: (stageId: string) => void;
  marketRegion?: 'USA' | 'IND';
}

export default function PipelineBoard({ config, leads, onMoveLead, onSelectLead, onQuickAdd, marketRegion = 'USA' }: PipelineBoardProps) {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Format currency value based on pre-defined rule (USA vs India support)
  const formatValue = (val: number) => {
    if (marketRegion === 'IND') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(val);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const triggerQuickCommunication = (lead: Lead, channel: 'call' | 'whatsapp' | 'sms' | 'email') => {
    const key = `leadpilot_templates_v2_${config.id}`;
    const saved = localStorage.getItem(key);
    
    let templateSet = {
      call: "Check status details and next steps.",
      whatsapp: "Hi {name}, regarding your inquiry, let's connect! - CRM Team",
      sms: "Hi {name}, let's catch up on your inquiry. - CRM Team",
      emailSubject: "Follow up on your inquiry",
      emailBody: "Dear {name},\n\nI would love to connect and follow up on your recent inquiry.\n\nBest regards,"
    };

    if (saved) {
      try { templateSet = { ...templateSet, ...JSON.parse(saved) }; } catch(e){}
    } else {
      const dbDefaults: any = {
        'real-estate': {
          call: "Check budget pre-approval and book showing time slots.",
          whatsapp: "Hi {name}! 🏠 I found some incredible properties matching your {value} budget in {preferredLocation}. Let me know if you would like to book a private site visit. - Apex Horizon",
          sms: "Hi {name}, regarding your search in {preferredLocation} (Budget: {value}), we have fresh listings. Let's arrange a showing today! - Apex",
          emailSubject: "Exclusive Viewings: Premium Properties in {preferredLocation}",
          emailBody: "Dear {name},\n\nFollowing up on your inquiry with Apex Horizon Estates, we have compiled an exclusive portfolio of properties matching your target neighborhood ({preferredLocation}) and budget of {value}.\n\nAre you available for a brief call to coordinate upcoming showings?\n\nBest regards,\nApex Horizon Estates Team"
        },
        'insurance': {
          call: "Complete medical risk questionnaire and clarify premium multipliers.",
          whatsapp: "Hi {name}! 🛡️ Your customized rate quote for {policyCategory} is prepared. Coverage limit: {coverageCapacity}. Let's secure your policy today. - ShieldGuard",
          sms: "Hi {name}, ShieldGuard quote for {policyCategory} is ready. Premium estimate can be locked in today! - ShieldGuard",
          emailSubject: "Your Requested Insurance Quote: {policyCategory}",
          emailBody: "Dear {name},\n\nOur underwriters have processed your request for {policyCategory}.\n\nEstimated Annual Premium: {value}\nTotal Coverage Limit: ${coverageCapacity}\n\nLet's schedule a brief 5-minute review to complete your coverage shield activation.\n\nBest regards,\nShieldGuard Underwriting Group"
        },
        'tarot-coaching': {
          call: "Conduct birth sign intuitive review and align connection oracle tools.",
          whatsapp: "Greetings seeker {name}! ✨🔮 Your birthsign is {cosmicZodiacSign} and our intuitive focus area will be {divineFocus}. Your sacred reading is prepared. - Cosmic Path",
          sms: "Greetings {name}, your intuitive intake tarot read regarding {divineFocus} is aligned. Let me know when you are ready to connect. ✨ - Cosmic Path",
          emailSubject: "Intuitive Intake: Aligning Your Tarot Reading for {divineFocus}",
          emailBody: "Greetings Seeker {name},\n\nWe are looking forward to our upcoming intuitive consultation session with you.\n\nHere are the energetic baselines aligned for your reading:\n• Divine Focus: {divineFocus}\n• Cosmic Zodiac Sign: {cosmicZodiacSign}\n• Primary Connection Oracle: {preferredTherapeuticTool}\n\nPrepare your intentions for our reading alignment today.\n\nIn cosmic light & guidance,\nCosmic Path Tarot"
        },
        'taxi': {
          call: "Confirm pickup point exit address details and chauffeur ID dispatch.",
          whatsapp: "Hello {name}, your chauffeur is dispatched for {pickupAddress} to {destinationAddress}. Vehicle category: {vehicleClass}. Safe travels! 🚕 - Metro Glide",
          sms: "Hi {name}, Metro Glide Chauffeur is confirmed. Pickup: {pickupAddress}. Quoted fare: {value}. Enjoy your ride. - Metro Glide",
          emailSubject: "Chauffeur Booking Dispatch Voucher - Metro Glide Transit",
          emailBody: "Dear {name},\n\nYour luxury dispatcher ride has been scheduled with Metro Glide:\n\n• Pickup Spot: {pickupAddress}\n• Destination Spot: {destinationAddress}\n• Vehicle Class: {vehicleClass}\n• Quoted Transit Fare: {value}\n\nYour professional chauffeur is pre-cleaning your vehicle and will meet you shortly.\n\nSafe journey,\nMetro Glide Logistics Crew"
        },
        'coaching': {
          call: "Verify leadership milestones and align strategic mindset breakthroughs.",
          whatsapp: "Hi {name}! 🚀 Your executive coaching roadmap is online. Let's tackle {primaryOutcome} under our {coachingNiche} stream. Ready to break through? - Catalyst",
          sms: "Hi {name}, prep work is complete for your {coachingNiche} review. Ready for our sync checkpoint? - Catalyst",
          emailSubject: "Strategy Roadmap: {coachingNiche} - Catalyst Coaching",
          emailBody: "Dear {name},\n\nWe are excited for our upcoming mentoring and leadership strategy review session.\n\n• Dynamic Niche: {coachingNiche}\n• Sync Cadence Frequency: {sessionFrequency}\n• Desired Breakthrough: {primaryOutcome}\n\nLet's keep your momentum soaring.\n\nSincerely,\nYour Performance Coach\nCatalyst Advisory Services"
        },
        'institution': {
          call: "Evaluate transcripts GPA benchmarks and select program semesters.",
          whatsapp: "Hello student {name}! 🏫 Academy Admissions reviewed your preference for {academicProgram} (GPA: {priorGpa}). Let's finalize your roster booking! - StemForward",
          sms: "Dear {name}, congrats on registering for {academicProgram}! Your tuition profile and enrollment checklist resides online. - StemForward",
          emailSubject: "Registration Confirmation & Placement: {academicProgram}",
          emailBody: "Dear {name},\n\nWelcome to your academic path at StemForward Tech Academy.\n\nAdmissions Registry summary:\n• Enrolled Program Strata: {academicProgram}\n• High School prior GPA: {priorGpa}\n• Dormitory Housing Request: {hasAccommodation}\n• Projected Term Tuition: {value}\n\nOur enrollment registrar will coordinate your core semesters guide shortly.\n\nCordially,\nOffice of Admissions\nStemForward Tech Academy"
        },
        'custom-crm': {
          call: "B2B discovery review with Chief Procurement Officer.",
          whatsapp: "Hi {name}, outline for {targetCompanyName} is prepared. Let's hop on a brief demo call to finalize SOW requirements of {value}! - Enterprise CRM",
          sms: "Hi {name}, custom proposal prepared for {targetCompanyName}. Let's align on contract negotiations. - Enterprise CRM",
          emailSubject: "Strategic Consultation & Service Outline for {targetCompanyName}",
          emailBody: "Dear {name},\n\nIt was a pleasure connecting with you regarding {targetCompanyName}.\n\nOur corporate planning desk has generated a project brief for your segment ({b2bSector}):\n\n• Target Client Entity: {targetCompanyName}\n• Contact Authority Persona: {contactAuthorityTitle}\n• Estimated Proposal Budget: {value}\n\nLet's coordinate a brief video call to solidify terms.\n\nKind regards,\nCorporate Business Development Team"
        }
      };
      
      if (dbDefaults[config.id]) {
        templateSet = dbDefaults[config.id];
      }
    }

    const hydrate = (templateStr: string) => {
      if (!templateStr) return '';
      let res = templateStr;
      res = res.replace(/{name}/g, lead.name || '');
      res = res.replace(/{phone}/g, lead.phone || '');
      res = res.replace(/{email}/g, lead.email || '');
      res = res.replace(/{source}/g, lead.source || '');
      res = res.replace(/{value}/g, lead.value 
        ? (marketRegion === 'IND' ? `₹${lead.value.toLocaleString('en-IN')}` : `$${lead.value.toLocaleString('en-US')}`) 
        : (marketRegion === 'IND' ? '₹0' : '$0')
      );
      
      if (lead.customFields) {
        Object.entries(lead.customFields).forEach(([key, val]) => {
          res = res.replace(new RegExp(`{${key}}`, 'g'), String(val ?? ''));
        });
      }
      return res;
    };

    let link = '';
    if (channel === 'call') {
      link = `tel:${lead.phone.replace(/[^0-9+]/g, '')}`;
    } else if (channel === 'whatsapp') {
      const sanitizedPhone = lead.phone.replace(/[^0-9]/g, '');
      link = `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(hydrate(templateSet.whatsapp))}`;
    } else if (channel === 'sms') {
      link = `sms:${lead.phone.replace(/[^0-9+]/g, '')}?&body=${encodeURIComponent(hydrate(templateSet.sms))}`;
    } else if (channel === 'email') {
      link = `mailto:${lead.email}?subject=${encodeURIComponent(hydrate(templateSet.emailSubject))}&body=${encodeURIComponent(hydrate(templateSet.emailBody))}`;
    }

    window.open(link, '_blank');
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      onMoveLead(leadId, targetStageId);
    }
    setDraggedLeadId(null);
  };

  // Get dynamic field display based on industry to show as primary detail badge on Kanban card
  const getCardSubtext = (lead: Lead) => {
    if (config.id === 'real-estate') {
      return `${lead.customFields.propertyType || ''} • 📍 ${lead.customFields.preferredLocation || ''}`;
    }
    if (config.id === 'insurance') {
      return `${lead.customFields.policyCategory || ''} • 🛡️ Limit: $${Number(lead.customFields.coverageCapacity || 0).toLocaleString()}`;
    }
    if (config.id === 'tarot-coaching') {
      return `✨ Focus: ${lead.customFields.divineFocus || ''} (${lead.customFields.cosmicZodiacSign || ''})`;
    }
    if (config.id === 'taxi') {
      return `🚖 ${lead.customFields.vehicleClass || ''} • 📍 From: ${lead.customFields.pickupAddress || ''}`;
    }
    if (config.id === 'creative-agency') {
      return `🎨 ${lead.customFields.industryType || ''} • ⚡ ${lead.customFields.engagementModel || ''}`;
    }
    return `${lead.customFields.targetCompanyName || lead.source}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4" id="pipeline-board-kanban">
      {config.stages.map((stage) => {
        const stageLeads = leads.filter((l) => l.stageId === stage.id && l.status === 'active');
        const columnSum = stageLeads.reduce((acc, curr) => acc + curr.value, 0);

        return (
          <div
            key={stage.id}
            id={`kanban-column-${stage.id}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
            className="flex-1 min-w-[250px] bg-gray-50/80 rounded-2xl border border-gray-100 p-4 transition-all duration-200 hover:bg-gray-50/100"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${stage.color.split(' ')[0]}`} />
                  <h4 className="font-semibold text-sm text-gray-800 tracking-tight">{stage.label}</h4>
                </div>
                <span className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-widest block">
                  {formatValue(columnSum)} ({stageLeads.length})
                </span>
              </div>
              <button
                id={`add-lead-btn-${stage.id}`}
                onClick={() => onQuickAdd(stage.id)}
                className="p-1 px-2 rounded-lg text-xs bg-white border border-gray-200 text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors flex items-center gap-1"
                title="Quick Add Lead to this stage"
              >
                <LucideIcons.Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Column List */}
            <div className="space-y-3 min-h-[450px]">
              {stageLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 border border-dashed border-gray-200 rounded-xl px-4 py-8 text-center text-xs text-gray-400 font-sans">
                  <LucideIcons.Compass className="w-6 h-6 mb-2 text-gray-300 stroke-1" />
                  No active {config.leadLabel.toLowerCase()}s in this stage
                </div>
              ) : (
                stageLeads.map((lead, index) => {
                  const completedTasksCount = lead.tasks.filter((t) => t.completed).length;
                  const totalTasksCount = lead.tasks.length;

                  return (
                    <div
                      key={lead.id}
                      id={`kanban-card-${lead.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onClick={() => onSelectLead(lead)}
                      className="group cursor-grab active:cursor-grabbing bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 relative"
                    >
                      {/* Drag Handle Indicator */}
                      <div className="absolute top-3 right-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <LucideIcons.SlidersHorizontal className="w-3.5 h-3.5" />
                      </div>

                      <div className="space-y-2">
                        {/* Title and Value */}
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="font-medium text-sm text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                            {lead.name}
                          </h5>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {formatValue(lead.value)}
                          </span>
                        </div>

                        {/* Custom Dynamic Content */}
                        <div className="text-xs font-sans text-gray-500 line-clamp-2">
                          {getCardSubtext(lead)}
                        </div>

                        {/* Contacts and Source badges */}
                        <div className="flex gap-1 items-center flex-wrap pt-1">
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono font-semibold">
                            {lead.source}
                          </span>
                          {lead.tasks.length > 0 && (
                            <span 
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold flex items-center gap-1 ${
                                completedTasksCount === totalTasksCount 
                                  ? 'bg-emerald-50 text-emerald-700' 
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              <LucideIcons.CheckSquare className="w-2.5 h-2.5" />
                              {completedTasksCount}/{totalTasksCount}
                            </span>
                          )}
                          {lead.notes.length > 0 && (
                            <span className="text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded font-mono font-semibold flex items-center gap-1">
                              <LucideIcons.ClipboardList className="w-2.5 h-2.5" />
                              {lead.notes.length}
                            </span>
                          )}
                        </div>

                        {/* One-Tap Communication Action Tools */}
                        <div className="flex items-center gap-1 pt-2 border-t border-gray-150 mt-1.5 justify-between" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => triggerQuickCommunication(lead, 'call')}
                            className="flex-1 p-1 rounded-sm text-[9px] font-bold bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 transition-all flex items-center justify-center gap-1"
                            title="Direct Phone Call"
                          >
                            <LucideIcons.PhoneCall className="w-2.5 h-2.5 text-amber-600" />
                            <span>Call</span>
                          </button>
                          
                          <button
                            onClick={() => triggerQuickCommunication(lead, 'whatsapp')}
                            className="flex-1 p-1 rounded-sm text-[9px] font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition-all flex items-center justify-center gap-1"
                            title="Direct WhatsApp"
                          >
                            <LucideIcons.Compass className="w-2.5 h-2.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() => triggerQuickCommunication(lead, 'sms')}
                            className="flex-1 p-1 rounded-sm text-[9px] font-bold bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 transition-all flex items-center justify-center gap-1"
                            title="Direct SMS Texter"
                          >
                            <LucideIcons.Lightbulb className="w-2.5 h-2.5 text-indigo-600" />
                            <span>SMS</span>
                          </button>

                          <button
                            onClick={() => triggerQuickCommunication(lead, 'email')}
                            className="flex-1 p-1 rounded-sm text-[9px] font-bold bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 transition-all flex items-center justify-center gap-1"
                            title="Direct Email composition"
                          >
                            <LucideIcons.Mail className="w-2.5 h-2.5 text-sky-600" />
                            <span>Mail</span>
                          </button>
                        </div>

                        {/* Hover Quick Move Actions (Extremely useful in iframe or mobile) */}
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-50 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <button
                            id={`move-left-${lead.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentIdx = config.stages.findIndex((s) => s.id === stage.id);
                              if (currentIdx > 0) {
                                onMoveLead(lead.id, config.stages[currentIdx - 1].id);
                              }
                            }}
                            disabled={config.stages.findIndex((s) => s.id === stage.id) === 0}
                            className="p-1 rounded text-gray-400 hover:text-emerald-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move back"
                          >
                            <LucideIcons.ArrowRight className="w-3.5 h-3.5 rotate-180" />
                          </button>
                          <span className="text-[10px] font-sans text-gray-400">Jump stage</span>
                          <button
                            id={`move-right-${lead.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentIdx = config.stages.findIndex((s) => s.id === stage.id);
                              if (currentIdx < config.stages.length - 1) {
                                onMoveLead(lead.id, config.stages[currentIdx + 1].id);
                              }
                            }}
                            disabled={config.stages.findIndex((s) => s.id === stage.id) === config.stages.length - 1}
                            className="p-1 rounded text-gray-400 hover:text-emerald-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move forward"
                          >
                            <LucideIcons.ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

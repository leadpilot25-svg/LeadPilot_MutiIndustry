import React, { useState, useEffect } from 'react';
import { IndustryConfig, Lead } from '../types';
import * as LucideIcons from 'lucide-react';

interface QuickCommunicationHubProps {
  config: IndustryConfig;
  lead: Lead;
  onLogInteraction?: (author: string, type: 'call' | 'whatsapp' | 'sms' | 'email', notes: string) => void;
}

interface OutreachTemplates {
  call: string;
  whatsapp: string;
  sms: string;
  emailSubject: string;
  emailBody: string;
}

const DEFAULT_TEMPLATES_BY_INDUSTRY: Record<string, OutreachTemplates> = {
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

export default function QuickCommunicationHub({ config, lead, onLogInteraction }: QuickCommunicationHubProps) {
  const [activeChannel, setActiveChannel] = useState<'call' | 'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [templates, setTemplates] = useState<OutreachTemplates>({
    call: '',
    whatsapp: '',
    sms: '',
    emailSubject: '',
    emailBody: ''
  });
  
  // Script editing mode
  const [isEditingMaster, setIsEditingMaster] = useState(false);
  const [masterTemplatesInput, setMasterTemplatesInput] = useState<OutreachTemplates | null>(null);

  // Hydrated content states (draft being sent/edited)
  const [draftSubject, setDraftSubject] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftSMS, setDraftSMS] = useState('');
  const [draftWhatsApp, setDraftWhatsApp] = useState('');
  const [draftCallNotes, setDraftCallNotes] = useState('');

  // Status logs
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const getLocalStorageKey = () => `leadpilot_templates_v2_${config.id}`;

  // Load and restore templates
  useEffect(() => {
    const rawSaved = localStorage.getItem(getLocalStorageKey());
    const defaultTemplates = DEFAULT_TEMPLATES_BY_INDUSTRY[config.id] || DEFAULT_TEMPLATES_BY_INDUSTRY['custom-crm'];
    
    if (rawSaved) {
      try {
        setTemplates(JSON.parse(rawSaved));
      } catch (e) {
        setTemplates(defaultTemplates);
      }
    } else {
      setTemplates(defaultTemplates);
    }
    setDispatchStatus(null);
  }, [config.id, lead.id]);

  // Sync draft whenever templates or lead fields change
  useEffect(() => {
    const hydrate = (templateStr: string) => {
      if (!templateStr) return '';
      let res = templateStr;
      res = res.replace(/{name}/g, lead.name || '');
      res = res.replace(/{phone}/g, lead.phone || '');
      res = res.replace(/{email}/g, lead.email || '');
      res = res.replace(/{source}/g, lead.source || '');
      res = res.replace(/{value}/g, lead.value ? `$${lead.value.toLocaleString()}` : '$0');
      
      // Hydrate custom fields
      if (lead.customFields) {
        Object.entries(lead.customFields).forEach(([key, val]) => {
          res = res.replace(new RegExp(`{${key}}`, 'g'), String(val ?? ''));
        });
      }
      return res;
    };

    setDraftSubject(hydrate(templates.emailSubject));
    setDraftBody(hydrate(templates.emailBody));
    setDraftSMS(hydrate(templates.sms));
    setDraftWhatsApp(hydrate(templates.whatsapp));
    setDraftCallNotes(hydrate(templates.call));
  }, [templates, lead]);

  const handleStartEditingMaster = () => {
    setMasterTemplatesInput({ ...templates });
    setIsEditingMaster(true);
  };

  const handleSaveMasterTemplates = () => {
    if (!masterTemplatesInput) return;
    setTemplates(masterTemplatesInput);
    localStorage.setItem(getLocalStorageKey(), JSON.stringify(masterTemplatesInput));
    setIsEditingMaster(false);
    setDispatchStatus("✔ outreach scripts saved to local client database successfully!");
    setTimeout(() => setDispatchStatus(null), 3000);
  };

  const handleResetToDefaults = () => {
    const defaultTemplates = DEFAULT_TEMPLATES_BY_INDUSTRY[config.id] || DEFAULT_TEMPLATES_BY_INDUSTRY['custom-crm'];
    setTemplates(defaultTemplates);
    localStorage.setItem(getLocalStorageKey(), JSON.stringify(defaultTemplates));
    setIsEditingMaster(false);
    setDispatchStatus("✔ Scripts reset to factory industry defaults.");
    setTimeout(() => setDispatchStatus(null), 3000);
  };

  // Launch Protocol Directives
  const handleTriggerAction = () => {
    let link = '';
    let contentToLog = '';
    
    if (activeChannel === 'call') {
      link = `tel:${lead.phone.replace(/[^0-9+]/g, '')}`;
      contentToLog = `📞 Outbound dialogue initiated. Checklist focus: ${draftCallNotes}`;
    } else if (activeChannel === 'whatsapp') {
      const sanitizedPhone = lead.phone.replace(/[^0-9]/g, '');
      link = `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(draftWhatsApp)}`;
      contentToLog = `💬 WhatsApp template dispatched: "${draftWhatsApp}"`;
    } else if (activeChannel === 'sms') {
      // Cross-platform mobile SMS protocol
      link = `sms:${lead.phone.replace(/[^0-9+]/g, '')}?&body=${encodeURIComponent(draftSMS)}`;
      contentToLog = `⚡ SMS text prompt fired: "${draftSMS}"`;
    } else if (activeChannel === 'email') {
      link = `mailto:${lead.email}?subject=${encodeURIComponent(draftSubject)}&body=${encodeURIComponent(draftBody)}`;
      contentToLog = `✉ Outreach email composed. Subject: "${draftSubject}".`;
    }

    if (onLogInteraction) {
      onLogInteraction('Advisor Agent', activeChannel, contentToLog);
    }

    setDispatchStatus(`🚀 One-Tap initiated! Launching ${activeChannel.toUpperCase()} protocol...`);
    setTimeout(() => setDispatchStatus(null), 4000);

    // Run action safely in browser context
    window.open(link, '_blank');
  };

  // Copy draft text to clipboard helper
  const handleCopyToClipboard = () => {
    const textToCopy = 
      activeChannel === 'email' ? `Subject: ${draftSubject}\n\n${draftBody}` :
      activeChannel === 'whatsapp' ? draftWhatsApp :
      activeChannel === 'sms' ? draftSMS :
      draftCallNotes;

    navigator.clipboard.writeText(textToCopy);
    setDispatchStatus("📋 Copied draft to clipboard for manual copy-pasting!");
    setTimeout(() => setDispatchStatus(null), 3000);
  };

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-5 mt-4 space-y-4" id="quick-communication-hub-widget">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
        <div>
          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded font-mono uppercase tracking-widest block w-fit">SIMULATED COMM CENTER</span>
          <h4 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
            <LucideIcons.Send className="w-4 h-4 text-emerald-600" />
            <span>One-Tap Communication Hub</span>
          </h4>
        </div>
        
        {/* Toggle master config edits */}
        <button
          onClick={isEditingMaster ? handleSaveMasterTemplates : handleStartEditingMaster}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
            isEditingMaster 
              ? 'bg-emerald-600 border-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
              : 'bg-white border-gray-200 text-gray-600 hover:text-emerald-700 hover:border-emerald-200 shadow-xs'
          }`}
        >
          <LucideIcons.Settings className="w-3.5 h-3.5" />
          <span>{isEditingMaster ? 'Save Master Scripts' : 'Edit Scripts'}</span>
        </button>
      </div>

      {dispatchStatus && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-semibold border border-emerald-100 animate-fade-in flex items-center gap-2">
          <LucideIcons.CheckCircle2 className="w-4 h-4 text-emerald-600 grow-0 shrink-0" />
          <span>{dispatchStatus}</span>
        </div>
      )}

      {/* RENDER MASTER TEMPLATE EDITOR */}
      {isEditingMaster && masterTemplatesInput ? (
        <div className="space-y-4 bg-white p-4 rounded-xl border border-indigo-100 text-xs animate-fade-in">
          <div className="flex justify-between items-center bg-indigo-50/50 p-2 text-[11px] rounded-lg text-indigo-900 font-semibold mb-2">
            <span>🔧 Customizing outreach templates for {config.name}</span>
            <button 
              onClick={handleResetToDefaults}
              className="text-[10px] bg-white border hover:bg-red-50 text-red-600 px-2 py-0.5 rounded"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Phone instructions script */}
            <div className="space-y-1">
              <label className="font-bold text-gray-500 block">📞 Verbal Checklist Goal Script:</label>
              <textarea
                value={masterTemplatesInput.call}
                onChange={(e) => setMasterTemplatesInput({...masterTemplatesInput, call: e.target.value})}
                rows={3}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>

            {/* SMS outreach script */}
            <div className="space-y-1">
              <label className="font-bold text-gray-500 block">⚡ SMS Message Script:</label>
              <textarea
                value={masterTemplatesInput.sms}
                onChange={(e) => setMasterTemplatesInput({...masterTemplatesInput, sms: e.target.value})}
                rows={3}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
              <span className="text-[10px] text-gray-400">Placeholders: {"{name}"}, {"{value}"}, {"{phone}"}</span>
            </div>

            {/* WhatsApp template */}
            <div className="space-y-1">
              <label className="font-bold text-gray-500 block">💬 WhatsApp Message Script:</label>
              <textarea
                value={masterTemplatesInput.whatsapp}
                onChange={(e) => setMasterTemplatesInput({...masterTemplatesInput, whatsapp: e.target.value})}
                rows={3}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
              <span className="text-[10px] text-gray-400">Placeholders: {"{name}"}, {"{value}"}, custom fields.</span>
            </div>

            {/* Email subject and body template */}
            <div className="space-y-1 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
              <label className="font-bold text-gray-700 block">✉ Subject & Email templates:</label>
              <input
                type="text"
                value={masterTemplatesInput.emailSubject}
                onChange={(e) => setMasterTemplatesInput({...masterTemplatesInput, emailSubject: e.target.value})}
                className="w-full p-2 mb-2 border rounded-lg focus:outline-none focus:border-indigo-500 font-bold"
                placeholder="Email Subject"
              />
              <textarea
                value={masterTemplatesInput.emailBody}
                onChange={(e) => setMasterTemplatesInput({...masterTemplatesInput, emailBody: e.target.value})}
                rows={5}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-xs"
                placeholder="Email Body Content..."
              />
            </div>

          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setIsEditingMaster(false)}
              className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold"
            >
              Cancel Edit
            </button>
            <button
              onClick={handleSaveMasterTemplates}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
            >
              Save Template Scripts
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          
          {/* Quick Outreach channel Selector buttons */}
          <div className="flex bg-white border border-gray-200 p-1.5 rounded-2xl gap-1">
            {[
              { id: 'whatsapp', label: 'WhatsApp', icon: LucideIcons.Compass, activeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
              { id: 'sms', label: 'SMS text', icon: LucideIcons.Lightbulb, activeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
              { id: 'email', label: 'E-mail draft', icon: LucideIcons.Mail, activeColor: 'bg-sky-50 text-sky-800 border-sky-200' },
              { id: 'call', label: 'Call script', icon: LucideIcons.PhoneCall, activeColor: 'bg-amber-50 text-amber-800 border-amber-200' }
            ].map((chan) => {
              const Icon = chan.icon;
              const isActive = activeChannel === chan.id;
              return (
                <button
                  key={chan.id}
                  onClick={() => {
                    setActiveChannel(chan.id as any);
                    setDispatchStatus(null);
                  }}
                  className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? `${chan.activeColor} border shadow-xs scale-102` 
                      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{chan.label}</span>
                </button>
              );
            })}
          </div>

          {/* DRAFT VIEW ZONE - Real-time editable drafted campaign */}
          <div className="bg-white rounded-xl border border-gray-250 p-4 space-y-3 shadow-xs">
            
            <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold font-mono pb-2 border-b border-gray-150">
              <span className="uppercase">Customize dispatch body for {lead.name} before sending</span>
              <span className="text-gray-500 font-bold">Channel Target: {lead.phone || lead.email}</span>
            </div>

            {/* Conditionally render editable message layouts based on selected channel */}
            {activeChannel === 'call' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[10px] text-amber-800 uppercase tracking-wider font-extrabold block">📞 Call Agenda goals:</label>
                <textarea
                  value={draftCallNotes}
                  onChange={(e) => setDraftCallNotes(e.target.value)}
                  rows={3}
                  className="w-full text-xs text-gray-800 p-2.5 bg-amber-50/20 border border-amber-100 rounded-lg focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            )}

            {activeChannel === 'whatsapp' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[10px] text-emerald-800 uppercase tracking-wider font-extrabold block">💬 WhatsApp Message Text:</label>
                <textarea
                  value={draftWhatsApp}
                  onChange={(e) => setDraftWhatsApp(e.target.value)}
                  rows={4}
                  className="w-full text-xs text-gray-800 p-2.5 bg-emerald-50/15 border border-emerald-100 rounded-lg focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
            )}

            {activeChannel === 'sms' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[10px] text-indigo-800 uppercase tracking-wider font-extrabold block">⚡ SMS text line:</label>
                <textarea
                  value={draftSMS}
                  onChange={(e) => setDraftSMS(e.target.value)}
                  rows={3}
                  className="w-full text-xs text-gray-800 p-2.5 bg-indigo-50/15 border border-indigo-100 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            )}

            {activeChannel === 'email' && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <label className="text-[10px] text-sky-800 uppercase tracking-wider font-extrabold block mb-1">✉ EMAIL SUBJECT PLANNER:</label>
                  <input
                    type="text"
                    value={draftSubject}
                    onChange={(e) => setDraftSubject(e.target.value)}
                    className="w-full text-xs text-gray-900 p-2.5 border border-sky-100 rounded-lg focus:outline-none focus:border-sky-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-sky-800 uppercase tracking-wider font-extrabold block mb-1">✉ EMAIL BODY SCRIPT:</label>
                  <textarea
                    value={draftBody}
                    onChange={(e) => setDraftBody(e.target.value)}
                    rows={6}
                    className="w-full text-xs text-gray-800 p-2.5 border border-sky-100 bg-sky-50/5 rounded-lg focus:outline-none focus:border-sky-500 font-sans leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Launch Actions strip */}
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              
              <button
                onClick={handleCopyToClipboard}
                title="Copy to clipboard for custom sharing"
                className="px-3.5 py-2 bg-white hover:bg-gray-150 border border-gray-200 text-gray-600 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
              >
                <LucideIcons.ClipboardCheck className="w-3.5 h-3.5" />
                <span>Copy Draft</span>
              </button>

              <button
                onClick={handleTriggerAction}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5 text-white ${
                  activeChannel === 'whatsapp' ? 'bg-emerald-600 hover:bg-emerald-500' :
                  activeChannel === 'sms' ? 'bg-indigo-600 hover:bg-indigo-500' :
                  activeChannel === 'email' ? 'bg-sky-600 hover:bg-sky-500' :
                  'bg-amber-500 hover:bg-amber-400 text-slate-900'
                }`}
              >
                <LucideIcons.ExternalLink className="w-3.5 h-3.5" />
                <span>
                  {activeChannel === 'call' && "Simulate Call"}
                  {activeChannel === 'whatsapp' && "One-Tap WhatsApp"}
                  {activeChannel === 'sms' && "Send SMS"}
                  {activeChannel === 'email' && "Open Mail Agent"}
                </span>
              </button>

            </div>

          </div>
          
        </div>
      )}

    </div>
  );
}

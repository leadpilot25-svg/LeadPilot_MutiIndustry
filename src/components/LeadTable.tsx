/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { IndustryConfig, Lead } from '../types';
import * as LucideIcons from 'lucide-react';

interface LeadTableProps {
  config: IndustryConfig;
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  marketRegion?: 'USA' | 'IND';
  onAddMultiLeads?: (leads: Lead[]) => void;
}

export default function LeadTable({ config, leads, onSelectLead, onDeleteLead, marketRegion = 'USA', onAddMultiLeads }: LeadTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // CSV Import States
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [rawCsvText, setRawCsvText] = useState('');
  const [csvFileError, setCsvFileError] = useState('');
  const [csvSuccessCount, setCsvSuccessCount] = useState<number | null>(null);

  // Format currency
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

  // Filter & Sort logic
  const filteredAndSortedLeads = useMemo(() => {
    let result = leads.filter((lead) => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.source.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStage = stageFilter === 'all' || lead.stageId === stageFilter;
      
      return matchesSearch && matchesStage;
    });

    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [leads, searchTerm, stageFilter, sortBy, sortOrder]);

  const handleSort = (field: 'name' | 'value' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStageLabel = (stageId: string) => {
    return config.stages.find((s) => s.id === stageId)?.label || stageId;
  };

  const getStageColor = (stageId: string) => {
    const stage = config.stages.find((s) => s.id === stageId);
    return stage ? stage.color : 'bg-gray-100 text-gray-800';
  };

  const handleParseCsv = (textToParse: string) => {
    if (!textToParse.trim()) {
      setCsvFileError('Please select a valid CSV file or paste valid CSV data lines.');
      return;
    }

    try {
      const lines = textToParse.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) {
        setCsvFileError('CSV file has no readable text records.');
        return;
      }

      let dataLines = lines;
      let headerColumns: string[] = [];

      // Check if first line is headers
      const firstLineLower = lines[0].toLowerCase();
      const hasHeaders = firstLineLower.includes('name') || firstLineLower.includes('email') || firstLineLower.includes('phone') || firstLineLower.includes('contact');
      
      if (hasHeaders) {
        // Parse headers
        headerColumns = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
        dataLines = lines.slice(1);
      }

      const stageList = config.stages.map(s => s.id);
      const defaultStage = config.stages[0]?.id || '';
      const parsedLeads: Lead[] = [];
      const today = new Date().toISOString().split('T')[0];

      dataLines.forEach((row, idx) => {
        // Handle escaped commas inside quotes
        let cols: string[] = [];
        let insideQuote = false;
        let currentField = '';

        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          if (char === '"' || char === "'") {
            insideQuote = !insideQuote;
          } else if (char === ',' && !insideQuote) {
            cols.push(currentField.trim());
            currentField = '';
          } else {
            currentField += char;
          }
        }
        cols.push(currentField.trim());

        // Remove wrapping quotes from fields
        cols = cols.map(c => c.replace(/^["']|["']$/g, ''));

        if (cols.length < 2 || !cols[0]) {
          // Skip empty or invalid names
          return;
        }

        let name = cols[0] || 'Unknown Client Name';
        let email = cols[1] || `client.${idx}@import.crm`;
        let phone = cols[2] || '+91 99999 88888';
        let valueStr = cols[3] || '50000';
        let source = cols[4] || 'Batch CSV Import';
        let stageId = cols[5] || defaultStage;

        // Strip currency symbols if modern users copied them
        const parsedValue = parseFloat(valueStr.replace(/[^0-9.-]/g, '')) || 10000;

        // Custom fields parsing
        const customFieldsObj: any = {};
        
        // Populate default values or matched CSV custom parameters
        config.customFields.forEach((field, fIdx) => {
          let customVal = cols[6 + fIdx] || '';
          if (field.type === 'select' && field.options) {
            const matched = field.options.find(opt => opt.toLowerCase() === customVal.toLowerCase()) || field.options[0];
            customFieldsObj[field.key] = matched;
          } else if (field.type === 'number') {
            customFieldsObj[field.key] = parseInt(customVal.replace(/[^0-9]/g, '')) || 0;
          } else if (field.type === 'boolean') {
            customFieldsObj[field.key] = customVal.toLowerCase() === 'true' || customVal === '1';
          } else {
            customFieldsObj[field.key] = customVal || 'General';
          }
        });

        // Map strictly if header matched
        if (hasHeaders && headerColumns.length > 0) {
          const nameIdx = headerColumns.findIndex(h => h.includes('name') || h.includes('client') || h.includes('contact'));
          if (nameIdx !== -1 && cols[nameIdx]) name = cols[nameIdx];

          const emailIdx = headerColumns.findIndex(h => h.includes('email') || h.includes('mail'));
          if (emailIdx !== -1 && cols[emailIdx]) email = cols[emailIdx];

          const phoneIdx = headerColumns.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('number'));
          if (phoneIdx !== -1 && cols[phoneIdx]) phone = cols[phoneIdx];

          const valIdx = headerColumns.findIndex(h => h.includes('value') || h.includes('budget') || h.includes('price') || h.includes('cost') || h.includes('fee'));
          if (valIdx !== -1 && cols[valIdx]) {
            const rawVal = cols[valIdx].replace(/[^0-9.-]/g, '');
            if (rawVal) {
              const numeric = parseFloat(rawVal);
              if (!isNaN(numeric)) {
                // Ensure correct conversion
              }
            }
          }
          
          const sourceIdx = headerColumns.findIndex(h => h.includes('source') || h.includes('channel') || h.includes('campaign'));
          if (sourceIdx !== -1 && cols[sourceIdx]) source = cols[sourceIdx];

          const stageIdx = headerColumns.findIndex(h => h.includes('stage') || h.includes('status'));
          if (stageIdx !== -1 && cols[stageIdx]) {
            const parsedStage = cols[stageIdx].toLowerCase().replace(/\s+/g, '_');
            const matchedStage = stageList.find(s => s === parsedStage || s.includes(parsedStage)) || defaultStage;
            stageId = matchedStage;
          }
        }

        const newId = `imported-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`;

        const parsedLead: Lead = {
          id: newId,
          name,
          email,
          phone,
          value: parsedValue,
          source,
          stageId,
          createdAt: today,
          lastContacted: today,
          status: 'active',
          customFields: customFieldsObj,
          notes: [
            { id: `note-imp-${Date.now()}-${idx}`, content: 'Acquired through bulk Batch CSV Import module.', createdAt: today, author: 'SaaS Platform Engine' }
          ],
          tasks: [
            { id: `task-imp-${Date.now()}-${idx}-1`, title: 'Verify CSV custom fields', completed: true },
            { id: `task-imp-${Date.now()}-${idx}-2`, title: 'Establish first contact strategy', completed: false }
          ]
        };

        parsedLeads.push(parsedLead);
      });

      if (parsedLeads.length === 0) {
        setCsvFileError('Could not resolve any valid rows from the provided CSV data.');
        return;
      }

      if (onAddMultiLeads) {
        onAddMultiLeads(parsedLeads);
        setCsvSuccessCount(parsedLeads.length);
        setRawCsvText('');
        setCsvFileError('');
        setTimeout(() => {
          setIsImportOpen(false);
          setCsvSuccessCount(null);
        }, 3200);
      } else {
        setCsvFileError('Platform registry error: missing active tenant sync callback.');
      }

    } catch (err: any) {
      setCsvFileError(`Parsing failed: ${err.message || 'unknown file error structure'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        handleParseCsv(text);
      }
    };
    reader.onerror = () => {
      setCsvFileError('FileReader execution error.');
    };
    reader.readAsText(file);
  };

  return (
    <div id="lead-table-component" className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Search, filters, controls bar */}
      <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
        <div className="relative flex-1 max-w-md">
          <LucideIcons.Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="table-search-input"
            type="text"
            placeholder={`Search ${config.leadLabel.toLowerCase()}s by name, email, phone...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans text-gray-800"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsImportOpen(!isImportOpen)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
              isImportOpen 
                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 border-gray-200 text-gray-700 font-bold'
            }`}
            id="table-toggle-csv-import"
          >
            <LucideIcons.FileUp className="w-4 h-4 text-emerald-600" />
            <span>Import CSV Leads</span>
          </button>

          <div className="flex items-center gap-2">
            <LucideIcons.Filter className="w-4 h-4 text-gray-400" />
            <select
              id="table-stage-filter"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-sans text-gray-700 font-semibold"
            >
              <option value="all">All Pipeline Stages</option>
              {config.stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isImportOpen && (
        <div className="p-5 border-b border-gray-100 bg-neutral-50/50 space-y-4 animate-fade-in" id="csv-import-panel">
          <div className="bg-white rounded-2xl border border-gray-250 p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <LucideIcons.Database className="w-4 h-4 text-emerald-600" />
                  <span>Batch CSV Pipeline Creator</span>
                </h4>
                <p className="text-[11px] text-gray-500 font-sans">
                  Import candidates en masse. CSV files can map headers automatically, or match raw column order: <strong className="text-slate-700">Name, Email, Phone, Budget, Campaign Source</strong>, and custom options.
                </p>
              </div>
              <button 
                onClick={() => setIsImportOpen(false)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-gray-400"
              >
                <LucideIcons.X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              
              {/* Option A: Selective File drag/drop */}
              <div className="border border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-emerald-400/80 transition-colors flex flex-col items-center justify-center space-y-2 relative min-h-[140px]" id="csv-drag-file-target">
                <LucideIcons.UploadCloud className="w-8 h-8 text-emerald-500" />
                <div className="text-xs">
                  <span className="font-bold text-slate-800">Select file from explorer</span>
                  <p className="text-[10px] text-gray-400 mt-0.5">Click below to locate a `.csv` format spreadsheet</p>
                </div>
                <input 
                  type="file" 
                  accept=".csv,text/csv" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  id="csv-file-elem"
                />
                <button className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-[11px] font-bold text-slate-700">
                  Choose CSV spreadsheet
                </button>
              </div>

              {/* Option B: Direct text paste for fast portability */}
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-700">Or paste raw text CSV records:</span>
                  <span className="text-[11px] text-gray-400 font-mono">Row-by-row comma delimited</span>
                </div>
                <textarea
                  value={rawCsvText}
                  onChange={(e) => setRawCsvText(e.target.value)}
                  placeholder="e.g.&#10;Olivia Sharma,olivia@roasters.in,+91 98200 12345,150000,Web Banner,brief_received&#10;Ethan Clark,ethan@zenithsolutions.com,(415) 304-9028,450000,Portfolio,concepts_review"
                  className="w-full h-[100px] border border-gray-200 rounded-xl p-2 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  id="csv-raw-paste-area"
                />
                <button
                  onClick={() => handleParseCsv(rawCsvText)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-550 rounded-xl text-xs font-bold text-white shadow-xs transition-transform active:scale-98"
                  id="csv-raw-process-btn"
                >
                  Parse & Inject CRM Records
                </button>
              </div>

            </div>

            {/* Error / Success Feedback Banner */}
            {csvFileError && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2 text-xs text-red-800" id="csv-error-feedback">
                <LucideIcons.AlertTriangle className="w-4 h-4 stroke-[2.2] shrink-0" />
                <span>{csvFileError}</span>
              </div>
            )}

            {csvSuccessCount !== null && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 animate-pulse" id="csv-success-feedback">
                <LucideIcons.PartyPopper className="w-4 h-4 stroke-[2.2] shrink-0" />
                <span>Success: Loaded <strong className="font-extrabold">{csvSuccessCount}</strong> parsed records into your workspace!</span>
              </div>
            )}

            {/* Schema Preview Table */}
            <div className="p-3 bg-neutral-100/50 rounded-xl border text-[10px] text-gray-500 flex justify-between gap-4 font-mono">
              <span>Expected CSV sequence: <strong className="text-slate-700">Client Name*, Email*, Phone*, Budget/Value, Source, StageId</strong></span>
              <span>*Required</span>
            </div>

          </div>
        </div>
      )}

      {/* Datatable */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" id="lead-datatable">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th 
                className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest cursor-pointer select-none font-sans"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Contact
                  {sortBy === 'name' && (
                    <LucideIcons.TrendingUp className={`w-3.5 h-3.5 text-emerald-600 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest font-sans">
                Pipeline Stage
              </th>
              
              {/* Dynamic Industry Specific Column Headers */}
              {config.id === 'real-estate' && (
                <>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest font-sans">Property Interest</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest font-sans">Neighborhood Preference</th>
                </>
              )}
              {config.id === 'insurance' && (
                <>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest font-sans">Policy Term</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest font-sans">Liability Limit</th>
                </>
              )}
              {config.id === 'tarot-coaching' && (
                <>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest font-sans">Zodiac & Divine Focus</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest font-sans">Preferred Tool</th>
                </>
              )}
              {config.id === 'taxi' && (
                <>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest font-sans">Pickup Location</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest font-sans">Vehicle Tier</th>
                </>
              )}
              {config.id === 'custom-crm' && (
                <>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest font-sans">Target Corporation</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest font-sans">Contact Executive Title</th>
                </>
              )}

              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest font-sans">
                Quick Touch
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest font-sans">
                Source
              </th>
              <th 
                className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest cursor-pointer select-none font-sans"
                onClick={() => handleSort('value')}
              >
                <div className="flex items-center gap-1">
                  {config.valueLabel}
                  {sortBy === 'value' && (
                    <LucideIcons.TrendingUp className={`w-3.5 h-3.5 text-emerald-600 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-widest font-sans">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAndSortedLeads.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400 font-sans">
                  No leads reflect your active filter settings. Try typing a different keyword!
                </td>
              </tr>
            ) : (
              filteredAndSortedLeads.map((lead) => (
                <tr 
                  key={lead.id}
                  id={`table-row-${lead.id}`}
                  onClick={() => onSelectLead(lead)}
                  className="hover:bg-gray-50/70 transition-colors duration-150 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-gray-900">{lead.name}</span>
                      <span className="text-xs font-sans text-gray-400 mt-0.5 select-all">{lead.email} • {lead.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStageColor(lead.stageId)}`}>
                      {getStageLabel(lead.stageId)}
                    </span>
                  </td>

                  {/* Dynamic Custom Fields Rendering */}
                  {config.id === 'real-estate' && (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-600 font-sans">{lead.customFields.propertyType || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-sans">{lead.customFields.preferredLocation || 'N/A'}</td>
                    </>
                  )}
                  {config.id === 'insurance' && (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-600 font-sans">{lead.customFields.policyCategory || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-sans">
                        {lead.customFields.coverageCapacity 
                          ? `$${Number(lead.customFields.coverageCapacity).toLocaleString()}` 
                          : 'N/A'}
                      </td>
                    </>
                  )}
                  {config.id === 'tarot-coaching' && (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-600 font-sans font-medium">
                        🔮 {lead.customFields.divineFocus || 'N/A'} ({lead.customFields.cosmicZodiacSign || 'N/A'})
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-sans">{lead.customFields.preferredTherapeuticTool || 'N/A'}</td>
                    </>
                  )}
                  {config.id === 'taxi' && (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-600 font-sans truncate max-w-[150px]" title={lead.customFields.pickupAddress as string}>
                        📍 {lead.customFields.pickupAddress || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-sans leading-none">
                        🚗 {lead.customFields.vehicleClass || 'N/A'}
                      </td>
                    </>
                  )}
                  {config.id === 'custom-crm' && (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-600 font-sans font-medium">{lead.customFields.targetCompanyName || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-sans text-xs italic">{lead.customFields.contactAuthorityTitle || 'N/A'}</td>
                    </>
                  )}

                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => triggerQuickCommunication(lead, 'call')}
                        className="p-1 rounded-sm text-[9px] font-bold bg-amber-50 hover:bg-amber-100 border border-amber-250 text-amber-800 transition-all flex items-center gap-0.5"
                        title="Simulate Call"
                      >
                        <LucideIcons.PhoneCall className="w-2.5 h-2.5 text-amber-600" />
                        <span>Call</span>
                      </button>
                      
                      <button
                        onClick={() => triggerQuickCommunication(lead, 'whatsapp')}
                        className="p-1 rounded-sm text-[9px] font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-800 transition-all flex items-center gap-0.5"
                        title="One-Tap WhatsApp"
                      >
                        <LucideIcons.Compass className="w-2.5 h-2.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        onClick={() => triggerQuickCommunication(lead, 'sms')}
                        className="p-1 rounded-sm text-[9px] font-bold bg-indigo-50 hover:bg-indigo-100 border border-indigo-250 text-indigo-800 transition-all flex items-center gap-0.5"
                        title="SMS Direct dispatch"
                      >
                        <LucideIcons.Lightbulb className="w-2.5 h-2.5 text-indigo-600" />
                        <span>SMS</span>
                      </button>

                      <button
                        onClick={() => triggerQuickCommunication(lead, 'email')}
                        className="p-1 rounded-sm text-[9px] font-bold bg-sky-50 hover:bg-sky-100 border border-sky-250 text-sky-800 transition-all flex items-center gap-0.5"
                        title="Draft Email outreach"
                      >
                        <LucideIcons.Mail className="w-2.5 h-2.5 text-sky-600" />
                        <span>Mail</span>
                      </button>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono font-semibold">
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-sm text-emerald-700 font-mono">
                      {formatValue(lead.value)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      id={`delete-lead-btn-${lead.id}`}
                      onClick={() => onDeleteLead(lead.id)}
                      className="p-1 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

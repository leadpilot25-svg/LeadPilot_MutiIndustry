/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { IndustryConfig, Lead } from '../types';
import * as LucideIcons from 'lucide-react';
import { getCurrencySymbol } from '../lib/currencyUtils';

interface AIPredictorProps {
  config: IndustryConfig;
  leads: Lead[];
  onAddSimulatedLead: (simulatedLead: Lead) => void;
  marketRegion?: 'USA' | 'IND' | 'EUR';
}

export default function AIPredictor({ config, leads, onAddSimulatedLead, marketRegion = 'USA' }: AIPredictorProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    qualityScore: number;
    urgencyLabel: string;
    actionPlan: string[];
    pitchHook: string;
    suggestedProductMatch: string;
  } | null>(null);

  useEffect(() => {
    // Select first lead as default when list or config changes
    if (leads.length > 0) {
      const activeForIndustry = leads.filter(l => l.status === 'active');
      if (activeForIndustry.length > 0) {
        setSelectedLeadId(activeForIndustry[0].id);
        setResult(null);
      } else {
        setSelectedLeadId('');
        setResult(null);
      }
    }
  }, [config, leads]);

  const activeLeads = leads.filter(l => l.status === 'active');
  const selectedLead = leads.find(l => l.id === selectedLeadId);

  const simulateAnalysis = () => {
    if (!selectedLead) return;
    setAnalyzing(true);
    
    // Define today's date in YYYY-MM-DD format (matches lastContacted format)
    const todayDateStr = new Date().toISOString().split('T')[0];
    
    setTimeout(() => {
      // Heuristic custom analysis specific to industry and lead customFields
      let qualityScore = 75;
      let urgencyLabel = 'Medium Urgency';
      let actionPlan: string[] = [];
      let pitchHook = '';
      let suggestedProductMatch = '';

      if (config.id === 'real-estate') {
        const isPreApproved = selectedLead.customFields.isPreApproved === 'Pre-Approved (Verified)' || selectedLead.customFields.isPreApproved === 'Self-Funded / Cash Buyer';
        qualityScore = isPreApproved ? 94 : 68;
        urgencyLabel = isPreApproved ? 'HIGH PRIORITY • Ready to Transact' : 'LOW PRIORITY • Needs mortgage nurturing';
        
        suggestedProductMatch = `${selectedLead.customFields.propertyType || 'Residential'} located in ${selectedLead.customFields.preferredLocation || 'selected suburbs'}`;
        
        actionPlan = [
          `Connect with pre-approval lending manager to verify maximum escrow liquidity.`,
          `Schedule a preview showing of the top 3 ${selectedLead.customFields.propertyType || 'listings'} within the ${selectedLead.customFields.preferredLocation || 'desired neighborhood'}.`,
          `Draft a comparative market analysis (CMA) report and email it as a PDF.`
        ];
        
        pitchHook = `"Hi ${selectedLead.name}, I just off-market scouted a gorgeous ${selectedLead.customFields.propertyType} in ${selectedLead.customFields.preferredLocation} that perfectly fits your profile. Let's do a private walk-through this Friday?"`;
      } 
      
      else if (config.id === 'insurance') {
        const coverage = Number(selectedLead.customFields.coverageCapacity || 500000);
        const symbol = getCurrencySymbol(marketRegion);
        qualityScore = coverage >= 1000000 ? 91 : 78;
        urgencyLabel = coverage >= 1000000 ? 'EXECUTIVE PRIORITY • High-Premium target' : 'STANDARD PRIORITY';
        
        suggestedProductMatch = `${selectedLead.customFields.policyCategory || 'Premium Life Policy'} with ${symbol}${coverage.toLocaleString()} coverage limit`;
        
        actionPlan = [
          `Trigger underwriting file review and run early diagnostic health ratings checklist.`,
          `Send high-limit rate comparison sheet comparing State Farm or MetLife packages.`,
          `Offer a corporate premium package discount combining multiple liability forms.`
        ];
        
        pitchHook = `"Hello ${selectedLead.name}, I've finalized a customized draft policy model for your ${selectedLead.customFields.policyCategory} covering up to ${symbol}${coverage.toLocaleString()}. We managed to squeeze an additional 12% off the standard premium rate. Can we do a quick review?"`;
      } 
      
      else if (config.id === 'tarot-coaching') {
        qualityScore = selectedLead.value >= 300 ? 95 : 80;
        urgencyLabel = selectedLead.value >= 300 ? 'DEEP SPIRITUAL CONNECTION • Mentorship path' : 'SEEKER LIGHT • Single session';
        
        suggestedProductMatch = `Divine Alignment Focus: "${selectedLead.customFields.divineFocus || 'General path'}"; Deck tool: ${selectedLead.customFields.preferredTherapeuticTool || 'Marseille'}`;
        
        actionPlan = [
          `Formulate a 90-minute Lunar Alchemy tarot reading layout customized for Zodiac ${selectedLead.customFields.cosmicZodiacSign}.`,
          `Prepare special meditation amethyst crystals and sage for their specific blockages.`,
          `Pitch the 6-Month continuing Spiritual Retainer plan post-reading to sustain their abundance.`
        ];
        
        pitchHook = `"Greetings ${selectedLead.name}, as a wise ${selectedLead.customFields.cosmicZodiacSign}, the planetary alignments indicate an intense transition ahead regarding your ${selectedLead.customFields.divineFocus}. I've prepared a highly specialized Celtic Cross reading card lineup for you."`;
      } 
      
      else if (config.id === 'taxi') {
        const symbol = marketRegion === 'IND' ? '₹' : (marketRegion === 'EUR' ? '€' : '$');
        const nameVal = selectedLead.name || 'Not Specified';
        const pickupVal = selectedLead.customFields.pickupAddress || 'Not Specified';
        const dropVal = selectedLead.customFields.destinationAddress || 'Not Specified';
        const vehicleVal = selectedLead.customFields.vehicleClass || 'Not Specified';
        const driverVal = selectedLead.customFields.driverAssigned || 'Not Specified';
        const distVal = selectedLead.customFields.distanceKm ? `${selectedLead.customFields.distanceKm} KM` : 'Not Specified';
        const dateVal = selectedLead.customFields.tripDate || 'Not Specified';
        const estFare = selectedLead.value ? `${symbol}${selectedLead.value}` : 'Not Specified';
        const actFare = selectedLead.customFields.actualFare ? `${symbol}${selectedLead.customFields.actualFare}` : 'Not Specified';

        qualityScore = selectedLead.customFields.actualFare ? 100 : 85;
        urgencyLabel = selectedLead.customFields.actualFare ? 'TRIP COMPLETED' : 'TRIP CONFIRMED • ACTIVE';
        suggestedProductMatch = `Active Dispatch Order #${selectedLead.id.substring(0, 6).toUpperCase()}`;
        
        actionPlan = [
          `Confirm route distance (${distVal}) with assigned driver ${driverVal}.`,
          `Verify drop-off location and actual fare calculations on completion.`,
          `Sync transit voucher details directly to the connected Google Spreadsheet.`
        ];

        pitchHook = `Passenger: ${nameVal}\n\nPickup:\n${pickupVal}\n\nDrop:\n${dropVal}\n\nVehicle:\n${vehicleVal}\n\nDriver:\n${driverVal}\n\nDistance:\n${distVal}\n\nTrip Date:\n${dateVal}\n\nEstimated Fare:\n${estFare}\n\nActual Fare:\n${actFare}`;
      } 
      
      else if (config.id === 'creative-agency') {
        const serviceType = selectedLead.customFields?.serviceType || 'creative services';
        const daysElapsed = Math.ceil((new Date(todayDateStr).getTime() - new Date(selectedLead.lastContacted).getTime()) / (1000 * 60 * 60 * 24));
        
        qualityScore = selectedLead.value >= 200000 ? 92 : selectedLead.value >= 100000 ? 85 : 75;
        
        // Service-specific urgency
        const serviceUrgencyMap: { [key: string]: string } = {
          'Logo Design': daysElapsed > 7 ? 'URGENT: Follow up on Logo Design proposal' : 'SCHEDULE: Design kickoff needed',
          'Web Design': daysElapsed > 5 ? 'URGENT: Website project timeline' : 'SCHEDULE: Discovery call',
          'Branding': daysElapsed > 10 ? 'OVERDUE: Brand strategy alignment' : 'SEND: Branding deck',
          'SEO': daysElapsed > 7 ? 'URGENT: SEO strategy review' : 'DISCOVERY: Market analysis needed',
          'Social Media Management': daysElapsed > 5 ? 'URGENT: Content calendar proposal' : 'CALL: Social strategy session',
          'Video Editing': daysElapsed > 4 ? 'URGENT: Post-production timeline' : 'PROPOSAL: Video edit rates',
          'Animation': daysElapsed > 7 ? 'URGENT: Animation storyboard' : 'CALL: Animation feasibility',
          'Motion Graphics': daysElapsed > 6 ? 'URGENT: Motion design timeline' : 'PROPOSAL: Design samples'
        };
        
        urgencyLabel = serviceUrgencyMap[serviceType as string] || `FOLLOW-UP: ${serviceType} discussion`;
        suggestedProductMatch = `${serviceType} for ${selectedLead.customFields?.companyName || selectedLead.name}`;
        
        actionPlan = [
          `Send proposal summary: ${serviceType} deliverables, timeline, and pricing.`,
          `Schedule discovery call to discuss project scope and client objectives.`,
          `Follow up with personalized message addressing their specific needs.`
        ];
        
        pitchHook = `Hi ${selectedLead.name}, following up on our ${serviceType.toLowerCase()} discussion. I've prepared a proposal tailored to your needs. When can we review it?`;
      }
      
      else {
        qualityScore = selectedLead.value >= 100000 ? 89 : 70;
        urgencyLabel = 'ENTERPRISE DEAL PIPELINE';
        suggestedProductMatch = `B2B Strategic proposal under category: ${selectedLead.customFields.b2bSector || 'High-Tech'}`;
        
        actionPlan = [
          `Prepare technical onboarding deck tailored for ${selectedLead.customFields.targetCompanyName}.`,
          `Book introductory Zoom with procurement executive ${selectedLead.customFields.contactAuthorityTitle || 'Lead Contact'}.`,
          `Draft standard SLA contract with detailed indemnity schedules.`
        ];
        
        pitchHook = `"Hello ${selectedLead.name}, I am following up on our conference discussion. I've mapped a scalable integration matrix specifically for ${selectedLead.customFields.targetCompanyName}."`;
      }

      setResult({
        qualityScore,
        urgencyLabel,
        actionPlan,
        pitchHook,
        suggestedProductMatch
      });
      setAnalyzing(false);
    }, 1200);
  };

  // Pre-configured simulated candidates to rapidly insert and showcase industry specific pipelines
  const insertSimulatedLead = () => {
    const listConfig: Record<string, Omit<Lead, 'id' | 'createdAt' | 'lastContacted' | 'notes' | 'tasks'>> = {
      'real-estate': {
        name: 'The Maxwell Estate Trust',
        email: 'estate.maxwell@trustees.org',
        phone: '(310) 909-4412',
        source: 'Social Media Campaign',
        value: 2850000,
        stageId: 'new_inquiry',
        status: 'active',
        customFields: {
          propertyType: 'Multi-Family Investment',
          preferredLocation: 'Beverly Crest Foothills',
          isPreApproved: 'Self-Funded / Cash Buyer'
        }
      },
      'insurance': {
        name: 'Peninsula Transport Corp',
        email: 'operations@peninsulatrans.net',
        phone: '(415) 707-1133',
        source: 'Quote Request Form',
        value: 18400,
        stageId: 'quote_requested',
        status: 'active',
        customFields: {
          policyCategory: 'Comprehensive Auto Portfolio',
          coverageCapacity: 2500000,
          currentCarrier: 'Geico Commercial'
        }
      },
      'tarot-coaching': {
        name: 'Aurelia Sage',
        email: 'aurelia@astralmanifest.com',
        phone: '(971) 330-8022',
        source: 'Podcast Free Reading Signups',
        value: 350,
        stageId: 'consult_inquired',
        status: 'active',
        customFields: {
          divineFocus: 'Career & Wealth Alignment',
          cosmicZodiacSign: 'Capricorn',
          preferredTherapeuticTool: 'Thoth Mystical Archetype'
        }
      },
      'taxi': {
        name: 'Governor Harrison',
        email: 'chiefofstaff@govoffice.state.gov',
        phone: '(518) 555-9001',
        source: 'Concierge Phone Line',
        value: 1250,
        stageId: 'ride_inquiry',
        status: 'active',
        customFields: {
          pickupAddress: 'Kochi Airport',
          destinationAddress: 'Infopark Kakkanad',
          vehicleClass: 'Sedan',
          driverAssigned: 'Rajesh',
          distanceKm: 32,
          tripDate: '2026-06-10',
          actualFare: 1350
        }
      },
      'custom-crm': {
        name: 'Synthetix Bio Robotics LLC',
        email: 'funding@synthetixbio.io',
        phone: '(617) 808-7711',
        source: 'LinkedIn Cold Inbound',
        value: 750000,
        stageId: 'prospect',
        status: 'active',
        customFields: {
          targetCompanyName: 'Synthetix Bio Labs',
          contactAuthorityTitle: 'Lead Technology Officer',
          b2bSector: 'Medical Care & Biotech'
        }
      }
    };

    const currentSeed = listConfig[config.id];
    if (!currentSeed) return;

    // Build complete Lead item
    const mockLead: Lead = {
      id: `sim-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastContacted: new Date().toISOString().split('T')[0],
      ...currentSeed,
      notes: [
        { id: `sim-note-${Date.now()}`, content: `Simulation Engine Pilot V2 generated an automatic incoming lead for ${config.name}.`, createdAt: new Date().toISOString().split('T')[0], author: 'Pilot System agent' }
      ],
      tasks: [
        { id: `sim-task-${Date.now()}`, title: `Trigger LeadPilot standard phone outreach protocol.`, completed: false }
      ]
    };

    onAddSimulatedLead(mockLead);
  };

  return (
    <div id="ai-predictor-component" className="bg-gradient-to-r from-teal-900 to-indigo-950 rounded-2xl p-6 text-white border border-indigo-900/50 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400">
              <LucideIcons.BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <h4 className="font-bold text-lg font-sans tracking-tight">LeadPilot AI Copilot</h4>
          </div>
          <p className="text-xs text-indigo-200">
            Automate diagnostics and generate high-probability conversion pitches matching local terminology.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="simulate-inbound-lead-btn"
            onClick={insertSimulatedLead}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
            title="Simulate a highly specific inbound lead for this industry category"
          >
            <LucideIcons.RefreshCw className="w-3.5 h-3.5" />
            <span>Generate Inbound {config.leadLabel}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Selector Panel */}
        <div className="lg:col-span-4 bg-slate-900/40 p-4 rounded-xl border border-indigo-900/40 space-y-4">
          <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider">
            Select candidate payload:
          </label>
          
          <select
            id="ai-lead-select"
            value={selectedLeadId}
            onChange={(e) => {
              setSelectedLeadId(e.target.value);
              setResult(null);
            }}
            className="w-full bg-indigo-950 border border-indigo-900/60 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="" disabled>-- Choose a seeker/prospect --</option>
            {activeLeads.map(lead => (
              <option key={lead.id} value={lead.id}>
                {lead.name} ({getCurrencySymbol(marketRegion)}{lead.value.toLocaleString()})
              </option>
            ))}
          </select>

          {selectedLead && (
            <div className="text-xs space-y-2 bg-slate-900/30 p-3 rounded border border-indigo-950">
              <div className="flex justify-between">
                <span className="text-indigo-400 font-medium">Channel Referror:</span>
                <span className="text-white font-semibold">{selectedLead.source}</span>
              </div>
              {config.customFields.map(field => (
                <div key={field.key} className="flex flex-col">
                  <span className="text-indigo-400 font-medium text-[10px] uppercase tracking-wider">{field.label}:</span>
                  <span className="text-white font-semibold">
                    {typeof selectedLead.customFields[field.key] === 'number'
                      ? Number(selectedLead.customFields[field.key]).toLocaleString()
                      : String(selectedLead.customFields[field.key] || 'Not Specified')}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            id="run-ai-diagnostic-btn"
            onClick={simulateAnalysis}
            disabled={!selectedLead || analyzing}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            {analyzing ? (
              <>
                <LucideIcons.RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning Metadata Parameters...</span>
              </>
            ) : (
              <>
                <LucideIcons.BrainCircuit className="w-3.5 h-3.5" />
                <span>Generate Smart Pitch hook</span>
              </>
            )}
          </button>
        </div>

        {/* Results Screen */}
        <div className="lg:col-span-8 bg-slate-950/50 rounded-xl border border-indigo-900/30 p-5 min-h-[220px] flex flex-col justify-center">
          {!result ? (
            <div className="text-center space-y-2 py-8">
              <LucideIcons.Compass className="w-10 h-10 text-indigo-500/40 mx-auto stroke-1" />
              <h5 className="font-semibold text-xs text-indigo-300">Analysis Pending</h5>
              <p className="text-xs text-indigo-200 max-w-sm mx-auto">
                Choose a candidate from the dropdown panel on the left and click "Generate Smart Pitch hook" to run the local analysis protocol.
              </p>
            </div>
          ) : (
            <div className="space-y-4 font-sans text-xs" id="ai-results-dashboard">
              {/* Score and Urgency Ribbon */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-indigo-900/30">
                <div className="space-y-1">
                  <span className="text-indigo-400 uppercase tracking-widest text-[9px] font-bold">Smart Quality Rating</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-emerald-400 font-mono">{result.qualityScore}%</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      {result.urgencyLabel}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-indigo-400 uppercase tracking-widest text-[9px] font-bold block mb-1">Inferred Product Target</span>
                  <span className="font-bold text-white bg-indigo-900/50 px-2 py-1 rounded border border-indigo-800">
                    {result.suggestedProductMatch}
                  </span>
                </div>
              </div>

              {/* Pitch Hook */}
              <div className="bg-indigo-950/40 border border-indigo-800/40 p-4 rounded-xl space-y-1">
                <span className="text-[9px] font-extrabold uppercase text-indigo-400 tracking-wider block">Suggested Pitch Hook (Ready to copy)</span>
                <p className="text-emerald-100 font-medium italic text-xs leading-relaxed">
                  {result.pitchHook}
                </p>
              </div>

              {/* Action Plan */}
              <div className="space-y-2">
                <span className="text-[9px] font-extrabold uppercase text-indigo-400 tracking-wider block">Recommended Conversion Checklist</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {result.actionPlan.map((step, idx) => (
                    <div key={idx} className="bg-slate-900/60 border border-indigo-950 p-2.5 rounded-lg flex gap-2">
                      <span className="font-bold text-indigo-400 font-mono">0{idx + 1}.</span>
                      <p className="text-indigo-200 text-[10px] leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
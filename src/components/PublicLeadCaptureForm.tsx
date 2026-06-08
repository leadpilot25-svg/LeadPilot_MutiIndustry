import React, { useState } from 'react';
import { Tenant, Lead, IndustryConfig, PipelineStage } from '../types';
import { INDUSTRY_CONFIGS } from '../constants/industries';
import * as LucideIcons from 'lucide-react';

interface PublicLeadCaptureFormProps {
  tenantId: string | boolean;
  tenants: Tenant[];
  onAddPublicLead: (tenantId: string, lead: Lead) => void;
}

export default function PublicLeadCaptureForm({ tenantId, tenants, onAddPublicLead }: PublicLeadCaptureFormProps) {
  // Gracefully render dynamic session loader if tenants profiles have not finished initializing on mount
  if (!tenants || tenants.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <LucideIcons.Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading secure workspace session...</p>
        </div>
      </div>
    );
  }

  // Resolve actual active tenant for branding
  const targetTenantId = (typeof tenantId === 'string' && tenantId !== 'true') ? tenantId : tenants[0]?.id || 't-real-estate';
  const tenant = tenants.find(t => t.id === targetTenantId) || tenants[0];
  const industry = INDUSTRY_CONFIGS.find(i => i.id === tenant.industryId) || INDUSTRY_CONFIGS[0];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [value, setValue] = useState<number | ''>('');
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  
  // Statuses
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
 
  const handleCustomFieldChange = (key: string, val: any) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [key]: val
    }));
  };
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
 
    if (!name.trim()) {
      setErrorMsg("Please provide your full name.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("Please provide your Phone Number.");
      return;
    }
 
    setIsLoading(true);
 
    try {
      // Create new inbound lead object
      const newLead: Lead = {
        id: `lead-public-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        source: 'Website',
        stageId: industry.stages[0]?.id || 'new_inquiry',
        createdAt: new Date().toISOString().split('T')[0],
        lastContacted: new Date().toISOString().split('T')[0],
        status: 'active',
        value: typeof value === 'number' ? value : 15000, // Default estimated value
        customFields: {
          ...customFieldValues
        },
        notes: [
          {
            id: `note-inbound-${Date.now()}`,
            content: `✨ Leads captured securely via dynamic Public Intake Form of ${tenant.company_name}.`,
            createdAt: new Date().toISOString().split('T')[0],
            author: 'LeadPilot Inbound Bot'
          },
          ...(message.trim() ? [{
            id: `note-msg-${Date.now()}`,
            content: `Message: ${message.trim()}`,
            createdAt: new Date().toISOString().split('T')[0],
            author: 'Lead'
          }] : [])
        ],
        tasks: [
          {
            id: `task-inbound-${Date.now()}`,
            title: `Review inbound intake details from ${name.trim()}`,
            completed: false
          }
        ]
      };
 
      // Push to corporate database
      onAddPublicLead(tenant.id, newLead);
 
      setTimeout(() => {
        setIsLoading(false);
        setIsSubmitted(true);
      }, 1000);
 
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg("Something went wrong with state persistence. Try again shortly!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-indigo-600 selection:text-white" id="public-lead-form-outer">
      
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6" id="public-form-container">
        
        {/* State 1: Submitted Success state */}
        {isSubmitted ? (
          <div className="text-center py-8 space-y-4 animate-fade-in" id="submission-success-view">
            <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <LucideIcons.CheckCircle2 className="w-8 h-8" />
            </div>
            
            <span className="text-[10px] font-bold tracking-widest text-emerald-400 font-mono uppercase bg-emerald-950/40 border border-emerald-900 px-3 py-1 rounded-full">
              SECURELY REGISTERED
            </span>
            
            <h3 className="text-2xl font-bold tracking-tight text-white mt-2">
              All set, {name}!
            </h3>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              Your inquiry has been logged instantly in the client system of <span className="text-indigo-400 font-bold">{tenant.company_name}</span>. An advisor will contact you shortly via email or phone!
            </p>

            <div className="pt-6 border-t border-slate-900/60 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setName('');
                  setEmail('');
                  setPhone('');
                  setMessage('');
                  setValue('');
                  setCustomFieldValues({});
                }}
                className="w-full px-5 py-2.5 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl text-xs font-semibold text-slate-300 transition-all border border-slate-700 cursor-pointer"
              >
                Submit another inquiry
              </button>

              <button
                onClick={() => {
                  window.location.href = window.location.origin;
                }}
                className="w-full px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 hover:text-white rounded-xl text-xs font-extrabold text-white transition-all border border-indigo-700 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LucideIcons.LayoutDashboard className="w-4 h-4 text-indigo-250" />
                <span>Go to CRM Dashboard Control Console</span>
              </button>
              
              <span className="text-[9px] text-slate-600 font-mono text-center mt-2">
                Powered securely by LeadPilot CRM Engine
              </span>
            </div>
          </div>
        ) : (
          /* State 2: Main Intake Input Form */
          <div className="space-y-6 animate-fade-in">
            
            {/* Form Header branding */}
            <div className="text-center space-y-2 pb-4 border-b border-slate-900">
              <div className="text-3xl mb-1">{tenant.logoEmoji || '💼'}</div>
              <h2 className="text-xl font-bold text-white tracking-tight">{tenant.company_name}</h2>
              <p className="text-xs text-indigo-400 font-mono tracking-wide uppercase">{industry.tagline}</p>
              <p className="text-xs text-slate-400">Please provide your details below to submit your inquiry or book-in with our team.</p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/30 border border-red-500/30 text-red-300 text-xs rounded-xl font-medium flex items-center gap-2 animate-pulse">
                <LucideIcons.AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Full Name <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <LucideIcons.User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-100 placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>

              {/* Direct Grid Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <LucideIcons.Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-100 placeholder:text-slate-600 transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Phone Number <span className="text-indigo-400">*</span>
                  </label>
                  <div className="relative">
                    <LucideIcons.Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-100 placeholder:text-slate-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Message / Message Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Message / Notes
                </label>
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter any questions or requirements..."
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 px-4 text-xs text-slate-100 placeholder:text-slate-500 transition-all focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Estimated Budget / Value */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  🎨 Estimated Budget / Value ({industry.valueLabel})
                </label>
                <div className="relative">
                  <span className="text-slate-500 absolute left-3.5 top-3 text-xs font-mono font-bold">$</span>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value ? Number(e.target.value) : '')}
                    placeholder="E.g. 50000"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-100 placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>

              {/* Dynamic industry-specific custom fields checklist */}
              <div className="space-y-4 pt-2 mt-2 border-t border-slate-900">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-indigo-400 block">
                  📋 Specific Terminology Preference Profile
                </span>
                
                <div className="space-y-3.5">
                  {industry.customFields.map((field) => {
                    return (
                      <div key={field.key} className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                          {field.label} {field.required && <span className="text-indigo-400">*</span>}
                        </label>

                        {field.type === 'select' ? (
                          <select
                            value={customFieldValues[field.key] || ''}
                            onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 px-4 text-xs text-slate-100 placeholder:text-slate-600 transition-all focus:outline-none"
                          >
                            <option value="">-- Select option --</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === 'boolean' ? (
                          <select
                            value={customFieldValues[field.key] || ''}
                            onChange={(e) => handleCustomFieldChange(field.key, e.target.value === 'true')}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 px-4 text-xs text-slate-100 placeholder:text-slate-600 transition-all focus:outline-none"
                          >
                            <option value="">-- Choose status --</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        ) : (
                          <input
                            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                            value={customFieldValues[field.key] || ''}
                            placeholder={field.placeholder || `Provide details...`}
                            onChange={(e) => handleCustomFieldChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 px-4 text-xs text-slate-100 placeholder:text-slate-600 transition-all"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl text-xs tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {isLoading ? (
                    <>
                      <LucideIcons.Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Transmitting Inquiry to Advisor...</span>
                    </>
                  ) : (
                    <>
                      <LucideIcons.Send className="w-4 h-4 text-indigo-200" />
                      <span>Submit Secure Application Form</span>
                    </>
                  )}
                </button>
              </div>

            </form>

            <div className="pt-4 border-t border-slate-900/60 text-center">
              <span className="text-[10px] text-slate-600 font-sans tracking-wide block">
                🔒 GDPR Standard Encrypted Secure Form
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

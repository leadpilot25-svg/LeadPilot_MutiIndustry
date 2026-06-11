/**
 * PublicLeadCaptureForm Component
 * Production-ready public-facing lead intake form
 * Captures leads from external sources and integrates with Firestore
 */

import React, { useState } from 'react';
import { Lead, Tenant } from '../types';
import * as LucideIcons from 'lucide-react';

interface PublicLeadCaptureFormProps {
  tenantId: string;
  tenants: Tenant[];
  onAddPublicLead: (tenantId: string, lead: Lead) => Promise<void>;
}

export default function PublicLeadCaptureForm({
  tenantId,
  tenants,
  onAddPublicLead
}: PublicLeadCaptureFormProps) {
  const activeTenant = tenants.find(t => t.id === tenantId);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'public_form',
    value: 0,
    notes: '',
    stageId: 'stage_1'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    if (formData.value < 0) {
      newErrors.value = 'Value cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'value' ? parseFloat(value) || 0 : value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const today = new Date().toISOString().split('T')[0];

      const newLead: Lead = {
        id: `public-lead-${Date.now()}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        source: 'public_form',
        sourceDisplay: 'Public Form',
        status: 'active',
        stageId: formData.stageId || 'stage_1',
        value: formData.value,
        createdAt: today,
        lastContacted: today,
        notes: formData.notes.trim() ? [
          {
            id: `note-${Date.now()}`,
            content: `Public form submission: ${formData.notes.trim()}`,
            createdAt: today,
            author: 'Public Form'
          }
        ] : [],
        tasks: [
          {
            id: `task-${Date.now()}-1`,
            title: 'Follow up with public form lead',
            completed: false
          }
        ],
        files: [],
        customFields: {
          nextFollowUpDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          followUpStage: 1
        },
        assignedTo: '',
        assignedToName: ''
      };

      await onAddPublicLead(tenantId, newLead);

      setSuccessMessage('✅ Thank you! Your inquiry has been received. We will contact you soon.');

      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'public_form',
        value: 0,
        notes: '',
        stageId: 'stage_1'
      });

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      console.error('Failed to submit public lead:', err);
      setErrors({
        submit: `Failed to submit form. Please try again. ${err instanceof Error ? err.message : ''}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeTenant) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="p-3 bg-red-100 text-red-600 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
          <LucideIcons.AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-950">Invalid Workspace</h4>
        <p className="text-xs text-slate-500">Unable to load the capture form. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 font-sans">
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">{activeTenant.logoEmoji}</span>
          <h1 className="text-xl font-bold text-slate-900">{activeTenant.company_name}</h1>
        </div>
        <p className="text-xs text-slate-500">Get in touch with us - we'll respond within 24 hours</p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <p className="text-sm text-emerald-900 font-medium">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-sm text-red-900 font-medium">{errors.submit}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="John Smith"
            className={`w-full text-sm border rounded-xl px-4 py-3 focus:outline-none transition-colors ${
              errors.name
                ? 'border-red-300 bg-red-50 focus:border-red-500'
                : 'border-slate-200 bg-white focus:border-indigo-500'
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
              <LucideIcons.AlertCircle className="w-3 h-3" />
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john@example.com"
            className={`w-full text-sm border rounded-xl px-4 py-3 focus:outline-none transition-colors ${
              errors.email
                ? 'border-red-300 bg-red-50 focus:border-red-500'
                : 'border-slate-200 bg-white focus:border-indigo-500'
            }`}
          />
          {errors.email && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
              <LucideIcons.AlertCircle className="w-3 h-3" />
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 123-4567"
            className={`w-full text-sm border rounded-xl px-4 py-3 focus:outline-none transition-colors ${
              errors.phone
                ? 'border-red-300 bg-red-50 focus:border-red-500'
                : 'border-slate-200 bg-white focus:border-indigo-500'
            }`}
          />
          {errors.phone && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
              <LucideIcons.AlertCircle className="w-3 h-3" />
              {errors.phone}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">Company</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            placeholder="Your Company Inc."
            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">Message</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Tell us more about your inquiry..."
            rows={4}
            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-white resize-none font-sans"
          />
          <p className="text-[10px] text-slate-500">
            {formData.notes.length}/500 characters
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">Estimated Value (Optional)</label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-600">$</span>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="100"
              className={`flex-1 text-sm border rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                errors.value
                  ? 'border-red-300 bg-red-50 focus:border-red-500'
                  : 'border-slate-200 bg-white focus:border-indigo-500'
              }`}
            />
          </div>
          {errors.value && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
              <LucideIcons.AlertCircle className="w-3 h-3" />
              {errors.value}
            </p>
          )}
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-[11px] text-slate-600 leading-relaxed">
            We respect your privacy. Your information will be used solely to respond to your inquiry and provide our services. We will never share your data with third parties.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <LucideIcons.Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <LucideIcons.Send className="w-4 h-4" />
              <span>Send My Inquiry</span>
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-slate-500">
          Or reach out directly at{' '}
          <a
            href={`mailto:contact@leadpilot.co`}
            className="text-indigo-600 hover:underline font-medium"
          >
            contact@leadpilot.co
          </a>
        </p>
      </form>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
        <div className="text-center">
          <p className="text-lg font-bold text-indigo-600">24hrs</p>
          <p className="text-[10px] text-slate-500">Response Time</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-600">100%</p>
          <p className="text-[10px] text-slate-500">Confidential</p>
        </div>
      </div>
    </div>
  );
}
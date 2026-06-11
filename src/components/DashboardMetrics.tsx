/**
 * DashboardMetrics Component
 * Displays KPI cards with clickable filters for the dashboard
 * All import paths corrected for src/components/ location
 */

import React, { useMemo } from 'react';
import { IndustryConfig, Lead } from '../types';
import { INDUSTRY_CONFIGS } from '../constants/industries';
import * as LucideIcons from 'lucide-react';

interface DashboardMetricsProps {
  config: IndustryConfig;
  leads: Lead[];
  onMetricClick: (filter: string) => void;
  onViewChange?: (view: 'kanban' | 'table') => void;
}

export default function DashboardMetrics({
  config,
  leads,
  onMetricClick,
  onViewChange
}: DashboardMetricsProps) {
  // Calculate metrics from leads
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    const totalLeads = leads.length;
    const activeLeads = leads.filter(l => l.status === 'active').length;
    const wonDeals = leads.filter(l => l.status === 'won').length;
    const lostLeads = leads.filter(l => l.status === 'lost').length;
    
    const missedFollowups = leads.filter(lead => {
      const nextFollowUp = lead.customFields?.nextFollowUpDate;
      return nextFollowUp && nextFollowUp < today;
    }).length;
    
    const todayFollowups = leads.filter(lead => {
      const nextFollowUp = lead.customFields?.nextFollowUpDate;
      return nextFollowUp && nextFollowUp === today;
    }).length;
    
    const meetingsToday = leads.filter(lead => {
      const nextFollowUp = lead.customFields?.nextFollowUpDate;
      return nextFollowUp && nextFollowUp === today && lead.status === 'active';
    }).length;
    
    const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);
    const activeValue = leads
      .filter(l => l.status === 'active')
      .reduce((sum, lead) => sum + (lead.value || 0), 0);
    const wonValue = leads
      .filter(l => l.status === 'won')
      .reduce((sum, lead) => sum + (lead.value || 0), 0);

    return {
      totalLeads,
      activeLeads,
      wonDeals,
      lostLeads,
      missedFollowups,
      todayFollowups,
      meetingsToday,
      totalValue,
      activeValue,
      wonValue
    };
  }, [leads]);

  const conversionRate = metrics.totalLeads > 0
    ? ((metrics.wonDeals / metrics.totalLeads) * 100).toFixed(1)
    : '0';

  const avgDealValue = metrics.wonDeals > 0
    ? (metrics.wonValue / metrics.wonDeals).toFixed(0)
    : '0';

  // KPI Cards Configuration
  const kpiCards = [
    {
      id: 'total-leads',
      icon: LucideIcons.Users,
      label: 'Total Leads',
      value: metrics.totalLeads.toString(),
      subtext: `${metrics.activeLeads} active`,
      color: 'indigo',
      action: 'all',
      description: 'All leads in pipeline'
    },
    {
      id: 'closed-deals',
      icon: LucideIcons.TrendingUp,
      label: 'Closed Deals',
      value: metrics.wonDeals.toString(),
      subtext: `$${(metrics.wonValue / 1000).toFixed(0)}k value`,
      color: 'emerald',
      action: 'closed_deals',
      description: 'Leads with won status'
    },
    {
      id: 'conversion-rate',
      icon: LucideIcons.Target,
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      subtext: `${metrics.totalLeads} total`,
      color: 'blue',
      action: 'closed_deals',
      description: 'Won / Total ratio'
    },
    {
      id: 'missed-followups',
      icon: LucideIcons.AlertCircle,
      label: 'Overdue Tasks',
      value: metrics.missedFollowups.toString(),
      subtext: 'Need attention',
      color: 'amber',
      action: 'missed_followups',
      description: 'Past due follow-ups'
    },
    {
      id: 'today-followups',
      icon: LucideIcons.Clock,
      label: "Today's Tasks",
      value: metrics.todayFollowups.toString(),
      subtext: `${metrics.meetingsToday} meetings`,
      color: 'violet',
      action: 'today_followups',
      description: 'Due today'
    },
    {
      id: 'avg-deal-value',
      icon: LucideIcons.DollarSign,
      label: 'Avg Deal Value',
      value: `$${avgDealValue}`,
      subtext: `${metrics.wonDeals} deals`,
      color: 'rose',
      action: 'closed_deals',
      description: 'Won deals average'
    },
    {
      id: 'active-leads',
      icon: LucideIcons.Zap,
      label: 'Active Pipeline',
      value: `$${(metrics.activeValue / 1000).toFixed(0)}k`,
      subtext: `${metrics.activeLeads} leads`,
      color: 'cyan',
      action: 'open',
      description: 'Active deal value'
    },
    {
      id: 'pipeline-health',
      icon: LucideIcons.Activity,
      label: 'Pipeline Health',
      value: metrics.activeLeads > 0 ? 'Good' : 'Low',
      subtext: `${metrics.lostLeads} lost`,
      color: config.id === 'real-estate' ? 'lime' : 'fuchsia',
      action: 'open',
      description: 'Overall status'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      indigo: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        border: 'border-indigo-150',
        hover: 'hover:bg-indigo-100 hover:border-indigo-200'
      },
      emerald: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-150',
        hover: 'hover:bg-emerald-100 hover:border-emerald-200'
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-150',
        hover: 'hover:bg-blue-100 hover:border-blue-200'
      },
      amber: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-150',
        hover: 'hover:bg-amber-100 hover:border-amber-200'
      },
      violet: {
        bg: 'bg-violet-50',
        text: 'text-violet-600',
        border: 'border-violet-150',
        hover: 'hover:bg-violet-100 hover:border-violet-200'
      },
      rose: {
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        border: 'border-rose-150',
        hover: 'hover:bg-rose-100 hover:border-rose-200'
      },
      cyan: {
        bg: 'bg-cyan-50',
        text: 'text-cyan-600',
        border: 'border-cyan-150',
        hover: 'hover:bg-cyan-100 hover:border-cyan-200'
      },
      lime: {
        bg: 'bg-lime-50',
        text: 'text-lime-600',
        border: 'border-lime-150',
        hover: 'hover:bg-lime-100 hover:border-lime-200'
      },
      fuchsia: {
        bg: 'bg-fuchsia-50',
        text: 'text-fuchsia-600',
        border: 'border-fuchsia-150',
        hover: 'hover:bg-fuchsia-100 hover:border-fuchsia-200'
      }
    };
    return colorMap[color] || colorMap.indigo;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Key Performance Indicators</h3>
          <p className="text-xs text-slate-500 mt-1">Click any card to filter leads by metric</p>
        </div>
        {onViewChange && (
          <div className="flex gap-2">
            <button
              onClick={() => onViewChange('kanban')}
              className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <LucideIcons.Layout className="w-4 h-4 inline mr-1" />
              Board
            </button>
            <button
              onClick={() => onViewChange('table')}
              className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <LucideIcons.List className="w-4 h-4 inline mr-1" />
              Table
            </button>
          </div>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const IconComponent = card.icon;
          const colors = getColorClasses(card.color);

          return (
            <button
              key={card.id}
              onClick={() => onMetricClick(card.action)}
              className={`p-5 rounded-2xl border-2 transition-all text-left group cursor-pointer ${colors.bg} ${colors.border} ${colors.hover}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${colors.bg} group-hover:scale-110 transition-transform`}>
                  <IconComponent className={`w-5 h-5 ${colors.text}`} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  CLICK
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-600 mb-1">{card.label}</h4>
              <p className={`text-2xl font-black ${colors.text} mb-1`}>{card.value}</p>
              <p className="text-[11px] text-slate-500">{card.subtext}</p>
              <p className="text-[10px] text-slate-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {card.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Total Pipeline Value</span>
          <span className="text-xl font-bold text-slate-900">${(metrics.totalValue / 1000).toFixed(0)}k</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Win Rate</span>
          <span className="text-xl font-bold text-emerald-600">{conversionRate}%</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Active Opportunities</span>
          <span className="text-xl font-bold text-indigo-600">{metrics.activeLeads}</span>
        </div>
      </div>
    </div>
  );
}
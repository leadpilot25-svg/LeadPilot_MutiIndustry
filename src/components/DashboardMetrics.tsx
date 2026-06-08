/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { IndustryConfig, Lead } from '../types';
import * as LucideIcons from 'lucide-react';

interface DashboardMetricsProps {
  config: IndustryConfig;
  leads: Lead[];
}

export default function DashboardMetrics({ config, leads }: DashboardMetricsProps) {
  const activeLeads = leads.filter(l => l.status === 'active');
  const wonLeads = leads.filter(l => l.status === 'won' || l.stageId === 'policy_active');

  const calculateMetricValue = (metric: IndustryConfig['metrics'][0]) => {
    if (metric.type === 'count') {
      if (metric.key === 'under_contract_count') {
        return leads.filter(l => l.stageId === 'under_contract' || l.stageId === 'closed').length;
      }
      if (metric.key === 'mentors_retained') {
        return leads.filter(l => l.stageId === 'mentorship_upgrade').length;
      }
      if (metric.key === 'completed_trips') {
        return leads.filter(l => l.stageId === 'trip_completed').length;
      }
      return activeLeads.length;
    }

    const field = metric.sourceField || 'value';
    
    // Extract values
    const values = leads.map(l => {
      if (field === 'value') return l.value;
      const customVal = l.customFields[field];
      return typeof customVal === 'number' ? customVal : parseFloat(customVal as string) || 0;
    });

    if (metric.type === 'sum') {
      const sum = values.reduce((acc, curr) => acc + curr, 0);
      return sum;
    }

    if (metric.type === 'average') {
      if (values.length === 0) return 0;
      const sum = values.reduce((acc, curr) => acc + curr, 0);
      return Math.round(sum / values.length);
    }

    return 0;
  };

  const formatNumber = (num: number, prefix = '', suffix = '') => {
    if (num >= 1000000) {
      return `${prefix}${(num / 1000000).toFixed(1)}M${suffix}`;
    }
    if (num >= 1000) {
      return `${prefix}${(num / 1000).toFixed(0)}k${suffix}`;
    }
    return `${prefix}${num}${suffix}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-metrics-container">
      {config.metrics.map((metric) => {
        const val = calculateMetricValue(metric);
        const displayVal = typeof val === 'number' 
          ? formatNumber(val, metric.prefix || '', metric.suffix || '')
          : val;

        // Choose icon dynamically based on the metric key
        let IconComponent = LucideIcons.TrendingUp;
        if (metric.key.includes('total') || metric.key.includes('pipeline') || metric.key.includes('premium')) {
          IconComponent = LucideIcons.DollarSign;
        } else if (metric.key.includes('count') || metric.key.includes('leads') || metric.key.includes('trips')) {
          IconComponent = LucideIcons.Users2 || LucideIcons.ClipboardList;
        } else if (metric.key.includes('size') || metric.key.includes('avg')) {
          IconComponent = LucideIcons.Sparkles;
        }

        return (
          <div 
            key={metric.key} 
            id={`metric-card-${metric.key}`}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group"
          >
            {/* Subtle corner highlight of active industry color */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-8 -mt-8 -z-10 group-hover:scale-110 transition-transform duration-300" />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{metric.label}</span>
                <h3 className="text-3xl font-bold font-sans tracking-tight text-gray-900 group-hover:text-emerald-700 transition-colors duration-200">
                  {displayVal}
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                {/* Fallback to Generic Icon if not exist */}
                {IconComponent ? <IconComponent className="w-6 h-6" /> : <LucideIcons.TrendingUp className="w-6 h-6" />}
              </div>
            </div>
            
            <p className="mt-4 text-xs text-gray-500 leading-relaxed font-sans">
              {metric.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

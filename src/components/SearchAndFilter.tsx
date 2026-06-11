/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SearchAndFilter Component - LeadPilot CRM
 * Integrates with App.tsx dashboardFilter state
 * Supports: Name, Email, Phone search + Status/Follow-up filters
 */

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dashboardFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function SearchAndFilter({
  searchQuery,
  onSearchChange,
  dashboardFilter,
  onFilterChange,
}: SearchAndFilterProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'name' | 'email' | 'phone' | 'company'>('all');

  // Dashboard filter options matching your App.tsx logic
  const dashboardFilters = [
    { id: 'all', label: 'All Leads', icon: LucideIcons.Filter, color: 'indigo' },
    { id: 'open', label: 'Open', icon: LucideIcons.AlertCircle, color: 'blue' },
    { id: 'closed', label: 'Closed', icon: LucideIcons.CheckCircle, color: 'green' },
    { id: 'today', label: 'Created Today', icon: LucideIcons.Calendar, color: 'purple' },
  ];

  // Follow-up specific filters
  const followUpFilters = [
    { id: 'today_followups', label: 'Upcoming Today', icon: LucideIcons.Clock },
    { id: 'missed_followups', label: 'Overdue', icon: LucideIcons.AlertTriangle },
    { id: 'meetings_today', label: 'Meetings Today', icon: LucideIcons.Users },
    { id: 'closed_deals', label: 'Closed Deals', icon: LucideIcons.Trophy },
  ];

  const getSearchPlaceholder = (): string => {
    switch (searchType) {
      case 'name':
        return 'Search by lead name...';
      case 'email':
        return 'Search by email address...';
      case 'phone':
        return 'Search by phone number...';
      case 'company':
        return 'Search by company name...';
      default:
        return 'Search by name, email, phone...';
    }
  };

  const getSearchIcon = () => {
    switch (searchType) {
      case 'name':
        return LucideIcons.User;
      case 'email':
        return LucideIcons.Mail;
      case 'phone':
        return LucideIcons.Phone;
      case 'company':
        return LucideIcons.Building;
      default:
        return LucideIcons.Search;
    }
  };

  const SearchIcon = getSearchIcon();

  const getFilterColor = (filterId: string): string => {
    const filterObj = dashboardFilters.find(f => f.id === filterId);
    if (!filterObj) return '';

    const isActive = dashboardFilter === filterId;
    switch (filterObj.color) {
      case 'blue':
        return isActive ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'green':
        return isActive ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 border border-green-200';
      case 'purple':
        return isActive ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'indigo':
      default:
        return isActive ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-200';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 md:px-6 py-4 space-y-4">
        {/* Main Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={getSearchPlaceholder()}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-colors text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Clear search"
                >
                  <LucideIcons.X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Search Type & Advanced Toggle */}
          <div className="flex gap-2 flex-shrink-0">
            <select
              value={searchType}
              onChange={e => setSearchType(e.target.value as any)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-colors bg-white font-medium"
              title="Search field type"
            >
              <option value="all">All Fields</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="company">Company</option>
            </select>

            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                isAdvancedOpen
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
              title="Toggle advanced filters"
            >
              <LucideIcons.SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Filters</span>
            </button>
          </div>
        </div>

        {/* Status Filter Buttons - Always Visible */}
        <div className="flex gap-2 flex-wrap">
          {dashboardFilters.map(filter => {
            const Icon = filter.icon;
            const isActive = dashboardFilter === filter.id;

            return (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full font-medium transition-all text-sm whitespace-nowrap ${getFilterColor(
                  filter.id
                )}`}
                title={filter.label}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden xs:inline">{filter.label}</span>
                <span className="xs:hidden">{filter.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Advanced Follow-Up Filters */}
        {isAdvancedOpen && (
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <LucideIcons.Clock className="w-4 h-4 text-indigo-600" />
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Follow-Up Status</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {followUpFilters.map(filter => {
                  const Icon = filter.icon;
                  const isActive = dashboardFilter === filter.id;

                  return (
                    <button
                      key={filter.id}
                      onClick={() => {
                        onFilterChange(filter.id);
                      }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white border border-gray-300 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                      }`}
                      title={filter.label}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{filter.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <LucideIcons.Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900">
                <p className="font-semibold mb-1">💡 Pro Tip:</p>
                <p>
                  Combine search + filters. Example: Search "john@email.com" and select "Overdue" to find all overdue follow-ups
                  for John.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active Search Summary */}
        {(searchQuery || dashboardFilter !== 'all') && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs text-blue-900 font-medium">
              {searchQuery && (
                <span>
                  🔍 Searching: <span className="font-bold">"{searchQuery}"</span>
                  {dashboardFilter !== 'all' &&
                    ` • Filter: ${dashboardFilters.find(f => f.id === dashboardFilter)?.label}`}
                </span>
              )}
              {!searchQuery && dashboardFilter !== 'all' && (
                <span>
                  📊 Filter: <span className="font-bold">{dashboardFilters.find(f => f.id === dashboardFilter)?.label}</span>
                </span>
              )}
            </div>
            <button
              onClick={() => {
                onSearchChange('');
                onFilterChange('all');
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded hover:bg-blue-100 transition-colors"
            >
              ✕ Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
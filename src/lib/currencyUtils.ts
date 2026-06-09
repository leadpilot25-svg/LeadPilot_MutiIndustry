/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Get currency symbol based on region
 * @param region - Market region: 'IND' | 'USA' | 'EUR'
 * @returns Currency symbol string
 */
export function getCurrencySymbol(region?: 'USA' | 'IND' | 'EUR'): string {
  const r = region || 'USA';
  
  switch (r) {
    case 'IND':
      return '₹';
    case 'EUR':
      return '€';
    case 'USA':
    default:
      return '$';
  }
}

/**
 * Format currency value with proper localization
 * Uses Intl.NumberFormat for locale-specific formatting
 * @param value - Numeric value to format
 * @param region - Market region: 'IND' | 'USA' | 'EUR'
 * @returns Fully formatted currency string (e.g., "₹1,250")
 */
export function formatCurrencyValue(
  value: number,
  region?: 'USA' | 'IND' | 'EUR'
): string {
  const r = region || 'USA';

  if (r === 'IND') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }

  if (r === 'EUR') {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format currency value with symbol and locale-specific thousands separator
 * @param value - Numeric value to format
 * @param region - Market region: 'IND' | 'USA' | 'EUR'
 * @returns Currency string with symbol (e.g., "₹1,250" or "$1,250" or "€1,250")
 */
export function formatCurrencyWithSymbol(
  value: number,
  region?: 'USA' | 'IND' | 'EUR'
): string {
  const symbol = getCurrencySymbol(region);
  const r = region || 'USA';

  if (r === 'IND') {
    return `${symbol}${value.toLocaleString('en-IN')}`;
  }
  if (r === 'EUR') {
    return `${symbol}${value.toLocaleString('de-DE')}`;
  }
  return `${symbol}${value.toLocaleString('en-US')}`;
}

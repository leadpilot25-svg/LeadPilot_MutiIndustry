/**
 * LogoPlaceholder Component
 * 
 * Reusable logo placeholder for LeadPilot branding.
 * Reserves a 120x40px area for future logo insertion.
 * Can be replaced with PNG, SVG, or transparent logos without code changes.
 */

import React from 'react';

interface LogoPlaceholderProps {
  width?: number;
  height?: number;
  className?: string;
  showLabel?: boolean;
}

export const LogoPlaceholder: React.FC<LogoPlaceholderProps> = ({
  width = 120,
  height = 40,
  className = '',
  showLabel = true,
}) => {
  return (
    <div
      className={`flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg transition-colors hover:border-slate-400 ${className}`}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        minWidth: `${width}px`,
        minHeight: `${height}px`,
      }}
      title="Logo Placeholder - Replace with LeadPilot logo (PNG/SVG/transparent)"
    >
      {showLabel && (
        <div className="text-center">
          <svg
            width={Math.min(width * 0.5, 30)}
            height={Math.min(height * 0.5, 20)}
            viewBox="0 0 100 100"
            className="text-slate-400 mx-auto mb-1"
            fill="currentColor"
          >
            <rect x="10" y="10" width="80" height="80" rx="8" opacity="0.3" />
            <circle cx="50" cy="35" r="12" opacity="0.3" />
            <rect x="15" y="55" width="70" height="8" rx="4" opacity="0.3" />
          </svg>
          <div className="text-[8px] text-slate-500 font-medium">Logo</div>
        </div>
      )}
    </div>
  );
};

export default LogoPlaceholder;

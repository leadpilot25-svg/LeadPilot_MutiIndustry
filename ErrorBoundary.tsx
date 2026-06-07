/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

// React error boundaries must be class components — there is no hook equivalent.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class ErrorBoundary extends React.Component<any, any> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    (this as any).state = { hasError: false, error: null } as ErrorBoundaryState;
    this.handleReload = this.handleReload.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('LeadPilot uncaught error:', error, info.componentStack);
  }

  handleReload() {
    window.location.reload();
  }

  render() {
    const s = (this as any).state as ErrorBoundaryState;
    const p = (this as any).props as ErrorBoundaryProps;

    if (s.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div className="mx-auto w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-white text-lg font-bold tracking-tight">Something went wrong</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">
                An unexpected error occurred. Your data is safe — this is a display issue only.
              </p>
            </div>
            {s.error && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-left">
                <p className="text-red-400 font-mono text-[10px] break-all leading-relaxed">
                  {s.error.message}
                </p>
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return p.children;
  }
}

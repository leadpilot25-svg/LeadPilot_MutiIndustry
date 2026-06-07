/**
 * Env Utility for Environment Detection and Demo Mode Lockdown.
 */

export function isIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true; // standard security restriction indicating iframe isolation
  }
}

export function isDevOrPreviewDomain(): boolean {
  try {
    const host = window.location.hostname;
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.includes('ais-dev-') ||
      host.includes('ais-pre-') ||
      host.includes('.run.app') ||
      host.includes('web-studio') ||
      host.includes('aistudio')
    );
  } catch (e) {
    return false;
  }
}

export function isDemoSandboxAllowed(): boolean {
  // Respect the explicit VITE_DEMO_MODE flag first
  const flag = (import.meta as any).env.VITE_DEMO_MODE;
  if (flag === 'true') {
    return true;
  }
  if (flag === 'false') {
    return false;
  }

  // Fallback to active sandbox, iframe, or developer preview subdomains
  return isIframe() || isDevOrPreviewDomain();
}

export function isProduction(): boolean {
  // Production is defined as NOT allowing Demo Sandbox.
  return !isDemoSandboxAllowed();
}

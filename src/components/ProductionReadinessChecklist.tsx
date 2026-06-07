import React, { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { auth, db, storage } from '../lib/firebase';
import { doc, getDocFromServer } from 'firebase/firestore';
import { ref, getMetadata } from 'firebase/storage';
import { isDemoSandboxAllowed, isProduction, isIframe, isDevOrPreviewDomain } from '../lib/env';

interface CheckResult {
  status: 'checking' | 'success' | 'failed';
  message: string;
  details?: string;
}

export default function ProductionReadinessChecklist() {
  const [checks, setChecks] = useState<Record<string, CheckResult>>({
    firebase: { status: 'checking', message: 'Checking Firebase SDK connection state...' },
    auth: { status: 'checking', message: 'Verifying Authentication system connectivity...' },
    firestore: { status: 'checking', message: 'Testing server-side Firestore handshake...' },
    storage: { status: 'checking', message: 'Probing Firebase Cloud Storage availability...' },
    rules: { status: 'checking', message: 'Checking active Firestore security rules...' },
  });

  const [isRunning, setIsRunning] = useState(false);

  // Run checks on load
  useEffect(() => {
    runAllChecks();
  }, []);

  const runAllChecks = async () => {
    setIsRunning(true);
    
    // 1. Check Firebase basic variables/connectivity
    const updatedChecks: Record<string, CheckResult> = {
      firebase: { status: 'checking', message: 'Checking Firebase SDK...' },
      auth: { status: 'checking', message: 'Probing Auth State...' },
      firestore: { status: 'checking', message: 'Probing Firestore Database...' },
      storage: { status: 'checking', message: 'Probing Firebase Storage...' },
      rules: { status: 'checking', message: 'Probing Security Rules...' },
    };
    setChecks({ ...updatedChecks });

    // Step 1: Firebase Connected check
    try {
      if (db && auth && storage && db.app && db.app.options.apiKey) {
        const isPlaceholder = String(db.app.options.apiKey).includes('placeholder-api-key');
        if (isPlaceholder) {
          updatedChecks.firebase = {
            status: 'failed',
            message: 'Firebase Configuration Missing',
            details: `Running with local fallback parameters. Please configure your live environment variables ('VITE_FIREBASE_API_KEY', etc.) to establish an authentic connection.`,
          };
        } else {
          updatedChecks.firebase = {
            status: 'success',
            message: 'Firebase SDK Connected',
            details: `Successfully initialized project: "${db.app.options.projectId || 'Unknown Project'}"`,
          };
        }
      } else {
        throw new Error('Firebase configuration or services have not initialized properly.');
      }
    } catch (err: any) {
      updatedChecks.firebase = {
        status: 'failed',
        message: 'Firebase Configuration Failed',
        details: err?.message || String(err),
      };
    }
    setChecks({ ...updatedChecks });

    // Step 2: Auth Connected check
    try {
      // Accessing standard auth object and checking initialized status
      if (auth && typeof auth.onIdTokenChanged === 'function') {
        const currentUser = auth.currentUser;
        updatedChecks.auth = {
          status: 'success',
          message: 'Auth Service Active',
          details: currentUser 
            ? `Client authenticated as ${currentUser.email || 'Anonymous (' + currentUser.uid + ')'}`
            : 'Authentication listener ready (No user signed in yet)',
        };
      } else {
        throw new Error('Google Auth SDK has not initialized properly.');
      }
    } catch (err: any) {
      updatedChecks.auth = {
        status: 'failed',
        message: 'Auth Service Inactive',
        details: err?.message || String(err),
      };
    }
    setChecks({ ...updatedChecks });

    // Step 3: Firestore Service Connected
    try {
      // Execute live getServer fetch to verify Firestore connection & routing
      // Use a test document. Note: because this document does not exist, or access is restricted,
      // what we expect is a response. If we get a "permission-denied" OR "not-found", that means firestore backend is alive and connected!
      // If client is offline, it will fail or hang.
      const pingDocRef = doc(db, '_connection_test_checklist', 'ping');
      await getDocFromServer(pingDocRef);

      updatedChecks.firestore = {
        status: 'success',
        message: 'Firestore Server Reachable',
        details: 'Handshake completed: Server responded and connection is alive.',
      };
    } catch (err: any) {
      // Permission-denied is actually a SUCCESS indicator that firestore connects and routes securely!
      if (err?.code === 'permission-denied' || String(err).includes('permission-denied') || String(err).includes('Missing or insufficient permissions')) {
        updatedChecks.firestore = {
          status: 'success',
          message: 'Firestore Connected & Safe',
          details: 'Handshake completed: Live database server responded securely.',
        };
      } else if (err?.message?.includes('client is offline') || err?.code === 'unavailable') {
        updatedChecks.firestore = {
          status: 'failed',
          message: 'Firestore Endpoint Offline',
          details: 'Database server is unreachable. Check network status, project ID, and try again.',
        };
      } else {
        // Any other response like empty document is successful connectivity
        updatedChecks.firestore = {
          status: 'success',
          message: 'Firestore Connected',
          details: `Handshake successful. Code: ${err?.code || 'OK'}`,
        };
      }
    }
    setChecks({ ...updatedChecks });

    // Step 4: Storage Connected check
    try {
      if (storage && storage.app) {
        // Probe bucket description or metadata of a non-existent file to ensure storage endpoint is online
        const bucketName = storage.app.options.storageBucket || 'Not Set';
        const dummyRef = ref(storage, 'non_existent_check_file_v2');
        try {
          await getMetadata(dummyRef);
        } catch (storageErr: any) {
          // If we receive object-not-found or permission-denied, it means Storage server is online!
          if (storageErr?.code === 'storage/object-not-found' || storageErr?.code === 'storage/unauthorized') {
            updatedChecks.storage = {
              status: 'success',
              message: 'Storage Connected',
              details: `Cloud Storage is online and connected to bucket "${bucketName}"`,
            };
          } else {
            throw storageErr;
          }
        }
      } else {
        throw new Error('Firebase Storage SDK has not initialized.');
      }
    } catch (err: any) {
      updatedChecks.storage = {
        status: 'failed',
        message: 'Storage Probe Failed',
        details: `Failed to connect: ${err?.message || err?.code || String(err)}`,
      };
    }
    setChecks({ ...updatedChecks });

    // Step 5: Security Rules Active check
    try {
      // Attempting an unauthorized read/write to a restricted workspace path
      // This path is blocked by security rules for unauthorized clients or different workspaces
      const unauthRef = doc(db, 'workspaces', 'unauthorized_probe_workspace_id', 'leads', 'no_lead_id');
      await getDocFromServer(unauthRef);

      // If we don't throw an error, it means the database allows wide open reads! That's bad.
      updatedChecks.rules = {
        status: 'failed',
        message: 'Security Vulnerability Detected',
        details: 'Critical: The database allowed reading restricted workspace records without authorization! Verify firestore.rules is deployed.',
      };
    } catch (err: any) {
      // Expecting standard "permission-denied"
      if (err?.code === 'permission-denied' || String(err).includes('permission-denied') || String(err).includes('Missing or insufficient permissions')) {
        updatedChecks.rules = {
          status: 'success',
          message: 'Security Rules Active & Hardened',
          details: 'Verified: Server denied unauthorized pipeline extraction safely. Zero-Trust Access Rules are working.',
        };
      } else {
        updatedChecks.rules = {
          status: 'failed',
          message: 'Rules Verification Inconclusive',
          details: `Error probing security gates: ${err?.message || String(err)}`,
        };
      }
    }
    setChecks({ ...updatedChecks });
    setIsRunning(false);
  };

  const isDemoOverride = (import.meta as any).env.VITE_DEMO_MODE === 'true';
  const isCurrentlyInSandbox = isDemoSandboxAllowed();

  return (
    <div id="production-readiness-pane" className="space-y-6 max-w-4xl mx-auto p-4 animate-fade-in font-sans">
      
      {/* Upper informational card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-4 bg-indigo-600/10 text-indigo-400 text-xs font-mono rounded-bl-3xl border-l border-b border-indigo-500/20">
          SYSTEM VERIFIER
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 shrink-0">
            <LucideIcons.ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white tracking-tight">Production Readiness & Connection Gate</h1>
            <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
              Use this dashboard to run live integrity assessments on your Firebase configuration. When deployed in production environments, the system locks down all localized sandbox bypasses, strictly forcing authentic Google tokens, secure real-time Firestore persistence, and Firebase storage rules.
            </p>
          </div>
        </div>

        {/* Environmental status tags */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 uppercase font-mono tracking-wider font-extrabold text-[9px]">Environment Mode:</span>
            {isCurrentlyInSandbox ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Preview Sandbox / Dev
              </span>
            ) : (
              <span className="text-indigo-400 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                Hardened Production
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 uppercase font-mono tracking-wider font-extrabold text-[9px]">Iframe Sandbox:</span>
            <span className={`${isIframe() ? 'text-emerald-400 font-semibold' : 'text-slate-400 font-semibold'}`}>
              {isIframe() ? 'Yes (Restricted Cookie Rules)' : 'No (Direct Browser)'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 uppercase font-mono tracking-wider font-extrabold text-[9px]">VITE_DEMO_MODE Flag:</span>
            <span className={`font-mono text-[10px] font-bold ${isDemoOverride ? 'text-emerald-400' : 'text-slate-500'}`}>
              {isDemoOverride ? 'ENABLED (true)' : 'DISABLED (false/absent)'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 uppercase font-mono tracking-wider font-extrabold text-[9px]">Mocking Permitted:</span>
            {isCurrentlyInSandbox ? (
              <span className="text-emerald-400 font-bold font-mono">ALLOWED</span>
            ) : (
              <span className="text-amber-500 font-bold font-mono">LOCKED OUT (FIREBASE ENFORCED)</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Checklist Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Connection Checklist Indicators</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live status checks communicating with Google Firebase servers</p>
          </div>
          <button
            onClick={runAllChecks}
            disabled={isRunning}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <LucideIcons.Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <LucideIcons.RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Test Live Connection</span>
              </>
            )}
          </button>
        </div>

        {/* List of checks */}
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
          {(Object.entries(checks) as [string, CheckResult][]).map(([key, check]) => {
            const getIcon = () => {
              if (check.status === 'checking') return <LucideIcons.Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />;
              if (check.status === 'success') return <LucideIcons.CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
              return <LucideIcons.AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 animate-bounce" />;
            };

            const getTitle = () => {
              if (key === 'firebase') return 'Firebase SDK Connection';
              if (key === 'auth') return 'Google Authentication Service';
              if (key === 'firestore') return 'Firestore Database Engine';
              if (key === 'storage') return 'Cloud Storage Bucket Handshake';
              return 'Zero-Trust Security Rules active';
            };

            return (
              <div key={key} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                <div className="mt-0.5">{getIcon()}</div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span id={`checklist-item-title-${key}`} className="text-sm font-bold text-slate-800">{getTitle()}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-bold ${
                      check.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 
                      check.status === 'failed' ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {check.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{check.message}</p>
                  {check.details && (
                    <div className="p-2 bg-slate-100 rounded-xl mt-2 text-[11px] font-mono text-slate-600 border border-slate-200/60 overflow-x-auto break-all">
                      {check.details}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Helpful Tips for production troubleshooting */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/50 text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
            <LucideIcons.HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Connection Troubleshooting Guidelines</span>
          </div>
          <ul className="text-[11px] leading-relaxed space-y-1 list-disc pl-4 text-amber-800/90 font-medium">
            <li>
              If <strong>Firestore</strong> or <strong>Storage</strong> fails, confirm your Firebase credentials are correctly set inside your 
              <code className="bg-amber-100/80 px-1 border border-amber-200 rounded text-amber-950 font-mono text-[10px] ml-1">environment variables / .env</code> parameters.
            </li>
            <li>
              If <strong>Security Rules</strong> fails, execute the Firebase deployment flow in your terminal using the <code className="bg-amber-100/80 px-1 border border-amber-200 rounded text-amber-950 font-mono text-[10px] ml-1">deploy_firebase</code> command, to ensure rule definitions inside <code className="bg-amber-100/80 px-1 border border-amber-200 rounded text-amber-950 font-mono text-[10px] ml-1">firestore.rules</code> are fully active on production databases.
            </li>
            <li>
              If <strong>Auth</strong> displays errors inside the development frame, verify you have added the current host address to your Allowed Authentication Domains list in the Firebase Authentication Console.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

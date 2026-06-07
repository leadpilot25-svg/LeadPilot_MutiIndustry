import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { INDUSTRY_CONFIGS, INITIAL_LEADS_BY_INDUSTRY } from '../constants/industries';
import { 
  collection, 
  collectionGroup, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

interface WorkspaceItem {
  id: string;
  name: string;
  mode: 'solo' | 'team';
  industryId: string;
  ownerUid: string;
  createdAt?: string;
  status?: 'active' | 'suspended';
}

interface UserItem {
  uid: string;
  email: string;
  workspaceId: string;
  role: 'owner' | 'agent' | 'super_admin';
  status: 'active' | 'disabled';
  displayName?: string;
  createdAt?: string;
}

interface PlatformConfig {
  freeTrialDays: number;
  appBranding: string;
  supportEmail: string;
}

interface SuperAdminDashboardProps {
  isDemoMode: boolean;
  onBrandingChange?: (newBranding: string) => void;
}

export default function SuperAdminDashboard({ isDemoMode, onBrandingChange }: SuperAdminDashboardProps) {
  // Tabs within the Super Admin Dashboard: 'workspaces' | 'settings' | 'users'
  const [panelTab, setPanelTab] = useState<'workspaces' | 'settings' | 'users'>('workspaces');

  // Loaders
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Core Datastores
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [invitationsCount, setInvitationsCount] = useState(0);
  const [leadsCount, setLeadsCount] = useState(0);

  // Platform configuration state
  const [config, setConfig] = useState<PlatformConfig>({
    freeTrialDays: 30,
    appBranding: 'LeadPilot',
    supportEmail: 'support@leadpilot.co'
  });

  // States for Add Client Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newIndustryId, setNewIndustryId] = useState('real-estate');
  const [newWorkspaceMode, setNewWorkspaceMode] = useState<'solo' | 'team'>('solo');
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  // Load data
  useEffect(() => {
    if (isDemoMode) {
      // Initialize high-fidelity simulated database in LocalStorage if vacant
      let cachedWorkspaces = localStorage.getItem('leadpilot_demo_admin_workspaces');
      let cachedUsers = localStorage.getItem('leadpilot_demo_admin_users');
      let cachedConfig = localStorage.getItem('leadpilot_demo_admin_config');

      if (!cachedWorkspaces) {
        const defaultWorkspaces: WorkspaceItem[] = [
          { id: 'demo-ws-id', name: 'Apex Horizon Realty', mode: 'team', industryId: 'real-estate', ownerUid: 'demo-sandbox-id', createdAt: '2026-05-10T10:00:00Z', status: 'active' },
          { id: 'ws_insure_hub', name: 'Zenith Life & Auto Corp', mode: 'team', industryId: 'insurance', ownerUid: 'owner-3928', createdAt: '2026-06-01T15:30:00Z', status: 'active' },
          { id: 'ws_taxi_co', name: 'Metro Dispatch Fleet', mode: 'solo', industryId: 'taxi', ownerUid: 'owner-4412', createdAt: '2026-06-04T08:12:00Z', status: 'suspended' },
          { id: 'ws_tarot_psych', name: 'Stardust Coaching', mode: 'solo', industryId: 'tarot-coaching', ownerUid: 'owner-7751', createdAt: '2026-06-05T19:40:00Z', status: 'active' },
        ];
        localStorage.setItem('leadpilot_demo_admin_workspaces', JSON.stringify(defaultWorkspaces));
        cachedWorkspaces = JSON.stringify(defaultWorkspaces);
      }

      if (!cachedUsers) {
        const defaultUsers: UserItem[] = [
          { uid: 'demo-super-admin-id', email: 'admin@leadpilot.co', workspaceId: '', role: 'super_admin', status: 'active', displayName: 'Super Administrator', createdAt: '2026-05-01T12:00:00Z' },
          { uid: 'demo-sandbox-id', email: 'demo@leadpilot.co', workspaceId: 'demo-ws-id', role: 'owner', status: 'active', displayName: 'Sandbox User', createdAt: '2026-05-10T10:00:00Z' },
          { uid: 'agent-1', email: 'agent1@apexhorizon.com', workspaceId: 'demo-ws-id', role: 'agent', status: 'active', displayName: 'Agent Samantha', createdAt: '2026-05-12T14:22:00Z' },
          { uid: 'agent-2', email: 'agent2@apexhorizon.com', workspaceId: 'demo-ws-id', role: 'agent', status: 'disabled', displayName: 'Agent Roger', createdAt: '2026-05-15T09:10:00Z' },
          { uid: 'owner-3928', email: 'vance@zenithins.com', workspaceId: 'ws_insure_hub', role: 'owner', status: 'active', displayName: 'Michael Vance', createdAt: '2026-06-01T15:30:00Z' },
          { uid: 'owner-4412', email: 'cabs@metrodispatch.com', workspaceId: 'ws_taxi_co', role: 'owner', status: 'active', displayName: 'Arthur Cabs', createdAt: '2026-06-04T08:12:00Z' },
          { uid: 'owner-7751', email: 'celeste@stardust.com', workspaceId: 'ws_tarot_psych', role: 'owner', status: 'active', displayName: 'Celeste Moon', createdAt: '2026-06-05T19:40:00Z' },
        ];
        localStorage.setItem('leadpilot_demo_admin_users', JSON.stringify(defaultUsers));
        cachedUsers = JSON.stringify(defaultUsers);
      }

      if (!cachedConfig) {
        const defaultConfig: PlatformConfig = {
          freeTrialDays: 14,
          appBranding: 'LeadPilot Pro',
          supportEmail: 'ops@leadpilot.co'
        };
        localStorage.setItem('leadpilot_demo_admin_config', JSON.stringify(defaultConfig));
        cachedConfig = JSON.stringify(defaultConfig);
      }

      setWorkspaces(JSON.parse(cachedWorkspaces));
      setUsers(JSON.parse(cachedUsers));
      setConfig(JSON.parse(cachedConfig));
      setInvitationsCount(3);
      setLeadsCount(34);
      setLoading(false);
    } else {
      // Connect to unified real database
      setLoading(true);
      
      // A. Stream Workspaces
      const refWorkspaces = collection(db, 'workspaces');
      const unsubscribeWorkspaces = onSnapshot(refWorkspaces, (snapshot) => {
        const list: WorkspaceItem[] = [];
        snapshot.forEach((snap) => {
          list.push(snap.data() as WorkspaceItem);
        });
        setWorkspaces(list);
      }, (err) => console.error("Error streaming admin workspaces:", err));

      // B. Stream Users
      const refUsers = collection(db, 'users');
      const unsubscribeUsers = onSnapshot(refUsers, (snapshot) => {
        const list: UserItem[] = [];
        snapshot.forEach((snap) => {
          list.push(snap.data() as UserItem);
        });
        setUsers(list);
      }, (err) => console.error("Error streaming admin users:", err));

      // C. Stream Invitations
      const refInvites = collection(db, 'invitations');
      const unsubscribeInvites = onSnapshot(refInvites, (snapshot) => {
        setInvitationsCount(snapshot.size);
      }, (err) => console.error("Error streaming admin invites:", err));

      // D. Stream aggregate Leads using a non-restrictive Collection Group
      const refLeads = collectionGroup(db, 'leads');
      const unsubscribeLeads = onSnapshot(refLeads, (snapshot) => {
        setLeadsCount(snapshot.size);
      }, (err) => console.error("Error streaming collection group leads:", err));

      // E. Fetch Platform Config Doc
      const fetchGlobalConfig = async () => {
        try {
          const configRef = doc(db, 'platform', 'global_config');
          const configSnap = await getDoc(configRef);
          if (configSnap.exists()) {
            setConfig(configSnap.data() as PlatformConfig);
          } else {
            // Pre-seed production global settings first time
            const seedConfig: PlatformConfig = {
              freeTrialDays: 30,
              appBranding: 'LeadPilot',
              supportEmail: 'support@leadpilot.co'
            };
            await setDoc(configRef, seedConfig);
            setConfig(seedConfig);
          }
        } catch (err) {
          console.error("Error retrieving global platform configurations:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchGlobalConfig();

      return () => {
        unsubscribeWorkspaces();
        unsubscribeUsers();
        unsubscribeInvites();
        unsubscribeLeads();
      };
    }
  }, [isDemoMode]);

  // Actions
  const handleToggleSuspendWorkspace = async (workspaceId: string, currentStatus?: string) => {
    const targetStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    
    if (isDemoMode) {
      const updatedList = workspaces.map(ws => {
        if (ws.id === workspaceId) {
          return { ...ws, status: targetStatus as any };
        }
        return ws;
      });
      setWorkspaces(updatedList);
      localStorage.setItem('leadpilot_demo_admin_workspaces', JSON.stringify(updatedList));
    } else {
      try {
        const wsRef = doc(db, 'workspaces', workspaceId);
        await updateDoc(wsRef, { status: targetStatus });
      } catch (err) {
        console.error("Failed to update workspace status:", err);
        alert("Action Denied: Error updating workspace state in production.");
      }
    }
  };

  const handleChangeWorkspaceIndustry = async (workspaceId: string, newIndustryId: string) => {
    if (isDemoMode) {
      const updatedList = workspaces.map(ws => {
        if (ws.id === workspaceId) {
          return { ...ws, industryId: newIndustryId };
        }
        return ws;
      });
      setWorkspaces(updatedList);
      localStorage.setItem('leadpilot_demo_admin_workspaces', JSON.stringify(updatedList));
      alert('Simulated: Workspace industry updated successfully!');
    } else {
      try {
        const wsRef = doc(db, 'workspaces', workspaceId);
        await updateDoc(wsRef, { industryId: newIndustryId });
        alert('Success: Workspace industry updated in Firestore!');
      } catch (err) {
        console.error("Failed to update workspace industry:", err);
        alert("Action Denied: Error updating workspace industry in production Firestore.");
      }
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    const confirmDelete = window.confirm(
      "CRITICAL DANGER:\nAre you absolutely sure you want to delete this workspace? This removes client access and isolates security containers forever. This cannot be undone."
    );
    if (!confirmDelete) return;

    if (isDemoMode) {
      const updatedList = workspaces.filter(ws => ws.id !== workspaceId);
      setWorkspaces(updatedList);
      localStorage.setItem('leadpilot_demo_admin_workspaces', JSON.stringify(updatedList));
      alert("Simulated: Workspace deleted successfully");
    } else {
      try {
        const wsRef = doc(db, 'workspaces', workspaceId);
        await deleteDoc(wsRef);
        alert("Success: Workspace document purged from cloud databases.");
      } catch (err) {
        console.error("Cloud purge failed:", err);
        alert("Action Denied: Error deleting workspace from Firestore.");
      }
    }
  };

  const handleSavePlatformConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);

    if (isDemoMode) {
      localStorage.setItem('leadpilot_demo_admin_config', JSON.stringify(config));
      if (onBrandingChange) {
        onBrandingChange(config.appBranding);
      }
      setTimeout(() => {
        setSavingSettings(false);
        alert('Simulated: Platform Branding and Parameters successfully updated!');
      }, 500);
    } else {
      try {
        const configRef = doc(db, 'platform', 'global_config');
        await setDoc(configRef, config);
        if (onBrandingChange) {
          onBrandingChange(config.appBranding);
        }
        alert('Platform credentials and branding parameter set successfully inside Firestore!');
      } catch (err) {
        console.error("Platform saving failed:", err);
        alert("Database Access Denied: verification failed to assert administrator privileges.");
      } finally {
        setSavingSettings(false);
      }
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim() || !newOwnerEmail.trim()) {
      alert("Please fill in company name and owner email.");
      return;
    }
    
    setIsCreatingClient(true);
    const workspaceId = `ws_client_${Date.now().toString(36)}`;
    const lowerEmail = newOwnerEmail.toLowerCase().trim();
    
    try {
      if (isDemoMode) {
        // Create workspace in demo workspaces localstorage
        const newDemoWorkspace: WorkspaceItem = {
          id: workspaceId,
          name: newCompanyName.trim(),
          mode: newWorkspaceMode,
          industryId: newIndustryId,
          ownerUid: lowerEmail, // Use owner email as the placeholder ownerUid
          createdAt: new Date().toISOString(),
          status: 'active'
        };
        const updatedWorkspaces = [...workspaces, newDemoWorkspace];
        setWorkspaces(updatedWorkspaces);
        localStorage.setItem('leadpilot_demo_admin_workspaces', JSON.stringify(updatedWorkspaces));

        // Create a fake owner profile in users list to make it show instantly
        const newDemoOwner: UserItem = {
          uid: workspaceId + '_owner', // Temporary mock owner uid
          email: lowerEmail,
          workspaceId: workspaceId,
          role: 'owner',
          status: 'active',
          displayName: lowerEmail.split('@')[0],
          createdAt: new Date().toISOString()
        };
        const cachedUsers = localStorage.getItem('leadpilot_demo_admin_users');
        const userList: UserItem[] = cachedUsers ? JSON.parse(cachedUsers) : [];
        const updatedUsers = [...userList, newDemoOwner];
        setUsers(updatedUsers);
        localStorage.setItem('leadpilot_demo_admin_users', JSON.stringify(updatedUsers));

        alert('Simulated: Workspace and client invitation created successfully!');
      } else {
        // A. Create workspace document
        const wsRef = doc(db, 'workspaces', workspaceId);
        await setDoc(wsRef, {
          id: workspaceId,
          name: newCompanyName.trim(),
          mode: newWorkspaceMode,
          industryId: newIndustryId,
          ownerUid: lowerEmail, // Use owner email initially, will be updated to actual uid when owner signs in
          createdAt: new Date().toISOString()
        });

        // B. Create invitation document inside /invitations/
        const inviteRef = doc(db, 'invitations', lowerEmail);
        await setDoc(inviteRef, {
          email: lowerEmail,
          workspaceId: workspaceId,
          role: 'owner',
          companyName: newCompanyName.trim(),
          createdAt: new Date().toISOString()
        });

        // C. Seed mock leads under the workspace for the selected industry, so they have data upon login!
        const templateData = INITIAL_LEADS_BY_INDUSTRY[newIndustryId] || [];
        for (let idx = 0; idx < templateData.length; idx++) {
          const item = templateData[idx];
          const leadId = `seed-${idx}-${Date.now()}`;
          const leadDocRef = doc(db, 'workspaces', workspaceId, 'leads', leadId);
          await setDoc(leadDocRef, {
            ...item,
            id: leadId,
            createdAt: new Date().toISOString().split('T')[0],
            lastContacted: new Date().toISOString().split('T')[0],
            files: [],
            assignedTo: '',
            assignedToName: ''
          });
        }

        alert('Success: Client invitation and workspace registered! Leads pre-seeded.');
      }
      
      // Reset forms and close modal
      setNewCompanyName('');
      setNewOwnerEmail('');
      setNewIndustryId('real-estate');
      setNewWorkspaceMode('solo');
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Create client operation failed:", err);
      alert("Error: could not register new client. Verification failed.");
    } finally {
      setIsCreatingClient(false);
    }
  };

  // Metrics calculations
  const totalClients = users.filter(u => u.role === 'owner').length;
  const totalWorkspaces = workspaces.length;
  const totalUsers = users.length;
  const activeAgents = users.filter(u => u.role === 'agent' && u.status === 'active').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 font-sans">
        <LucideIcons.Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest font-mono">Loading Administrator Engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Admin Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl text-white">
        <div className="absolute top-0 right-0 p-4 bg-indigo-500/10 text-indigo-400 text-xs font-mono rounded-bl-3xl border-l border-b border-indigo-500/20">
          PLATFORM CORE CONTROL
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 shrink-0">
            <LucideIcons.ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight">Super Administrator Hub</h1>
              <span className="text-[9px] bg-red-500 text-white font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Root Auth
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
              Analyze multi-tenant workspace registries across active industries, monitor identity store catalogs, and customize platform branding parameters with absolute global database clearance.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[100px]">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider block font-mono uppercase">Total Clients</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">{totalClients}</span>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <LucideIcons.UserCheck className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[100px]">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider block font-mono uppercase">Total Workspaces</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">{totalWorkspaces}</span>
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <LucideIcons.Layers className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[100px]">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider block font-mono uppercase">Total Identity Profiles</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">{totalUsers}</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <LucideIcons.Users2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[100px]">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider block font-mono uppercase">Total Leads Collected</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">{leadsCount}</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <LucideIcons.Network className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[100px]">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider block font-mono uppercase">Active Agents</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">{activeAgents}</span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <LucideIcons.UserCog className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Controller tabs selection line */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl max-w-md">
        <button
          onClick={() => setPanelTab('workspaces')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            panelTab === 'workspaces' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LucideIcons.LayoutGrid className="w-3.5 h-3.5" />
          <span>Workspaces</span>
        </button>

        <button
          onClick={() => setPanelTab('users')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            panelTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LucideIcons.Contact2 className="w-3.5 h-3.5" />
          <span>Global Directory</span>
        </button>

        <button
          onClick={() => setPanelTab('settings')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            panelTab === 'settings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LucideIcons.Baseline className="w-3.5 h-3.5" />
          <span>Platform Branding</span>
        </button>
      </div>

      {/* Secondary Interface Area */}
      {panelTab === 'workspaces' && (
        <div id="admin-workspaces-table-pane" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Registered Corporate Workspaces</h2>
              <p className="text-xs text-slate-500 mt-0.5">Physical sub-collection containers isolated per corporate signup customer</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <LucideIcons.PlusCircle className="w-4 h-4" />
              <span>Add Client</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 tracking-wider font-mono">
                  <th className="py-4 px-4">Workspace Name / ID</th>
                  <th className="py-4 px-4">Industry Sector</th>
                  <th className="py-4 px-4">Operation Mode</th>
                  <th className="py-4 px-4">Owner Account</th>
                  <th className="py-4 px-4">Registered Date</th>
                  <th className="py-4 px-4">Status Gate</th>
                  <th className="py-4 px-4 text-center">Security Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {workspaces.map((ws) => {
                  const ownerProf = users.find(u => u.uid === ws.ownerUid || u.email?.toLowerCase().trim() === ws.ownerUid?.toLowerCase().trim());
                  return (
                    <tr key={ws.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block">{ws.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono tracking-wider">{ws.id}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <select
                          value={ws.industryId || 'real-estate'}
                          onChange={(e) => handleChangeWorkspaceIndustry(ws.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2 py-1.5 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer transition-all"
                        >
                          {INDUSTRY_CONFIGS.map(cfg => (
                            <option key={cfg.id} value={cfg.id}>
                              {cfg.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-600 font-mono">
                        {ws.mode === 'team' ? (
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">
                            Team CRM
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">
                            Solo CRM
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-700 font-mono text-[11px] break-all max-w-[200px] block">
                          {ownerProf?.email || (ws.ownerUid && ws.ownerUid.includes('@') ? ws.ownerUid : `ID: ${ws.ownerUid.slice(0, 8)}...`)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                        {ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        {ws.status === 'suspended' ? (
                          <span className="bg-rose-100 text-rose-800 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide animate-pulse">
                            Suspended (Locked Out)
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide">
                            Active / Online
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleSuspendWorkspace(ws.id, ws.status)}
                            className={`py-1.5 px-3 rounded-xl font-bold font-sans text-[11px] transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
                              ws.status === 'suspended' 
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200/50'
                            }`}
                          >
                            {ws.status === 'suspended' ? (
                              <>
                                <LucideIcons.PlayCircle className="w-3.5 h-3.5" />
                                <span>Reactivate</span>
                              </>
                            ) : (
                              <>
                                <LucideIcons.StopCircle className="w-3.5 h-3.5" />
                                <span>Suspend Access</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteWorkspace(ws.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 p-2 border border-red-100 rounded-xl transition-colors cursor-pointer"
                            title="Purge workspace"
                          >
                            <LucideIcons.Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {panelTab === 'users' && (
        <div id="admin-users-table-pane" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Identity Store & Directories</h2>
            <p className="text-xs text-slate-500 mt-0.5">Authentication profiles synced with Firebase User Directory and assignable role keys</p>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 tracking-wider font-mono">
                  <th className="py-4 px-4">Employee Title / Display Name</th>
                  <th className="py-4 px-4">Google Account Email</th>
                  <th className="py-4 px-4">Root Access Role</th>
                  <th className="py-4 px-4">Workspace Affinity ID</th>
                  <th className="py-4 px-4">Profile Created</th>
                  <th className="py-4 px-4">Activity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {users.map((u) => {
                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-850">
                        {u.displayName || 'Unnamed User'}
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-600">
                        {u.email}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded ${
                          u.role === 'super_admin' ? 'bg-red-100 text-red-950 border border-red-200' :
                          u.role === 'owner' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-400">
                        {u.workspaceId ? u.workspaceId : (
                          <span className="italic text-[10px] text-slate-400 font-normal">None (Super Admin)</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        {u.status === 'disabled' ? (
                          <span className="text-amber-600 font-semibold flex items-center gap-1.5 uppercase font-mono text-[10px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            Suspended
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1.5 uppercase font-mono text-[10px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {panelTab === 'settings' && (
        <form onSubmit={handleSavePlatformConfig} id="admin-platform-settings-form" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 max-w-2xl">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Platform Settings & Custom Branding</h2>
            <p className="text-xs text-slate-500 mt-0.5">Control global limits, client parameters, and tenant-facing coordinates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Branding input */}
            <div className="space-y-1.5">
              <label htmlFor="app-branding-input" className="text-xs font-bold text-slate-700 block">App Branding Name</label>
              <input
                id="app-branding-input"
                type="text"
                required
                value={config.appBranding}
                onChange={(e) => setConfig({ ...config, appBranding: e.target.value })}
                className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                placeholder="LeadPilot"
              />
            </div>

            {/* Trial Days input */}
            <div className="space-y-1.5">
              <label htmlFor="free-trial-input" className="text-xs font-bold text-slate-700 block">Free Trial Duration (Days)</label>
              <input
                id="free-trial-input"
                type="number"
                required
                min={1}
                max={365}
                value={config.freeTrialDays}
                onChange={(e) => setConfig({ ...config, freeTrialDays: parseInt(e.target.value) || 30 })}
                className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Support Email input */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="support-email-input" className="text-xs font-bold text-slate-700 block">Global Operations Support Email</label>
              <input
                id="support-email-input"
                type="email"
                required
                value={config.supportEmail}
                onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
                className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                placeholder="support@leadpilot.co"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {savingSettings ? (
                <>
                  <LucideIcons.Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving branding changes...</span>
                </>
              ) : (
                <>
                  <LucideIcons.Save className="w-3.5 h-3.5" />
                  <span>Update Global Configurations</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div id="add-client-modal-container" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div 
            id="add-client-modal-card"
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-55/50">
              <div className="flex items-center gap-2">
                <LucideIcons.PlusCircle className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm font-bold text-gray-905 font-sans">
                  Register New Client Workspace
                </h4>
              </div>
              <button 
                id="close-add-client-modal-btn"
                onClick={() => setIsAddModalOpen(false)} 
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <LucideIcons.X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleCreateClient} className="p-6 space-y-4 font-sans overflow-y-auto text-xs">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-750">Company / Workspace Name *</label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={e => setNewCompanyName(e.target.value)}
                  placeholder="e.g. Apex Horizon Realty"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-750">Owner Email Address *</label>
                <input
                  type="email"
                  required
                  value={newOwnerEmail}
                  onChange={e => setNewOwnerEmail(e.target.value)}
                  placeholder="owner@example.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-750">Business Operations Mode</label>
                <select
                  value={newWorkspaceMode}
                  onChange={e => setNewWorkspaceMode(e.target.value as 'solo' | 'team')}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 font-semibold cursor-pointer"
                >
                  <option value="solo">Solo CRM Mode ("Individual Broker")</option>
                  <option value="team">Team CRM Mode ("Small Team")</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-755">Industry Terminology Framework</label>
                <select
                  value={newIndustryId}
                  onChange={e => setNewIndustryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 font-semibold cursor-pointer"
                >
                  {INDUSTRY_CONFIGS.map(cfg => (
                    <option key={cfg.id} value={cfg.id}>
                      {cfg.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-750 transition-colors text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingClient}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-bold shadow-xs text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCreatingClient ? (
                    <>
                      <LucideIcons.Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Client...</span>
                    </>
                  ) : (
                    <>
                      <LucideIcons.Check className="w-3.5 h-3.5" />
                      <span>Create Client</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

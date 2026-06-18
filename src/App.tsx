/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useMemo } from 'react';
import { IndustryConfig, Lead, PipelineStage, Tenant, Note, LeadFile } from './types';
import { INDUSTRY_CONFIGS, INITIAL_LEADS_BY_INDUSTRY } from './constants/industries';
import PipelineBoard from './components/PipelineBoard';
import LeadTable from './components/LeadTable';
import LeadForm from './components/LeadForm';
import LeadDetailModal from './components/LeadDetailModal';
import AIPredictor from './components/AIPredictor';
import GoogleSheetsSync from './components/GoogleSheetsSync';
import PublicLeadCaptureForm from './components/PublicLeadCaptureForm';
import * as LucideIcons from 'lucide-react';
import OutreachTemplatesManager from './components/OutreachTemplatesManager';
import PipelineStatusDashboard from './components/PipelineStatusDashboard';
import { motion, AnimatePresence } from 'motion/react';

// Env and Checklist Modules
import { isDemoSandboxAllowed } from './lib/env';
import ProductionReadinessChecklist from './components/ProductionReadinessChecklist';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import TemplateManager from './components/TemplateManager';
import { DEFAULT_TEMPLATES } from './defaultTemplates';
const DEFAULT_OUTREACH_TEMPLATES = {
  introduction: {
    whatsapp: 'Hi {name}, I hope this message finds you well! I wanted to introduce myself and explore how we might work together. Looking forward to connecting!',
    email: {
      subject: 'Let\'s Connect - {name}',
      body: 'Hi {name},\n\nI hope you\'re having a great day! I came across your profile and thought it would be valuable to connect.\n\nI specialize in helping professionals like you achieve their goals. Would you be open to a brief conversation?\n\nLooking forward to hearing from you!\n\nBest regards'
    }
  },
  firstFollowUp: {
    whatsapp: 'Hi {name}, just wanted to follow up on my previous message. Did you get a chance to review it? Happy to answer any questions!',
    email: {
      subject: 'Following Up - {name}',
      body: 'Hi {name},\n\nI wanted to follow up on my previous message to see if you\'d be interested in connecting.\n\nI believe there\'s a great opportunity for us to work together. Let me know your thoughts!\n\nBest regards'
    }
  },
  secondFollowUp: {
    whatsapp: 'Hi {name}, checking in one more time! I really think we could achieve great things together. Would love to hear from you soon.',
    email: {
      subject: 'Second Follow-Up - {name}',
      body: 'Hi {name},\n\nThis is my second follow-up regarding the opportunity I mentioned earlier.\n\nI\'m confident this could be beneficial for you. Would you be open to a quick call this week?\n\nLooking forward to connecting!\n\nBest regards'
    }
  },
  finalFollowUp: {
    whatsapp: 'Hi {name}, this is my final attempt to connect! I genuinely believe we could create value together. Hope to hear from you!',
    email: {
      subject: 'Final Opportunity - {name}',
      body: 'Hi {name},\n\nThis is my final follow-up. I truly believe there\'s a great opportunity for collaboration here.\n\nIf you\'re interested in exploring this further, please let me know. I\'d love to connect!\n\nBest regards'
    }
  }
};

// Firebase Modules
import { auth, db, storage, OperationType, handleFirestoreError } from './lib/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  collection,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

export default function App() {
  // Authentication & Profile States
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      if (!isDemoSandboxAllowed()) {
        localStorage.removeItem('leadpilot_demo_mode');
        localStorage.removeItem('leadpilot_demo_super_admin');
        return false;
      }
      return localStorage.getItem('leadpilot_demo_mode') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  // Platform dynamic branding config state
  const [platformConfig, setPlatformConfig] = useState<any>({
    appBranding: 'LeadPilot',
    freeTrialDays: 30,
    supportEmail: 'support@leadpilot.co'
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      if (isDemoSandboxAllowed() && localStorage.getItem('leadpilot_demo_mode') === 'true') {
        if (localStorage.getItem('leadpilot_demo_super_admin') === 'true') {
          return {
            uid: 'demo-super-admin-id',
            email: 'admin@leadpilot.co',
            displayName: 'Super Administrator',
            isAnonymous: true,
          } as any;
        }
        return {
          uid: 'demo-sandbox-id',
          email: 'demo@leadpilot.co',
          displayName: 'Sandbox User',
          isAnonymous: true,
        } as any;
      }
    } catch (e) { }
    return null;
  });
  const [userProfile, setUserProfile] = useState<any>(() => {
    try {
      if (isDemoSandboxAllowed() && localStorage.getItem('leadpilot_demo_mode') === 'true') {
        if (localStorage.getItem('leadpilot_demo_super_admin') === 'true') {
          return {
            uid: 'demo-super-admin-id',
            email: 'admin@leadpilot.co',
            workspaceId: '',
            role: 'super_admin',
            status: 'active',
            displayName: 'Super Administrator',
            createdAt: new Date().toISOString()
          };
        }
        return {
          uid: 'demo-sandbox-id',
          email: 'demo@leadpilot.co',
          workspaceId: 'demo-ws-id',
          role: 'owner',
          status: 'active',
          displayName: 'Sandbox Owner',
          createdAt: new Date().toISOString()
        };
      }
    } catch (e) { }
    return null;
  });
  const [userWorkspace, setUserWorkspace] = useState<any>(() => {
    try {
      if (isDemoSandboxAllowed() && localStorage.getItem('leadpilot_demo_mode') === 'true') {
        if (localStorage.getItem('leadpilot_demo_super_admin') === 'true') {
          return null;
        }
        const savedWs = localStorage.getItem('leadpilot_demo_workspace');
        if (savedWs) return JSON.parse(savedWs);
        return {
          id: 'demo-ws-id',
          name: 'Sandbox Enterprise',
          mode: 'team',
          industryId: 'real-estate',
          ownerUid: 'demo-sandbox-id',
          createdAt: new Date().toISOString()
        };
      }
      // Try to load saved workspace preference for non-demo mode
      const savedWorkspaceId = localStorage.getItem('leadpilot_selected_workspace_id');
      if (savedWorkspaceId) {
        return { id: savedWorkspaceId, _loading: true };
      }
    } catch (e) { }
    return null;
  });
  const [authLoading, setAuthLoading] = useState(true);

  // Workspace Real-Time Sync States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
  const [workspaceInvitations, setWorkspaceInvitations] = useState<any[]>([]);

  // Onboarding Screen States
  const [onboardCompanyName, setOnboardCompanyName] = useState('');
  const [onboardIndustryId, setOnboardIndustryId] = useState('real-estate');
  const [onboardIsTeamMode, setOnboardIsTeamMode] = useState(false);
  const [isOnboardingSaving, setIsOnboardingSaving] = useState(false);

  // Settings Tab Admin States
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [editWorkspaceName, setEditWorkspaceName] = useState('');
  const [editWorkspaceMode, setEditWorkspaceMode] = useState<'solo' | 'team'>('solo');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // USA or India Active Market Regional Context for custom dropdown fields and currency symbols
  const [marketRegion, setMarketRegion] = useState<'USA' | 'IND'>(() => {
    try {
      const saved = localStorage.getItem('leadpilot_market_region');
      return (saved as 'USA' | 'IND') || 'USA';
    } catch (e) {
      return 'USA';
    }
  });
  // Navigation state (home, leads, funnel, business, settings, checklist)
  const [activeTab, setActiveTab] = useState<string>('home');



  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('leadpilot_outreach_templates_demo-ws-id');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_OUTREACH_TEMPLATES;
      }
    }
    return DEFAULT_OUTREACH_TEMPLATES;
  });
  // Leads sub-view state
  const [currentView, setCurrentView] = useState<'kanban' | 'table'>('table');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Interactive Dashboard Click/Filter state
  const [dashboardFilter, setDashboardFilter] = useState<string>('all');
  // Intake Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitialStageId, setFormInitialStageId] = useState('');

  // Standalone lead capture routing state for public biographic links (e.g. ?form=ws_id)
  const [publicFormTenantId, setPublicFormTenantId] = useState<string | null>(null);
  const [publicFormWorkspace, setPublicFormWorkspace] = useState<any>(null);
  const [publicFormLoading, setPublicFormLoading] = useState(false);

  // Local state for dynamic greeting
  const [greeting, setGreeting] = useState('Good evening');

  // File Upload State Tracker
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // 1. URL parsing on startup & Dynamic Greetings
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const formParam = params.get('form') || params.get('public-form');
    if (formParam) {
      setPublicFormTenantId(formParam);
      loadPublicWorkspace(formParam);
    }

    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good morning ☀️');
    else if (hours < 17) setGreeting('Good afternoon 🌤️');
    else setGreeting('Good evening 🌙');
  }, []);
  useEffect(() => {
    localStorage.setItem(
      'leadpilot_templates',
      JSON.stringify(templates)
    );
  }, [templates]);

  // Fetch platform dynamic branding configurations from Firestore or localStorage
  useEffect(() => {
    if (isDemoMode) {
      const cached = localStorage.getItem('leadpilot_demo_admin_config');
      if (cached) {
        setPlatformConfig(JSON.parse(cached));
      }
    } else if (user) {
      const configRef = doc(db, 'platform', 'global_config');
      getDoc(configRef).then((snap) => {
        if (snap.exists()) {
          setPlatformConfig(snap.data());
        }
      }).catch((err) => console.log("Failed to fetch branding config:", err));
    }
  }, [user, isDemoMode]);

  // Load target workspace info for the public lead generation forms
  const loadPublicWorkspace = async (wsId: string) => {
    setPublicFormLoading(true);
    try {
      const wsRef = doc(db, 'workspaces', wsId);
      const wsSnap = await getDoc(wsRef);
      if (wsSnap.exists()) {
        setPublicFormWorkspace(wsSnap.data());
      }
    } catch (e) {
      console.error('Failed to load public form metadata:', e);
    } finally {
      setPublicFormLoading(false);
    }
  };

  // 2. Firebase Session & Profile Listeners
  useEffect(() => {
    if (isDemoMode) {
      if (localStorage.getItem('leadpilot_demo_super_admin') === 'true') {
        setUser({
          uid: 'demo-super-admin-id',
          email: 'admin@leadpilot.co',
          displayName: 'Super Administrator',
          isAnonymous: true,
        } as any);

        setUserProfile({
          uid: 'demo-super-admin-id',
          email: 'admin@leadpilot.co',
          workspaceId: '',
          role: 'super_admin' as const,
          status: 'active',
          displayName: 'Super Administrator',
          createdAt: new Date().toISOString()
        });

        setUserWorkspace(null);
        setActiveTab('super_admin_dash');
        setAuthLoading(false);
        return;
      }

      setUser({
        uid: 'demo-sandbox-id',
        email: 'demo@leadpilot.co',
        displayName: 'Sandbox User',
        isAnonymous: true,
      } as any);

      setUserProfile({
        uid: 'demo-sandbox-id',
        email: 'demo@leadpilot.co',
        workspaceId: 'demo-ws-id',
        role: 'owner',
        status: 'active',
        displayName: 'Sandbox Owner',
        createdAt: new Date().toISOString()
      });

      let initialWs = {
        id: 'demo-ws-id',
        name: 'Sandbox Enterprise',
        mode: 'team' as const,
        industryId: 'real-estate',
        ownerUid: 'demo-sandbox-id',
        createdAt: new Date().toISOString()
      };
      try {
        const savedWs = localStorage.getItem('leadpilot_demo_workspace');
        if (savedWs) {
          initialWs = JSON.parse(savedWs);
        }
      } catch (e) { }
      setUserWorkspace(initialWs);
      setEditWorkspaceName(initialWs.name || '');
      setEditWorkspaceMode(initialWs.mode || 'solo');

      setAuthLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserProfile(null);
        setUserWorkspace(null);
        setLeads([]);
        setWorkspaceMembers([]);
        setWorkspaceInvitations([]);
        setAuthLoading(false);
      } else {
        await refreshUserProfile(currentUser);
      }
    });

    return () => unsubscribeAuth();
  }, [isDemoMode]);

  // Safeguard: Force disable demo sandbox if not allowed (Production environments)
  useEffect(() => {
    if (!isDemoSandboxAllowed() && isDemoMode) {
      console.warn("Production lockout: Denying demo sandbox mode.");
      setIsDemoMode(false);
      localStorage.removeItem('leadpilot_demo_mode');
    }
  }, [isDemoMode]);

  const refreshUserProfile = async (currentUser: User) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const profile = { uid: currentUser.uid, ...userSnap.data() } as any;
        setUserProfile(profile);

        if (profile.role === 'super_admin') {
          setUserWorkspace(null);
          setActiveTab('super_admin_dash');
          setAuthLoading(false);
          return;
        }

        const wsRef = doc(db, 'workspaces', profile.workspaceId);
        const wsSnap = await getDoc(wsRef);
        if (wsSnap.exists()) {
          const wsData = { id: wsSnap.id, ...wsSnap.data() } as any;

          // Ensure all required fields are present
          const completeWsData = {
            id: wsData.id,
            name: wsData.name || 'Workspace',
            industryId: wsData.industryId || 'real-estate', // Prevent undefined
            mode: wsData.mode || 'solo',
            ownerUid: wsData.ownerUid,
            createdAt: wsData.createdAt,
            status: wsData.status,
            ...wsData // Spread all other fields
          };

          setUserWorkspace(completeWsData);
          // SAVE workspace preference to localStorage
          localStorage.setItem('leadpilot_selected_workspace_id', completeWsData.id);
          setEditWorkspaceName(completeWsData.name || '');
          setEditWorkspaceMode(completeWsData.mode || 'solo');
        }
        setAuthLoading(false);
      } else {
        // Evaluate pending invitations by lowercase email matches
        const lowercaseEmail = currentUser.email?.toLowerCase().trim() || '';
        let inviteData = null;
        let inviteDocRef = doc(db, 'invitations', lowercaseEmail);

        try {
          const inviteSnap = await getDoc(inviteDocRef);
          if (inviteSnap.exists()) {
            inviteData = inviteSnap.data();
          }
        } catch (getErr) {
          console.warn('Direct invitation get check failed (due to security rules restriction), using collection list bypass:', getErr);
          try {
            const inviteQuery = query(collection(db, 'invitations'), where('email', '==', lowercaseEmail));
            const querySnap = await getDocs(inviteQuery);
            if (!querySnap.empty) {
              const firstDoc = querySnap.docs[0];
              inviteDocRef = doc(db, 'invitations', firstDoc.id);
              inviteData = firstDoc.data();
            }
          } catch (queryErr) {
            console.error('Bypass list query also failed:', queryErr);
          }
        }

        if (inviteData) {
          const invRole = inviteData.role || 'agent';
          const displayName = currentUser.displayName || currentUser.email || (invRole === 'owner' ? 'Owner' : 'Agent');

          const newProfile = {
            uid: currentUser.uid,
            email: lowercaseEmail,
            workspaceId: inviteData.workspaceId,
            role: invRole,
            status: 'active',
            displayName,
            createdAt: new Date().toISOString()
          };

          console.log(`Writing ${invRole} user record users/{uid}...`);
          await setDoc(userRef, newProfile);
          console.log('User document created successfully');

          if (invRole === 'owner') {
            try {
              const wsRef = doc(db, 'workspaces', inviteData.workspaceId);
              await updateDoc(wsRef, { ownerUid: currentUser.uid });
            } catch (wsErr) {
              console.warn('Could not update ownerUid on workspace document:', wsErr);
            }
          }

          try {
            console.log('Revoking invitation document...');
            await deleteDoc(inviteDocRef);
            console.log('Invitation document deleted successfully');
          } catch (deleteErr) {
            console.warn('Could not delete invitation document on client-side (this is acceptable):', deleteErr);
          }

          setUserProfile(newProfile);

          const wsRef = doc(db, 'workspaces', inviteData.workspaceId);
          const wsSnap = await getDoc(wsRef);
          if (wsSnap.exists()) {
            const wsData = { id: wsSnap.id, ...wsSnap.data() } as any;
            setUserWorkspace(wsData);
            setEditWorkspaceName(wsData.name || '');
            setEditWorkspaceMode(wsData.mode || 'solo');
          }
          setAuthLoading(false);
        } else {
          // No invitation and no profile - stay on onboarding view
          setUserProfile(null);
          setAuthLoading(false);
        }
      }
    } catch (err) {
      console.error('Error loading session profile:', err);
      setAuthLoading(false);
    }
  };

  // 3. Workspace Leads and Member Subscriptions
  useEffect(() => {
    if (isDemoMode) {
      const loadDemoData = () => {
        try {
          const savedLeads = localStorage.getItem('leadpilot_demo_leads');
          if (savedLeads) {
            setLeads(JSON.parse(savedLeads));
          } else {
            const industryId = userWorkspace?.industryId || 'real-estate';
            const templateData = INITIAL_LEADS_BY_INDUSTRY[industryId] || [];
            const initialLeadsList = templateData.map((item, idx) => ({
              ...item,
              id: `demo-seed-${idx}-${Date.now()}`,
              createdAt: new Date().toISOString().split('T')[0],
              lastContacted: new Date().toISOString().split('T')[0],
              files: [],
              assignedTo: '',
              assignedToName: ''
            }));
            setLeads(initialLeadsList);
            localStorage.setItem('leadpilot_demo_leads', JSON.stringify(initialLeadsList));
          }

          setWorkspaceMembers([
            { uid: 'demo-sandbox-id', email: 'demo@leadpilot.co', displayName: 'Sandbox User', role: 'owner', status: 'active' },
            { uid: 'agent-1', email: 'agent1@apexhorizon.com', displayName: 'Agent Samantha', role: 'agent', status: 'active' },
            { uid: 'agent-2', email: 'agent2@apexhorizon.com', displayName: 'Agent Roger', role: 'agent', status: 'disabled' },
          ]);

          setWorkspaceInvitations([
            { email: 'pending_agent@apexhorizon.com', role: 'agent', createdAt: new Date().toISOString() }
          ]);
        } catch (err) {
          console.error('Failed to load demo sandbox states:', err);
        }
      };
      loadDemoData();
      return;
    }

    if (!user || !userProfile || !userProfile.workspaceId) return;
    const wsId = userProfile.workspaceId;

    // A. Sync Leads
    let leadsQuery;
    if (userProfile.role === 'owner') {
      leadsQuery = collection(db, 'workspaces', wsId, 'leads');
    } else {
      leadsQuery = query(
        collection(db, 'workspaces', wsId, 'leads'),
        where('assignedTo', '==', user.uid)
      );
    }

    const unsubscribeLeads = onSnapshot(leadsQuery, (snapshot) => {
      const list: Lead[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Lead);
      });
      list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      setLeads(list);
    }, (err) => {
      console.error('Failed to stream leads:', err);
      handleFirestoreError(err, OperationType.LIST, `workspaces/${wsId}/leads`);
    });

    // B. Sync Workspace Members (All authenticated workspace users can sync team list, invitations are Owner Only)
    let unsubscribeMembers = () => { };
    let unsubscribeInvites = () => { };

    const membersQuery = query(collection(db, 'users'), where('workspaceId', '==', wsId));
    console.log('[Firestore Sync Debug] Initializing members subscription. wsId used:', wsId);
    unsubscribeMembers = onSnapshot(membersQuery, (snapshot) => {
      console.log('[Firestore Sync Debug] Members Snapshot triggered!');
      console.log('[Firestore Sync Debug] snapshot.size:', snapshot.size);
      console.log('[Firestore Sync Debug] snapshot.metadata.fromCache:', snapshot.metadata?.fromCache);
      console.log('[Firestore Sync Debug] snapshot.metadata.hasPendingWrites:', snapshot.metadata?.hasPendingWrites);

      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        console.log(`[Firestore Sync Debug] Member doc id: ${docSnap.id}, source matches wsId (${wsId} == ${data?.workspaceId}):`, data?.workspaceId === wsId);
        console.log('[Firestore Sync Debug] doc data:', JSON.stringify(data));
        list.push(data);
      });
      console.log('[Firestore Sync Debug] Final members list to render:', JSON.stringify(list));
      setWorkspaceMembers(list);
    }, (err) => {
      console.error('[Firestore Sync Debug] Failed to stream workspace members:', err);
    });

    if (userProfile.role === 'owner') {
      const invitesQuery = query(collection(db, 'invitations'), where('workspaceId', '==', wsId));
      unsubscribeInvites = onSnapshot(invitesQuery, (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data());
        });
        setWorkspaceInvitations(list);
      }, (err) => {
        console.error('Failed to stream workspace invitations:', err);
      });
    }

    return () => {
      unsubscribeLeads();
      unsubscribeMembers();
      unsubscribeInvites();
    };
  }, [user, userProfile, isDemoMode, userWorkspace?.industryId]);

  // Translate active tenant info utilizing custom Firestore workspace settings
  const activeTenant: Tenant = {
    id: userWorkspace?.id || 'ws_preview',
    company_name: userWorkspace?.name || 'LeadPilot Workspace',
    industryId: userWorkspace?.industryId || 'real-estate',
    logoEmoji: userWorkspace?.industryId === 'tarot-coaching' ? '🔮' : userWorkspace?.industryId === 'taxi' ? '🚕' : '🏢',
    subscription_plan: userWorkspace?.mode === 'team' ? 'Professional' : 'Starter',
    status: 'active',
    assignedOwner: userProfile?.role === 'owner' ? userProfile.email : 'broker.steward@apexhorizon.com'
  };

  const activeIndustry = INDUSTRY_CONFIGS.find(i => i.id === activeTenant.industryId) || INDUSTRY_CONFIGS[0];
  console.log('ACTIVE TENANT:', activeTenant);
  console.log('ACTIVE INDUSTRY:', activeIndustry);
  console.log(
    'MATCH FOUND:',
    INDUSTRY_CONFIGS.find(i => i.id === activeTenant.industryId)
  );
  // 4. Onboarding Workspace Init
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !onboardCompanyName.trim()) return;

    setIsOnboardingSaving(true);
    try {
      const wsId = `ws_${user.uid}_${Date.now().toString(36)}`;

      // Update workspaces
      const wsDoc = {
        id: wsId,
        name: onboardCompanyName.trim(),
        mode: onboardIsTeamMode ? 'team' : 'solo',
        industryId: onboardIndustryId,
        ownerUid: user.uid,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'workspaces', wsId), wsDoc);

      // Create owner user profile
      const lowercaseEmail = user.email?.toLowerCase().trim() || '';
      const profileDoc = {
        uid: user.uid,
        email: lowercaseEmail,
        workspaceId: wsId,
        role: 'owner',
        status: 'active',
        displayName: user.displayName || user.email || 'Owner',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', user.uid), profileDoc);

      // Pre-seed demo database leads under workspaces/ws_id/leads/lead_id
      const templateData = INITIAL_LEADS_BY_INDUSTRY[onboardIndustryId] || [];
      const batch = writeBatch(db);

      templateData.forEach((item, idx) => {
        const leadId = `seed-${idx}-${Date.now()}`;
        const newLead: Lead = {
          ...item,
          id: leadId,
          createdAt: new Date().toISOString().split('T')[0],
          lastContacted: new Date().toISOString().split('T')[0],
          files: [],
          assignedTo: '',
          assignedToName: ''
        };
        const leadDocRef = doc(db, 'workspaces', wsId, 'leads', leadId);
        batch.set(leadDocRef, newLead);
      });

      await batch.commit();

      // Trigger session refresh
      await refreshUserProfile(user);

    } catch (err) {
      console.error('Failed to complete onboarding sequence:', err);
      alert('Initialization Error: could not initialize the Firestore. Check database permissions and retry.');
    } finally {
      setIsOnboardingSaving(false);
    }
  };

  // 5. Auth Handlers
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google authorization error:', err);
      alert('Sign-In Mismatch: authorization failed or closed by visitor.');
    }
  };

  const handleDemoBypassLogin = () => {
    if (!isDemoSandboxAllowed()) {
      alert('Demo Sandbox Mode is completely disabled in production environments. Please use real Google Authentication.');
      return;
    }
    try {
      localStorage.setItem('leadpilot_demo_mode', 'true');
      setIsDemoMode(true);
    } catch (e) {
      console.error('Failed to set demo mode state:', e);
    }
  };

  const handleDemoSuperAdminBypassLogin = () => {
    if (!isDemoSandboxAllowed()) {
      alert('Demo Sandbox Mode is completely disabled in production environments. Please use real Google Authentication.');
      return;
    }
    try {
      localStorage.setItem('leadpilot_demo_mode', 'true');
      localStorage.setItem('leadpilot_demo_super_admin', 'true');
      setIsDemoMode(true);
      setUser({
        uid: 'demo-super-admin-id',
        email: 'admin@leadpilot.co',
        displayName: 'Super Administrator',
        photoURL: null,
        emailVerified: true
      } as any);
      setUserProfile({
        uid: 'demo-super-admin-id',
        email: 'admin@leadpilot.co',
        workspaceId: '',
        role: 'super_admin',
        status: 'active',
        displayName: 'Super Administrator',
        createdAt: new Date().toISOString()
      });
      setUserWorkspace(null);
      setActiveTab('super_admin_dash');
    } catch (e) {
      console.error('Failed to set demo super admin state:', e);
    }
  };

  const handleLogout = async () => {
    try {
      if (isDemoMode) {
        setIsDemoMode(false);
        localStorage.removeItem('leadpilot_demo_mode');
        localStorage.removeItem('leadpilot_demo_super_admin');
        setUser(null);
        setUserProfile(null);
        setUserWorkspace(null);
        setLeads([]);
        setWorkspaceMembers([]);
        setWorkspaceInvitations([]);
        if (window.location.search) {
          window.history.pushState({}, document.title, window.location.pathname);
          setPublicFormTenantId(null);
        }
        return;
      }
      await signOut(auth);
      // Clean query parameter if returning home
      if (window.location.search) {
        window.history.pushState({}, document.title, window.location.pathname);
        setPublicFormTenantId(null);
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // 6. Settings tab update Workspace handler
  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userWorkspace || userProfile?.role !== 'owner') return;

    setIsSavingSettings(true);
    try {
      if (isDemoMode) {
        const updatedWs = {
          ...userWorkspace,
          name: editWorkspaceName.trim(),
          mode: editWorkspaceMode
        };
        setUserWorkspace(updatedWs);
        localStorage.setItem('leadpilot_demo_workspace', JSON.stringify(updatedWs));
        alert('Workspace preferences successfully updated instantly in local sandbox!');
        setIsSavingSettings(false);
        return;
      }

      const wsRef = doc(db, 'workspaces', userWorkspace.id);
      await updateDoc(wsRef, {
        name: editWorkspaceName.trim(),
        mode: editWorkspaceMode
      });

      // Update workspace object state directly
      setUserWorkspace((prev: any) => ({
        ...prev,
        name: editWorkspaceName.trim(),
        mode: editWorkspaceMode
      }));

      // SAVE workspace preference to localStorage
      localStorage.setItem('leadpilot_selected_workspace_id', userWorkspace.id);

      alert('Workspace preferences successfully updated instantly in Firestore!');
    } catch (err) {
      console.error('Failed to write changes:', err);
      alert('Write Permission: verification failed.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // 7. Team Inviter Handler
  const handleSendTeamInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userWorkspace || !inviteEmail.trim() || userProfile?.role !== 'owner') return;

    setIsSendingInvite(true);
    const lowerEmail = inviteEmail.toLowerCase().trim();
    try {
      if (isDemoMode) {
        const updatedWs = {
          ...userWorkspace,
          name: editWorkspaceName.trim(),
          mode: editWorkspaceMode
        };
        setUserWorkspace(updatedWs);
        localStorage.setItem('leadpilot_demo_workspace', JSON.stringify(updatedWs));
        // SAVE workspace preference to localStorage
        localStorage.setItem('leadpilot_selected_workspace_id', updatedWs.id);
        alert('Workspace preferences successfully updated instantly in local sandbox!');
        setIsSavingSettings(false);
        return;
      }

      const inviteRef = doc(db, 'invitations', lowerEmail);
      await setDoc(inviteRef, {
        email: lowerEmail,
        workspaceId: userWorkspace.id,
        role: 'agent',
        ownerEmail: userProfile.email,
        companyName: userWorkspace.name,
        createdAt: new Date().toISOString()
      });
      setInviteEmail('');
      alert(`Successfully sent pending agent invite code model to ${lowerEmail}!`);
    } catch (err) {
      console.error('Failed to create invitation:', err);
      alert('Failed to send team invite. Check rule path scopes.');
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleDeleteInvitation = async (inviteEmailAddr: string) => {
    try {
      if (isDemoMode) {
        setWorkspaceInvitations(prev => prev.filter(inv => inv.email !== inviteEmailAddr));
        alert('Invitation revoked successfully in local sandbox.');
        return;
      }
      await deleteDoc(doc(db, 'invitations', inviteEmailAddr));
      alert('Invitation revoked successfully.');
    } catch (err) {
      console.error('Delete invite error:', err);
    }
  };

  // Enable / Disable Team Members
  const handleToggleAgentStatus = async (agentUid: string, currentStatus: string) => {
    try {
      const targetStatus = currentStatus === 'active' ? 'disabled' : 'active';
      if (isDemoMode) {
        setWorkspaceMembers(prev => prev.map(m => m.uid === agentUid ? { ...m, status: targetStatus } : m));
        alert(`Agent system profile is now: ${targetStatus.toUpperCase()}`);
        return;
      }
      await updateDoc(doc(db, 'users', agentUid), { status: targetStatus });
      alert(`Agent system profile is now: ${targetStatus.toUpperCase()}`);
    } catch (err) {
      console.error('Toggle status failed:', err);
    }
  };

  const handleRemoveAgent = async (agentUid: string) => {
    try {
      if (confirm('Delete member? They will lose access to this CRM environment.')) {
        if (isDemoMode) {
          setWorkspaceMembers(prev => prev.filter(m => m.uid !== agentUid));
          alert('Agent removed from workspace successfully.');
          return;
        }
        await updateDoc(doc(db, 'users', agentUid), { workspaceId: '' });
        alert('Agent removed from workspace successfully.');
      }
    } catch (err) {
      console.error('Remove agent failed:', err);
    }
  };

  // 8. Lead Interactions (Writes directly to Firestore!)
  const handleMoveLead = async (leadId: string, newStageId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      if (isDemoMode) {
        const updated = leads.map(l => l.id === leadId ? { ...l, stageId: newStageId, lastContacted: today } : l);
        setLeads(updated);
        localStorage.setItem('leadpilot_demo_leads', JSON.stringify(updated));
        return;
      }
      const wsId = userProfile?.workspaceId || userWorkspace?.id;
      if (!wsId) throw new Error("Workspace ID is undefined.");
      const leadDocRef = doc(db, 'workspaces', wsId, 'leads', leadId);
      await updateDoc(leadDocRef, {
        stageId: newStageId,
        lastContacted: today
      });
    } catch (err) {
      console.error('Move stage failed:', err);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      if (confirm('Are you sure you want to permanently delete this lead? This cannot be undone.')) {
        if (isDemoMode) {
          const updated = leads.filter(l => l.id !== leadId);
          setLeads(updated);
          localStorage.setItem('leadpilot_demo_leads', JSON.stringify(updated));
          if (selectedLead?.id === leadId) {
            setSelectedLead(null);
          }
          return;
        }
        const wsId = userProfile?.workspaceId || userWorkspace?.id;
        if (!wsId) throw new Error("Workspace ID is undefined.");
        const leadDocRef = doc(db, 'workspaces', wsId, 'leads', leadId);
        await deleteDoc(leadDocRef);
        if (selectedLead?.id === leadId) {
          setSelectedLead(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  const handleAddLiveLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'lastContacted' | 'notes' | 'tasks'> & { noteText?: string }) => {
    try {
      const newId = `lead-${Date.now()}`;
      const today = new Date().toISOString().split('T')[0];

      // 1. Before creating newLead, remove all undefined values from leadData
      const cleanedLeadData: any = {};
      for (const [key, val] of Object.entries(leadData)) {
        if (val !== undefined) {
          cleanedLeadData[key] = val;
        }
      }

      // 2. Ensure noteText is stored as: empty string "" OR omitted completely, never undefined
      if ('noteText' in cleanedLeadData) {
        if (cleanedLeadData.noteText === undefined || cleanedLeadData.noteText === null) {
          delete cleanedLeadData.noteText;
        } else {
          cleanedLeadData.noteText = String(cleanedLeadData.noteText).trim();
        }
      }

      // 3. Ensure optional email is: empty string "" and never undefined
      cleanedLeadData.email = cleanedLeadData.email ? String(cleanedLeadData.email).trim() : "";

      const newNotes = cleanedLeadData.noteText
        ? [{ id: `note-${Date.now()}`, content: cleanedLeadData.noteText, createdAt: today, author: userProfile?.displayName || 'Advisor Agent' }]
        : [];

      const newTasks = [
        { id: `task-${Date.now()}-1`, title: 'Initial telephone check on core requirement', completed: false },
        { id: `task-${Date.now()}-2`, title: 'Schedule calendar call agenda', completed: false }
      ];

      const assignedToVal = userProfile?.role === 'agent' ? (auth.currentUser?.uid || userProfile?.uid || '') : '';
      const assignedToNameVal = userProfile?.role === 'agent' ? (userProfile.displayName || userProfile.email || 'Agent') : '';

      const newLead: Lead = {
        ...cleanedLeadData,
        id: newId,
        createdAt: today,
        lastContacted: today,
        notes: newNotes,
        tasks: newTasks,
        files: [],
        assignedTo: assignedToVal,
        assignedToName: assignedToNameVal
      };

      // Ensure no properties on newLead are undefined
      Object.keys(newLead).forEach(key => {
        if ((newLead as any)[key] === undefined) {
          delete (newLead as any)[key];
        }
      });

      if (isDemoMode) {
        const updated = [newLead, ...leads];
        setLeads(updated);
        localStorage.setItem('leadpilot_demo_leads', JSON.stringify(updated));
        setIsFormOpen(false);
        triggerAutoSyncWebhook([newLead]);
        return;
      }

      const wsIdToUse = userProfile?.workspaceId || userWorkspace?.id;
      if (!wsIdToUse) {
        throw new Error("Unable to identify active workspace ID. Profile and workspace references are empty.");
      }

      const leadDocRef = doc(db, 'workspaces', wsIdToUse, 'leads', newId);

      console.log("ROLE:", userProfile?.role);
      console.log("AUTH UID:", auth.currentUser?.uid);
      console.log("USER PROFILE UID:", userProfile?.uid);
      console.log("ASSIGNED TO:", newLead.assignedTo);
      console.log("ASSIGNED TO NAME:", newLead.assignedToName);
      console.log("LEAD PAYLOAD:", newLead);

      await setDoc(leadDocRef, newLead);
      setIsFormOpen(false);
      triggerAutoSyncWebhook([newLead]);
    } catch (err) {
      console.error('Failed adding lead:', err);
      alert('Error creating lead document in Firestore.');
    }
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    try {
      if (isDemoMode) {
        const updated = leads.map(l => l.id === updatedLead.id ? updatedLead : l);
        setLeads(updated);
        localStorage.setItem('leadpilot_demo_leads', JSON.stringify(updated));
        setSelectedLead(updatedLead);
        return;
      }
      const wsId = userProfile?.workspaceId || userWorkspace?.id;
      if (!wsId) throw new Error("Workspace ID is undefined.");
      const leadDocRef = doc(db, 'workspaces', wsId, 'leads', updatedLead.id);
      console.log(
        'SAVING FOLLOWUP:',
        updatedLead.id,
        updatedLead.customFields?.nextFollowUpDate
      );
      await setDoc(
        leadDocRef,
        updatedLead,
        { merge: true }
      );
      console.log('SAVED FOLLOWUP:', updatedLead.customFields?.nextFollowUpDate);
      setSelectedLead(updatedLead);
    } catch (err) {
      console.error('Update lead failed:', err);
    }
  };

  const handleBatchImportLeads = async (newLeadsList: Lead[]) => {
    try {
      if (isDemoMode) {
        const updated = [...newLeadsList, ...leads];
        setLeads(updated);
        localStorage.setItem('leadpilot_demo_leads', JSON.stringify(updated));
        setDashboardFilter('all');
        alert(`Imported ${newLeadsList.length} leads successfully into local sandbox!`);
        triggerAutoSyncWebhook(newLeadsList);
        return;
      }
      const wsId = userProfile?.workspaceId || userWorkspace?.id;
      if (!wsId) throw new Error("Workspace ID is undefined.");
      const batch = writeBatch(db);
      newLeadsList.forEach((newLead) => {
        const docRef = doc(db, 'workspaces', wsId, 'leads', newLead.id);
        batch.set(docRef, { ...newLead, files: newLead.files || [] });
      });
      await batch.commit();
      setDashboardFilter('all');
      alert(`Imported ${newLeadsList.length} leads successfully!`);
      triggerAutoSyncWebhook(newLeadsList);
    } catch (err) {
      console.error('Batch CSV writing failed:', err);
      alert('CSV Write Mismatch: error executing batch writes in Firestore.');
    }
  };

  // Google Sheets Auto Webhook Sync Trigger
  const triggerAutoSyncWebhook = (activeLeadsList: Lead[], industryId?: string, workspaceName?: string) => {
    try {
      const indId = industryId || activeIndustry.id;
      const webhookUrl = localStorage.getItem(`leadpilot_sheets_webhook_${indId}`);
      if (webhookUrl && webhookUrl.trim() && activeLeadsList.length > 0) {
        activeLeadsList.forEach((lead) => {
          const notesValue = lead.notes && lead.notes.length > 0 ? lead.notes[0].content : '';
          const followupDateValue = lead.tasks && lead.tasks.length > 0 ? (lead.tasks[0].dueDate || '') : '';
          const cityValue = lead.customFields && lead.customFields.city ? String(lead.customFields.city) : '';

          const payload: Record<string, string> = {
            row_id: lead.id,
            date: lead.createdAt,
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            city: cityValue,
            source: lead.source,
            status: lead.status,
            agent: lead.assignedToName || '',
            notes: notesValue,
            followup_date: followupDateValue
          };

          // Dynamically pass extra custom fields so they are mapped in custom headers on Google Sheets
          if (lead.customFields) {
            Object.entries(lead.customFields).forEach(([k, v]) => {
              if (k !== 'city') {
                payload[k] = String(v);
              }
            });
          }

          fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
          }).catch(err => {
            console.warn(`Auto-sync background webhook communication error for lead ID ${lead.id}:`, err);
          });
        });
      }
    } catch (e) {
      console.warn('Background sync trigger omitted:', e);
    }
  };

  // File Upload Handlers (Phase 8 - File Attachments)
  const handleUploadFile = async (leadId: string, file: File) => {
    if (!userWorkspace) return;
    setIsUploadingFile(true);
    try {
      if (isDemoMode) {
        const url = URL.createObjectURL(file);
        const updatedFiles = [...(selectedLead?.files || []), {
          name: file.name,
          url,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: userProfile?.displayName || 'Agent'
        }];
        const newNote: Note = {
          id: `note-file-${Date.now()}`,
          content: `📎 Attached file document: "${file.name}"`,
          createdAt: new Date().toISOString().split('T')[0],
          author: userProfile?.displayName || 'Advisor'
        };
        const updatedLeads = leads.map(l => {
          if (l.id === leadId) {
            return {
              ...l,
              files: updatedFiles,
              notes: [newNote, ...(l.notes || [])]
            };
          }
          return l;
        });
        setLeads(updatedLeads);
        localStorage.setItem('leadpilot_demo_leads', JSON.stringify(updatedLeads));
        if (selectedLead?.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, files: updatedFiles, notes: [newNote, ...(prev.notes || [])] } : null);
        }
        alert('File attachment added to local sandbox successfully!');
        return;
      }

      const wsId = userProfile?.workspaceId || userWorkspace?.id;
      if (!wsId) throw new Error("Workspace ID is undefined.");
      const storagePath = `workspaces/${wsId}/leads/${leadId}/files/${Date.now()}_${file.name}`;
      const fileRef = ref(storage, storagePath);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      const leadDocRef = doc(db, 'workspaces', wsId, 'leads', leadId);
      const leadSnap = await getDoc(leadDocRef);
      if (leadSnap.exists()) {
        const leadData = leadSnap.data() as Lead;
        const currentFiles = leadData.files || [];
        const updatedFiles: LeadFile[] = [...currentFiles, {
          name: file.name,
          url,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: userProfile?.displayName || 'Agent'
        }];

        await updateDoc(leadDocRef, { files: updatedFiles });

        const newNote: Note = {
          id: `note-file-${Date.now()}`,
          content: `📎 Attached file document: "${file.name}"`,
          createdAt: new Date().toISOString().split('T')[0],
          author: userProfile?.displayName || 'Advisor'
        };

        await updateDoc(leadDocRef, { notes: [newNote, ...(leadData.notes || [])] });

        if (selectedLead?.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, files: updatedFiles, notes: [newNote, ...(prev.notes || [])] } : null);
        }
        alert('File attachment uploaded and added to lead profile successfully!');
      }
    } catch (err) {
      console.error('Storage upload error:', err);
      alert(`Failed to upload file attachment: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteFile = async (leadId: string, fileIndex: number, fileUrl: string) => {
    if (!userWorkspace) return;
    try {
      if (isDemoMode) {
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
          const updatedFiles = (lead.files || []).filter((_, idx) => idx !== fileIndex);
          const fileToDelete = (lead.files || [])[fileIndex];
          const deleteNote: Note = {
            id: `note-file-del-${Date.now()}`,
            content: `🗑️ Removed file attachment: "${fileToDelete?.name || 'document'}"`,
            createdAt: new Date().toISOString().split('T')[0],
            author: userProfile?.displayName || 'Advisor'
          };
          const updatedLeads = leads.map(l => {
            if (l.id === leadId) {
              return {
                ...l,
                files: updatedFiles,
                notes: [deleteNote, ...(l.notes || [])]
              };
            }
            return l;
          });
          setLeads(updatedLeads);
          localStorage.setItem('leadpilot_demo_leads', JSON.stringify(updatedLeads));
          if (selectedLead?.id === leadId) {
            setSelectedLead(prev => prev ? { ...prev, files: updatedFiles, notes: [deleteNote, ...(prev.notes || [])] } : null);
          }
          alert('File attachment removed successfully.');
        }
        return;
      }

      try {
        const fileRef = ref(storage, fileUrl);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('Firebase storage blob non-existent or deleted, cleaning database ref.', err);
      }

      const wsId = userProfile?.workspaceId || userWorkspace?.id;
      if (!wsId) throw new Error("Workspace ID is undefined.");
      const leadDocRef = doc(db, 'workspaces', wsId, 'leads', leadId);
      const leadSnap = await getDoc(leadDocRef);
      if (leadSnap.exists()) {
        const leadData = leadSnap.data() as Lead;
        const currentFiles = leadData.files || [];
        const fileToDelete = currentFiles[fileIndex];
        const updatedFiles = currentFiles.filter((_, idx) => idx !== fileIndex);

        await updateDoc(leadDocRef, { files: updatedFiles });

        const deleteNote: Note = {
          id: `note-file-del-${Date.now()}`,
          content: `🗑️ Removed file attachment: "${fileToDelete?.name || 'document'}"`,
          createdAt: new Date().toISOString().split('T')[0],
          author: userProfile?.displayName || 'Advisor'
        };

        await updateDoc(leadDocRef, { notes: [deleteNote, ...(leadData.notes || [])] });

        if (selectedLead?.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, files: updatedFiles, notes: [deleteNote, ...(prev.notes || [])] } : null);
        }
        alert('File attachment removed successfully.');
      }
    } catch (err) {
      console.error('File delete failed: ', err);
      alert('File Delete Mismatch: write permission denied.');
    }
  };

  // 9. Lead Assignment (Team Owner Only)
  const handleAssignLead = async (leadId: string, agentUid: string, agentName: string) => {
    try {
      const assignNote: Note = {
        id: `note-assign-${Date.now()}`,
        content: agentUid ? `👤 Reassigned client dashboard to Agent: ${agentName}` : `👤 Removed assignment. Client returned to unassigned roster.`,
        createdAt: new Date().toISOString().split('T')[0],
        author: userProfile?.displayName || 'Owner'
      };

      if (isDemoMode) {
        const updated = leads.map(l => {
          if (l.id === leadId) {
            return {
              ...l,
              assignedTo: agentUid,
              assignedToName: agentName,
              notes: [assignNote, ...(l.notes || [])]
            };
          }
          return l;
        });
        setLeads(updated);
        localStorage.setItem('leadpilot_demo_leads', JSON.stringify(updated));
        if (selectedLead?.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, assignedTo: agentUid, assignedToName: agentName, notes: [assignNote, ...(prev.notes || [])] } : null);
        }
        alert('Agent allocation updated instantly in local sandbox.');
        return;
      }

      const wsId = userProfile?.workspaceId || userWorkspace?.id;
      if (!wsId) throw new Error("Workspace ID is undefined.");
      const leadDocRef = doc(db, 'workspaces', wsId, 'leads', leadId);
      await updateDoc(leadDocRef, {
        assignedTo: agentUid,
        assignedToName: agentName
      });

      const leadSnap = await getDoc(leadDocRef);
      if (leadSnap.exists()) {
        const leadData = leadSnap.data();
        await updateDoc(leadDocRef, { notes: [assignNote, ...(leadData.notes || [])] });
      }

      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, assignedTo: agentUid, assignedToName: agentName, notes: [assignNote, ...(prev.notes || [])] } : null);
      }
      alert('Agent allocation updated instantly in real-time database.');
    } catch (err) {
      console.error('Assign lead failed:', err);
    }
  };

  const triggerQuickAdd = (stageId: string) => {
    setFormInitialStageId(stageId);
    setIsFormOpen(true);
  };

  const handleDashboardFilterClick = (filterType: typeof dashboardFilter) => {
    console.log('CLICK:', filterType);
    setDashboardFilter(filterType);
    setActiveTab('leads');
  };

  // Dynamic colors highlighted for current industry config
  const getIndustryThemeColor = (id: string) => {
    switch (id) {
      case 'real-estate': return 'from-emerald-600 to-teal-700 bg-emerald-600 border-emerald-600 text-emerald-600';
      case 'insurance': return 'from-sky-600 to-indigo-700 bg-sky-600 border-sky-600 text-sky-600';
      case 'tarot-coaching': return 'from-purple-600 to-indigo-700 bg-purple-600 border-purple-600 text-purple-600';
      case 'taxi': return 'from-amber-500 to-orange-600 bg-amber-500 border-amber-500 text-amber-700';
      case 'coaching': return 'from-violet-600 to-indigo-700 bg-violet-600 border-violet-600 text-violet-600';
      case 'institution': return 'from-rose-600 to-pink-700 bg-rose-600 border-rose-600 text-rose-600';
      case 'creative-agency': return 'from-pink-600 to-violet-700 bg-pink-600 border-pink-600 text-pink-600';
      default: return 'from-slate-700 to-slate-900 bg-slate-700 border-slate-700 text-slate-700';
    }
  };

  const getIndustryTextHighlight = (id: string) => {
    switch (id) {
      case 'real-estate': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'insurance': return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'tarot-coaching': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'taxi': return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'coaching': return 'text-violet-700 bg-violet-50 border-violet-200';
      case 'institution': return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'creative-agency': return 'text-pink-700 bg-pink-50 border-pink-200';
      default: return 'text-slate-800 bg-slate-50 border-slate-200';
    }
  };

  // 10. Computations & Follow-up Alerts Dashboard Logic
  const currentLeads = leads;
  const todayDateStr = new Date().toISOString().split('T')[0];
  const totalLeadsCount = currentLeads.length;

  const finalStageId =
    activeIndustry.stages[activeIndustry.stages.length - 1]?.id || '';

  const isCompletedLead = (l: Lead) =>
    l.stageId === 'won_client' ||
    l.stageId === 'project_delivered' ||
    l.status === 'won';

  // NOW use isCompletedLead
  const openLeadsCount = currentLeads.filter(
    l => l.status === 'active' && !isCompletedLead(l)
  ).length;

  const todayCreatedCount = currentLeads.filter(
    l => l.createdAt === todayDateStr
  ).length;

  // TODAY KPI
  const todayFollowupLeads = currentLeads.filter(
    l =>
      l.status === 'active' &&
      !isCompletedLead(l) &&
      l.customFields?.nextFollowUpDate === todayDateStr
  );

  const todayFollowupsCount = todayFollowupLeads.length;

  // MISSED KPI



  // OVERDUE KPI: Count leads where nextFollowUpDate is before today AND lead is not completed/closed.
  const missedFollowupLeads = currentLeads.filter(l =>
    l.status === 'active' &&
    !isCompletedLead(l) &&
    l.customFields?.nextFollowUpDate &&
    l.customFields.nextFollowUpDate < todayDateStr
  );
  const missedFollowupsCount = missedFollowupLeads.length;

  const scheduledFollowupLeads = currentLeads.filter((lead) => {
    const date = lead.customFields?.nextFollowUpDate;

    if (!date) return false;

    return (
      lead.status === 'active' &&
      !isCompletedLead(lead) &&
      date > todayDateStr
    );
  });

  const scheduledFollowupsCount = scheduledFollowupLeads.length;
  console.log(
    'SCHEDULED FOLLOWUPS:',
    scheduledFollowupsCount
  );

  // UPCOMING KPI: Count leads where nextFollowUpDate is after today.
  const upcomingFollowupLeads = currentLeads.filter(l =>
    l.status === 'active' &&
    !isCompletedLead(l) &&
    l.customFields?.nextFollowUpDate &&
    l.customFields.nextFollowUpDate > todayDateStr
  );
  const meetingsCount = upcomingFollowupLeads.length;

  // COMPLETED KPI: Use the industry's final stage instead of hardcoded values.
  const closedDealsLeads = currentLeads.filter(lead =>
    isCompletedLead(lead) ||
    lead.status?.toLowerCase() === 'lost' ||
    lead.status?.toLowerCase() === 'closed'  // ← ADD THIS
  );

  const repeatClientsLeads = currentLeads.filter(l => {
    const status = l.status
      ? String(l.status).toLowerCase().trim()
      : '';

    return (
      status === 'returning client' ||
      status === 'repeat client'
    );
  });

  const repeatClientsCount = repeatClientsLeads.length;

  // INSURANCE CRM
  const policiesActivatedLeads = currentLeads.filter(l => {
    const status = l.status ? String(l.status).toLowerCase().trim() : '';
    const stageId = l.stageId ? String(l.stageId).toLowerCase().trim() : '';

    return status === 'policy activated' || stageId === 'policy_active';
  });

  const policiesActivatedCount = policiesActivatedLeads.length;


  // Debug: Check what's being counted
  console.log('All Leads Status Values:', currentLeads.map(l => l.status));
  console.log('Policies Activated Leads:', policiesActivatedLeads.map(l => ({
    name: l.name,
    status: l.status,
    stageId: l.stageId
  })));
  console.log('Policies Activated Count:', policiesActivatedCount);

  const closedDealsCount = closedDealsLeads.length;
  console.log('TOTAL:', totalLeadsCount);
  console.log('OPEN:', openLeadsCount);
  console.log('CLOSED:', closedDealsCount);
  console.log('FINAL STAGE ID:', finalStageId);


  // Follow-Up Stage Metrics
  const followUp1DueLeads = currentLeads.filter(l => l.customFields?.followUpStage === 1);
  const followUp1DueCount = followUp1DueLeads.length;

  const followUp2DueLeads = currentLeads.filter(l => l.customFields?.followUpStage === 2);
  const followUp2DueCount = followUp2DueLeads.length;

  const finalFollowUpDueLeads = currentLeads.filter(l => l.customFields?.followUpStage === 4);
  const finalFollowUpDueCount = finalFollowUpDueLeads.length;

  // Active Conversations
  const activeConversationLeads = currentLeads.filter(l =>
    l.status === 'active' &&
    l.communicationHistory &&
    l.communicationHistory.length > 0
  );
  const activeConversationCount = activeConversationLeads.length;

  const tableLeads = (() => {
    console.log('dashboardFilter=', dashboardFilter);
    console.log('todayFollowupLeads=', todayFollowupLeads.length);
    console.log('missedFollowupLeads=', missedFollowupLeads.length);


    if (
      typeof dashboardFilter === 'string' &&
      dashboardFilter.startsWith('status_')
    ) {
      const statusName = dashboardFilter.replace('status_', '');

      console.log('📋 STATUS FILTER:', statusName);

      return currentLeads.filter(
        lead =>
          lead.status?.toLowerCase().trim() ===
          statusName.toLowerCase().trim()
      );
    }
    if (
      typeof dashboardFilter === 'string' &&
      dashboardFilter.startsWith('stage_')
    ) {
      const stageId = dashboardFilter.replace('stage_', '');

      return currentLeads.filter(
        lead => lead.stageId === stageId
      );
    }

    switch (dashboardFilter) {
      case 'today_followups':
        console.log('📋 CASE MATCHED: today_followups, returning', todayFollowupLeads.length, 'leads');  // ← Add this
        return todayFollowupLeads;

      case 'missed_followups':
        console.log('📋 CASE MATCHED: missed_followups, returning', missedFollowupLeads.length, 'leads');
        return missedFollowupLeads;

      case 'meetings_today':
        console.log('📋 CASE MATCHED: meetings_today, returning', todayFollowupLeads.length, 'leads');
        return todayFollowupLeads;
      case 'scheduled_followups':
        console.log(
          '📋 CASE MATCHED: scheduled_followups, returning',
          scheduledFollowupLeads.length,
          'leads'
        );
        return scheduledFollowupLeads;

      case 'closed_deals':
        console.log('📋 CASE MATCHED: closed_deals, returning', closedDealsLeads.length, 'leads');
        return closedDealsLeads;

      case 'followup_1':
        console.log('📋 CASE MATCHED: followup_1, returning', followUp1DueLeads.length, 'leads');
        return followUp1DueLeads;

      case 'followup_2':
        console.log('📋 CASE MATCHED: followup_2, returning', followUp2DueLeads.length, 'leads');
        return followUp2DueLeads;

      case 'followup_final':
        console.log('📋 CASE MATCHED: followup_final, returning', finalFollowUpDueLeads.length, 'leads');
        return finalFollowUpDueLeads;

      case 'active_conversations':
        console.log('📋 CASE MATCHED: active_conversations, returning', activeConversationLeads.length, 'leads');
        return activeConversationLeads;
      case 'open':
        return currentLeads.filter(
          l => l.status === 'active' && !isCompletedLead(l)
        );

      case 'closed':
        return currentLeads.filter(
          l => isCompletedLead(l)
        );

      case 'today':
        return currentLeads.filter(
          l => l.createdAt === todayDateStr
        );

      default:
        console.log('⚠️ NO CASE MATCHED! Returning DEFAULT currentLeads:', currentLeads.length, 'leads');
        return currentLeads;
    }
  })();


  // Final filtered array depending on Dashboard Interactive selection

  // Public Lead Intake Capture Gateway Screen Router
  if (publicFormTenantId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        {publicFormLoading ? (
          <div className="text-white text-center space-y-3 font-mono">
            <LucideIcons.Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <span>Resolving custom CRM referral capturing terminal...</span>
          </div>
        ) : !publicFormWorkspace ? (
          <div className="bg-white p-8 rounded-3xl text-center max-w-sm border border-gray-100 shadow-xl space-y-4 font-sans">
            <div className="p-3 bg-red-100 text-red-600 rounded-full w-14 h-14 mx-auto flex items-center justify-center">
              <LucideIcons.ShieldAlert className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-slate-950">Invalid Workspace Reference</h4>
            <p className="text-xs text-gray-500">The referral capture form you are searching for is invalid or retired by its owner.</p>
            <button
              onClick={() => {
                window.history.pushState({}, document.title, window.location.pathname);
                setPublicFormTenantId(null);
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Back to Home Port
            </button>
          </div>
        ) : (
          <div className="w-full max-w-lg mt-6 mb-12">
            <PublicLeadCaptureForm
              tenantId={publicFormWorkspace.id}
              tenants={[{
                id: publicFormWorkspace.id,
                company_name: publicFormWorkspace.name,
                industryId: publicFormWorkspace.industryId,
                logoEmoji: publicFormWorkspace.industryId === 'tarot-coaching' ? '🔮' : '🏢',
                subscription_plan: 'Professional',
                status: 'active',
                assignedOwner: publicFormWorkspace.ownerUid
              }]}
              onAddPublicLead={async (tenantId, inboundLead) => {
                try {
                  const docRef = doc(db, 'workspaces', tenantId, 'leads', inboundLead.id);
                  await setDoc(docRef, inboundLead);
                  alert('Referral successfully captured directly in workspace cloud database!');
                  triggerAutoSyncWebhook([inboundLead], publicFormWorkspace?.industryId, publicFormWorkspace?.name);
                } catch (err) {
                  console.error('Failed to capture inbound lead:', err);
                  alert('Capture Error: check network rules.');
                }
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Loading Screen Shield
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center font-mono space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 border-t-2 border-emerald-400 rounded-full animate-spin" />
          <LucideIcons.Loader2 className="w-8 h-8 text-emerald-400 animate-pulse shrink-0" />
        </div>
        <div className="space-y-1">
          <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Loading LeadPilot V2 Environment</h4>
          <span className="text-[10px] text-zinc-500">Connecting to secure Google Firestore endpoints...</span>
        </div>
      </div>
    );
  }

  // Login Splash Interface Gate
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Animated ambient gradient blob highlights */}
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-900/15 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-emerald-950/20 rounded-full filter blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6 text-center backdrop-blur-md">

          {/* Logo element */}
          <div className="space-y-3">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-md shadow-emerald-500/10">
              <LucideIcons.Send className="w-8 h-8 text-white rotate-45 transform" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">LeadPilot V2</h2>
              <p className="text-zinc-400 text-xs mt-1 max-w-xs mx-auto">
                The Ultra-Fast AI-Assisted CRM for High-Performing Teams & Solo Entrepreneurs.
              </p>
            </div>
          </div>

          <div className="border-t border-zinc-800/80 pt-6 space-y-4">
            {/* Google Authentication */}
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 bg-zinc-805 hover:bg-zinc-800 border border-zinc-700 text-white font-medium rounded-xl text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer"
            >
              {/* Google vector icon */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.61 0 3.09.55 4.23 1.64l3.15-3.15C17.46 1.7 14.95 1 12 1 7.37 1 3.42 3.66 1.5 7.56l3.75 2.91C6.18 7.33 8.86 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.88 3.39-8.54z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.25 14.52c-.25-.75-.39-1.55-.39-2.38s.14-1.63.39-2.38L1.5 6.85C.54 8.77 0 10.92 0 13.15s.54 4.38 1.5 6.3l3.75-2.93z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.14 0-5.82-2.29-6.77-5.43L1.5 16.27C3.42 20.16 7.37 23 12 23y"
                />
              </svg>
              <span>Continue with Google Account</span>
            </button>

            {/* Dynamic Sandbox/Demo Bypass button */}
            {isDemoSandboxAllowed() && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-zinc-900 px-3 text-zinc-500 font-mono text-[9px] tracking-widest uppercase">Or Sandbox Bypass</span>
                  </div>
                </div>

                <button
                  onClick={handleDemoBypassLogin}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-sm flex flex-col items-center justify-center transition-opacity shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <LucideIcons.ShieldAlert className="w-4 h-4 text-emerald-300 animate-pulse" />
                    <span>Demo Sandbox Bypass</span>
                    <span className="text-[9px] bg-emerald-400 text-emerald-950 font-bold px-1.5 py-0.2 rounded font-mono uppercase tracking-wide">Ready</span>
                  </div>
                  <span className="text-[10px] text-zinc-100 font-normal mt-0.5">Recommended for immediate previews & iframe sandbox</span>
                </button>

                <button
                  onClick={handleDemoSuperAdminBypassLogin}
                  className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-white font-bold rounded-xl text-sm flex flex-col items-center justify-center transition-all cursor-pointer mt-2"
                >
                  <div className="flex items-center gap-2">
                    <LucideIcons.ShieldCheck className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span>Demo Super Admin Bypass</span>
                    <span className="text-[9px] bg-indigo-500 text-white font-bold px-1.5 py-0.2 rounded font-mono uppercase tracking-wide">Admin</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-normal mt-0.5">Test Super Admin client list, metrics, & rules</span>
                </button>
              </>
            )}

            {/* Collapsible Troubleshoot info */}
            <div className="border border-zinc-800 rounded-xl bg-zinc-950/60 p-4 text-left space-y-3">
              <button
                type="button"
                onClick={() => setShowTroubleshoot(!showTroubleshoot)}
                className="w-full flex items-center justify-between text-xs font-semibold text-zinc-400 hover:text-white transition-colors focus:outline-none cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <LucideIcons.HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Seeing Google Auth Mismatches / Errors?</span>
                </div>
                {showTroubleshoot ? (
                  <LucideIcons.ChevronUp className="w-4 h-4 shrink-0" />
                ) : (
                  <LucideIcons.ChevronDown className="w-4 h-4 shrink-0" />
                )}
              </button>

              {showTroubleshoot && (
                <div className="text-[11px] text-zinc-400 space-y-2 border-t border-zinc-850 pt-2 font-sans leading-relaxed animate-fade-in">
                  <p>
                    Iframe sandbox restrictions block Google Auth cookies by default. To enable full Firestore integrations:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] list-inside">
                    <li>Open your <strong className="text-zinc-200">Firebase Console</strong>.</li>
                    <li>Go to <strong className="text-zinc-200">Authentication › Settings › Authorized Domains</strong>.</li>
                    <li>Click <strong className="text-zinc-200">Add Domain</strong> & insert:
                      <code className="block mt-1 p-1 bg-zinc-900 border border-zinc-800 rounded font-mono text-[10px] text-indigo-300 select-all overflow-x-auto truncate">
                        {window.location.hostname}
                      </code>
                    </li>
                  </ol>
                  <p className="text-[10px] text-zinc-500 italic mt-1">
                    Once customized, refresh this interface to log in. In the meantime, use the <strong className="text-emerald-400">Demo Sandbox Bypass</strong> above to test all features instantly!
                  </p>
                </div>
              )}
            </div>

            <p className="text-[10px] text-zinc-500 font-mono">SECURE MULTI-TENANT GATE • DISIsolation V2 ENG</p>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding Setup Screen Router (If logged in but profile document does not yet exist)
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative font-sans">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[100px]" />

        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-7 shadow-2xl space-y-6 text-left relative z-10">
          <div className="space-y-1.5 border-b border-zinc-800 pb-4">
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[9px] font-bold uppercase tracking-wider">
              Onboarding Phase 1
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Setup Your Workspace 🚀</h3>
            <p className="text-xs text-zinc-400">Initialize your cloud database pipeline to begin managing your leads.</p>
          </div>

          <form onSubmit={handleOnboardSubmit} className="space-y-4">

            {/* Input Workspace Name */}
            <div className="space-y-1">
              <label className="text-zinc-400 text-xs font-semibold block">Company or Profile Name</label>
              <input
                type="text"
                placeholder="e.g. Apex Horizon Estates"
                required
                value={onboardCompanyName}
                onChange={(e) => setOnboardCompanyName(e.target.value)}
                className="w-full text-sm border border-zinc-700 bg-zinc-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Selector Config Industry */}
            <div className="space-y-1">
              <label className="text-zinc-450 text-xs font-semibold block">Industry Framework Terminology</label>
              <select
                value={onboardIndustryId}
                onChange={(e) => setOnboardIndustryId(e.target.value)}
                className="w-full text-sm border border-zinc-700 bg-zinc-800 text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-550"
              >
                {INDUSTRY_CONFIGS.map(cfg => (
                  <option key={cfg.id} value={cfg.id}>
                    {cfg.name} (e.g. {cfg.leadLabel}s)
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-zinc-500 mt-0.5 block italic leading-normal">
                This instantly configures all dynamic wordings (Value metrics, followups, stages, and dashboards in Firestore).
              </span>
            </div>

            {/* Toggle Business Format Mode */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="text-zinc-400 text-xs font-semibold block">SaaS Operations Format</label>
              <div className="grid grid-cols-2 gap-3">

                {/* Solo Mode option */}
                <div
                  onClick={() => setOnboardIsTeamMode(false)}
                  className={`p-3.5 rounded-xl border border-zinc-850 cursor-pointer select-none transition-all ${!onboardIsTeamMode ? 'border-indigo-600 bg-indigo-950/20 text-white' : 'hover:border-zinc-700 text-zinc-400 hover:text-white'}`}
                >
                  <LucideIcons.User className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-bold block">Solo CRM Mode</span>
                  <span className="text-[9px] text-zinc-500 block leading-normal mt-0.5">Streamlined format. Ideal for sole operators.</span>
                </div>

                {/* Team Mode option */}
                <div
                  onClick={() => setOnboardIsTeamMode(true)}
                  className={`p-3.5 rounded-xl border border-zinc-850 cursor-pointer select-none transition-all ${onboardIsTeamMode ? 'border-indigo-600 bg-indigo-950/20 text-white' : 'hover:border-zinc-700 text-zinc-400 hover:text-white'}`}
                >
                  <LucideIcons.Users className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-bold block">Team CRM Mode</span>
                  <span className="text-[9px] text-zinc-500 block leading-normal mt-0.5">Role allocations. Invite up to 10 agents safely.</span>
                </div>

              </div>
            </div>

            <button
              type="submit"
              disabled={isOnboardingSaving}
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:bg-zinc-750 disabled:cursor-not-allowed"
            >
              {isOnboardingSaving ? (
                <>
                  <LucideIcons.Loader2 className="w-4 h-4 animate-spin" />
                  <span>Configuring and Seeding Firestore...</span>
                </>
              ) : (
                <>
                  <LucideIcons.Layers className="w-4 h-4" />
                  <span>Initialize My CRM Workspace</span>
                </>
              )}
            </button>
          </form>

          <button
            onClick={handleLogout}
            className="w-full text-center text-[11px] font-mono text-zinc-500 hover:text-zinc-400 flex items-center justify-center gap-1.5 pt-2"
          >
            <LucideIcons.LogOut className="w-3.5 h-3.5" />
            <span>Cancel / Logout Session</span>
          </button>
        </div>
      </div>
    );
  }

  // Member Status Disabled view
  if (userProfile.status === 'disabled') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-7 rounded-3xl max-w-sm text-center border border-gray-100 shadow-xl space-y-4 font-sans py-8">
          <div className="p-3.5 bg-red-100 text-red-600 rounded-full w-14 h-14 mx-auto flex items-center justify-center">
            <LucideIcons.ShieldOff className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-950">Agent Account Deactivated</h4>
          <p className="text-xs text-gray-500">
            Your membership profile inside <strong className="text-slate-900">{activeTenant.company_name}</strong> has been disabled by the system owner. Please coordinate with them to regain entry.
          </p>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold flex items-center gap-2 mx-auto cursor-pointer"
          >
            <LucideIcons.LogOut className="w-3.5 h-3.5" />
            <span>Return to Login Gate</span>
          </button>
        </div>
      </div>
    );
  }

  // Workspace Suspended Gate
  if (userWorkspace?.status === 'suspended' && userProfile.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-7 rounded-3xl max-w-sm text-center border border-gray-100 shadow-xl space-y-4 font-sans py-8">
          <div className="p-3.5 bg-rose-100 text-rose-600 rounded-full w-14 h-14 mx-auto flex items-center justify-center">
            <LucideIcons.ShieldAlert className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-950">Workspace Suspended</h4>
          <p className="text-xs text-gray-500">
            This workspace (<strong className="text-slate-900">{userWorkspace.name}</strong>) has been temporarily suspended by the platform administrator. Access to records and channels has been deauthorized.
          </p>
          <div className="space-y-2 pt-2">
            <a
              href={`mailto:${platformConfig.supportEmail || 'support@leadpilot.co'}?subject=Suspended%20Workspace%20ID%20${userWorkspace.id}`}
              className="w-full px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <LucideIcons.Mail className="w-3.5 h-3.5" />
              <span>Contact Platform Support</span>
            </a>
            <button
              onClick={handleLogout}
              className="w-full px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
            >
              <LucideIcons.LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE CRM FULL VIEW WORKSPACE PORTAL SCREEN
  return (
    <div id="saas-corporate-frame" className="min-h-screen bg-slate-50 flex flex-col font-sans transition-colors duration-250 relative">

      {/* Dynamic Alerts follow-up dashboard warning bar (Phase 1 & Phase 2 follow-ups warnings) */}
      {(missedFollowupsCount > 0 || todayFollowupsCount > 0) && (
        <div className="bg-amber-100/70 border-b border-amber-200/50 py-2.5 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs shrink-0 animate-fade-in relative z-20">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-200/40 rounded-lg text-amber-700">
              <LucideIcons.AlertCircle className="w-4 h-4 text-amber-800" />
            </div>
            <div className="space-y-0.5">
              <span className="font-bold">Active Priority Tasks alert: </span>
              <span className="text-amber-850">
                You have <strong className="font-extrabold text-amber-950">{missedFollowupsCount}</strong> past due tasks needing urgent actions or reallocation.
              </span>
            </div>
          </div>
          <button
            onClick={() => handleDashboardFilterClick('missed_followups')}
            className="text-[10px] bg-amber-800 hover:bg-amber-900 text-white font-bold px-3 py-1.5 rounded-lg shrink-0 transition-all font-sans"
          >
            Reallocate Overdue Leads
          </button>
        </div>
      )}

      {/* Primary Header Frame Layout */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 py-3 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shrink-0 shadow-xs relative">
        {/* LEFT SECTION - Branding & Logo */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
          {userProfile.role === 'super_admin' ? (
            <>
              <span className="text-2xl p-1.5 bg-slate-900 border border-slate-800 rounded-lg select-none shrink-0 shadow-sm text-white font-bold flex items-center justify-center w-10 h-10">
                🛠️
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-bold text-sm text-slate-900 tracking-tight leading-tight truncate">Super Control Center</h1>
                  <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-red-100 text-red-950 border border-red-200 font-mono shrink-0 whitespace-nowrap">
                    Super Admin
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-medium truncate leading-tight">Platform Management</p>
              </div>
            </>
          ) : (
            <>
              <div className="shrink-0 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="LeadPilot"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-bold text-sm text-slate-900 tracking-tight leading-tight truncate">
                    {activeTenant.company_name}
                  </h1>
                  <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono shrink-0 whitespace-nowrap">
                    {activeTenant.subscription_plan}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-medium truncate leading-tight">
                  <strong className="text-slate-600 font-semibold">{activeIndustry.name}</strong> • {marketRegion}
                </p>
              </div>
            </>
          )}
        </div>

        {/* RIGHT SECTION - Navigation & Actions */}
        <div className="flex flex-wrap items-center gap-2 justify-end"></div>
        {/* Global Nav Elements */}
        <div className="hidden md:flex flex-wrap items-center gap-2">
          {userProfile.role === 'super_admin' ? (
            <>
              <button
                onClick={() => {
                  setActiveTab('super_admin_dash');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'super_admin_dash' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-gray-100 hover:text-slate-800'}`}
              >
                <LucideIcons.ShieldAlert className="w-4 h-4" />
                <span>Super Admin Dash</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('checklist');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'checklist' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-gray-100 hover:text-slate-800'}`}
              >
                <LucideIcons.ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>System Readiness</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setDashboardFilter('all');
                  setActiveTab('home');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5  ${activeTab === 'home' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-gray-100 hover:text-slate-800'}`}
              >
                <LucideIcons.LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setDashboardFilter('all');
                  setActiveTab('leads');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'leads' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-gray-100 hover:text-slate-800'}`}
              >
                <LucideIcons.Kanban className="w-4 h-4" />
                <span>Pipelines</span>
              </button>

              <button
                onClick={() => {
                  setDashboardFilter('all');
                  setActiveTab('funnel');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'funnel' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-gray-100 hover:text-slate-800'}`}
              >
                <LucideIcons.PieChart className="w-4 h-4" />
                <span>Conversion Funnel</span>
              </button>

              <button
                onClick={() => {
                  setDashboardFilter('all');
                  setActiveTab('business');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'business' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-gray-100 hover:text-slate-800'}`}
              >
                <LucideIcons.Flame className="w-4 h-4" />
                <span>Copilot & AI Tools</span>
              </button>

              {/* Settings replaces Admin for Owners. Visible for Lead Allocation settings */}
              <button
                onClick={() => {
                  setDashboardFilter('all');
                  setActiveTab('settings');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-gray-100 hover:text-slate-800'}`}
              >
                <LucideIcons.Settings className="w-4 h-4" />
                <span>Team & Settings</span>
              </button>

              <button
                onClick={() => {
                  setDashboardFilter('all');
                  setActiveTab('checklist');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'checklist' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-gray-100 hover:text-slate-800'}`}
              >
                <LucideIcons.ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Readiness Checklist</span>
              </button>

              <div className="h-6 w-px bg-gray-200 mx-1" />

              {/* Region Toggle selector */}
              <button
                onClick={() => {
                  const targetRegion = marketRegion === 'USA' ? 'IND' : 'USA';
                  setMarketRegion(targetRegion);
                  localStorage.setItem('leadpilot_market_region', targetRegion);
                }}
                className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center"
                title="Switch Regional currency / format parameters"
              >
                <span>{marketRegion === 'USA' ? '🇺🇸 USD' : '🇮🇳 INR'}</span>
              </button>
            </>
          )}

          <div className="h-6 w-px bg-gray-200 mx-1" />

          <button
            onClick={handleLogout}
            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center shrink-0"
            title="Secure Sign-Out"
          >
            <LucideIcons.LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Base Viewport Container */}

      <main id="workspace-viewport-pane" className="flex-1 p-6 max-w-7xl w-full mx-auto overflow-y-auto md:pb-6 pb-28">        <AnimatePresence mode="wait">

        {/* ================= tab: SUPER ADMIN DASHBOARD ================= */}
        {activeTab === 'super_admin_dash' && userProfile.role === 'super_admin' && (
          <div className="space-y-6 animate-fade-in" id="super-admin-tab-content">
            <SuperAdminDashboard
              isDemoMode={isDemoMode}
              onBrandingChange={(newBrandingName) => {
                setPlatformConfig((prev: any) => ({
                  ...prev,
                  appBranding: newBrandingName
                }));
              }}
            />
          </div>
        )}

        {/* ================= tab: HOME (METRICS & ACTIVE PANELS) ================= */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fade-in" id="home-tab-content">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-150/40 shadow-2xs">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  {greeting}, {userProfile.displayName}!
                </h3>
                <p className="text-xs text-slate-500 mt-1"></p>
              </div>
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-4.5 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0 select-none cursor-pointer"
              >
                <LucideIcons.Plus className="w-4 h-4 text-indigo-400 stroke-[3]" />
                <span>Onboard New {activeIndustry.leadLabel}</span>
              </button>
            </div>

            {/* Follow-up Clearance banner card (matching original) */}
            {missedFollowupsCount === 0 && todayFollowupsCount === 0 && (
              <div className="bg-emerald-50 border border-emerald-150/60 p-4 rounded-3xl" id="clean-followups-clear-banner">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full text-emerald-600 shrink-0">
                    <LucideIcons.CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">All active follow-ups cleared!</span>
                    <p className="text-[11px] text-emerald-800 leading-normal mt-0.5">Your customer pipeline contains zero expired tasks or actions today.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 4 Large Clickable Dashboard Metric Blocks (matching user image layout 1:1) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="dashboard-large-clickable-metrics">

              {/* Card 1: Trips Scheduled / Site Visits Scheduled / Consults Scheduled (Future Items) */}
              <div
                onClick={() => handleDashboardFilterClick('today_followups')}
                className="bg-amber-50/50 hover:bg-amber-50 border border-amber-150/50 p-5 rounded-3xl cursor-pointer transition-all hover:scale-102 flex flex-col justify-between h-[140px] shadow-xs hover:shadow-md relative overflow-hidden group"
                id="kpi-today-followups"
              >
                <div className="text-amber-500 group-hover:scale-110 transition-transform">
                  <LucideIcons.Clock className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-slate-900 block font-sans focus:outline-none">
                    {todayFollowupsCount}
                  </span>

                  <div className="h-10 flex items-center">
                    <span className="text-[11px] font-semibold uppercase leading-tight">
                      FOLLOW-UPS TODAY
                    </span>
                  </div>
                </div>

              </div>

              {/* Card 2: Missed follow-ups */}
              <div
                onClick={() => handleDashboardFilterClick('missed_followups')}
                className="bg-red-50/50 hover:bg-red-50 border border-black p-5 rounded-3xl cursor-pointer transition-all hover:scale-102 flex flex-col justify-between h-[140px] shadow-xs hover:shadow-md relative overflow-hidden group"
                id="kpi-missed-followups"
              >
                <div className="text-red-500 group-hover:scale-110 transition-transform">
                  <LucideIcons.ShieldAlert className="w-6 h-6 stroke-[2.2]" />
                </div>

                <div>
                  <span className="text-2xl font-extrabold text-slate-900 block font-sans focus:outline-none">
                    {missedFollowupsCount}
                  </span>

                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
                    {activeIndustry.missedFollowupsLabel || "Expired tasks"}
                  </span>
                </div>
              </div>

              {/* Card 3: Trips Today / Site Visits Today / Consults Today (Today's Items) */}
              <div
                onClick={() => handleDashboardFilterClick('scheduled_followups')}
                className="bg-orange-50/40 hover:bg-orange-50/80 border border-orange-150/45 p-5 rounded-3xl cursor-pointer transition-all hover:scale-102 flex flex-col justify-between h-[140px] shadow-xs hover:shadow-md relative overflow-hidden group"
                id="kpi-meetings-today"
              >
                <div className="text-orange-500 group-hover:scale-110 transition-transform">
                  <LucideIcons.Calendar className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-slate-900 block font-sans focus:outline-none">
                    {scheduledFollowupsCount}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
                    Follow-Ups Scheduled
                  </span>
                </div>
              </div>

              {/* Card 4: Closed deals */}
              <div
                onClick={() => handleDashboardFilterClick('closed_deals')}
                className="bg-emerald-50/40 hover:bg-emerald-50/80 border border-emerald-150/40 p-5 rounded-3xl cursor-pointer transition-all hover:scale-102 flex flex-col justify-between h-[140px] shadow-xs hover:shadow-md relative overflow-hidden group"
                id="kpi-closed-deals"
              >
                <div className="text-emerald-500 group-hover:scale-110 transition-transform">
                  <LucideIcons.Trophy className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-slate-900 block font-sans focus:outline-none">
                    {activeIndustry.closedDealsLabel === 'Policies Activated'
                      ? policiesActivatedCount
                      : activeIndustry.closedDealsLabel === 'Repeat Clients'
                        ? repeatClientsCount
                        : closedDealsCount}
                  </span>

                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
                    {activeIndustry.closedDealsLabel || "Closed deals"}
                  </span>
                </div>

              </div>

            </div>



            {/* Section: LEAD OVERVIEW Breakdown parameters */}
            <div className="space-y-3 pt-2" id="lead-overview-block">
              <span className="text-xs font-extrabold text-slate-400 tracking-wider block font-mono uppercase">LEAD OVERVIEW</span>
<div className={`grid gap-4 ${activeIndustry.id === 'real-estate' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>

                {/* Total */}
                <div
                  onClick={() => handleDashboardFilterClick('total')}
                  className="bg-white hover:bg-slate-50/50 border border-gray-150/40 p-4 rounded-2xl cursor-pointer transition-all shadow-3xs flex flex-col justify-center h-[90px]"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total</span>
                  <span className="text-2xl font-black text-slate-900 mt-1">{totalLeadsCount}</span>
                </div>

                {/* Open */}
                <div
                  onClick={() => handleDashboardFilterClick('open')}
                  className="bg-white hover:bg-slate-50/50 border border-gray-150/40 p-4 rounded-2xl cursor-pointer transition-all shadow-3xs flex flex-col justify-center h-[90px]"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Open</span>
                  <span className="text-2xl font-black text-slate-900 mt-1">{openLeadsCount}</span>
                </div>
{/* CLOSED - Hide for Real Estate */}
{activeIndustry.id !== 'real-estate' && (
  <div
    onClick={() => handleDashboardFilterClick('closed')}
    className="bg-white hover:bg-slate-50/50 border border-gray-150/40 p-4 rounded-2xl cursor-pointer transition-all shadow-3xs flex flex-col justify-center h-[90px]"
  >
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Closed</span>
    <span className="text-2xl font-black text-slate-900 mt-1">{closedDealsLeads.length}</span>
  </div>
)}
                {/* Today */}
                <div
                  onClick={() => handleDashboardFilterClick('today')}
                  className="bg-white hover:bg-slate-50/50 border border-gray-150/40 p-4 rounded-2xl cursor-pointer transition-all shadow-3xs flex flex-col justify-center h-[90px]"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today</span>
                  <span className="text-2xl font-black text-slate-900 mt-1">{todayCreatedCount}</span>
                </div>

              </div>
            </div>
            {/* Pipeline Status Distribution */}
            <PipelineStatusDashboard
              config={activeIndustry}
              leads={currentLeads}
              onFilterClick={handleDashboardFilterClick}
              activeFilter={dashboardFilter}
            />

          


            {/* Quick Industry Summary Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 rounded-3xl text-white my-4 relative overflow-hidden shadow-md">
              <div className="absolute right-0 bottom-0 select-none opacity-10 font-black text-8xl -mr-6 -mb-6">
                {activeIndustry.leadLabel[0]}
              </div>
              <div className="relative z-10 space-y-2">
                <span className="text-[9px] bg-indigo-800 text-indigo-100 px-2.5 py-0.5 rounded font-extrabold uppercase tracking-widest font-mono">WORKSPACE METADATA</span>
                <h3 className="text-lg font-bold">{activeIndustry.tagline}</h3>
                <p className="text-xs text-indigo-200 leading-relaxed max-w-xl">
                  Calculations on this screen are tailored dynamically for <strong className="text-white">{activeIndustry.leadLabel}s</strong> with value-based monitoring configured under the <strong className="text-white">{activeIndustry.valueLabel}</strong> matrix.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition-all text-white flex items-center gap-1.5"
                  >
                    <LucideIcons.ArrowRight className="w-3.5 h-3.5" />
                    <span>Open Interactive Pipeline</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('business')}
                    className="px-4 py-2 bg-slate-900/40 hover:bg-slate-900/60 rounded-xl text-xs font-semibold text-indigo-100"
                  >
                    View Live Advisor Tools
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= tab: LEADS (PIPELINE & BOARD) ================= */}
        {activeTab === 'leads' && (
          <div className="space-y-6 animate-fade-in" id="leads-tab-content">

            <div className="bg-white p-4.5 rounded-3xl border border-gray-150/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-3xs justify-start leading-none mb-2">
              <div className="space-y-1 self-start sm:self-auto">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Active {activeIndustry.leadLabel} Leads Roster</h4>
                <p className="text-xs text-gray-500">Track and advance lead stages in real-time. System sync is active.</p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* View Form toggle panel */}
                <div className="bg-slate-100 p-1 rounded-xl flex items-center shrink-0 border">
                  <button
                    onClick={() => setCurrentView('kanban')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${currentView === 'kanban' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500'}`}
                  >
                    <LucideIcons.Layout className="w-3.5 h-3.5" />
                    <span>Kanban</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('table')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${currentView === 'table' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500'}`}
                  >
                    <LucideIcons.List className="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsFormOpen(true)}
                  className="px-4.5 py-2 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-indigo-900 transition-colors flex items-center gap-1 border shrink-0 cursor-pointer"
                >
                  <LucideIcons.Plus className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span>Create Lead</span>
                </button>
              </div>
            </div>

           {/* Dynamic selection helper note if active */}
            {dashboardFilter !== 'all' && (
              <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs text-indigo-900">
                <div className="flex items-center gap-2">
                  <LucideIcons.SlidersHorizontal className="w-4 h-4 text-indigo-700" />
                  <span>Interactive filter active: <strong className="font-bold text-indigo-950 uppercase">{dashboardFilter.replace('_', ' ')}</strong></span>
                </div>
                <button
                  onClick={() => setDashboardFilter('all')}
                  className="text-[10px] bg-white border hover:bg-neutral-50 px-2 py-1 rounded-lg font-bold text-slate-700"
                >
                  Clear Filter
                </button>
              </div>
            )}

            {/* Core Viewport Rendering - Kanban, Pipeline Status, LeadTable */}
            
            {/* Kanban/Pipeline Board - conditionally hidden for Real Estate */}
{activeIndustry.id !== 'real-estate' && activeIndustry.id !== 'creative-agency' ? (            <PipelineBoard
  config={activeIndustry}
  leads={currentLeads}
  onMoveLead={handleMoveLead}
  onSelectLead={setSelectedLead}  // ← CORRECT
  onQuickAdd={triggerQuickAdd}
  marketRegion={marketRegion}
/>
            ) : (
              <div className="p-8 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <h3 className="text-gray-800 font-semibold mb-2">Pipeline Status View</h3>
                <p className="text-gray-600 text-sm">
                  Real Estate uses the Pipeline Status Distribution below for stage tracking.
                </p>
              </div>
            )}

          

            {/* Lead Table */}
            <LeadTable
              config={activeIndustry}
              leads={tableLeads}
              templates={templates}
              dashboardFilter={dashboardFilter}
              onSelectLead={setSelectedLead}
              onUpdateLead={handleUpdateLead}
              onDeleteLead={handleDeleteLead}
              marketRegion={marketRegion}
              onAddMultiLeads={handleBatchImportLeads}
            />
              </div>
            )}
            {/* ================= tab: FUNNEL ================= */}
            {activeTab === 'funnel' && (
              <div className="space-y-6 animate-fade-in" id="funnel-tab-content">

                <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 rounded-3xl p-6 text-white border space-y-4">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#10b981] bg-indigo-950/40 border px-2.5 py-1 rounded-full inline-block">Conversions</span>
                  <h3 className="text-xl font-bold tracking-tight">Active Conversion Funnel diagnostics</h3>
                  <p className="text-xs text-indigo-200 leading-relaxed max-w-xl">
                    Evaluates progression values for active clients across each stage of the {activeIndustry.name} pipeline workflow registry.
                  </p>
                </div>

                {/* Funnel chart simulation */}
                <div className="bg-white p-6 rounded-3xl border border-gray-150/40 shadow-3xs space-y-4">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-tight block">Conversion Stages Flow metrics</span>
                  <div className="space-y-4">
                    {activeIndustry.stages.map((stage, idx) => {
                      const stageLeads = currentLeads.filter(l => l.stageId === stage.id);
                      const percentOfTotal = totalLeadsCount > 0 ? (stageLeads.length / totalLeadsCount) * 100 : 0;
                      const stageValue = stageLeads.reduce((acc, lead) => acc + (lead.value || 0), 0);

                      return (
                        <div key={stage.id} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="font-bold text-slate-800">{idx + 1}. {stage.label}</span>
                            <span className="text-slate-500 font-bold">
                              {stageLeads.length} leads • {marketRegion === 'USA' ? '$' : '₹'}{stageValue.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-slate-50 border border-slate-100 rounded-full h-4 relative overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(percentOfTotal, 3)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* ================= tab: BUSINESS (TOOLS & AI ADVISOR) ================= */}
            {activeTab === 'business' && (
              <div className="space-y-6 animate-fade-in" id="business-tab-content">

                {/* Header / Intro Area */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#10b981] bg-emerald-950/40 border border-emerald-900/30 px-3 py-1 rounded-full inline-block">
                      🎯 CRM Business Management Hub
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                      AI Advisor & Client Growth Ecosystem
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                      Welcome to your operational cockpit. Under security compliance guidelines, standard sales operations (like pipelines and contact checklists)
                      reside on your main dashboard, while high-level growth integrations like
                      <strong className="text-emerald-400"> Google Sheet synchronization</strong>,
                      <strong className="text-indigo-400"> Social referral intake pages</strong>, and
                      <strong className="text-sky-400"> AI Conversion predictors</strong> are separated here to keep your operations clean and focused!
                    </p>
                  </div>

                  {/* Core capabilities list */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
                    <div className="space-y-1">
                      <span className="font-bold text-emerald-400">📊 Google Sheets Sync</span>
                      <p className="text-slate-400">Formats, groups, and logs client lists directly into corporate spreadsheets in real-time.</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-indigo-400">🔗 Bio Link Capture Form</span>
                      <p className="text-slate-400">Provides specialized referral links tailored to capture target Facebook or Instagram traffic.</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-sky-400">🧠 AI Advisor Diagnostics</span>
                      <p className="text-slate-400">Evaluates business pipeline velocity, scores conversion weights, and drives simulations.</p>
                    </div>
                  </div>
                </div>

                {/* Section A: Public Form Referral Capture Link for Social Media */}
                <div className="bg-white rounded-3xl p-6 border border-gray-150/45 shadow-3xs space-y-4 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        Social Growth Tool
                      </span>
                      <h4 className="text-base font-bold text-slate-900">Facebook & Instagram Public Capture Page</h4>
                      <p className="text-xs text-slate-500">Put this URL inside your Instagram bio, Facebook page settings, or YouTube video description to auto-inject leads directly into CRM!</p>
                    </div>

                    <button
                      onClick={() => {
                        const bioUrl = `${window.location.origin}${window.location.pathname}?form=${userWorkspace?.id || 'ws_preview'}`;
                        navigator.clipboard.writeText(bioUrl);
                        alert('Direct bio integration link copied to clipboard successfully!');
                      }}
                      className="p-3 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold rounded-2xl flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
                    >
                      <LucideIcons.Copy className="w-4 h-4" />
                      <span>Copy Bio URL Link</span>
                    </button>
                  </div>

                  {/* Display url */}
                  <div className="bg-neutral-50 border p-3.5 rounded-2xl font-mono text-[11px] text-indigo-800 border-indigo-200 font-sans select-all leading-normal">
                    {window.location.origin}{window.location.pathname}?form={userWorkspace?.id || 'ws_preview'}
                  </div>
                </div>

                {/* Section B: Google Sheets Sync Panel */}
                <GoogleSheetsSync
                  config={activeIndustry}
                  leads={currentLeads}
                />

                {/* Section C: AIPredictor Model Panel */}
                <AIPredictor
                  config={activeIndustry}
                  leads={currentLeads}
                  onAddSimulatedLead={async (simulatedLead) => {
                    try {
                      const leadDocRef = doc(db, 'workspaces', userWorkspace.id, 'leads', simulatedLead.id);
                      await setDoc(leadDocRef, { ...simulatedLead, files: [] });
                      alert('Simulated agent lead successfully added to real-time Firestore database!');
                    } catch (err) {
                      console.error('Failed simulation lead insertion:', err);
                    }
                  }}
                />



              </div>
            )}

            {/* ================= tab: SETTINGS & TEAM MANAGEMENT (Owner-Only Settings, Agent viewing assignment checklist) ================= */}
            {activeTab === 'settings' && (

              <div className="space-y-6 animate-fade-in" id="settings-tab-content">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* COLUMN 1: Outreach Templates */}
                  <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-gray-200">
                    <OutreachTemplatesManager
                      workspaceId={userWorkspace?.id || 'default'}
                      industryId={userWorkspace?.industryId || 'real-estate'}
                      defaultTemplates={templates}
                      onTemplatesSaved={(savedTemplates) => setTemplates(savedTemplates)}
                    />
                  </div>

                  {/* COLUMN 2: Workspace Branding */}
                  <div className="lg:col-span-1 space-y-5">
                    <div className="bg-white rounded-3xl p-6 border border-gray-150/40 shadow-3xs space-y-4">
                      <div className="border-b border-gray-100 pb-2">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <LucideIcons.Briefcase className="w-4 h-4 text-indigo-600" />
                          <span>Workspace Branding Specs</span>
                        </h4>

                        <p className="text-[11px] text-gray-500 mt-0.5">Control company name, business scope, or terminology parameters.</p>
                      </div>

                      {userProfile.role === 'owner' ? (
                        <form onSubmit={handleSettingsUpdate} className="space-y-4 text-xs font-medium">
                          <div className="space-y-1">
                            <label className="text-slate-600 block">Workspace Display Name</label>
                            <input
                              type="text"
                              required
                              value={editWorkspaceName}
                              onChange={(e) => setEditWorkspaceName(e.target.value)}
                              className="w-full text-xs font-bold border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          {userProfile?.role === 'super_admin' && (
                            <div className="space-y-1">
                              <label className="text-slate-600 block">Business Operations Mode</label>
                              <select
                                value={editWorkspaceMode}
                                onChange={(e) => setEditWorkspaceMode(e.target.value as any)}
                                className="w-full text-xs font-bold border border-gray-200 rounded-xl px-2.5 py-2.5 bg-white"
                              >
                                <option value="solo">Solo CRM Mode ("Just Me")</option>
                                <option value="team">Team CRM Mode ("Small Team")</option>
                              </select>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={isSavingSettings}
                            className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl font-bold transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
                          >
                            {isSavingSettings ? 'Writing database...' : 'Update Workspace Specs'}
                          </button>
                        </form>
                      ) : (
                        <div className="p-4 bg-gray-50 border rounded-2xl text-[11px] text-gray-500 leading-normal font-medium speak-none">
                          ⚠️ Agent View Limit: only the Workspace Owner may alter branding or industry metadata formats.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* COLUMN 2: TEAM MEMBERS ROSTER (Only displays in TEAM CRM mode) */}
                  <div className="lg:col-span-2 space-y-5">
                    {userWorkspace?.mode === 'team' ? (
                      <div className="space-y-5">

                        {/* Inviter Console (Owner Only) */}
                        {userProfile.role === 'owner' && (
                          <div className="bg-white rounded-3xl p-6 border border-gray-150/40 shadow-3xs space-y-4">
                            <div className="border-b border-gray-100 pb-2">
                              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                <LucideIcons.UserPlus className="w-4 h-4 text-[#10b981]" />
                                <span>Invite Agent to Team Workspace</span>
                              </h4>
                              <p className="text-[11px] text-gray-500 mt-0.5">Enter their Google Account email to authorize instantaneous onboarding setup.</p>
                            </div>

                            <form onSubmit={handleSendTeamInvitation} className="flex gap-2 text-xs">
                              <input
                                type="email"
                                required
                                placeholder="e.g. agent.smith@gmail.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="flex-1 text-xs font-semibold border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
                              />
                              <button
                                type="submit"
                                disabled={isSendingInvite}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shrink-0"
                              >
                                {isSendingInvite ? 'Sending...' : 'Authorize Invite'}
                              </button>
                            </form>
                          </div>
                        )}

                        {/* Members List */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-150/40 shadow-3xs space-y-4">
                          <div className="border-b border-gray-100 pb-2">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                              <LucideIcons.Users className="w-4 h-4 text-indigo-600" />
                              <span>Team Workspace Members</span>
                            </h4>
                            <p className="text-[11px] text-gray-500 mt-0.5">Authorised agents authorized to view and coordinate assigned leads.</p>
                          </div>

                          {/* Active members */}
                          <div className="space-y-3">
                            <span className="text-[10px] font-extrabold text-slate-400 tracking-wider block font-mono">ACTIVE TEAM MEMBERS ({workspaceMembers.length})</span>
                            {workspaceMembers.map((member) => (
                              <div key={member.uid} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-neutral-50/50 border border-gray-150/45 rounded-2xl gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-3 bg-white border rounded-xl text-slate-700 font-bold text-xs select-none shadow-3xs">
                                    {member.displayName ? member.displayName[0].toUpperCase() : 'A'}
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-slate-800">{member.displayName || member.email}</span>
                                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${member.role === 'owner' ? 'bg-indigo-100 text-indigo-800 font-sans' : 'bg-gray-100 text-gray-700 font-sans'}`}>
                                        {member.role === 'owner' ? 'Owner' : 'Agent'}
                                      </span>
                                      {member.status === 'disabled' && (
                                        <span className="text-[9px] font-black bg-red-100 text-red-650 px-2 py-0.5 rounded-full uppercase">Disabled</span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-mono italic">{member.email}</p>
                                  </div>
                                </div>

                                {/* Member actions (Owner Only, can't toggle self) */}
                                {userProfile.role === 'owner' && member.uid !== user.uid && (
                                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                                    <button
                                      onClick={() => handleToggleAgentStatus(member.uid, member.status)}
                                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all shrink-0 ${member.status === 'disabled'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                                        : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                                        }`}
                                    >
                                      {member.status === 'disabled' ? 'Enable Agent' : 'Disable Agent'}
                                    </button>
                                    <button
                                      onClick={() => handleRemoveAgent(member.uid)}
                                      className="p-1.5 text-gray-500 hover:text-red-500 bg-white border border-gray-200 rounded-lg shrink-0 transition-colors"
                                      title="Revoke and remove member allocation"
                                    >
                                      <LucideIcons.Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Pending invite list (Owner Only) */}
                          {userProfile.role === 'owner' && (
                            <div className="space-y-3 pt-3 border-t border-gray-100">
                              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider block font-mono">PENDING INVITATION CODES ({workspaceInvitations.length})</span>
                              {workspaceInvitations.length === 0 ? (
                                <p className="text-[10px] text-gray-400 italic">No pending invitations. Authorize email above to invite newly recruited agents.</p>
                              ) : (
                                <div className="grid grid-cols-1 gap-2.5">
                                  {workspaceInvitations.map((invite) => (
                                    <div key={invite.email} className="flex items-center justify-between p-3 bg-white border border-dashed rounded-2xl">
                                      <div className="space-y-0.5">
                                        <span className="text-xs font-bold text-gray-700">{invite.email}</span>
                                        <p className="text-[9px] text-gray-400 font-sans">Created on {new Date(invite.createdAt).toLocaleDateString()}</p>
                                      </div>
                                      <button
                                        onClick={() => handleDeleteInvitation(invite.email)}
                                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg border border-transparent hover:border-red-100 transition-colors shrink-0"
                                        title="Revoke code and cancel authorization"
                                      >
                                        <LucideIcons.X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                        </div>

                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl p-8 border border-gray-150/40 text-center shadow-3xs space-y-4">
                        <LucideIcons.Users className="w-12 h-12 text-gray-300 mx-auto" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 uppercase">Lead allocations disabled under Solo CRM</h4>
                          <p className="text-xs text-gray-450 leading-relaxed max-w-sm mx-auto mt-1">
                            Your workspace is currently set to <strong className="text-slate-800">Solo CRM mode</strong>. Agent tracking, security isolates,
                            members allocations settings, and invitations controls are locked out.
                          </p>
                        </div>
                        {userProfile.role === 'owner' && (
                          <button
                            onClick={() => {
                              setEditWorkspaceMode('team');
                              alert('Operations format set to Team CRM. Click "Update Workspace Specs" to apply instantly.');
                            }}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs"
                          >
                            Enable Team Operations format
                          </button>
                        )}
                      </div>
                    )}
                  </div>


                </div>

              </div>
            )}

            {activeTab === 'checklist' && (
              <div id="checklist-tab-content" className="animate-fade-in">
                <ProductionReadinessChecklist />
              </div>
            )}

          </AnimatePresence>
      </main>

      {/* Sub-modals & Overlay views */}
      <AnimatePresence>

        {/* Detail Modal Overlay */}
        {selectedLead && (
          <LeadDetailModal
            lead={selectedLead}
            config={activeIndustry}
            onClose={() => setSelectedLead(null)}
            onUpdate={handleUpdateLead}
            templates={templates}
            marketRegion={marketRegion}
            isTeamMode={userWorkspace?.mode === 'team'}
            teamAgents={workspaceMembers.filter(m => m.role === 'agent' && m.status === 'active')}
            currentUserRole={userProfile.role}
            isUploadingFile={isUploadingFile}
            onUploadFile={handleUploadFile}
            onDeleteFile={handleDeleteFile}
          />
        )}

        {/* Lead Insertion Panel Form Overlay */}
        {isFormOpen && (
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
            id="lead-intake-modal-canvas"
          >
            <div className="bg-white rounded-3xl border border-gray-150 shadow-2xl p-6 max-w-md w-full relative">
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-slate-700 transition"
              >
                <LucideIcons.X className="w-5 h-5" />
              </button>

              <LeadForm
                config={activeIndustry}
                initialStageId={formInitialStageId}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleAddLiveLead}
                marketRegion={marketRegion}
              />
            </div>
          </div>
        )}

      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      {!isDemoMode || userProfile.role !== 'super_admin' ? (
        <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-150/40 px-2 py-2 flex items-center justify-between gap-1 shrink-0 z-30">
          <button
            onClick={() => { setDashboardFilter('all'); setActiveTab('home'); }}
            className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all ${activeTab === 'home' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
            title="Dashboard"
          >
            <LucideIcons.LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => { setDashboardFilter('all'); setActiveTab('leads'); }}
            className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all ${activeTab === 'leads' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
            title="Pipelines"
          >
            <LucideIcons.Kanban className="w-5 h-5" />
            <span>Pipelines</span>
          </button>

          <button
            onClick={() => { setDashboardFilter('all'); setActiveTab('funnel'); }}
            className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all ${activeTab === 'funnel' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
            title="Conversion Funnel"
          >
            <LucideIcons.PieChart className="w-5 h-5" />
            <span>Funnel</span>
          </button>

          <button
            onClick={() => { setDashboardFilter('all'); setActiveTab('business'); }}
            className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all ${activeTab === 'business' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
            title="Copilot & AI Tools"
          >
            <LucideIcons.Flame className="w-5 h-5" />
            <span>AI</span>
          </button>

          <button
            onClick={() => { setDashboardFilter('all'); setActiveTab('settings'); }}
            className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
            title="Team & Settings"
          >
            <LucideIcons.Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl text-[10px] font-bold text-red-500"
            title="Logout"
          >
            <LucideIcons.LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      ) : null}

      {/* Footer Platform Specs bar (Anti-AI-Slop humbler branding) */}
      <footer className="p-4 bg-white border-t border-gray-150/40 text-[10px] text-gray-450 hover:text-gray-500 font-mono flex flex-col md:flex-row justify-between items-center gap-2 mt-auto shrink-0 relative hidden md:flex">
        <span className="flex items-center gap-1.5 font-bold">
          <span>PORTAL: CLIENT CLOUD ENVIRONMENT ACTIVATE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </span>
        <span className="tracking-tight">LeadPilot AI Workspace Engine v3 • Signed in as: <strong className="font-extrabold text-[#4f46e5]">{user.email}</strong></span>
      </footer>

    </div>
  );
}
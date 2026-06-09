/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndustryConfig, Lead } from '../types';

export const INDUSTRY_CONFIGS: IndustryConfig[] = [
  {
    id: 'real-estate',
    name: 'Real Estate CRM',
    iconName: 'Home',
    tagline: 'Connect buyers with their dream properties, manage showings, and close listings.',
    leadLabel: 'Client Prospect',
    valueLabel: 'Property Budget',
    stages: [
      { id: 'new_inquiry', label: 'New Inquiries', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      { id: 'viewing_scheduled', label: 'Showings / Viewings', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      { id: 'offer_made', label: 'Offers Submitted', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      { id: 'under_contract', label: 'Under Contract', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      { id: 'closed', label: 'Deals Closed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    ],
    customFields: [
      {
        key: 'propertyType',
        label: 'Property Type Interested',
        type: 'select',
        options: ['Apartment', 'Villa', 'House', 'Plot', 'Commercial Space', 'Office', 'Warehouse'],
        required: false,
        placeholder: 'Select a property category'
      },
      {
        key: 'preferredLocation',
        label: 'Target Location Neighborhood',
        type: 'text',
        required: false,
        placeholder: 'e.g. Westside, Downtown, Oak Creek'
      },
      {
        key: 'isPreApproved',
        label: 'Mortgage Pre-Approved Check',
        type: 'select',
        options: ['Pre-Approved (Verified)', 'Self-Funded / Cash Buyer', 'Not Pre-Approved', 'Negotiating Financing'],
        required: false
      }
    ],
    metrics: [
      {
        key: 'pipeline_total',
        label: 'Active Pipeline Value',
        prefix: '$',
        type: 'sum',
        sourceField: 'value',
        description: 'Aggregate budget value across all active properties.'
      },
      {
        key: 'avg_deal_size',
        label: 'Average Client Budget',
        prefix: '$',
        type: 'average',
        sourceField: 'value',
        description: 'Mean property seeking budget per lead.'
      },
      {
        key: 'under_contract_count',
        label: 'Properties Under Contract',
        type: 'count',
        description: 'Current count of properties moving through legal closing.'
      }
    ],
    suggestedSources: [
      'Website',
      'Facebook',
      'Instagram',
      'WhatsApp',
      'Google Ads',
      'Google Search',
      'Referral',
      'Walk-In',
      'Phone Call',
      'JustDial',
      'IndiaMART',
      'Manual Entry',
      'Other'
    ],
    todayFollowupsLabel: "Site Visits Scheduled",
    missedFollowupsLabel: "Overdue Follow-ups",
    meetingsTodayLabel: "Site Visits Today",
    closedDealsLabel: "Closed sales"
  },
  {
    id: 'insurance',
    name: 'Insurance Marketing',
    iconName: 'ShieldAlert',
    tagline: 'Underwriting pipelines, policy quotes, and coverage lead acceleration.',
    leadLabel: 'Coverage Applicant',
    valueLabel: 'Est. Annual Premium',
    stages: [
      { id: 'quote_requested', label: 'Quote Requested', color: 'bg-sky-100 text-sky-800 border-sky-200' },
      { id: 'needs_analysis', label: 'Needs Assessment', color: 'bg-orange-100 text-orange-800 border-orange-200' },
      { id: 'proposals_sent', label: 'Proposals Presented', color: 'bg-pink-100 text-pink-800 border-pink-200' },
      { id: 'underwriting_check', label: 'In Underwriting Review', color: 'bg-violet-100 text-violet-800 border-violet-200' },
      { id: 'policy_active', label: 'Policies Issued', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    ],
    customFields: [
      {
        key: 'policyCategory',
        label: 'Policy Term Category',
        type: 'select',
        options: ['High-Limit Term Life', 'Whole Life Premium', 'Comprehensive Auto Portfolio', 'Homeowners Shield', 'Executive Liability Plan'],
        required: false
      },
      {
        key: 'coverageCapacity',
        label: 'Target Coverage Limit',
        type: 'number',
        required: false,
        placeholder: 'e.g. 500000'
      },
      {
        key: 'currentCarrier',
        label: 'Existing Insurance Carrier',
        type: 'text',
        placeholder: 'e.g. State Farm, Geico, None'
      }
    ],
    metrics: [
      {
        key: 'annualized_premium',
        label: 'Active Premium Pipeline',
        prefix: '$',
        type: 'sum',
        sourceField: 'value',
        description: 'Combined values of prospective policies.'
      },
      {
        key: 'coverage_total',
        label: 'Total Net Capital Liability',
        prefix: '$',
        type: 'sum',
        sourceField: 'coverageCapacity',
        description: 'Accumulative insurance benefit limit.'
      },
      {
        key: 'lead_count',
        label: 'Inquiries Handled',
        type: 'count',
        description: 'Total active applicants in active tracking.'
      }
    ],
    suggestedSources: ['Comparison Engine', 'Quote Request Form', 'Corporate Health Benefit Campaign', 'Cold Lead Re-engagement'],
    todayFollowupsLabel: "Consults Scheduled",
    missedFollowupsLabel: "Missed Follow-ups",
    meetingsTodayLabel: "Consults Today",
    closedDealsLabel: "Policies issued"
  },
  {
    id: 'tarot-coaching',
    name: 'Tarot Coaching Hub',
    iconName: 'Sparkles',
    tagline: 'Nurture spiritual seekers, schedule intuitive reads, and upgrade clients to mentorship plans.',
    leadLabel: 'Querent Seeker',
    valueLabel: 'Session Booking Fee',
    stages: [
      { id: 'consult_inquired', label: 'Seeker Consultations', color: 'bg-violet-100 text-violet-800 border-violet-200' },
      { id: 'intuitive_intake', label: 'Intake Forms Received', color: 'bg-rose-100 text-rose-800 border-rose-200' },
      { id: 'session_scheduled', label: 'Readings Scheduled', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      { id: 'reading_completed', label: 'Sessions Completed', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      { id: 'mentorship_upgrade', label: 'Yearly Seekers Retainer', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    ],
    customFields: [
      {
        key: 'divineFocus',
        label: 'Reading Spiritual Focus Area',
        type: 'select',
        options: ['Romantic Connection & Love', 'Wealth Alignment & Abundance', 'Life Transition / Path Shift', 'Ancestral Healing & Karma', 'Past Life Discovery'],
        required: false
      },
      {
        key: 'cosmicZodiacSign',
        label: 'Seeker Birth Zodiac Sign',
        type: 'select',
        options: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
        required: false
      },
      {
        key: 'preferredTherapeuticTool',
        label: 'Preferred Connection Oracle',
        type: 'select',
        options: ['Rider-Waite-Smith Classic', 'Thoth Mystical Archetype', 'Astrology Birth Charts', 'Chakra Alignment Rituals', 'Crystalline Grid Casting']
      }
    ],
    metrics: [
      {
        key: 'session_income',
        label: 'Total Scheduled Revenue',
        prefix: '$',
        type: 'sum',
        sourceField: 'value',
        description: 'Income committed across readings and healing sessions.'
      },
      {
        key: 'mentors_retained',
        label: 'Retainer Clients Upgraded',
        type: 'count',
        description: 'High-value seekers enrolled in continuing spiritual mentorship cycles.'
      }
    ],
    suggestedSources: ['Instagram DM Lead', 'Weekly Tarot Newsletter', 'Podcast Free Reading Signups', 'Word of Mouth / Spiritual Circle'],
    todayFollowupsLabel: "Seeker follow-ups",
    missedFollowupsLabel: "Forgotten querents",
    meetingsTodayLabel: "Readings scheduled",
    closedDealsLabel: "Mentors retained"
  },
  {
    id: 'taxi',
    name: 'Taxi & Shuttle Logistics',
    iconName: 'Car',
    tagline: 'Manage chauffeur bookings, executive shuttles, passenger profiles, and dispatcher dispatch routing.',
    leadLabel: 'Passenger Booking',
    valueLabel: 'Quoted Fair Value',
    stages: [
      { id: 'ride_inquiry', label: 'Ride Inquiries / Routes', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      { id: 'fare_dispatched', label: 'Dispatches Broadcast', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
      { id: 'ride_scheduled', label: 'Confirmed bookings', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      { id: 'trip_active', label: 'Passengers In Transit', color: 'bg-rose-100 text-rose-800 border-rose-200' },
      { id: 'trip_completed', label: 'Journeys Completed', color: 'bg-slate-100 text-slate-800 border-slate-200' }
    ],
    customFields: [
      {
        key: 'pickupAddress',
        label: 'Pickup Coordinates Address',
        type: 'text',
        required: false,
        placeholder: 'e.g. Terminal 2, JFK Airport, NY'
      },
      {
        key: 'destinationAddress',
        label: 'Destination Exit Address',
        type: 'text',
        required: false,
        placeholder: 'e.g. Midtown Manhattan Plaza'
      },
      {
        key: 'vehicleClass',
        label: 'Fleet Vehicle Category Required',
        type: 'select',
        options: ['Standard Eco Hybrid', 'Business Class Executive Sedan', 'Prime VIP SUV', 'Wheelchair Lift Van Extra Space'],
        required: false
      },
      {
        key: 'isRecurringSchedule',
        label: 'Recurring Commute Plan Holder',
        type: 'select',
        options: ['Daily Commuter', 'Weekly Corporate account', 'One-Off Tourist Booker']
      }
    ],
    metrics: [
      {
        key: 'active_fares',
        label: 'Dispatched Fleet Volume',
        prefix: '$',
        type: 'sum',
        sourceField: 'value',
        description: 'Gross cumulative cost of bookings in flow.'
      },
      {
        key: 'completed_trips',
        label: 'Concluded Missions',
        type: 'count',
        description: 'Trips safely transported and processed.'
      }
    ],
    suggestedSources: ['Corporate Travel Desk Referral', 'Airport Terminal Concierge', 'Mobile App Booking Log', 'Concierge Phone Line'],
    todayFollowupsLabel: "Trips Scheduled",
    missedFollowupsLabel: "Missed Dispatches",
    meetingsTodayLabel: "Trips Today",
    closedDealsLabel: "Journeys finished"
  },
  {
    id: 'custom-crm',
    name: 'General Business CRM',
    iconName: 'Building2',
    tagline: 'Highly flexible B2B general sales, customer relationship pipelines and negotiations.',
    leadLabel: 'Account Lead',
    valueLabel: 'Deal Proposal Value',
    stages: [
      { id: 'prospect', label: 'Inbound Prospects', color: 'bg-slate-100 text-slate-800 border-slate-200' },
      { id: 'pitch', label: 'Discovery & Demos', color: 'bg-sky-100 text-sky-800 border-sky-200' },
      { id: 'negotiations', label: 'Contract negotiations', color: 'bg-pink-100 text-pink-800 border-pink-200' },
      { id: 'closing_status', label: 'Closing Phase', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      { id: 'won', label: 'Deals Retained', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    ],
    customFields: [
      {
        key: 'targetCompanyName',
        label: 'Target Entity / Corporation',
        type: 'text',
        required: false,
        placeholder: 'e.g. ACME International Corp'
      },
      {
        key: 'contactAuthorityTitle',
        label: 'Key Contact Role Description',
        type: 'text',
        placeholder: 'e.g. Chief Procurement Officer'
      },
      {
        key: 'b2bSector',
        label: 'Market Industry Vertical',
        type: 'select',
        options: ['SaaS & High-Tech', 'Logistics Supply Chain', 'Medical Care & Biotech', 'Manufacturing Heavy Equipment', 'Decentralized Finance']
      }
    ],
    metrics: [
      {
        key: 'pipeline_deal',
        label: 'Net Projected SOW Values',
        prefix: '$',
        type: 'sum',
        sourceField: 'value',
        description: 'Net prospective business contract valuations.'
      },
      {
        key: 'b2b_leads',
        label: 'Key Accounts Under Negotiation',
        type: 'count',
        description: 'Number of accounts currently sitting inside proposal stages.'
      }
    ],
    suggestedSources: ['LinkedIn Cold Inbound', 'Executive Conference Event', 'Website Consultation Booking', 'Affiliate Partner Bridge'],
    todayFollowupsLabel: "Today's follow-ups",
    missedFollowupsLabel: "Missed follow-ups",
    meetingsTodayLabel: "Demos online",
    closedDealsLabel: "Deals won"
  },
  {
    id: 'coaching',
    name: 'Coaching & Mentoring',
    iconName: 'GraduationCap',
    tagline: 'Connect transforms, nurturing client growth, program milestones, and retention for executive and lifestyle mentors.',
    leadLabel: 'Client Coachee',
    valueLabel: 'Coaching Package Fee',
    stages: [
      { id: 'discovery_session', label: 'Discovery Session', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      { id: 'alignment_proposal', label: 'Proposal & Plan', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      { id: 'package_selected', label: 'Agreement Signed', color: 'bg-pink-100 text-pink-800 border-pink-200' },
      { id: 'active_coaching', label: 'Active Mentoring', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      { id: 'coaching_renewed', label: 'Certified / Renewed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    ],
    customFields: [
      {
        key: 'coachingNiche',
        label: 'Selected Coaching Niche',
        type: 'select',
        options: ['Executive & Business Scaling', 'Health & High-Performance Habits', 'Career Transition Strategy', 'Mindset & Mindful Leadership'],
        required: false,
        placeholder: 'Select client target focus'
      },
      {
        key: 'sessionFrequency',
        label: 'Session Frequency Cadence',
        type: 'select',
        options: ['Weekly Accelerator Sync', 'Bi-Weekly Strategy Loop', 'Monthly Check-in Cadence'],
        required: false
      },
      {
        key: 'primaryOutcome',
        label: 'Core Desired Breakthrough',
        type: 'text',
        required: false,
        placeholder: 'e.g. Scale revenue to 20k/mo, run a marathon'
      }
    ],
    metrics: [
      {
        key: 'coaching_revenue',
        label: 'Total Program Revenue',
        prefix: '$',
        type: 'sum',
        sourceField: 'value',
        description: 'Cumulative monetary commitment for package cohorts.'
      },
      {
        key: 'active_sessions',
        label: 'Active Program Cohorts',
        type: 'count',
        description: 'Number of active coachees currently undergoing curriculum blocks.'
      }
    ],
    suggestedSources: ['Discovery Webpage Form', 'LinkedIn Authority Post', 'Podcast Inbound Guest', 'Social Group Referral', 'Direct Email Hook'],
    todayFollowupsLabel: "Syncs to book",
    missedFollowupsLabel: "Checkpoints missed",
    meetingsTodayLabel: "Sessions today",
    closedDealsLabel: "Adherents graduated"
  },
  {
    id: 'institution',
    name: 'Education & Academy',
    iconName: 'BookOpen',
    tagline: 'Manage campus applicants, student onboarding, scholarship qualifications, and course enrollments.',
    leadLabel: 'Student Registrant',
    valueLabel: 'Annual Tuition Cost',
    stages: [
      { id: 'admission_inquiry', label: 'Inquiries Received', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      { id: 'academic_assessment', label: 'Orientation Placement', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      { id: 'financials_review', label: 'Tuition Review', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      { id: 'officially_enrolled', label: 'Enrolled & Scheduled', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      { id: 'active_alumnus', label: 'Graduated Alumni', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    ],
    customFields: [
      {
        key: 'academicProgram',
        label: 'Desired Academic Stream',
        type: 'select',
        options: ['Advanced STEM & Coding', 'MBA Management Executive', 'Intensive Language Program', 'University Prep Placement'],
        required: false,
        placeholder: 'Select a program stream'
      },
      {
        key: 'hasAccommodation',
        label: 'On-Campus Housing Option',
        type: 'select',
        options: ['Required (Dormitory Request)', 'Not Required (Local Commuter)'],
        required: false
      },
      {
        key: 'priorGpa',
        label: 'Prior Transcripts GPA',
        type: 'number',
        required: false,
        placeholder: 'GPA on 4.0 scale'
      }
    ],
    metrics: [
      {
        key: 'projected_tuition',
        label: 'Projected Annual Tuition Booked',
        prefix: '$',
        type: 'sum',
        sourceField: 'value',
        description: 'Cumulative tuition fees guaranteed across active class rosters.'
      },
      {
        key: 'enrolled_students',
        label: 'Admitted Study Cohorts',
        type: 'count',
        description: 'Total prospective students accepted into active study tracks.'
      }
    ],
    suggestedSources: ['Online Webinar Openhouse', 'High-school District Referral', 'Google Search Marketing', 'Global Scholar Placement Office', 'In-Person Campus Tour'],
    todayFollowupsLabel: "Applications to review",
    missedFollowupsLabel: "Incomplete uploads",
    meetingsTodayLabel: "Assessments today",
    closedDealsLabel: "Scholars registered"
  },
  {
    id: 'creative-agency',
    name: 'Creative & Digital Agency',
    iconName: 'Palette',
    tagline: 'Manage design briefs, active digital marketing campaigns, creative client feedback, and milestone reviews.',
    leadLabel: 'Creative Project',
    valueLabel: 'Project Budget',
    stages: [
      { id: 'brief_received', label: 'Brief Inquired', color: 'bg-emerald-100 text-emerald-800 border-emerald-250' },
      { id: 'concepts_review', label: 'Concepts Reviewed', color: 'bg-purple-100 text-purple-800 border-purple-250' },
      { id: 'active_design', label: 'Active Milestones', color: 'bg-blue-100 text-blue-800 border-blue-250' },
      { id: 'client_approvals', label: 'Sign-Off Pending', color: 'bg-amber-100 text-amber-800 border-amber-250' },
      { id: 'won', label: 'Retained Partners', color: 'bg-violet-100 text-violet-800 border-violet-250' }
    ],
    customFields: [
      {
        key: 'industryType',
        label: 'Business Sector Type',
        type: 'select',
        options: ['Graphic Design & Arts', 'Digital Ads & PPC', 'Software & UI Development', 'SEO Content Strategy', 'Social Media Management', 'E-Commerce Branding'],
        required: false,
        placeholder: 'Select target creative category'
      },
      {
        key: 'engagementModel',
        label: 'Client Billing Model Type',
        type: 'select',
        options: ['Fixed Price Package', 'Monthly Project Retainer', 'Milestone Hourly Rate', 'Value Share Option'],
        required: false
      },
      {
        key: 'estimatedDays',
        label: 'Expected Project Duration (Days)',
        type: 'number',
        required: false,
        placeholder: 'e.g. 30'
      }
    ],
    metrics: [
      {
        key: 'agency_pipeline',
        label: 'Creative Proposal Value',
        prefix: '$',
        type: 'sum',
        sourceField: 'value',
        description: 'Cumulative budget value for active design & marketing contracts.'
      },
      {
        key: 'active_milestones',
        label: 'Ongoing Production Projects',
        type: 'count',
        description: 'Design tasks currently undergoing active milestone execution.'
      }
    ],
    suggestedSources: ['Portfolio Showcase', 'Email Direct Outreach', 'Upwork Enterprise', 'Dribbble/Behance', 'Social Media Search', 'Client Referral'],
    todayFollowupsLabel: "Design reviews today",
    missedFollowupsLabel: "Briefs overdue",
    meetingsTodayLabel: "Pitches scheduled",
    closedDealsLabel: "Partners retained"
  }
];

export const INITIAL_LEADS_BY_INDUSTRY: Record<string, Lead[]> = {
  'real-estate': [
    {
      id: 're-1',
      name: 'Evelyn Sterling',
      email: 'evelyn.sterling@gmail.com',
      phone: '(415) 309-8802',
      source: 'Google Ads',
      stageId: 'new_inquiry',
      createdAt: '2026-06-01',
      lastContacted: '2026-06-01',
      status: 'active',
      value: 1250000,
      customFields: {
        propertyType: 'Apartment',
        preferredLocation: 'Downtown Skyline Marina',
        isPreApproved: 'Pre-Approved (Verified)'
      },
      notes: [
        { id: 'n-1', content: 'Requested penthouse listings with unobstructed ocean view decks.', createdAt: '2026-06-01', author: 'Pilot System agent' }
      ],
      tasks: [
        { id: 't-1', title: 'Compile listings for Marina tower portfolio', completed: false },
        { id: 't-2', title: 'Verify pre-approval certificate with Wells mortgage team', completed: false }
      ]
    },
    {
      id: 're-2',
      name: 'Marcus Chen',
      email: 'marcus.chen@outlook.com',
      phone: '(650) 808-1193',
      source: 'Walk-In',
      stageId: 'viewing_scheduled',
      createdAt: '2026-05-24',
      lastContacted: '2026-06-04',
      status: 'active',
      value: 950000,
      customFields: {
        propertyType: 'House',
        preferredLocation: 'North Redwood Hills',
        isPreApproved: 'Self-Funded / Cash Buyer'
      },
      notes: [
        { id: 'n-2', content: 'Showed the Redwood Valley estate last Sunday. Client loved the architectural integrity but is unsure about school districts.', createdAt: '2026-05-28', author: 'M. Sterling' }
      ],
      tasks: [
        { id: 't-3', title: 'Send school performance charts package', completed: true },
        { id: 't-4', title: 'Confirm second private showing for wife', completed: false }
      ]
    },
    {
      id: 're-3',
      name: 'The Kensington Family Trust',
      email: 'trustees@kensington.org',
      phone: '(212) 690-3490',
      source: 'Referral',
      stageId: 'offer_made',
      createdAt: '2026-05-18',
      lastContacted: '2026-06-05',
      status: 'active',
      value: 3400000,
      customFields: {
        propertyType: 'Plot',
        preferredLocation: 'Metropolitan Historic Core',
        isPreApproved: 'Self-Funded / Cash Buyer'
      },
      notes: [
        { id: 'n-3', content: 'Offered 3.2M with a 10-day escalation clause up to 3.4M cash.', createdAt: '2026-06-02', author: 'A. Chauffeur' }
      ],
      tasks: [
        { id: 't-5', title: 'Monitor counteroffer response deadline', completed: false },
        { id: 't-6', title: 'Prepare title deed draft with corporate attorneys', completed: false }
      ]
    },
    {
      id: 're-4',
      name: 'Sarah & David Jenkins',
      email: 'sarah.jenkins@comcast.net',
      phone: '(510) 412-2321',
      source: 'Website',
      stageId: 'under_contract',
      createdAt: '2026-04-29',
      lastContacted: '2026-06-03',
      status: 'active',
      value: 680000,
      customFields: {
        propertyType: 'House',
        preferredLocation: 'Oak Creek East Reserve',
        isPreApproved: 'Pre-Approved (Verified)'
      },
      notes: [
        { id: 'n-4', content: 'Escrow deposit of $20K successfully cleared. Inspection found minor plumbing fixes.', createdAt: '2026-05-15', author: 'A. Chauffeur' }
      ],
      tasks: [
        { id: 't-7', title: 'Book structural final walkthrough signoff', completed: true },
        { id: 't-8', title: 'Coordinate remote notary session for closing day', completed: false }
      ]
    }
  ],
  'insurance': [
    {
      id: 'ins-1',
      name: 'Alliance Logistics Inc',
      email: 'fleet@alliancelogistics.com',
      phone: '(800) 555-0988',
      source: 'Corporate Health Benefit Campaign',
      stageId: 'quote_requested',
      createdAt: '2026-06-02',
      lastContacted: '2026-06-02',
      status: 'active',
      value: 54000,
      customFields: {
        policyCategory: 'Executive Liability Plan',
        coverageCapacity: 5000000,
        currentCarrier: 'Hartford Indemnity'
      },
      notes: [
        { id: 'n-5', content: 'Demanding multi-fleet insurance umbrella for 40 long-haul trucks.', createdAt: '2026-06-02', author: 'Underwriting Lead' }
      ],
      tasks: [
        { id: 't-9', title: 'Audit logistics claims history checklist', completed: false },
        { id: 't-10', title: 'Prepare package discount spreadsheet', completed: false }
      ]
    },
    {
      id: 'ins-2',
      name: 'Dr. Gregory Ross',
      email: 'gross@stanfordmedicine.org',
      phone: '(415) 895-3129',
      source: 'Quote Request Form',
      stageId: 'proposals_sent',
      createdAt: '2026-05-20',
      lastContacted: '2026-06-04',
      status: 'active',
      value: 12500,
      customFields: {
        policyCategory: 'High-Limit Term Life',
        coverageCapacity: 3000000,
        currentCarrier: 'MetLife'
      },
      notes: [
        { id: 'n-6', content: 'Sent proposals for customized high-limit term life with return premium rider. Client reviewing with accountant on Monday.', createdAt: '2026-05-24', author: 'Underwriting Lead' }
      ],
      tasks: [
        { id: 't-11', title: 'Schedule medical practitioner blood visit', completed: true },
        { id: 't-12', title: 'Send revised tax-deferral analysis chart', completed: false }
      ]
    }
  ],
  'tarot-coaching': [
    {
      id: 'tc-1',
      name: 'Diana Moon',
      email: 'diana.seeker@goddessrising.io',
      phone: '(323) 441-9988',
      source: 'Instagram DM Lead',
      stageId: 'consult_inquired',
      createdAt: '2026-06-04',
      lastContacted: '2026-06-05',
      status: 'active',
      value: 180,
      customFields: {
        divineFocus: 'Romantic Connection & Love',
        cosmicZodiacSign: 'Scorpio',
        preferredTherapeuticTool: 'Rider-Waite-Smith Classic'
      },
      notes: [
        { id: 'n-7', content: 'Diana is feeling a intense energetic block around career decisions and emotional boundaries. Seeking a Celtic Cross spread.', createdAt: '2026-06-04', author: 'Tarot Steward' }
      ],
      tasks: [
        { id: 't-13', title: 'Set up candles and incense for high concentration', completed: false },
        { id: 't-14', title: 'Send intake meditation voice note', completed: false }
      ]
    },
    {
      id: 'tc-2',
      name: 'Theresa Finch',
      email: 'theresa.manifestor@gmail.com',
      phone: '(206) 710-1882',
      source: 'Weekly Tarot Newsletter',
      stageId: 'session_scheduled',
      createdAt: '2026-05-15',
      lastContacted: '2026-06-02',
      status: 'active',
      value: 450,
      customFields: {
        divineFocus: 'Wealth Alignment & Abundance',
        cosmicZodiacSign: 'Taurus',
        preferredTherapeuticTool: 'Astrology Birth Charts'
      },
      notes: [
        { id: 'n-8', content: 'Scheduled for 90-minute Lunar Alchemy session. Focused on abundance mindset and launching her creative business.', createdAt: '2026-05-15', author: 'Tarot Steward' }
      ],
      tasks: [
        { id: 't-15', title: 'Pre-draw a guidance oracle card on morning of session', completed: false },
        { id: 't-16', title: 'Log natal chart of her corporate launch date', completed: true }
      ]
    },
    {
      id: 'tc-3',
      name: 'Reverend Elijah Mercer',
      email: 'elijah.mercer@sacredpaths.org',
      phone: '(503) 910-3341',
      source: 'Word of Mouth / Spiritual Circle',
      stageId: 'mentorship_upgrade',
      createdAt: '2026-04-01',
      lastContacted: '2026-06-05',
      status: 'active',
      value: 2400,
      customFields: {
        divineFocus: 'Ancestral Healing & Karma',
        cosmicZodiacSign: 'Pisces',
        preferredTherapeuticTool: 'Thoth Mystical Archetype'
      },
      notes: [
        { id: 'n-9', content: 'Upgraded to the 6-Month Cosmic Mentorship Retainer program. Completed Session 4 of 12. Healing ancestral blockages around expression.', createdAt: '2026-04-10', author: 'Tarot Steward' }
      ],
      tasks: [
        { id: 't-17', title: 'Send journal journal prompt for Gemini New Moon', completed: true },
        { id: 't-18', title: 'Prepare customized solar eclipse reading layout', completed: false }
      ]
    }
  ],
  'taxi': [
    {
      id: 'tx-1',
      name: 'David Rockefeller Jr.',
      email: 'assistant@rockefellertravel.com',
      phone: '(212) 555-0101',
      source: 'Corporate Travel Desk Referral',
      stageId: 'ride_inquiry',
      createdAt: '2026-06-05',
      lastContacted: '2026-06-05',
      status: 'active',
      value: 250,
      customFields: {
        pickupAddress: 'The Carlyle Hotel, 35 E 76th St',
        destinationAddress: 'John F. Kennedy Airport, Terminal 4',
        vehicleClass: 'Prime VIP SUV',
        isRecurringSchedule: 'Weekly Corporate account'
      },
      notes: [
        { id: 'n-10', content: 'Demanding full-service black car with cell chargers, sparkling water, and cold towels.', createdAt: '2026-06-05', author: 'Lead Dispatcher' }
      ],
      tasks: [
        { id: 't-19', title: 'Assign high-rated veteran chauffeur', completed: false },
        { id: 't-20', title: 'Pre-check Kennedy flight arrival delays', completed: false }
      ]
    },
    {
      id: 'tx-2',
      name: 'Helena Petrova',
      email: 'helena@petrovapartners.ru',
      phone: '(347) 902-8841',
      source: 'Airport Terminal Concierge',
      stageId: 'ride_scheduled',
      createdAt: '2026-06-03',
      lastContacted: '2026-06-04',
      status: 'active',
      value: 120,
      customFields: {
        pickupAddress: 'Vessel Plaza Hudson Yards',
        destinationAddress: 'LaGuardia Executive Jet Terminal',
        vehicleClass: 'Business Class Executive Sedan',
        isRecurringSchedule: 'One-Off Tourist Booker'
      },
      notes: [
        { id: 'n-11', content: 'Luggage count: 4 heavy items. Assist requested. Chauffeur assigned.', createdAt: '2026-06-04', author: 'Lead Dispatcher' }
      ],
      tasks: [
        { id: 't-21', title: 'Confirm gate chauffeur authorization pass', completed: true },
        { id: 't-22', title: 'Send greeting card link and vehicle profile text to client', completed: false }
      ]
    }
  ],
  'custom-crm': [
    {
      id: 'cust-1',
      name: 'Omni Retail Ventures Corp',
      email: 'procure@omniretail.com',
      phone: '(312) 441-0921',
      source: 'Executive Conference Event',
      stageId: 'prospect',
      createdAt: '2026-06-03',
      lastContacted: '2026-06-03',
      status: 'active',
      value: 150000,
      customFields: {
        targetCompanyName: 'Omni Retail Ventures Inc',
        contactAuthorityTitle: 'Lead Sourcing Advisor',
        b2bSector: 'Logistics Supply Chain'
      },
      notes: [
        { id: 'n-12', content: 'Explored our SaaS integrations. Needs continuous stock replication logistics pipelines.', createdAt: '2026-06-03', author: 'CRM System' }
      ],
      tasks: [
        { id: 't-23', title: 'Send B2B technical slide deck', completed: false },
        { id: 't-24', title: 'Set up intro demonstration videoconference', completed: false }
      ]
    },
    {
      id: 'cust-2',
      name: 'Novartis Biotech Lab Inc',
      email: 'p.hudson@novartisbiolab.net',
      phone: '(617) 555-8833',
      source: 'LinkedIn Cold Inbound',
      stageId: 'negotiations',
      createdAt: '2026-05-12',
      lastContacted: '2026-06-04',
      status: 'active',
      value: 420000,
      customFields: {
        targetCompanyName: 'Novartis Biotech Lab Inc',
        contactAuthorityTitle: 'VP Innovation Department',
        b2bSector: 'Medical Care & Biotech'
      },
      notes: [
        { id: 'n-13', content: 'Draft of SLA sent last evening. Client reviewing non-disclosure legal clauses.', createdAt: '2026-06-01', author: 'CRM System' }
      ],
      tasks: [
        { id: 't-25', title: 'Conduct final compliance audit call', completed: true },
        { id: 't-26', title: 'Revise legal indemnity section 4.2', completed: false }
      ]
    }
  ],
  'coaching': [
    {
      id: 'coaching-1',
      name: 'Richard Branson III',
      email: 'branson.richard@virgin-ventures.co.uk',
      phone: '(212) 808-9911',
      source: 'LinkedIn Authority Post',
      stageId: 'discovery_session',
      createdAt: '2026-06-03',
      lastContacted: '2026-06-03',
      status: 'active',
      value: 12000,
      customFields: {
        coachingNiche: 'Executive & Business Scaling',
        sessionFrequency: 'Weekly Accelerator Sync',
        primaryOutcome: 'Launch pre-seed climate venture fund'
      },
      notes: [
        { id: 'n-co-1', content: 'Highly ambitious founder. Needs rigorous, high-efficiency alignment mapping and advisory syncs.', createdAt: '2026-06-03', author: 'Elite Advisor Agent' }
      ],
      tasks: [
        { id: 't-co-1', title: 'Compile preliminary fundraising slide playbook', completed: false },
        { id: 't-co-2', title: 'Verify leadership assessment calendar link', completed: false }
      ]
    },
    {
      id: 'coaching-2',
      name: 'Dr. Amanda Mercer',
      email: 'amanda.mercer@mindfulclinics.org',
      phone: '(312) 590-4493',
      source: 'Podcast Inbound Guest',
      stageId: 'active_coaching',
      createdAt: '2026-05-18',
      lastContacted: '2026-06-04',
      status: 'active',
      value: 4800,
      customFields: {
        coachingNiche: 'Mindset & Mindful Leadership',
        sessionFrequency: 'Bi-Weekly Strategy Loop',
        primaryOutcome: 'Establish strict clinical boundaries & scale output'
      },
      notes: [
        { id: 'n-co-2', content: 'Completed boundary exercises. Client reported Immediate reduction in work burnout stressors.', createdAt: '2026-05-24', author: 'Elite Advisor Agent' }
      ],
      tasks: [
        { id: 't-co-3', title: 'Send deep-work mindfulness journal worksheets', completed: true },
        { id: 't-co-4', title: 'Confirm next bi-weekly mentoring review call', completed: false }
      ]
    }
  ],
  'institution': [
    {
      id: 'inst-1',
      name: 'Carlos Santana Jr.',
      email: 'carlos.santana@academy-scholars.org',
      phone: '(415) 330-8801',
      source: 'Online Webinar Openhouse',
      stageId: 'admission_inquiry',
      createdAt: '2026-06-04',
      lastContacted: '2026-06-04',
      status: 'active',
      value: 24050,
      customFields: {
        academicProgram: 'Advanced STEM & Coding',
        hasAccommodation: 'Required (Dormitory Request)',
        priorGpa: 3.8
      },
      notes: [
        { id: 'n-in-1', content: 'Demonstrated stellar aptitude in competitive coding during enrollment interview.', createdAt: '2026-06-04', author: 'Admittance Dean' }
      ],
      tasks: [
        { id: 't-in-1', title: 'Review Grade 11 high school science transcripts', completed: false },
        { id: 't-in-2', title: 'Send dormitory scholarship offer letter details', completed: false }
      ]
    },
    {
      id: 'inst-2',
      name: 'Emma Watson',
      email: 'emma.watson@oxford-fellows.com',
      phone: '(650) 412-0099',
      source: 'Global Scholar Placement Office',
      stageId: 'officially_enrolled',
      createdAt: '2026-05-15',
      lastContacted: '2026-06-02',
      status: 'active',
      value: 35000,
      customFields: {
        academicProgram: 'MBA Management Executive',
        hasAccommodation: 'Not Required (Local Commuter)',
        priorGpa: 3.9
      },
      notes: [
        { id: 'n-in-2', content: 'Tuition transaction successfully settled. Student placed in executive leadership cohort A.', createdAt: '2026-05-15', author: 'Admittance Dean' }
      ],
      tasks: [
        { id: 't-in-3', title: 'Issue active campus roster access keycard', completed: true },
        { id: 't-in-4', title: 'Send onboarding orientation program calendar schedule', completed: false }
      ]
    }
  ],
  'creative-agency': [
    {
      id: 'ca-1',
      name: 'Vibrant Brew Coffee',
      email: 'roasters@vibrantbrew.in',
      phone: '+91 98200 12345',
      source: 'Instagram Ad Campaign',
      stageId: 'brief_received',
      createdAt: '2026-06-05',
      lastContacted: '2026-06-05',
      status: 'active',
      value: 120000,
      customFields: {
        industryType: 'E-Commerce Branding',
        engagementModel: 'Fixed Price Package',
        estimatedDays: 45
      },
      notes: [
        { id: 'n-ca1', content: 'Requested a bold, modern rebrand of their premium coffee packaging with 3D product renders.', createdAt: '2026-06-05', author: 'Lead Designer' }
      ],
      tasks: [
        { id: 't-ca1', title: 'Schedule style-guide moodboard collaboration call', completed: false },
        { id: 't-ca2', title: 'Draft visual asset breakdown pricing guide', completed: false }
      ]
    },
    {
      id: 'ca-2',
      name: 'Zenith Tech Platforms',
      email: 'marketing@zenithsolutions.com',
      phone: '(415) 304-9028',
      source: 'Dribbble/Behance Portfolio Inquiry',
      stageId: 'concepts_review',
      createdAt: '2026-05-28',
      lastContacted: '2026-06-03',
      status: 'active',
      value: 450000,
      customFields: {
        industryType: 'Software & UI Development',
        engagementModel: 'Monthly Project Retainer',
        estimatedDays: 90
      },
      notes: [
        { id: 'n-ca2', content: 'Presented the initial wireframe design layouts. Seeking highly interactive customized components.', createdAt: '2026-06-01', author: 'Project Director' }
      ],
      tasks: [
        { id: 't-ca3', title: 'Update proposal deck with revised milestone schedules', completed: true },
        { id: 't-ca4', title: 'Verify digital campaign key deliverables', completed: false }
      ]
    }
  ]
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndustryConfig, Lead } from '../types';

export const INDUSTRY_CONFIGS: IndustryConfig[] = [
  {
    id: 'real-estate',
    name: 'Real Estate',
    iconName: 'Home',
    tagline: 'Connect buyers with their dream properties, manage showings, and close listings.',
    leadLabel: 'Client Prospect',
    valueLabel: 'Property Budget',
    stages: [
      { id: 'contacted', name: 'Contacted' },
      { id: 'meeting', name: 'Meeting' },
      { id: 'site_visit_scheduled', name: 'Site Visit Scheduled' },
      { id: 'site_visit_postponed', name: 'Site Visit Postponed' },
      { id: 'booked', name: 'Booked' },
      { id: 'closed', name: 'Closed' },
      { id: 'lost', name: 'Lost' }
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
     
    ],
    statuses: [
      'Contacted',
      'Meeting',
      'Site Visit Scheduled',
      'Site Visit Postponed',
      'Booked',
      'Closed',
      'Lost'
    ],
    metrics: [
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
      { id: 'policy_quoted', label: 'Underwriting / Quote', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      { id: 'paperwork_sent', label: 'Documents Sent', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      { id: 'policy_active', label: 'Policies Activated', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    ],
    customFields: [
      {
        key: 'policyType',
        label: 'Insurance Category',
        type: 'select',
        options: ['Health', 'Life', 'Auto', 'Home', 'Business Liability', 'Disability'],
        required: false,
        placeholder: 'Select policy type'
      },
      {
        key: 'coverageCapacity',
        label: 'Coverage Limit (₹)',
        type: 'number',
        required: false,
        placeholder: '1000000'
      }
    ],
    statuses: ['Active', 'Closed', 'Lost', 'Policy Activated', 'Policy Issued'],
    metrics: [
      {
        key: 'premium_pipeline',
        label: 'Premium Pipeline Value',
        prefix: '$',
        type: 'sum',
        sourceField: 'value',
        description: 'Total estimated annual premiums in active pipeline.'
      },
      {
        key: 'policies_activated_count',
        label: 'Policies Activated',
        type: 'count',
        description: 'Count of leads that reached policy activation stage.'
      }
    ],
    suggestedSources: [
      'Website Lead Form',
      'Google Ads',
      'Facebook Ads',
      'Insurance Referral Portal',
      'Direct Call',
      'Email Campaign',
      'Broker Network',
      'Existing Customer Referral',
      'Other'
    ],
    todayFollowupsLabel: "Follow-up Calls",
    missedFollowupsLabel: "Overdue Callbacks",
    meetingsTodayLabel: "Consultations Today",
    closedDealsLabel: "Policies Activated"
  },
  {
    id: 'tarot-coaching',
    name: 'Tarot Coaching Hub',
    iconName: 'Sparkles',
    tagline: 'Nurture spiritual seekers, schedule intuitive reads, and upgrade clients to mentorship plans.',
    leadLabel: 'Querent Seeker',
    valueLabel: 'Session Booking Fee',
    stages: [
      { id: 'new_inquiry', label: 'New Inquiry', color: 'bg-violet-100 text-violet-800 border-violet-200' },
      { id: 'reading_scheduled', label: 'Reading Scheduled', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      { id: 'reading_completed', label: 'Reading Completed', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      { id: 'repeat_client', label: 'Repeat Client', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
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
      }
    ],
    statuses: ['New Seeker', 'Reading Scheduled', 'Reading Completed', 'Repeat Client', 'Lost'],
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
        key: 'repeat_clients_count',
        label: 'Repeat Clients',
        type: 'count',
        description: 'Count of seekers in repeat client retainer programs.'
      }
    ],
    suggestedSources: ['Instagram DM Lead', 'Weekly Tarot Newsletter', 'Podcast Free Reading Signups', 'Word of Mouth / Spiritual Circle'],
    todayFollowupsLabel: "Follow-ups Today",
    missedFollowupsLabel: "Overdue Readings",
    meetingsTodayLabel: "Readings Scheduled",
    closedDealsLabel: "Repeat Clients"
  },
  {
    id: 'taxi',
    name: 'Taxi & Shuttle Logistics',
    iconName: 'Car',
    tagline: 'Manage chauffeur bookings, executive shuttles, passenger profiles, and dispatched ride pipelines.',
    leadLabel: 'Passenger Booking',
    valueLabel: 'Estimated Fare',
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
        label: 'Pickup Location',
        type: 'text',
        required: false,
        placeholder: 'e.g. Kochi Airport'
      },
      {
        key: 'destinationAddress',
        label: 'Drop Location',
        type: 'text',
        required: false,
        placeholder: 'e.g. Infopark Kakkanad'
      },
      {
        key: 'vehicleClass',
        label: 'Vehicle Type',
        type: 'select',
        options: ['Hatchback', 'Sedan', 'SUV', 'Van', 'Luxury', 'Mini Bus'],
        required: false,
        placeholder: 'Select vehicle category'
      },
      {
        key: 'distanceKm',
        label: 'Estimated Distance (km)',
        type: 'number',
        required: false,
        placeholder: '25'
      },
      {
        key: 'ratePerKm',
        label: 'Rate Per km (₹)',
        type: 'number',
        required: false,
        placeholder: '8'
      }
    ],
    statuses: ['Active', 'Completed', 'Cancelled', 'Lost'],
    metrics: [
      {
        key: 'total_fare_value',
        label: 'Total Fare Pipeline',
        prefix: '₹',
        type: 'sum',
        sourceField: 'value',
        description: 'Aggregate estimated fares across all active ride bookings.'
      },
      {
        key: 'completed_trips',
        label: 'Journeys Completed',
        type: 'count',
        description: 'Total count of completed taxi/shuttle trips.'
      }
    ],
    suggestedSources: [
      'Corporate Travel Desk',
      'Phone Call / Manual Booking',
      'Online Aggregator',
      'Employee Referral',
      'Repeat Client',
      'Hotel Concierge',
      'Travel Agency',
      'Airport Counter',
      'Other'
    ],
    todayFollowupsLabel: "Rides Today",
    missedFollowupsLabel: "Overdue Pickups",
    meetingsTodayLabel: "In Transit",
    closedDealsLabel: "Completed Journeys"
  },
  {
    id: 'creative-agency',
    name: '🎨 Creative Agency',
    iconName: 'Briefcase',
    tagline: 'Manage leads and conversions for creative agencies.',
    leadLabel: 'Agency Lead',
    valueLabel: 'Estimated Project Value',
    stages: [
      { id: 'new_lead', label: 'New Inquiry', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      { id: 'discovery_call', label: 'Discovery Call', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
      { id: 'proposal_sent', label: 'Proposal Sent', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      { id: 'follow_up', label: 'Follow-up', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      { id: 'won_client', label: 'Client Won', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      { id: 'project_delivered', label: 'Project Delivered', color: 'bg-green-100 text-green-800 border-green-200' },
      { id: 'lost_client', label: 'Lost Client', color: 'bg-red-100 text-red-800 border-red-200' }
    ],
    customFields: [
      {
        key: 'serviceType',
        label: 'Service Required',
        type: 'select',
        options: [
          '2D Animation',
          '3D Animation',
          'Motion Graphics',
          'Explainer Videos',
          'Character Animation',
          'Product Animation',
          'Architectural Animation',
          'Whiteboard Animation',
          'Corporate Animation',
          'Video Editing',
          'Branding',
          'Graphic Design',
          'Social Media Management',
          'Meta Ads',
          'Google Ads',
          'SEO',
          'Website Development'
        ],
        required: false,
        placeholder: 'Select service type'
      },
      {
        key: 'followUpType',
        label: 'Follow-up Type',
        type: 'select',
        options: ['Call', 'Email', 'WhatsApp', 'Meeting', 'Proposal Review'],
        required: false,
        placeholder: 'Select follow-up method'
      },
      {
        key: 'companyName',
        label: 'Company Name',
        type: 'text',
        required: false,
        placeholder: 'Client company name (optional)'
      }
    ],
    statuses: ['Active', 'Closed', 'Lost', 'Won'],
    metrics: [
      {
        key: 'followups_today',
        label: 'Follow-ups Today',
        type: 'count',
        description: 'Leads with follow-ups scheduled for today.'
      },
      {
        key: 'followups_scheduled',
        label: 'Follow-ups Scheduled',
        type: 'count',
        description: 'Leads with future follow-ups scheduled.'
      },
      {
        key: 'overdue_followups',
        label: 'Overdue Follow-ups',
        type: 'count',
        description: 'Leads with overdue follow-ups.'
      },
      {
        key: 'clients_won',
        label: 'Clients Won',
        type: 'count',
        description: 'Total leads converted to clients.'
      }
    ],
    suggestedSources: [
      'Website Portfolio',
      'LinkedIn',
      'Facebook / Instagram',
      'Google Ads',
      'Referral from Past Client',
      'Upwork / Freelance Platform',
      'Direct Cold Outreach',
      'Industry Directory',
      'Event / Networking',
      'Other'
    ],
    todayFollowupsLabel: "Follow-ups Today",
    missedFollowupsLabel: "Overdue Follow-ups",
    meetingsTodayLabel: "Follow-ups Scheduled",
 closedDealsLabel: "Clients Won"
  },
  {
    id: 'professional-training',
    name: '💼 Professional Training & Coaching',
    iconName: 'Zap',
    tagline: 'Manage professional course enrollments, corporate training programs, skill development, and completion tracking.',
    leadLabel: 'Training Prospect',
    valueLabel: 'Course Package Value',
    stages: [
      { id: 'lead_received', label: 'Lead Received', color: 'bg-slate-100 text-slate-800 border-slate-200' },
      { id: 'discovery_call', label: 'Discovery Call', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      { id: 'demo_session', label: 'Demo Session', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
      { id: 'proposal_sent', label: 'Proposal Sent', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      { id: 'payment_pending', label: 'Payment Pending', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      { id: 'enrolled', label: 'Enrolled', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      { id: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' },
      { id: 'lost', label: 'Lost Deal', color: 'bg-red-100 text-red-800 border-red-200' }
    ],
    customFields: [
      {
        key: 'trainingType',
        label: 'Training Type',
        type: 'select',
        options: ['Digital Marketing', 'SAP', 'Power BI', 'Data Analytics', 'Python', 'AI/ML', 'Coding', 'Corporate Training'],
        required: false,
        placeholder: 'Select training type'
      },
      {
        key: 'trainingFormat',
        label: 'Training Format',
        type: 'select',
        options: ['Live Online', 'Self-Paced', 'Hybrid', 'Corporate Onsite', 'Bootcamp', 'Workshop'],
        required: false,
        placeholder: 'Select format'
      },
      {
        key: 'courseDuration',
        label: 'Course Duration (weeks)',
        type: 'number',
        required: false,
        placeholder: '8'
      },
      {
        key: 'participantCount',
        label: 'Number of Participants',
        type: 'number',
        required: false,
        placeholder: '1'
      }
    ],
statuses: ['Prospect', 'Demo Scheduled', 'Proposal Sent', 'Enrolled', 'Completed', 'Closed', 'Lost'],    metrics: [
      {
        key: 'enrollment_pipeline',
        label: 'Enrollment Pipeline Value',
        prefix: '₹',
        type: 'sum',
        sourceField: 'value',
        description: 'Total estimated value of all active training prospects.'
      },
      {
        key: 'courses_completed',
        label: 'Courses Completed',
        type: 'count',
        description: 'Count of completed training programs.'
      }
    ],
    suggestedSources: [
      'Website',
      'LinkedIn',
      'Facebook / Instagram',
      'Google Ads',
      'Email Campaign',
      'Industry Portal',
      'Corporate Referral',
      'Partner Network',
      'Job Portal Listing',
      'YouTube',
      'Webinar',
      'Other'
    ],
    todayFollowupsLabel: "Demo Sessions Today",
    missedFollowupsLabel: "Overdue Follow-ups",
    meetingsTodayLabel: "Discovery Calls",
    closedDealsLabel: "Courses Completed"
  }
];

export const INITIAL_LEADS_BY_INDUSTRY: Record<string, Lead[]> = {
  'real-estate': [
    {
      id: 're-1',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '(91) 98765-43210',
      source: 'Facebook',
      stageId: 'new_inquiry',
      createdAt: '2026-06-05',
      lastContacted: '2026-06-05',
      status: 'active',
      value: 1500000,
      customFields: {
        propertyType: 'Apartment',
        preferredLocation: 'Westside Heights',
        isPreApproved: 'Pre-Approved (Verified)'
      },
      notes: [
        { id: 'n-1', content: 'Looking for 3BHK apartment near metro. Budget 1.5Cr. Family of 4. Prefers modern amenities.', createdAt: '2026-06-05', author: 'Real Estate Agent' }
      ],
      tasks: [
        { id: 't-1', title: 'Send 5 property links matching criteria', completed: false },
        { id: 't-2', title: 'Schedule site visit for this weekend', completed: false }
      ]
    },
    {
      id: 're-2',
      name: 'Rajesh Kumar',
      email: 'rajesh.k@business.com',
      phone: '(91) 99876-54321',
      source: 'Google Search',
      stageId: 'viewing_scheduled',
      createdAt: '2026-05-20',
      lastContacted: '2026-06-02',
      status: 'active',
      value: 2500000,
      customFields: {
        propertyType: 'Commercial Space',
        preferredLocation: 'Business District',
        isPreApproved: 'Self-Funded / Cash Buyer'
      },
      notes: [
        { id: 'n-2', content: 'Corporate client looking for office space. 2000 sq ft. Multiple showings scheduled.', createdAt: '2026-05-20', author: 'Real Estate Agent' }
      ],
      tasks: [
        { id: 't-3', title: 'Prepare lease terms document', completed: true },
        { id: 't-4', title: 'Confirm final walkthrough time', completed: false }
      ]
    }
  ],
  'insurance': [
    {
      id: 'ins-1',
      name: 'Anjali Desai',
      email: 'anjali.desai@email.com',
      phone: '(91) 9876543210',
      source: 'Google Ads',
      stageId: 'quote_requested',
      createdAt: '2026-06-04',
      lastContacted: '2026-06-04',
      status: 'active',
      value: 15000,
     customFields: {
  policyType: 'Health',
  coverageCapacity: 500000,
  nextFollowUpDate: '2026-06-21'
},
      notes: [
        { id: 'n-3', content: 'Looking for comprehensive health insurance for family of 4. High coverage requirements.', createdAt: '2026-06-04', author: 'Insurance Agent' }
      ],
      tasks: [
        { id: 't-5', title: 'Get medical history details', completed: false },
        { id: 't-6', title: 'Send customized quotes', completed: false }
      ]
    },
    {
      id: 'ins-2',
      name: 'Vikram Singh',
      email: 'vikram.singh@company.com',
      phone: '(91) 8765432109',
      source: 'Insurance Referral Portal',
      stageId: 'policy_active',
      createdAt: '2026-04-15',
      lastContacted: '2026-06-01',
      status: 'active',
      value: 45000,
     customFields: {
  policyType: 'Business Liability',
  coverageCapacity: 1000000,
  nextFollowUpDate: '2026-06-22'
},
      notes: [
        { id: 'n-4', content: 'Business owner. Policy activated. Premium paid. Coverage active for 12 months.', createdAt: '2026-04-15', author: 'Insurance Agent' }
      ],
      tasks: [
        { id: 't-7', title: 'Send renewal reminder (11 months)', completed: false }
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
      stageId: 'new_inquiry',
      createdAt: '2026-06-04',
      lastContacted: '2026-06-05',
      status: 'active',
      value: 180,
     customFields: {
  divineFocus: 'Romantic Connection & Love',
  cosmicZodiacSign: 'Scorpio',
  nextFollowUpDate: '2026-06-20'
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
      stageId: 'reading_scheduled',
      createdAt: '2026-05-15',
      lastContacted: '2026-06-02',
      status: 'active',
      value: 450,
      customFields: {
  divineFocus: 'Wealth Alignment & Abundance',
  cosmicZodiacSign: 'Taurus',
  nextFollowUpDate: '2026-06-19'
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
      stageId: 'repeat_client',
      createdAt: '2026-04-01',
      lastContacted: '2026-06-05',
      status: 'active',
      value: 2400,
    customFields: {
  divineFocus: 'Ancestral Healing & Karma',
  cosmicZodiacSign: 'Pisces',
  nextFollowUpDate: '2026-06-17'
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
      value: 850,
    customFields: {
  pickupAddress: 'Manhattan Office',
  destinationAddress: 'JFK Airport',
  vehicleClass: 'Luxury',
  distanceKm: 25,
  ratePerKm: 34,
  nextFollowUpDate: '2026-06-18'
},
      notes: [
        { id: 'n-10', content: 'Frequent corporate traveler. Executive transportation. Multiple monthly bookings.', createdAt: '2026-06-05', author: 'Dispatch' }
      ],
      tasks: [
        { id: 't-19', title: 'Confirm luxury vehicle availability', completed: false },
        { id: 't-20', title: 'Send pickup confirmation SMS', completed: false }
      ]
    },
    {
      id: 'tx-2',
      name: 'Sanya Patel',
      email: 'sanya.patel@company.in',
      phone: '(91) 9876543210',
      source: 'Online Aggregator',
      stageId: 'trip_completed',
      createdAt: '2026-05-01',
      lastContacted: '2026-06-04',
      status: 'active',
      value: 420,
    customFields: {
  pickupAddress: 'Kochi Central Station',
  destinationAddress: 'Infopark Kakkanad',
  vehicleClass: 'Sedan',
  distanceKm: 30,
  ratePerKm: 14,
  nextFollowUpDate: '2026-06-19'
},
      notes: [
        { id: 'n-11', content: 'Regular commute booking. 4-star rating. Reliable passenger.', createdAt: '2026-05-01', author: 'Dispatch' }
      ],
      tasks: [
        { id: 't-21', title: 'Send feedback survey', completed: true }
      ]
    }
  ],
  'creative-agency': [
  {
    id: 'ca-1',
    name: 'Luxury Fashion Boutique',
    email: 'brand@luxuryboutique.com',
    phone: '(91) 9876543210',
    source: 'LinkedIn',
    stageId: 'new_lead',
    createdAt: '2026-06-03',
    lastContacted: '2026-06-04',
    status: 'active',
    value: 250000,
    customFields: {
      serviceType: 'Branding',
      followUpType: 'Email',
      companyName: 'Luxury Fashion Boutique',
      nextFollowUpDate: '2026-06-18'
    },
    notes: [
      { id: 'n-12', content: 'High-end fashion brand rebranding project. Complete brand identity overhaul. Timeline: 10 weeks.', createdAt: '2026-06-03', author: 'Creative Lead' }
    ],
    tasks: [
      { id: 't-22', title: 'Send branding proposal document', completed: false },
      { id: 't-23', title: 'Schedule creative briefing call', completed: false }
    ]
  },
  {
    id: 'ca-2',
    name: 'Tech Startup XYZ',
    email: 'marketing@techxyz.io',
    phone: '(91) 9012345678',
    source: 'Upwork / Freelance Platform',
    stageId: 'won_client',
    createdAt: '2026-04-01',
    lastContacted: '2026-06-01',
    status: 'active',
    value: 120000,
    customFields: {
      serviceType: 'Web Design',
      followUpType: 'Call',
      companyName: 'Tech Startup XYZ',
      nextFollowUpDate: '2026-06-16'
    },
    notes: [
      { id: 'n-13', content: 'Website redesign project completed successfully. Client satisfied. 5-star feedback received.', createdAt: '2026-04-01', author: 'Creative Lead' }
    ],
    tasks: [
      { id: 't-24', title: 'Send final invoice and payment terms', completed: true },
      { id: 't-25', title: 'Request detailed feedback for case study', completed: false }
    ]
  }
] , 
  'professional-training': [
    {
      id: 'pt-1',
      name: 'Abhishek Verma',
      email: 'abhishek.v@company.com',
      phone: '(91) 9876543210',
      source: 'LinkedIn',
      stageId: 'demo_session',
      createdAt: '2026-06-03',
      lastContacted: '2026-06-05',
      status: 'active',
      value: 45000,
      customFields: {
        trainingType: 'Digital Marketing',
        trainingFormat: 'Live Online',
        courseDuration: 8,
        participantCount: 1,
        nextFollowUpDate: '2026-06-18'
      },
      notes: [
        { id: 'n-pt1', content: 'Working professional. Demo session scheduled for Wednesday. Interested in advanced Digital Marketing course.', createdAt: '2026-06-03', author: 'Sales Team' }
      ],
      tasks: [
        { id: 't-pt1', title: 'Send demo session link and course syllabus', completed: false },
        { id: 't-pt2', title: 'Prepare personalized learning path', completed: false }
      ]
    },
    {
      id: 'pt-2',
      name: 'Tech Corp Limited',
      email: 'hr@techcorp.com',
      phone: '(91) 9012345678',
      source: 'Corporate Referral',
      stageId: 'proposal_sent',
      createdAt: '2026-05-15',
      lastContacted: '2026-06-02',
      status: 'active',
      value: 250000,
      customFields: {
        trainingType: 'Data Analytics',
        trainingFormat: 'Corporate Onsite',
        courseDuration: 6,
        participantCount: 25,
        nextFollowUpDate: '2026-06-17'
      },
      notes: [
        { id: 'n-pt2', content: 'Corporate training for 25 employees. Data Analytics upskilling. Proposal sent with customized curriculum.', createdAt: '2026-05-15', author: 'Corporate Sales' }
      ],
      tasks: [
        { id: 't-pt3', title: 'Follow up on proposal review', completed: false },
        { id: 't-pt4', title: 'Prepare trainer allocation plan', completed: false }
      ]
    },
    {
      id: 'pt-3',
      name: 'Neha Gupta',
      email: 'neha.ai@email.com',
      phone: '(91) 8765432109',
      source: 'Website',
      stageId: 'enrolled',
      createdAt: '2026-05-01',
      lastContacted: '2026-06-04',
      status: 'active',
      value: 65000,
      customFields: {
        trainingType: 'AI/ML',
        trainingFormat: 'Live Online',
        courseDuration: 12,
        participantCount: 1,
        nextFollowUpDate: '2026-06-21'
      },
      notes: [
        { id: 'n-pt3', content: 'Enrolled in AI/ML bootcamp. Week 4 of 12 weeks. Attending live sessions regularly. Project work on track.', createdAt: '2026-05-01', author: 'Instructor' }
      ],
      tasks: [
        { id: 't-pt5', title: 'Capstone project guidance session', completed: false },
        { id: 't-pt6', title: 'Career mentorship call scheduled', completed: false }
      ]
    },{
      id: 'pt-4',
      name: 'Raj Kumar Singh',
      email: 'raj.kumar@innovatetech.com',
      phone: '(91) 9123456789',
      source: 'Referral',
      stageId: 'completed',
      createdAt: '2026-04-01',
      lastContacted: '2026-06-10',
      status: 'completed',
      value: 55000,
      customFields: {
        trainingType: 'Python',
        trainingFormat: 'Self-Paced',
        courseDuration: 8,
        participantCount: 1,
        nextFollowUpDate: '2026-07-15'
      },
      notes: [
        { id: 'n-pt4', content: 'Successfully completed Python bootcamp. Score: 92%. Now pursuing advanced specialization course.', createdAt: '2026-06-10', author: 'Instructor' }
      ],
      tasks: [
        { id: 't-pt7', title: 'Send completion certificate', completed: true },
        { id: 't-pt8', title: 'Offer alumni community access', completed: false }
      ]
    }
  ]
};

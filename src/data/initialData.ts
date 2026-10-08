import { Project, Milestone, Task, RealityCheck, ProjectMemory, Deliverable } from '../types';

export interface SeedData {
  projects: Project[];
  milestones: Milestone[];
  tasks: Task[];
  realityChecks: RealityCheck[];
  memories: ProjectMemory[];
  deliverables: Deliverable[];
}

export const INITIAL_SEED_DATA: SeedData = {
  projects: [
    {
      id: 'proj-clothing',
      title: 'Launch Online Apparel Brand',
      description: 'Validate target customer demand, source low-MOQ suppliers, and launch a lean e-commerce capsule collection within budget.',
      goal: {
        outcome: 'Launch a small online clothing brand with 3 core capsule SKUs within a ₹50,000 / $600 starting budget.',
        successCriteria: [
          'Interview 10 target buyers to validate fit and fabric demand',
          'Lock in 1 supplier with MOQ under 40 units per SKU',
          'Achieve 100 VIP early access waitlist signups',
          'Break even on initial 50-piece capsule batch',
        ],
        category: 'business',
      },
      constraints: [
        { type: 'budget', value: 'Strict ₹50,000 ($600) initial capital ceiling' },
        { type: 'time', value: 'Execute in 45 days (evenings & weekends)' },
        { type: 'resource', value: 'Direct-to-consumer online distribution only' },
      ],
      status: 'active',
      progress: 33,
      currentMilestoneId: 'ms-clothing-1',
      currentTaskId: 'task-clothing-2',
      createdAt: '2026-09-28T10:00:00.000Z',
      updatedAt: '2026-10-07T14:30:00.000Z',
    },
    {
      id: 'proj-saas',
      title: 'Build API Monitoring Micro-SaaS',
      description: 'Ship a lightweight latency & uptime alerting tool for indie hackers and acquire the first 10 paying subscribers.',
      goal: {
        outcome: 'Launch a self-serve API monitor with Stripe billing and reach $500 MRR in 60 days.',
        successCriteria: [
          'Deploy multi-region ping agent with Discord/Slack webhooks',
          'Launch on Product Hunt & Hacker News',
          'Acquire 10 paid subscribers at $29/mo',
        ],
        category: 'technology',
      },
      constraints: [
        { type: 'time', value: '4 weeks to live beta' },
        { type: 'skill', value: 'Full-stack React & Go/Node.js' },
      ],
      status: 'active',
      progress: 60,
      currentMilestoneId: 'ms-saas-2',
      currentTaskId: 'task-saas-4',
      createdAt: '2026-09-15T08:00:00.000Z',
      updatedAt: '2026-10-06T18:00:00.000Z',
    },
    {
      id: 'proj-python',
      title: 'Master Python for Data in 60 Days',
      description: 'Systematic curriculum covering pandas, SQL, and practical machine learning with 3 portfolio projects.',
      goal: {
        outcome: 'Pass technical interview screening and complete 3 production-grade portfolio repositories.',
        successCriteria: [
          'Complete 40 hours of focused hands-on data manipulation',
          'Publish 3 end-to-end data analysis projects on GitHub',
          'Solve 50 SQL and Python coding challenge questions',
        ],
        category: 'learning',
      },
      constraints: [
        { type: 'time', value: '1.5 hours daily dedicated study time' },
      ],
      status: 'active',
      progress: 50,
      currentMilestoneId: 'ms-py-2',
      currentTaskId: 'task-py-3',
      createdAt: '2026-09-01T09:00:00.000Z',
      updatedAt: '2026-10-05T12:00:00.000Z',
    },
  ],

  milestones: [
    // Clothing Milestones
    {
      id: 'ms-clothing-1',
      projectId: 'proj-clothing',
      title: '01. Customer & Aesthetic Validation',
      objective: 'Verify customer interest and validate Willingness-to-Pay before purchasing any inventory.',
      status: 'in_progress',
      order: 1,
      dependencies: [],
      completionCriteria: ['10 customer discovery interviews completed', 'Capsule aesthetic finalized'],
      tasks: ['task-clothing-1', 'task-clothing-2', 'task-clothing-3'],
    },
    {
      id: 'ms-clothing-2',
      projectId: 'proj-clothing',
      title: '02. Sourcing & Sample Fit Approval',
      objective: 'Secure manufacturing partner capable of low minimum orders and inspect physical samples.',
      status: 'available',
      order: 2,
      dependencies: ['ms-clothing-1'],
      completionCriteria: ['Supplier quote approved', 'Sample wash-tested and approved'],
      tasks: ['task-clothing-4', 'task-clothing-5'],
    },
    {
      id: 'ms-clothing-3',
      projectId: 'proj-clothing',
      title: '03. Storefront & Pre-Launch Drop',
      objective: 'Set up checkout, build VIP waitlist, and execute first 50-unit drop.',
      status: 'locked',
      order: 3,
      dependencies: ['ms-clothing-2'],
      completionCriteria: ['Live store with payments', '100 waitlist signups', 'Initial batch sold out'],
      tasks: ['task-clothing-6', 'task-clothing-7'],
    },

    // SaaS Milestones
    {
      id: 'ms-saas-1',
      projectId: 'proj-saas',
      title: '01. Core Architecture & Ping Engine',
      objective: 'Build dependable multi-region HTTP/TCP ping check worker and incident alert queue.',
      status: 'completed',
      order: 1,
      dependencies: [],
      completionCriteria: ['Latency measurement under 10ms variance', 'Slack & Webhook delivery confirmed'],
      tasks: ['task-saas-1', 'task-saas-2'],
    },
    {
      id: 'ms-saas-2',
      projectId: 'proj-saas',
      title: '02. Billing & User Dashboard',
      objective: 'Implement Stripe subscriptions, multi-project tenant controls, and status page builder.',
      status: 'in_progress',
      order: 2,
      dependencies: ['ms-saas-1'],
      completionCriteria: ['Stripe webhook idempotent handling verified', 'Custom domain status page'],
      tasks: ['task-saas-3', 'task-saas-4'],
    },
    {
      id: 'ms-saas-3',
      projectId: 'proj-saas',
      title: '03. Public Launch & Outreach',
      objective: 'Launch on Show HN and target 100 developer signups.',
      status: 'locked',
      order: 3,
      dependencies: ['ms-saas-2'],
      completionCriteria: ['Product Hunt top 5 finish', '10 paid active subscribers'],
      tasks: ['task-saas-5'],
    },

    // Python Milestones
    {
      id: 'ms-py-1',
      projectId: 'proj-python',
      title: '01. Foundations & Data Wrangling',
      objective: 'Master pandas, numpy, and relational SQL queries on large datasets.',
      status: 'completed',
      order: 1,
      dependencies: [],
      completionCriteria: ['Passed 25 SQL practice exercises', 'Cleaned raw messy 500k-row dataset'],
      tasks: ['task-py-1', 'task-py-2'],
    },
    {
      id: 'ms-py-2',
      projectId: 'proj-python',
      title: '02. Exploratory Portfolio Analysis',
      objective: 'Build an interactive dashboard and complete statistical exploratory analysis.',
      status: 'in_progress',
      order: 2,
      dependencies: ['ms-py-1'],
      completionCriteria: ['Published GitHub repository with documented README and insights'],
      tasks: ['task-py-3', 'task-py-4'],
    },
  ],

  tasks: [
    // Clothing Tasks
    {
      id: 'task-clothing-1',
      projectId: 'proj-clothing',
      milestoneId: 'ms-clothing-1',
      title: 'Define target persona & benchmark competitor pricing',
      description: 'Document the ideal customer profile: age 18-28, minimal aesthetic, premium heavyweight cotton preference. Identify 3 competitor price points.',
      status: 'done',
      priority: 'high',
      dependencies: [],
      estimatedEffort: '2 hours',
      completionCriteria: ['Target persona sheet complete', 'Competitor pricing matrix filled'],
      deliverableSuggestions: ['Ideal Customer Persona Sheet', 'Competitor Pricing Matrix'],
      createdAt: '2026-09-28T11:00:00.000Z',
      completedAt: '2026-09-30T16:00:00.000Z',
    },
    {
      id: 'task-clothing-2',
      projectId: 'proj-clothing',
      milestoneId: 'ms-clothing-1',
      title: 'Interview 10 potential customers on fit & fabric issues',
      description: 'Run 15-minute discovery conversations to understand why they stop wearing their existing favorite t-shirts and what collars degrade first.',
      status: 'in_progress',
      priority: 'critical',
      dependencies: ['task-clothing-1'],
      estimatedEffort: '4 hours',
      completionCriteria: ['10 interview notes recorded with recurring pain points marked'],
      deliverableSuggestions: ['Customer Discovery Interview Script', 'Interview Findings Matrix', 'Fabric Preference Summary'],
      createdAt: '2026-10-01T09:00:00.000Z',
      completedAt: null,
    },
    {
      id: 'task-clothing-3',
      projectId: 'proj-clothing',
      milestoneId: 'ms-clothing-1',
      title: 'Lock 3 capsule collection specifications',
      description: 'Determine exact garment specifications: 240 GSM French Terry oversized tee, boxy cut, ribbed 1.25" neck collar.',
      status: 'todo',
      priority: 'high',
      dependencies: ['task-clothing-2'],
      estimatedEffort: '2 hours',
      completionCriteria: ['Tech pack spec sheet prepared with exact dimensions'],
      deliverableSuggestions: ['Tech Pack Spec Sheet', 'Unit Economics & Margin Calculator'],
      createdAt: '2026-10-01T09:00:00.000Z',
      completedAt: null,
    },
    {
      id: 'task-clothing-4',
      projectId: 'proj-clothing',
      milestoneId: 'ms-clothing-2',
      title: 'Contact 5 low-MOQ textile suppliers',
      description: 'Reach out to domestic manufacturers offering low MOQ (under 40 units) and sample turnaround under 10 days.',
      status: 'todo',
      priority: 'critical',
      dependencies: ['task-clothing-3'],
      estimatedEffort: '3 hours',
      completionCriteria: ['At least 3 verified quotes with fabric sample kits shipped'],
      deliverableSuggestions: ['Supplier Outreach Script', 'Supplier Comparison Sheet', 'Supplier Evaluation Checklist'],
      createdAt: '2026-10-02T10:00:00.000Z',
      completedAt: null,
    },
    {
      id: 'task-clothing-5',
      projectId: 'proj-clothing',
      milestoneId: 'ms-clothing-2',
      title: 'Inspect physical samples & perform 3 wash tests',
      description: 'Test shrinkage, neckline curl, and dye bleed across 3 gentle machine wash cycles.',
      status: 'todo',
      priority: 'high',
      dependencies: ['task-clothing-4'],
      estimatedEffort: '3 days',
      completionCriteria: ['Shrinkage measured under 3%', 'Neckline retains elastic structure'],
      deliverableSuggestions: ['Sample Inspection Checklist', 'Defect Revision Request'],
      createdAt: '2026-10-02T10:00:00.000Z',
      completedAt: null,
    },
    {
      id: 'task-clothing-6',
      projectId: 'proj-clothing',
      milestoneId: 'ms-clothing-3',
      title: 'Build Shopify storefront with local checkout & UPI/card',
      description: 'Configure clean minimal theme, upload product photos, and test payments.',
      status: 'todo',
      priority: 'medium',
      dependencies: ['task-clothing-5'],
      estimatedEffort: '4 hours',
      completionCriteria: ['Test payment completed successfully'],
      deliverableSuggestions: ['E-commerce Launch Checklist', 'Shipping & Returns Policy'],
      createdAt: '2026-10-02T10:00:00.000Z',
      completedAt: null,
    },
    {
      id: 'task-clothing-7',
      projectId: 'proj-clothing',
      milestoneId: 'ms-clothing-3',
      title: 'Launch VIP Early Access Drop to 100 waitlist members',
      description: 'Send exclusive 24-hour access code to waitlist subscribers before public release.',
      status: 'todo',
      priority: 'critical',
      dependencies: ['task-clothing-6'],
      estimatedEffort: '1 day',
      completionCriteria: ['First batch orders packaged and shipping manifests created'],
      deliverableSuggestions: ['VIP Drop Announcement Email', 'Unboxing Card Insert Copy'],
      createdAt: '2026-10-02T10:00:00.000Z',
      completedAt: null,
    },

    // SaaS Tasks
    {
      id: 'task-saas-1',
      projectId: 'proj-saas',
      milestoneId: 'ms-saas-1',
      title: 'Implement ping runner with exponential backoff & TLS validation',
      description: 'Construct health check daemon verifying status code 200, SSL expiration date, and payload regex.',
      status: 'done',
      priority: 'critical',
      dependencies: [],
      estimatedEffort: '6 hours',
      completionCriteria: ['Test suite passing with 100% mocked edge cases'],
      deliverableSuggestions: ['Ping Architecture Spec', 'Worker Test Suite'],
      createdAt: '2026-09-15T09:00:00.000Z',
      completedAt: '2026-09-18T17:00:00.000Z',
    },
    {
      id: 'task-saas-2',
      projectId: 'proj-saas',
      milestoneId: 'ms-saas-1',
      title: 'Build Slack & Discord webhook dispatcher',
      description: 'Fire instant alerts when 2 consecutive pings fail from distinct edge locations.',
      status: 'done',
      priority: 'high',
      dependencies: ['task-saas-1'],
      estimatedEffort: '3 hours',
      completionCriteria: ['Alert payload rendered with latency sparkline and status badge'],
      deliverableSuggestions: ['Alert Webhook Schema', 'Slack Bot Manifest'],
      createdAt: '2026-09-19T10:00:00.000Z',
      completedAt: '2026-09-22T14:00:00.000Z',
    },
    {
      id: 'task-saas-3',
      projectId: 'proj-saas',
      milestoneId: 'ms-saas-2',
      title: 'Integrate Stripe Customer Portal & billing webhooks',
      description: 'Handle subscription created, updated, and canceled events with grace period logic.',
      status: 'done',
      priority: 'high',
      dependencies: [],
      estimatedEffort: '4 hours',
      completionCriteria: ['Test clock billing simulation successfully tested'],
      deliverableSuggestions: ['Stripe Webhook Handlers Spec', 'Pricing Tier Breakdown'],
      createdAt: '2026-09-25T10:00:00.000Z',
      completedAt: '2026-10-02T11:00:00.000Z',
    },
    {
      id: 'task-saas-4',
      projectId: 'proj-saas',
      milestoneId: 'ms-saas-2',
      title: 'Build public status page renderer with custom subdomains',
      description: 'Allow customers to host their own status page at status.theirbrand.com with 90-day uptime history.',
      status: 'in_progress',
      priority: 'critical',
      dependencies: ['task-saas-3'],
      estimatedEffort: '5 hours',
      completionCriteria: ['SSL cert provisioning via CNAME automation verified'],
      deliverableSuggestions: ['Status Page Layout Spec', 'CNAME Verification Guide'],
      createdAt: '2026-10-03T09:00:00.000Z',
      completedAt: null,
    },
    {
      id: 'task-saas-5',
      projectId: 'proj-saas',
      milestoneId: 'ms-saas-3',
      title: 'Draft Show HN pitch & launch on developer forums',
      description: 'Craft honest, technical Show HN post emphasizing zero false alarms and open telemetry.',
      status: 'todo',
      priority: 'critical',
      dependencies: ['task-saas-4'],
      estimatedEffort: '3 hours',
      completionCriteria: ['Post published at 8am PST on Tuesday with demo sandbox active'],
      deliverableSuggestions: ['Show HN Pitch Copy', 'Product Hunt Maker Comment'],
      createdAt: '2026-10-03T09:00:00.000Z',
      completedAt: null,
    },

    // Python Tasks
    {
      id: 'task-py-1',
      projectId: 'proj-python',
      milestoneId: 'ms-py-1',
      title: 'Complete 30 intermediate SQL queries on window functions',
      description: 'Master row_number, rank, lead/lag, and complex joins on mock e-commerce database.',
      status: 'done',
      priority: 'high',
      dependencies: [],
      estimatedEffort: '10 hours',
      completionCriteria: ['All 30 queries written and verified on LeetCode/StrataScratch'],
      deliverableSuggestions: ['SQL Window Functions Cheat Sheet', 'Practice Query Log'],
      createdAt: '2026-09-02T10:00:00.000Z',
      completedAt: '2026-09-12T16:00:00.000Z',
    },
    {
      id: 'task-py-2',
      projectId: 'proj-python',
      milestoneId: 'ms-py-1',
      title: 'Clean and reshape NYC Taxi dataset with pandas',
      description: 'Handle missing values, parse datetime offsets, and group by pickup zones.',
      status: 'done',
      priority: 'high',
      dependencies: ['task-py-1'],
      estimatedEffort: '6 hours',
      completionCriteria: ['Jupyter notebook cleanly documented and exported'],
      deliverableSuggestions: ['Data Cleaning Workflow Checklist', 'EDA Notebook Template'],
      createdAt: '2026-09-14T10:00:00.000Z',
      completedAt: '2026-09-20T18:00:00.000Z',
    },
    {
      id: 'task-py-3',
      projectId: 'proj-python',
      milestoneId: 'ms-py-2',
      title: 'Build automated churn prediction notebook with Scikit-Learn',
      description: 'Train Random Forest and Logistic Regression models; evaluate with Precision-Recall curves and ROC-AUC.',
      status: 'in_progress',
      priority: 'critical',
      dependencies: ['task-py-2'],
      estimatedEffort: '8 hours',
      completionCriteria: ['F1 score above 0.78 with feature importance analysis charted'],
      deliverableSuggestions: ['Model Evaluation Framework', 'Portfolio Project README Guide'],
      createdAt: '2026-09-22T10:00:00.000Z',
      completedAt: null,
    },
    {
      id: 'task-py-4',
      projectId: 'proj-python',
      milestoneId: 'ms-py-2',
      title: 'Deploy Streamlit dashboard to Streamlit Cloud',
      description: 'Wrap churn prediction model in interactive web UI with sliders for user features.',
      status: 'todo',
      priority: 'high',
      dependencies: ['task-py-3'],
      estimatedEffort: '3 hours',
      completionCriteria: ['Live public URL accessible from resume'],
      deliverableSuggestions: ['Streamlit App Boilerplate', 'Deployment Checklist'],
      createdAt: '2026-09-22T10:00:00.000Z',
      completedAt: null,
    },
  ],

  realityChecks: [
    {
      id: 'rc-clothing',
      projectId: 'proj-clothing',
      overallRisk: 'moderate',
      summary: 'Lean capital approach is smart, but low MOQ suppliers carry higher defect rates and audience acquisition requires daily discipline.',
      strengths: [
        'Strict capsule limit (3 SKUs) avoids tying up all cash in slow inventory',
        'Customer interview requirement prevents producing unpopular cuts',
      ],
      concerns: [
        {
          id: 'rc-c1',
          severity: 'high',
          title: 'Defect Risk with Small Unverified Mills',
          reason: 'Manufacturers accepting 30-50 unit MOQs often have erratic quality control and high defect rates.',
          evidence: 'Starting capital restricts working with ISO-certified Tier-1 garment exporters.',
          recommendation: 'Order and inspect 2 physical pre-production samples before paying the 50% deposit.',
        },
        {
          id: 'rc-c2',
          severity: 'moderate',
          title: 'Zero Distribution Momentum',
          reason: 'A website does not generate sales on its own without steady organic traffic or ad spend.',
          evidence: 'No pre-existing social audience is linked to this project.',
          recommendation: 'Do not produce the clothes until 100 people have signed up for early access.',
        },
      ],
      missingInformation: [
        'Exact fabric GSM weight and yarn count',
        'Shipping partner rates and packaging costs',
      ],
      recommendations: [
        'Complete the 10 customer interviews before putting down any production deposit.',
        'Use pre-orders or waitlist to validate exact size breakdown (S/M/L/XL).',
      ],
      updatedAt: '2026-10-07T14:30:00.000Z',
    },
    {
      id: 'rc-saas',
      projectId: 'proj-saas',
      overallRisk: 'low',
      summary: 'Strong technical progress. The critical bottleneck is transitioning from developer hobby to paying developer customers.',
      strengths: [
        'Core monitoring and webhook engine are already tested and stable',
        'Direct Stripe integration eliminates billing friction',
      ],
      concerns: [
        {
          id: 'rc-s1',
          severity: 'moderate',
          title: 'Crowded Market Differentiation',
          reason: 'Uptime monitoring has established giants (Better Uptime, Pingdom, Uptime Kuma).',
          evidence: 'Value proposition needs a sharp developer-first edge.',
          recommendation: 'Highlight zero-false-positive multi-region consensus and fast public status pages.',
        },
      ],
      missingInformation: ['Target cost-per-check infrastructure overhead'],
      recommendations: [
        'Share working beta in indie hacker communities before the formal Product Hunt launch.',
      ],
      updatedAt: '2026-10-06T18:00:00.000Z',
    },
    {
      id: 'rc-python',
      projectId: 'proj-python',
      overallRisk: 'low',
      summary: 'Solid execution velocity. Need to ensure projects solve realistic business questions rather than standard toy datasets.',
      strengths: ['Consistent daily practice pace', 'Strong SQL foundation already locked in'],
      concerns: [
        {
          id: 'rc-p1',
          severity: 'low',
          title: 'Generic Portfolio Fatigue',
          reason: 'Hiring managers ignore standard Titanic and Iris flower models.',
          evidence: 'Need distinctive domain projects (e.g. churn, fintech fraud, log analysis).',
          recommendation: 'Frame churn analysis with concrete business cost and retention dollar figures.',
        },
      ],
      missingInformation: ['Specific target companies and interview date deadlines'],
      recommendations: ['Write a 5-minute technical writeup on Medium/Substack for each project.'],
      updatedAt: '2026-10-05T12:00:00.000Z',
    },
  ],

  memories: [
    {
      id: 'mem-clothing',
      projectId: 'proj-clothing',
      facts: [
        { key: 'Target Customer', value: 'Men & Unisex 18-28, minimalist streetwear', confidence: 'high' },
        { key: 'Initial Capital', value: '₹50,000 / $600', confidence: 'high' },
        { key: 'Fabric Preference', value: '240 GSM 100% Combed Cotton', confidence: 'high' },
      ],
      decisions: [
        { decision: 'Limit launch to 3 staple SKUs', reason: 'Conserves working capital and avoids inventory bloat', date: '2026-09-28' },
        { decision: 'Validate demand before bulk deposit', reason: 'Prevents unsold stock risk', date: '2026-09-29' },
      ],
      constraints: [
        { key: 'Budget', value: 'Strict cap ₹50,000' },
        { key: 'Timeline', value: 'Launch within 45 days' },
      ],
      preferences: [
        { key: 'Brand Tone', value: 'Quiet, premium, understated' },
        { key: 'Distribution', value: 'Online D2C first' },
      ],
    },
    {
      id: 'mem-saas',
      projectId: 'proj-saas',
      facts: [
        { key: 'Tech Stack', value: 'React, Vite, Node.js, TimescaleDB', confidence: 'high' },
        { key: 'Pricing Model', value: '$29/month Pro tier, free 3-monitor tier', confidence: 'high' },
      ],
      decisions: [
        { decision: 'Require 2 edge confirmations before alerting', reason: 'Eliminates 99% of false wake-up alarms', date: '2026-09-18' },
      ],
      constraints: [
        { key: 'Launch Target', value: 'October 2026' },
      ],
      preferences: [
        { key: 'Target Audience', value: 'Indie founders and small engineering squads' },
      ],
    },
    {
      id: 'mem-python',
      projectId: 'proj-python',
      facts: [
        { key: 'Current Daily Study', value: '90 minutes every morning', confidence: 'high' },
      ],
      decisions: [
        { decision: 'Focus on business tabular data over complex deep learning', reason: 'Higher demand in corporate data analyst roles', date: '2026-09-02' },
      ],
      constraints: [
        { key: 'Target timeline', value: '60 days total' },
      ],
      preferences: [
        { key: 'Focus area', value: 'SQL + pandas + data storytelling' },
      ],
    },
  ],

  deliverables: [
    {
      id: 'deliv-clothing-1',
      projectId: 'proj-clothing',
      taskId: 'task-clothing-1',
      taskTitle: 'Define target persona & benchmark competitor pricing',
      title: 'Ideal Customer Persona & Pricing Matrix',
      type: 'framework',
      content: `# Ideal Customer Persona (ICP) & Competitor Analysis

**Project:** Launch Online Apparel Brand  
**Generated by:** FORGE Execution Engine  

---

## 1. Primary Persona: "The Intentional Minimalist"
- **Demographics:** Age 20–29, urban, college student or early-career professional.
- **Pain Points with Existing Brands:**
  - Fast-fashion shirts bacon-neck after 3 wash cycles.
  - Excessive branding/logos on chest.
  - Lightweight, translucent fabric that clings uncomfortably.
- **Willingness to Pay:** ₹1,299 – ₹1,699 ($18 – $24) for a shirt that holds structure for 2+ years.
- **Core Value Hook:** "Heavyweight architectural drape. Zero loud branding. Guaranteed collar tension."

---

## 2. Competitor Pricing Matrix

| Brand | Fabric Weight | Price (INR) | Primary Weakness |
| :--- | :--- | :--- | :--- |
| **Brand A (Fast Fashion)** | 160 GSM | ₹799 | Flimsy neckline, shrinks in dryer |
| **Brand B (Direct Competitor)** | 220 GSM | ₹1,899 | Frequent out-of-stock, slow 8-day shipping |
| **Brand C (Luxury Minimal)** | 280 GSM | ₹3,499 | Unaffordable for daily wear |
| **OUR CAPSULE** | **240 GSM** | **₹1,399** | **Target 62% gross margin at ₹520 landed cost** |

---

## 3. Recommended Actions
1. Target the sweet spot of 240 GSM French terry cotton.
2. Price first drop at ₹1,399 with free shipping over 2 items.
`,
      createdAt: '2026-09-30T16:00:00.000Z',
    },
  ],
};

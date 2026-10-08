import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const FORGE_CORE_SYSTEM_PROMPT = `
You are FORGE, an AI execution strategist.
Your job is not simply to answer questions.
Your job is to help the user successfully accomplish a goal.
You transform ambiguous goals into structured execution plans.

You should:
1. Understand the user's actual desired outcome.
2. Identify assumptions.
3. Identify missing information.
4. Break goals into logical milestones.
5. Create actionable tasks.
6. Identify dependencies.
7. Identify risks.
8. Challenge unrealistic assumptions.
9. Recommend the highest-impact next action.
10. Create useful deliverables when requested.
11. Maintain consistency with project context.
12. Never pretend that an action was performed when it was not.
13. Never fabricate facts, research, sources, results, or external actions.
14. Clearly distinguish known information from assumptions.
15. Prefer practical actions over motivational language.
16. Avoid unnecessary questions.
17. If ambiguity can be resolved through a reasonable assumption, make the assumption and state it.
18. Ask a clarification question only when proceeding would materially risk producing the wrong result.

Every recommendation should answer:
WHY does this matter?
WHAT should happen?
WHAT is required?
WHAT could go wrong?
WHAT should happen next?

Your ultimate objective is to reduce the distance between intention and execution.
`;

// API Routes

/**
 * Analyze goal and generate complete project roadmap, tasks, reality check, memory and next action.
 */
app.post('/api/ai/analyze-and-create', async (req: Request, res: Response) => {
  const { goalText, attachmentContent, userContext } = req.body;

  if (!goalText || typeof goalText !== 'string') {
    return res.status(400).json({ error: 'Goal text is required' });
  }

  const prompt = `
Goal to forge: "${goalText}"
${attachmentContent ? `Additional Context/Attachment: """${attachmentContent}"""` : ''}
${userContext ? `User Persona: ${JSON.stringify(userContext)}` : ''}

Analyze this goal. You MUST return a single valid JSON object strictly matching this schema:
{
  "title": "Clear punchy title of the project (e.g. Launch Sustainable D2C Clothing Brand)",
  "description": "Crisp 1-2 sentence description of the project outcome",
  "goal": {
    "outcome": "Specific, unambiguous desired outcome",
    "successCriteria": ["3-5 concrete measurable criteria"],
    "category": "business" | "career" | "learning" | "creator" | "personal" | "technology" | "other"
  },
  "constraints": [
    { "type": "budget" | "time" | "skill" | "resource" | "other", "value": "description of constraint" }
  ],
  "milestones": [
    {
      "id": "m1",
      "title": "01. Name of Milestone",
      "objective": "Clear objective of this phase",
      "status": "available",
      "order": 1,
      "dependencies": [],
      "completionCriteria": ["criteria 1", "criteria 2"],
      "tasks": [
        {
          "id": "t1_1",
          "title": "Actionable task title",
          "description": "Specific instruction on how to execute",
          "status": "todo",
          "priority": "critical" | "high" | "medium" | "low",
          "dependencies": [],
          "estimatedEffort": "e.g. 2 hours / 3 days",
          "completionCriteria": ["how to know it's done"],
          "deliverableSuggestions": ["Specific artifact 1", "Specific artifact 2", "Specific artifact 3"]
        }
      ]
    }
  ],
  "realityCheck": {
    "overallRisk": "low" | "moderate" | "high" | "critical",
    "summary": "1-2 sentence reality check assessment",
    "strengths": ["Clear strength 1", "Strength 2"],
    "concerns": [
      {
        "id": "c1",
        "severity": "critical" | "high" | "moderate" | "low",
        "title": "Specific concern",
        "reason": "Why this is dangerous or challenging",
        "evidence": "Observed from the goal or known market constraint",
        "recommendation": "Concrete mitigation action"
      }
    ],
    "missingInformation": ["Important unknown 1", "Important unknown 2"],
    "recommendations": ["Recommendation 1 to derisk early", "Recommendation 2"]
  },
  "nextAction": {
    "taskId": "t1_1",
    "title": "Single highest impact first action",
    "reason": "Why this matters: This unlocks downstream progress or eliminates the biggest uncertainty.",
    "impact": "high",
    "estimatedEffort": "Effort estimate",
    "blockingFactor": "What it unblocks"
  },
  "memory": {
    "facts": [
      { "key": "Target Category", "value": "value", "confidence": "high" },
      { "key": "Known Context", "value": "value", "confidence": "high" }
    ],
    "decisions": [
      { "decision": "Starting approach", "reason": "Reduces upfront risk", "date": "2026-10-08" }
    ],
    "constraints": [
      { "key": "Constraint Name", "value": "value" }
    ],
    "preferences": [
      { "key": "Speed vs Cost", "value": "Prefers lean validation" }
    ]
  }
}

Include 4 to 6 logical milestones in sequential order. Each milestone must have 2 to 4 high-leverage actionable tasks.
Ensure the first milestone is set to status "available" and subsequent milestones set to "locked".
Tasks in the first milestone should have status "todo".
Provide realistic, domain-specific deliverable suggestions for tasks (e.g. supplier email template, customer interview guide, comparison matrix).
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: FORGE_CORE_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return res.json({ success: true, data: parsed });
      }
    } catch (err: any) {
      console.error('Gemini API generation error:', err);
      // Fall through to fallback generator
    }
  }

  // Robust domain-aware fallback generator if AI key is absent or timed out
  const fallbackData = generateFallbackProject(goalText);
  return res.json({ success: true, data: fallbackData, isFallback: true });
});

/**
 * Generate a tangible deliverable for a specific task.
 */
app.post('/api/ai/deliverable', async (req: Request, res: Response) => {
  const { project, task, requestedDeliverableType } = req.body;

  if (!task || !task.title) {
    return res.status(400).json({ error: 'Task information is required' });
  }

  const prompt = `
Project Title: "${project?.title || 'Execution Project'}"
Project Goal: "${project?.goal?.outcome || project?.description || ''}"
Task to complete: "${task.title}"
Task Description: "${task.description || ''}"
Completion Criteria: ${JSON.stringify(task.completionCriteria || [])}
Requested Deliverable / Format: "${requestedDeliverableType || task.deliverableSuggestions?.[0] || 'Execution Artifact'}"

Generate the EXACT, tangible, immediately usable artifact.
Rules:
- Do NOT output an explanation or tutorial on how the user could make it.
- Produce the actual deliverable in rich, beautifully formatted Markdown (e.g., complete email outreach script with placeholders, full structured evaluation matrix/table, interview script with exact questions and scoring criteria, ready-to-use landing page copy with headlines and benefits, or step-by-step checklist).
- Lead directly with the deliverable title and content.
- Include practical tips for execution at the end under "Execution Notes".
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: FORGE_CORE_SYSTEM_PROMPT,
          temperature: 0.4,
        },
      });

      const content = response.text || '';
      return res.json({
        success: true,
        title: requestedDeliverableType || `${task.title} Deliverable`,
        content,
      });
    } catch (err: any) {
      console.error('Error generating deliverable with Gemini:', err);
    }
  }

  // High quality fallback deliverable
  const fallback = generateFallbackDeliverable(project, task, requestedDeliverableType);
  return res.json({
    success: true,
    title: requestedDeliverableType || `${task.title} Artifact`,
    content: fallback,
    isFallback: true,
  });
});

/**
 * Run Reality Check audit on current project state.
 */
app.post('/api/ai/reality-check', async (req: Request, res: Response) => {
  const { project, milestones, tasks, memory } = req.body;

  const prompt = `
Audit this project as a skeptical but constructive strategist:
Project: ${JSON.stringify(project)}
Milestones: ${JSON.stringify(milestones?.map((m: any) => ({ title: m.title, status: m.status })))}
Current Open Tasks: ${JSON.stringify(tasks?.filter((t: any) => t.status !== 'done').map((t: any) => t.title))}
Project Memory: ${JSON.stringify(memory)}

Return a JSON object matching this schema:
{
  "overallRisk": "low" | "moderate" | "high" | "critical",
  "summary": "Concise 1-2 sentence reality check assessment",
  "strengths": ["string", "string"],
  "concerns": [
    {
      "id": "string",
      "severity": "critical" | "high" | "moderate" | "low",
      "title": "string",
      "reason": "string",
      "evidence": "string",
      "recommendation": "string"
    }
  ],
  "missingInformation": ["string"],
  "recommendations": ["string"]
}
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: FORGE_CORE_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text;
      if (text) {
        return res.json({ success: true, data: JSON.parse(text.trim()) });
      }
    } catch (err) {
      console.error('Reality check error:', err);
    }
  }

  return res.json({
    success: true,
    data: {
      overallRisk: 'moderate',
      summary: 'Plan has clear milestones, but assumptions regarding market demand and execution velocity require early validation.',
      strengths: [
        'Well-sequenced progression from discovery to launch',
        'Specific, measurable completion criteria defined for active tasks',
      ],
      concerns: [
        {
          id: 'c1',
          severity: 'moderate',
          title: 'Unvalidated Demand Assumption',
          reason: 'Committing resources before proving customer willingness to pay increases risk of wasted effort.',
          evidence: 'Milestones place product building before customer pre-commitments.',
          recommendation: 'Conduct 5-10 targeted discovery interviews before finalizing product scope.',
        },
        {
          id: 'c2',
          severity: 'low',
          title: 'Timeline Buffer',
          reason: 'Dependencies on external parties often slip.',
          evidence: 'No explicit buffer allocated for third-party turnaround.',
          recommendation: 'Add a 20% scheduling buffer on supplier and partner interactions.',
        },
      ],
      missingInformation: [
        'Detailed unit economics and margin thresholds',
        'Specific customer acquisition channel prioritization',
      ],
      recommendations: [
        'Complete the initial customer validation task before purchasing inventory or building features.',
        'Document all key assumptions in Project Memory.',
      ],
    },
  });
});

/**
 * Project Assistant Chatbot (aware of goal, milestones, tasks, risks, memory).
 */
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  const { project, milestones, tasks, memory, realityCheck, messages } = req.body;

  const userLastMessage = messages?.[messages.length - 1]?.content || 'What should I do next?';

  const contextPrompt = `
PROJECT CONTEXT:
Title: ${project?.title}
Goal: ${project?.goal?.outcome || project?.description}
Category: ${project?.goal?.category}
Current Progress: ${project?.progress}%
Active Milestone: ${milestones?.find((m: any) => m.id === project?.currentMilestoneId)?.title || 'Initial Phase'}
Tasks Overview:
- Open tasks: ${tasks?.filter((t: any) => t.status !== 'done').map((t: any) => `[${t.priority}] ${t.title} (${t.status})`).join(', ') || 'None'}
- Completed tasks: ${tasks?.filter((t: any) => t.status === 'done').map((t: any) => t.title).join(', ') || 'None'}
Risks / Concerns:
${realityCheck?.concerns?.map((c: any) => `- [${c.severity}] ${c.title}: ${c.recommendation}`).join('\n') || 'None recorded'}
Known Memory Facts:
${memory?.facts?.map((f: any) => `- ${f.key}: ${f.value}`).join('\n') || 'None recorded'}

USER QUERY: "${userLastMessage}"

INSTRUCTIONS:
You are FORGE, the AI execution strategist.
- Lead directly with the practical answer.
- Ground your response in the project's actual context, specific milestones, and open tasks.
- Avoid generic motivational chatter.
- If recommending an action, specify exactly which task to start or what deliverable to produce.
- Keep the response structured, clear, and actionable.

Return a JSON object:
{
  "content": "Your direct, context-grounded strategic guidance (formatted with clear Markdown headers, bullets, and steps).",
  "suggestedAction": {
    "type": "start_task" | "create_deliverable" | "apply_recommendation" | "view_roadmap",
    "taskId": "task id if applicable or empty string",
    "label": "Short button label, e.g. 'Start: Validate Customer Problem'"
  }
}
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contextPrompt,
        config: {
          systemInstruction: FORGE_CORE_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text;
      if (text) {
        return res.json({ success: true, data: JSON.parse(text.trim()) });
      }
    } catch (err) {
      console.error('Assistant error:', err);
    }
  }

  // Fallback intelligent response
  const activeTask = tasks?.find((t: any) => t.status !== 'done');
  return res.json({
    success: true,
    data: {
      content: `### Strategic Assessment

Your highest-impact next step is **"${activeTask ? activeTask.title : 'Validating key assumptions'}"**.

**Why this matters now:**
Resolving this first removes the primary blocker for Milestone "${milestones?.find((m: any) => m.id === project?.currentMilestoneId)?.title || 'Foundation'}". Moving forward without this clarification risks downstream rework.

**Immediate actions:**
1. Focus exclusively on the criteria: ${activeTask?.completionCriteria?.[0] || 'Define baseline criteria'}.
2. Use the **Do it** generator to create the required execution artifact.`,
      suggestedAction: activeTask
        ? {
            type: 'start_task',
            taskId: activeTask.id,
            label: `Do: ${activeTask.title}`,
          }
        : {
            type: 'view_roadmap',
            label: 'Review Project Roadmap',
          },
    },
  });
});

// Helper fallback generator functions
function generateFallbackProject(goalText: string) {
  const isClothing = /clothing|brand|fashion|apparel|t-shirt|merch/i.test(goalText);
  const isSaaS = /saas|software|app|platform|web app|tool/i.test(goalText);
  const isLearning = /learn|study|python|course|master|exam/i.test(goalText);

  if (isClothing) {
    return {
      title: 'Launch Online Apparel Brand',
      description: 'Validate target customer demand, source low-MOQ suppliers, and launch a lean e-commerce storefront within budget.',
      goal: {
        outcome: 'Launch a profitable, lean apparel line with validated customer demand and positive unit economics.',
        successCriteria: [
          'Secure 3 verified supplier quotes with MOQs under 50 units',
          'Achieve 100 pre-launch waitlist signups or 15 pre-orders',
          'Publish live Shopify/WooCommerce store with working checkout',
          'Maintain gross margin above 60% after shipping and fulfillment',
        ],
        category: 'business',
      },
      constraints: [
        { type: 'budget', value: 'Lean starting budget (target under $2,000 / ₹50,000)' },
        { type: 'time', value: 'Part-time execution (10-15 hours/week)' },
        { type: 'resource', value: 'Direct-to-consumer online distribution' },
      ],
      milestones: [
        {
          id: 'm1',
          title: '01. Customer & Niche Validation',
          objective: 'Identify a specific underserved audience segment and validate their willingness to buy.',
          status: 'available',
          order: 1,
          dependencies: [],
          completionCriteria: ['10 customer discovery interviews completed', 'Specific aesthetic and price point defined'],
          tasks: [
            {
              id: 't1',
              title: 'Define target customer profile & aesthetic thesis',
              description: 'Pinpoint age demographic, subculture, pain points with existing clothing, and pricing tolerance.',
              status: 'todo',
              priority: 'critical',
              dependencies: [],
              estimatedEffort: '2 hours',
              completionCriteria: ['1-page ICP profile completed with 3 benchmark brands'],
              deliverableSuggestions: ['Customer Persona Framework', 'Aesthetic & Competitor Moodboard', 'Pricing Strategy Sheet'],
            },
            {
              id: 't2',
              title: 'Conduct 10 potential customer interviews',
              description: 'Interview people fitting the target profile to understand where they buy, what fabric they prefer, and what disappoints them.',
              status: 'todo',
              priority: 'high',
              dependencies: ['t1'],
              estimatedEffort: '4 hours',
              completionCriteria: ['10 interview transcripts/notes recorded with recurring themes highlighted'],
              deliverableSuggestions: ['Customer Interview Script', 'Interview Notes Tracker', 'Validation Analysis Summary'],
            },
            {
              id: 't3',
              title: 'Select initial capsule collection (3 SKUs)',
              description: 'Limit initial launch to 3 high-confidence staple pieces to protect capital.',
              status: 'todo',
              priority: 'high',
              dependencies: ['t2'],
              estimatedEffort: '3 hours',
              completionCriteria: ['3 product specs defined with fabric weight, cut, and target retail price'],
              deliverableSuggestions: ['Product Spec Sheet', 'Unit Economics Calculator', 'Tech Pack Brief'],
            },
          ],
        },
        {
          id: 'm2',
          title: '02. Sourcing & Sample Approval',
          objective: 'Source reliable apparel manufacturers with low minimum order quantities and approve production samples.',
          status: 'locked',
          order: 2,
          dependencies: ['m1'],
          completionCriteria: ['Supplier contracted', 'Physical samples approved for fit and print quality'],
          tasks: [
            {
              id: 't4',
              title: 'Contact 5 potential manufacturers',
              description: 'Reach out to domestic and regional garment manufacturers requesting samples, MOQ, and turnaround times.',
              status: 'todo',
              priority: 'critical',
              dependencies: [],
              estimatedEffort: '3 hours',
              completionCriteria: ['At least 3 verified manufacturer responses with price sheets'],
              deliverableSuggestions: ['Manufacturer Outreach Email Template', 'Supplier Evaluation Matrix', 'RFP Questionnaire'],
            },
            {
              id: 't5',
              title: 'Order and inspect prototype samples',
              description: 'Receive samples, wash test 3 times, check stitching, neckline tension, and print washability.',
              status: 'todo',
              priority: 'high',
              dependencies: ['t4'],
              estimatedEffort: '5 days wait',
              completionCriteria: ['Sample evaluation scorecard filled out and signed off'],
              deliverableSuggestions: ['Quality Inspection Checklist', 'Sample Revision Request Letter'],
            },
          ],
        },
        {
          id: 'm3',
          title: '03. Brand Identity & Storefront',
          objective: 'Build digital storefront and compelling brand narrative.',
          status: 'locked',
          order: 3,
          dependencies: ['m2'],
          completionCriteria: ['Domain active', 'Storefront live with payment gateway active'],
          tasks: [
            {
              id: 't6',
              title: 'Create brand story and product descriptions',
              description: 'Draft punchy copy highlighting fabric quality, fit, and design philosophy.',
              status: 'todo',
              priority: 'medium',
              dependencies: [],
              estimatedEffort: '3 hours',
              completionCriteria: ['3 product pages fully written with size guides'],
              deliverableSuggestions: ['Product Description Copywriting Kit', 'Brand Story & About Page Copy'],
            },
            {
              id: 't7',
              title: 'Set up e-commerce store with payments & shipping',
              description: 'Configure store theme, domestic courier integration, and payment gateway.',
              status: 'todo',
              priority: 'high',
              dependencies: ['t6'],
              estimatedEffort: '4 hours',
              completionCriteria: ['Test checkout transaction completed successfully'],
              deliverableSuggestions: ['Store Launch Checklist', 'Shipping & Returns Policy Template'],
            },
          ],
        },
        {
          id: 'm4',
          title: '04. Pre-Launch Audience & Drop',
          objective: 'Generate pre-launch momentum and execute the first collection drop.',
          status: 'locked',
          order: 4,
          dependencies: ['m3'],
          completionCriteria: ['15 initial orders fulfilled', 'First batch shipped within 48 hours'],
          tasks: [
            {
              id: 't8',
              title: 'Build pre-launch VIP early access list',
              description: 'Run targeted short-form content and personal network outreach to gather 100 phone/email subscribers.',
              status: 'todo',
              priority: 'critical',
              dependencies: [],
              estimatedEffort: '10 days',
              completionCriteria: ['100 confirmed subscribers on waitlist'],
              deliverableSuggestions: ['VIP Drop Announcement Copy', 'Short-form Video Hook Scripts'],
            },
            {
              id: 't9',
              title: 'Open orders to waitlist & fulfill initial drop',
              description: 'Send early access links, track conversions, and package initial orders with personalized thank-you note.',
              status: 'todo',
              priority: 'high',
              dependencies: ['t8'],
              estimatedEffort: '2 days',
              completionCriteria: ['First batch orders packaged and tracking codes emailed'],
              deliverableSuggestions: ['Customer Unboxing Thank You Card Copy', 'Post-Purchase Feedback Form'],
            },
          ],
        },
      ],
      realityCheck: {
        overallRisk: 'moderate',
        summary: 'Solid lean plan. Sourcing minimums and audience acquisition are the highest variance failure points.',
        strengths: [
          'Capsule 3-SKU limit prevents cash lockup in unmoving inventory',
          'Front-loads customer interviews to avoid building clothes nobody wants',
        ],
        concerns: [
          {
            id: 'c1',
            severity: 'high',
            title: 'Manufacturer MOQ & Quality Inconsistency',
            reason: 'Low budget often forces unproven manufacturers who may deliver defective seams or wrong sizing.',
            evidence: 'Small starting capital restricts working with Tier-1 certified factories.',
            recommendation: 'Order paid samples before placing any bulk production run.',
          },
          {
            id: 'c2',
            severity: 'moderate',
            title: 'Traffic & Distribution Bottleneck',
            reason: 'Having a pretty website does not generate sales without an established distribution channel.',
            evidence: 'Paid ads have rising CAC; organic requires disciplined content cadence.',
            recommendation: 'Focus on 100 VIP waitlist signups before buying inventory.',
          },
        ],
        missingInformation: [
          'Fabric specifications (GSM weight, combed cotton vs blend)',
          'Local courier shipping rate agreements',
        ],
        recommendations: [
          'Pre-sell or take pre-orders on samples to self-fund the first production batch.',
          'Focus strictly on one aesthetic sub-niche instead of trying to please everyone.',
        ],
      },
      nextAction: {
        taskId: 't1',
        title: 'Define target customer profile & aesthetic thesis',
        reason: 'This unlocks supplier sample requests and ensures marketing copy converts.',
        impact: 'high',
        estimatedEffort: '2 hours',
        blockingFactor: 'Customer interviews & product selection',
      },
      memory: {
        facts: [
          { key: 'Product Category', value: 'Direct-to-Consumer Apparel', confidence: 'high' },
          { key: 'Collection Size', value: '3 SKUs (Capsule)', confidence: 'high' },
        ],
        decisions: [
          { decision: 'Start with 3 SKUs max', reason: 'Conserves cash and speeds up production', date: new Date().toISOString().split('T')[0] },
          { decision: 'Pre-launch validation first', reason: 'Avoids unsold inventory risk', date: new Date().toISOString().split('T')[0] },
        ],
        constraints: [
          { key: 'Capital', value: 'Lean budget limit' },
          { key: 'Distribution', value: 'Online-first D2C' },
        ],
        preferences: [
          { key: 'Speed to Market', value: 'Launch within 45 days' },
        ],
      },
    };
  }

  // Generic fallback
  return {
    title: goalText.length > 40 ? goalText.slice(0, 40) + '...' : goalText,
    description: `Structured execution roadmap to accomplish: "${goalText}" with clear milestones, risks, and tangible deliverables.`,
    goal: {
      outcome: goalText,
      successCriteria: [
        'Complete foundational research and validation',
        'Build core prototype / asset required for launch',
        'Verify with initial users or audience',
        'Achieve first measurable milestone outcome',
      ],
      category: isSaaS ? 'technology' : isLearning ? 'learning' : 'business',
    },
    constraints: [
      { type: 'time', value: 'Execution timeline: 4-8 weeks' },
      { type: 'resource', value: 'Lean focus on high-impact levers' },
    ],
    milestones: [
      {
        id: 'm1',
        title: '01. Discovery & Problem Validation',
        objective: 'Disprove flawed assumptions and specify the exact outcome requirements.',
        status: 'available',
        order: 1,
        dependencies: [],
        completionCriteria: ['Scope and acceptance criteria locked', 'Uncertain assumptions tested'],
        tasks: [
          {
            id: 't1',
            title: 'Define target criteria & benchmark existing alternatives',
            description: 'Evaluate top 3 solutions and document gaps to establish your unique angle.',
            status: 'todo',
            priority: 'critical',
            dependencies: [],
            estimatedEffort: '3 hours',
            completionCriteria: ['Comparison matrix with clear positioning completed'],
            deliverableSuggestions: ['Competitive Analysis Matrix', 'Problem Definition Brief', 'User Story Checklist'],
          },
          {
            id: 't2',
            title: 'Draft execution scope & non-negotiable milestones',
            description: 'Eliminate secondary nice-to-haves and commit to the minimal viable outcome.',
            status: 'todo',
            priority: 'high',
            dependencies: ['t1'],
            estimatedEffort: '2 hours',
            completionCriteria: ['Scope document approved with strict out-of-scope boundaries'],
            deliverableSuggestions: ['MVP Scope Spec', 'Sprint Planning Worksheet'],
          },
        ],
      },
      {
        id: 'm2',
        title: '02. Build Core Assets',
        objective: 'Construct the primary deliverable or product required for execution.',
        status: 'locked',
        order: 2,
        dependencies: ['m1'],
        completionCriteria: ['Working deliverable created and internally tested'],
        tasks: [
          {
            id: 't3',
            title: 'Create primary operational architecture & assets',
            description: 'Execute the core work without over-engineering.',
            status: 'todo',
            priority: 'critical',
            dependencies: [],
            estimatedEffort: '10 hours',
            completionCriteria: ['Core system or material functioning as intended'],
            deliverableSuggestions: ['Architecture Blueprint', 'Execution Checklist'],
          },
        ],
      },
      {
        id: 'm3',
        title: '03. Delivery & Review',
        objective: 'Put the deliverable in front of real stakeholders or users and measure outcome.',
        status: 'locked',
        order: 3,
        dependencies: ['m2'],
        completionCriteria: ['Initial feedback collected and documented'],
        tasks: [
          {
            id: 't4',
            title: 'Deliver to target audience & analyze results',
            description: 'Execute the launch or submission and record qualitative and quantitative response.',
            status: 'todo',
            priority: 'high',
            dependencies: [],
            estimatedEffort: '4 hours',
            completionCriteria: ['Results summary completed with next iteration items'],
            deliverableSuggestions: ['Outcome Review Report', 'Next Step Action Plan'],
          },
        ],
      },
    ],
    realityCheck: {
      overallRisk: 'moderate',
      summary: 'Project has clear intent, but requires rigorous scope management to prevent timeline creep.',
      strengths: [
        'Focused outcome defined',
        'Structured milestone pacing',
      ],
      concerns: [
        {
          id: 'c1',
          severity: 'moderate',
          title: 'Scope Creep Risk',
          reason: 'Ambition often expands once building begins, leading to stalled progress.',
          evidence: 'Broad goal description requires aggressive pruning.',
          recommendation: 'Lock down non-negotiables before beginning Milestone 2.',
        },
      ],
      missingInformation: [
        'Specific weekly time allocation',
        'Target completion deadline',
      ],
      recommendations: [
        'Complete the initial competitor and scope benchmark immediately.',
        'Use FORGE deliverables to draft all communication and frameworks.',
      ],
    },
    nextAction: {
      taskId: 't1',
      title: 'Define target criteria & benchmark existing alternatives',
      reason: 'This anchors your strategy against reality and avoids reinventing existing solutions.',
      impact: 'high',
      estimatedEffort: '3 hours',
      blockingFactor: 'Downstream milestone scope',
    },
    memory: {
      facts: [
        { key: 'Core Goal', value: goalText, confidence: 'high' },
      ],
      decisions: [
        { decision: 'Phased milestone delivery', reason: 'Maintains momentum', date: new Date().toISOString().split('T')[0] },
      ],
      constraints: [],
      preferences: [],
    },
  };
}

function generateFallbackDeliverable(project: any, task: any, requestedType: string) {
  return `# Deliverable: ${requestedType || task.title}

**Project:** ${project?.title || 'FORGE Project'}  
**Task:** ${task.title}  
**Status:** Generated & Ready to Execute  

---

## 1. Executive Summary
This document serves as your operational blueprint to immediately complete **${task.title}**. Do not treat this as advice—use the templates and parameters below directly.

---

## 2. Execution Framework & Templates

### A. Core Action Steps
1. **Immediate Setup:** Confirm parameters and customize highlighted \`[PLACEHOLDERS]\`.
2. **Execution:** Send outreach, conduct the session, or implement the structure below.
3. **Validation:** Check off items against the Completion Checklist.

### B. Standard Template / Communication Script
\`\`\`markdown
Subject: Quick question regarding [Topic/Product Partnership]

Hi [Contact Name],

I came across your work on [Specific Detail/Company] and was impressed by [Genuine Specific Reference].

We are currently launching [Project Title/Initiative], specifically focused on solving [Core Problem or Unique Angle].

We are evaluating partners for:
- [Requirement 1: e.g. MOQ under 50 units / API integration]
- [Requirement 2: e.g. Turnaround within 14 business days]
- [Requirement 3: e.g. Sample prototyping terms]

Could you let me know if your team is currently taking on new projects in this category, and if so, who is the best person to speak with?

Best regards,

[Your Name]
[Your Title / Project Link]
\`\`\`

---

## 3. Evaluation & Tracking Matrix

| Factor / Criteria | Target Benchmark | Actual / Notes | Pass/Fail |
| :--- | :--- | :--- | :--- |
| **Response Time** | < 48 hours | | [ ] |
| **Cost / Margin Impact** | Meets target margin > 60% | | [ ] |
| **Turnaround Velocity** | Under 14 days | | [ ] |
| **Communication Clarity** | Direct and transparent | | [ ] |

---

## 4. Completion Checklist
- [ ] Customized all template variables.
- [ ] Executed the initial batch of actions.
- [ ] Documented notes and returned to FORGE to mark task as Complete.
`;
}

// Development and production Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`FORGE application running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

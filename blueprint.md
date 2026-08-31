இந்த job-க்கு **simple demo மாதிரி இல்லாமல், small but production-quality PR SaaS prototype** build பண்ணுவது best. Job description-ல் அவர்கள் specifically **AI-assisted development, spec thinking, code review, testing, Git history, shipped work** பார்க்கிறார்கள். அதனால் functionality + architecture + documentation + Git history எல்லாமே முக்கியம்.

Google-ன் current developer ecosystem-லும் Antigravity agent-based development-க்கு பயன்படுத்தப்படுகிறது; Next.js is suitable for full-stack React applications, and FastAPI provides a production-oriented Python API layer. ([Google for Developers][1])

# PROJECT BLUEPRINT — `PRFlow AI`

## 1. Project objective

**PRFlow AI** என்பது PR/Communications consultants-க்கு:

* prospects/leads manage செய்ய
* company/contact information store செய்ய
* AI மூலம் personalized outreach generate செய்ய
* outreach status track செய்ய
* follow-ups manage செய்ய
* AI-generated content review/edit செய்ய
* campaign performance பார்க்க

உதவும் **AI-powered PR Lead Outreach web platform**.

இது அவர்கள் job description-ல் குறிப்பிட்ட **Pressella / PR automation workflow**-க்கு directly relevant ஆக இருக்கும்.

---

# 2. Product positioning

### App name

**PRFlow AI**

### Tagline

> **AI-powered outreach workspace for modern PR teams.**

### Main user

**PR Consultant / PR Manager**

### Main problem

PR consultant ஒரு prospect-ஐ contact செய்யும்போது:

```text
Find company
      ↓
Research company
      ↓
Find contact
      ↓
Understand their business
      ↓
Write personalized pitch
      ↓
Track outreach
      ↓
Follow up
```

இதெல்லாம் manually செய்ய வேண்டியுள்ளது.

### PRFlow AI

```text
Lead
 ↓
Company information
 ↓
AI research summary
 ↓
AI personalized pitch
 ↓
Review/Edit
 ↓
Send / Mark as sent
 ↓
Follow-up
 ↓
Track result
```

---

# 3. Important scope decision

**இதை huge SaaS ஆக build பண்ணக்கூடாது.**

Job description:

> Keep it small and finished — an evening or two is plenty.

அதனால்:

### Build fully

* Dashboard
* Leads
* Lead details
* Add/edit lead
* AI outreach generation
* Outreach editor
* Status tracking
* Search/filter
* Follow-up
* Activity timeline
* Basic analytics
* Settings
* Responsive UI
* Error handling
* Loading states
* Empty states
* Tests
* README
* Seed data
* Docker
* GitHub

### Don't build now

* Real WhatsApp sending
* Real email sending
* Twilio production integration
* HubSpot OAuth
* Multi-tenant billing
* Subscription
* Complex RBAC
* Mobile app
* Huge CRM
* Complex campaign engine

இவை **future roadmap** ஆக காட்டலாம்.

இதனால் project small + complete ஆக இருக்கும்.

---

# 4. Complete user flow

```text
Landing / Login
      ↓
Dashboard
      ↓
Leads
      ↓
Select Lead
      ↓
Lead Details
      ↓
Research Summary
      ↓
Generate AI Outreach
      ↓
AI Draft
      ↓
Edit / Approve
      ↓
Mark as Sent
      ↓
Follow-up
      ↓
Activity Timeline
      ↓
Analytics
```

---

# 5. Pages

## Public

### `/`

Landing page

Sections:

* Navbar
* Hero
* Problem
* Solution
* Features
* Workflow
* AI section
* CTA
* Footer

CTA:

**Open Workspace**

---

### `/login`

Demo login.

For test project, don't waste time building real OAuth.

Use:

```text
Email
Password
Sign in
```

Demo credentials clearly shown:

```text
demo@prflow.ai
password123
```

After login:

```text
/dashboard
```

---

# 6. Dashboard

Route:

```text
/dashboard
```

### Header

```text
Good morning, Amresh

Here's what's happening with your outreach today.
```

Actions:

```text
+ Add Lead
Generate Outreach
```

### KPI cards

```text
Total Leads
124

New This Week
18

Outreach Sent
67

Follow-ups Due
12
```

### Outreach funnel

```text
New
 ↓
Contacted
 ↓
Replied
 ↓
Meeting
 ↓
Converted
```

### Recent leads

Columns:

```text
Company
Contact
Industry
Status
Last Contact
Next Follow-up
Action
```

### Follow-up panel

```text
Follow-ups Due Today

TechNova
Sarah Wilson
Due today

Acme AI
David Chen
Due tomorrow
```

---

# 7. Leads page

Route:

```text
/dashboard/leads
```

Top:

```text
Leads

Search leads...
[Status]
[Industry]
[Sort]
+ Add Lead
```

Table:

```text
Company
Contact
Role
Industry
Status
Last Contact
Next Follow-up
Actions
```

Status:

```text
New
Researching
Contacted
Replied
Meeting
Converted
Not Interested
```

---

# 8. Add Lead

Route:

```text
/dashboard/leads/new
```

Fields:

```text
Company Name *
Website
Contact Name *
Contact Email
Job Title
Industry
Company Description
Company Size
Location
LinkedIn URL
Notes
```

Buttons:

```text
Cancel
Create Lead
```

Validation:

* Company required
* Contact name required
* Email format validation
* URL validation
* No duplicate company/contact combination

After creation:

```text
Lead created successfully
```

redirect:

```text
/dashboard/leads/{id}
```

---

# 9. Lead Details

This is one of the **most important screens**.

Layout:

```text
← Back to Leads

TechNova AI
AI Infrastructure Company

[Generate Outreach]
[Edit Lead]
```

### Company information

```text
Website
Industry
Location
Company Size
LinkedIn
Description
```

### Contact

```text
Sarah Wilson
Head of Communications

Email
LinkedIn
```

### AI Research Summary

```text
AI-generated summary

TechNova AI is an...
```

### Outreach

```text
Latest Outreach

Subject:
...

Message:
...

[Edit]
[Regenerate]
[Mark as Sent]
```

### Follow-up

```text
Next Follow-up
Sep 05, 2026

[Schedule Follow-up]
```

### Activity timeline

```text
Today
AI outreach generated

Yesterday
Lead created

Sep 01
Lead researched
```

---

# 10. AI Outreach Generator

This is the **hero feature**.

Modal/page:

```text
Generate AI Outreach
```

Inputs:

```text
Goal
[Media Pitch ▼]

Tone
[Professional ▼]

Channel
[Email ▼]

Key Angle
[AI innovation / product launch / funding...]
```

Button:

```text
Generate Outreach
```

AI output:

```text
Subject
AI-generated subject

Message
AI-generated personalized message
```

Buttons:

```text
Regenerate
Copy
Edit
Approve
```

---

# 11. AI prompt architecture

Backend should NOT blindly send raw user input.

Create structured prompt:

```text
SYSTEM

You are an experienced PR communications assistant.

Your job is to create concise, personalized and fact-based
outreach messages for PR professionals.

Rules:
- Never invent facts.
- Use only information provided.
- Do not make unsupported claims.
- Avoid generic sales language.
- Keep the message professional.
- Make the personalization obvious.
- Return valid JSON.
```

User context:

```text
Company:
Contact:
Role:
Industry:
Company description:
Key angle:
Tone:
Channel:
Goal:
```

Output:

```json
{
  "subject": "...",
  "message": "...",
  "personalization_points": [
    "...",
    "..."
  ]
}
```

This is much better than simply:

```text
"write me an email"
```

---

# 12. AI safety / reliability

Important.

AI output should have:

### Loading

```text
Generating personalized outreach...
```

### Error

```text
We couldn't generate the outreach right now.

Please try again.
```

### Empty response

```text
The AI returned an incomplete response.
Please regenerate.
```

### API timeout

Handle timeout.

### Invalid JSON

Backend validates AI response.

### No API key

For GitHub/demo:

```text
Demo AI mode
```

Use deterministic mock response.

This means the hiring manager can run the project without your secret key.

**Never commit API keys.**

---

# 13. Outreach editor

Don't make generated AI text read-only.

Use editor:

```text
Subject
────────────────

Message
────────────────────────
| editable content       |
|                        |
|                        |
────────────────────────
```

Actions:

```text
Save Draft
Regenerate
Copy
Approve
```

Track:

```text
AI Generated
Human Edited
Approved
Sent
```

This is actually valuable for the job because it demonstrates **human verification of AI output**.

---

# 14. Outreach status

Use:

```text
Draft
Approved
Sent
Replied
Follow-up Due
Meeting
Converted
Closed
```

Status transitions should be logical.

Example:

```text
Draft
 ↓
Approved
 ↓
Sent
 ↓
Replied
 ↓
Meeting
 ↓
Converted
```

---

# 15. Follow-up system

On Lead Details:

```text
Next follow-up

[Date]
[Time]
[Note]

Schedule
```

Dashboard:

```text
Follow-ups Due
```

Each follow-up:

```text
Company
Contact
Due date
Status
Action
```

Actions:

```text
Complete
Reschedule
Open Lead
```

---

# 16. Analytics

Route:

```text
/dashboard/analytics
```

Show:

```text
Total Leads
Outreach Sent
Response Rate
Meetings
Conversions
```

Charts:

### Outreach activity

```text
Mon █████
Tue ███████
Wed ████
Thu █████████
Fri ██████
```

### Status distribution

```text
New
Contacted
Replied
Meeting
Converted
```

Don't overbuild analytics.

---

# 17. Settings

Route:

```text
/dashboard/settings
```

Sections:

### Profile

```text
Name
Email
Role
```

### AI preferences

```text
Default tone
Default channel
Default outreach length
```

### Appearance

```text
Light
Dark
System
```

### API status

```text
AI Provider
Connection status
```

Don't expose API secrets.

---

# 18. Navigation

Desktop sidebar:

```text
PRFlow AI

Dashboard
Leads
Outreach
Follow-ups
Analytics

────────────

Settings
Help
```

Bottom:

```text
Amresh
PR Consultant
```

Mobile:

```text
Top bar
+
Bottom navigation
```

---

# 19. UI design

I recommend:

### Style

**Modern B2B SaaS**

Not flashy.

Not gaming.

Not generic AI landing page.

Use:

```text
Clean
Minimal
Professional
Premium
High readability
```

### Colors

Primary:

```text
Indigo / Violet
```

Supporting:

```text
Neutral gray
White
Dark charcoal
Green success
Amber warning
Red error
```

### Typography

Use:

```text
Inter
```

### Border radius

Moderate:

```text
8px–12px
```

### Shadows

Very subtle.

---

# 20. Responsive requirements

Must work:

```text
1440px desktop
1280px laptop
1024px tablet
768px tablet
390px mobile
```

No:

* horizontal overflow
* broken tables
* clipped modals
* unreadable text
* overlapping buttons

On mobile, table becomes cards.

---

# 21. Accessibility

Implement:

* semantic HTML
* keyboard navigation
* visible focus states
* labels
* ARIA where needed
* sufficient contrast
* accessible modal
* Escape to close modal
* screen-reader-friendly buttons
* form error messages

This is especially good because modern frontend engineering roles value accessibility.

---

# 22. Frontend stack

Use:

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
Lucide icons
React Hook Form
Zod
TanStack Query
Recharts
```

Next.js officially supports the App Router and full-stack React application development; Tailwind has current Next.js setup guidance. ([Next.js][2])

---

# 23. Backend stack

```text
Python
FastAPI
Pydantic
SQLAlchemy
PostgreSQL
Alembic
```

FastAPI's official full-stack template also uses FastAPI, PostgreSQL, TypeScript, Tailwind/shadcn, Playwright, JWT, Docker and CI/CD, so this is a reasonable architecture direction for a professional prototype. ([FastAPI][3])

---

# 24. Backend API

Design APIs like:

```text
POST   /api/v1/auth/login

GET    /api/v1/leads
POST   /api/v1/leads
GET    /api/v1/leads/{id}
PATCH  /api/v1/leads/{id}
DELETE /api/v1/leads/{id}

POST   /api/v1/leads/{id}/research

POST   /api/v1/outreach/generate
GET    /api/v1/outreach
PATCH  /api/v1/outreach/{id}

POST   /api/v1/followups
GET    /api/v1/followups
PATCH  /api/v1/followups/{id}

GET    /api/v1/analytics

GET    /api/v1/health
```

---

# 25. Database

Tables:

```text
users
leads
outreach_messages
followups
activities
```

### users

```text
id
name
email
password_hash
role
created_at
updated_at
```

### leads

```text
id
company_name
website
contact_name
contact_email
job_title
industry
location
company_size
linkedin_url
description
status
created_at
updated_at
```

### outreach_messages

```text
id
lead_id
channel
goal
tone
subject
message
ai_generated
human_edited
status
created_at
updated_at
```

### followups

```text
id
lead_id
outreach_id
due_at
note
status
created_at
completed_at
```

### activities

```text
id
lead_id
type
description
metadata
created_at
```

---

# 26. Seed data

Don't show an empty dashboard.

Create realistic demo data:

```text
TechNova AI
Vertex Robotics
CloudMesh
FinEdge
Nova Health
Quantum Labs
BrightGrid
```

Each with:

* contact
* industry
* status
* outreach
* follow-up
* activity

Then hiring manager immediately sees a functioning product.

---

# 27. Demo mode

This is important.

If they clone GitHub and don't have API keys, app should still work.

Add:

```text
DEMO_MODE=true
```

When enabled:

```text
AI request
   ↓
Mock AI service
   ↓
Realistic generated response
```

When disabled:

```text
AI request
   ↓
OpenAI/Anthropic
```

Architecture:

```text
AIService
 ├── OpenAIProvider
 ├── AnthropicProvider
 └── MockAIProvider
```

This demonstrates good engineering thinking.

---

# 28. Environment variables

Frontend:

```text
NEXT_PUBLIC_API_URL=
```

Backend:

```text
DATABASE_URL=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
JWT_SECRET=
DEMO_MODE=true
CORS_ORIGINS=
```

Create:

```text
.env.example
```

Never:

```text
.env
```

inside Git.

---

# 29. Error handling

Global API error format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid lead information"
  }
}
```

Frontend should show:

```text
Toast
Inline validation
Retry
Empty state
```

---

# 30. Loading states

Every async operation needs a state.

Examples:

```text
Loading dashboard...
Loading leads...
Creating lead...
Generating outreach...
Saving...
Updating status...
```

Use skeletons rather than blank screens.

---

# 31. Empty states

Example:

```text
No leads yet

Start building your PR pipeline by adding your first lead.

[Add Lead]
```

Follow-ups:

```text
You're all caught up.

No follow-ups are due today.
```

---

# 32. Security

Even for a demo:

* validate all inputs
* hash passwords
* don't expose API keys
* server-side AI calls
* CORS configuration
* SQL injection protection through ORM
* basic rate limiting on AI endpoint
* max input lengths
* sanitize rendered content
* don't trust AI output
* validate AI response schema

---

# 33. Testing

### Frontend

Use:

```text
Vitest
React Testing Library
Playwright
```

### Backend

Use:

```text
Pytest
```

Test:

```text
Create lead
Update lead
Delete lead
Generate outreach
Invalid email
Empty company
AI failure
Follow-up creation
Status transition
Analytics
```

At minimum, create a few meaningful tests rather than hundreds of fake tests.

---

# 34. Health check

Backend:

```text
GET /api/v1/health
```

Response:

```json
{
  "status": "ok",
  "database": "connected",
  "version": "1.0.0"
}
```

---

# 35. Project structure

```text
prflow-ai/
│
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── leads/
│   │   │   ├── outreach/
│   │   │   ├── followups/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── dashboard/
│   │   ├── leads/
│   │   ├── outreach/
│   │   └── shared/
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── validators.ts
│   │   └── utils.ts
│   │
│   ├── hooks/
│   ├── types/
│   └── tests/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   ├── leads/
│   │   │   └── outreach/
│   │   ├── core/
│   │   ├── db/
│   │   └── main.py
│   │
│   └── tests/
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── AI_WORKFLOW.md
│   └── DECISIONS.md
│
├── docker-compose.yml
├── README.md
├── .env.example
└── .gitignore
```

---

# 36. Documentation

This is **very important for this specific job**.

Create:

### `PRD.md`

Explain:

```text
Problem
Target user
Goals
Non-goals
User stories
Features
Acceptance criteria
```

### `ARCHITECTURE.md`

Explain:

```text
Frontend
Backend
Database
AI layer
API
Security
Deployment
```

### `AI_WORKFLOW.md`

This is a major differentiator.

Explain:

```text
Requirement
 ↓
Spec
 ↓
AI prompt
 ↓
Implementation
 ↓
Human review
 ↓
Tests
 ↓
Fix
 ↓
Commit
```

### `DECISIONS.md`

Example:

```text
Why Next.js?
Why FastAPI?
Why PostgreSQL?
Why provider abstraction?
Why demo mode?
Why no Twilio in MVP?
```

---

# 37. Git strategy

Don't ask Antigravity to create everything in one giant generation.

Build in phases.

### Commit 1

```text
chore: initialize project structure
```

### Commit 2

```text
docs: add product requirements
```

### Commit 3

```text
feat: create dashboard shell
```

### Commit 4

```text
feat: implement lead management
```

### Commit 5

```text
feat: add lead details and activity timeline
```

### Commit 6

```text
feat: add AI outreach generation
```

### Commit 7

```text
feat: add outreach editor
```

### Commit 8

```text
feat: add follow-up management
```

### Commit 9

```text
feat: add analytics dashboard
```

### Commit 10

```text
test: add critical application tests
```

### Commit 11

```text
fix: improve error and loading states
```

### Commit 12

```text
docs: finalize README and architecture
```

This directly supports their requirement that **commit history counts**.

---

# 38. AI coding workflow

Since this job specifically says:

> Claude Code (or similar) does most of the typing.

Your Antigravity workflow should be:

```text
You → Requirement
       ↓
Antigravity → Plan
       ↓
You → Review plan
       ↓
Antigravity → Implement
       ↓
You → Run/test
       ↓
Find issue
       ↓
Antigravity → Fix
       ↓
You → Verify
       ↓
Git commit
```

Don't just blindly accept generated code.

---

# 39. Final acceptance checklist

Before sending to CTO:

### Product

* [ ] Login works
* [ ] Dashboard works
* [ ] Leads work
* [ ] Add lead works
* [ ] Edit lead works
* [ ] Delete lead works
* [ ] Search works
* [ ] Filters work
* [ ] Lead details work
* [ ] AI generation works
* [ ] AI editor works
* [ ] Follow-ups work
* [ ] Activity timeline works
* [ ] Analytics works
* [ ] Settings works

### UX

* [ ] Loading states
* [ ] Empty states
* [ ] Error states
* [ ] Toasts
* [ ] Responsive
* [ ] Keyboard accessible
* [ ] Mobile usable
* [ ] No console errors

### Engineering

* [ ] TypeScript clean
* [ ] Python type hints
* [ ] API validation
* [ ] AI response validation
* [ ] Tests
* [ ] `.env.example`
* [ ] No secrets
* [ ] README
* [ ] Architecture docs
* [ ] Git history

### Deployment

* [ ] Production build passes
* [ ] Frontend deployed
* [ ] Backend deployed
* [ ] Database connected
* [ ] Environment variables configured
* [ ] Demo mode works
* [ ] Health endpoint works

---

# 40. What the CTO should see

When Scott opens your GitHub:

```text
PRFlow AI
│
├── Clean README
├── Clear PRD
├── Architecture
├── Meaningful commits
├── Tests
├── Screenshots
├── Live demo
└── AI development workflow
```

When he opens the application:

```text
Professional UI
       ↓
Dashboard
       ↓
Lead
       ↓
AI research
       ↓
AI outreach
       ↓
Human review
       ↓
Follow-up
```

When he watches your video:

```text
I understood the problem
        ↓
I wrote a specification
        ↓
I decomposed the work
        ↓
I directed AI
        ↓
I reviewed its output
        ↓
I tested it
        ↓
I shipped it
```

**இந்த last flow தான் இந்த job-க்கு மிகவும் important.**

---

# 41. Future roadmap — DON'T implement

README-ல் மட்டும்:

```text
Phase 2
- Gmail integration
- Outlook integration
- Twilio / WhatsApp
- HubSpot integration
- Contact enrichment
- AI company research
- Campaign management

Phase 3
- Team workspaces
- RBAC
- Multi-tenancy
- Advanced analytics
- AI evaluation pipeline
- Guardrails
- Automated follow-up agents
```

இதனால் scope controlled என்று காட்ட முடியும்.

---

# 42. Google Antigravity-க்கு கொடுக்க வேண்டிய master instruction

**முதல் prompt-ஆக இதை கொடுக்கலாம்:**

```text
Build a complete production-quality MVP web application called PRFlow AI.

PRFlow AI is an AI-powered PR lead outreach workspace designed for PR consultants. The application should help a PR consultant manage prospects, understand company information, generate personalized AI outreach, review and edit AI-generated messages, track outreach status, schedule follow-ups, and view basic analytics.

IMPORTANT:
This project is a technical assessment for a Junior Software Engineer role at a PR consultancy. The evaluator will review the product quality, architecture, specification thinking, AI-assisted development workflow, code quality, testing, Git history, and ability to ship a small finished product.

Do NOT build an oversized SaaS product.
Keep the MVP small, polished, complete, reliable, and production-minded.

TECH STACK

Frontend:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide icons
- React Hook Form
- Zod
- TanStack Query
- Recharts

Backend:
- Python
- FastAPI
- Pydantic
- SQLAlchemy
- PostgreSQL
- Alembic

AI:
- Provider abstraction
- OpenAI provider
- Anthropic provider
- Mock provider for demo mode
- AI calls must happen server-side
- Never expose API keys to the frontend

Testing:
- Playwright
- Vitest / React Testing Library
- Pytest

Infrastructure:
- Docker
- docker-compose
- .env.example
- Production-ready configuration

PRODUCT NAME

PRFlow AI

TAGLINE

AI-powered outreach workspace for modern PR teams.

CORE USER

PR consultant / PR manager.

CORE USER JOURNEY

Login
→ Dashboard
→ Leads
→ Lead Details
→ AI Research Summary
→ Generate Personalized Outreach
→ Review/Edit
→ Approve
→ Mark as Sent
→ Schedule Follow-up
→ Track Activity
→ Analytics

PAGES

1. Landing page
2. Login
3. Dashboard
4. Leads
5. Add Lead
6. Edit Lead
7. Lead Details
8. Outreach
9. Follow-ups
10. Analytics
11. Settings

DASHBOARD

Display:
- Total Leads
- New Leads This Week
- Outreach Sent
- Follow-ups Due
- Outreach funnel
- Recent leads
- Follow-ups due today
- Recent activity

LEADS

Support:
- Search
- Status filter
- Industry filter
- Sorting
- Pagination or efficient client-side pagination for demo data
- Add lead
- Edit lead
- Delete lead
- Open lead details

Lead fields:
- Company name
- Website
- Contact name
- Contact email
- Job title
- Industry
- Location
- Company size
- LinkedIn URL
- Description
- Notes
- Status
- Created date
- Updated date

Statuses:
- New
- Researching
- Contacted
- Replied
- Meeting
- Converted
- Not Interested

LEAD DETAILS

Display:
- Company information
- Contact information
- AI research summary
- Latest outreach
- Outreach status
- Follow-up
- Activity timeline

AI RESEARCH

Create a structured AI research summary using only supplied information.

Never invent facts.

AI output should include:
- Company summary
- Relevant PR angle
- Personalization opportunities
- Suggested talking points

AI OUTREACH

Allow user to select:
- Goal
- Tone
- Channel
- Key angle

Generate:
- Subject
- Personalized message
- Personalization points

AI system instructions:
- Never invent facts
- Only use supplied information
- Avoid generic spam language
- Keep professional tone
- Clearly personalize the message
- Return structured JSON
- Validate the JSON response server-side

OUTREACH EDITOR

The generated message must be editable.

Track:
- AI generated
- Human edited
- Approved
- Sent

Actions:
- Edit
- Save
- Regenerate
- Copy
- Approve
- Mark as Sent

FOLLOW-UPS

Support:
- Create follow-up
- Due date
- Note
- Complete
- Reschedule
- Open lead

ANALYTICS

Display:
- Total leads
- Outreach sent
- Response rate
- Meetings
- Conversions
- Outreach activity chart
- Lead status distribution

SETTINGS

Include:
- Profile
- AI preferences
- Default tone
- Default channel
- Appearance
- AI provider status

DEMO MODE

The application MUST work without external API keys.

Environment:
DEMO_MODE=true

When demo mode is enabled, use a deterministic MockAIProvider that returns realistic generated responses.

When demo mode is disabled, use the configured AI provider.

SEED DATA

Create realistic demo data for:
- TechNova AI
- Vertex Robotics
- CloudMesh
- FinEdge
- Nova Health
- Quantum Labs
- BrightGrid

Each lead should contain realistic contact information, status, outreach history, follow-up, and activity.

DATABASE TABLES

users
leads
outreach_messages
followups
activities

API

POST /api/v1/auth/login

GET /api/v1/leads
POST /api/v1/leads
GET /api/v1/leads/{id}
PATCH /api/v1/leads/{id}
DELETE /api/v1/leads/{id}

POST /api/v1/leads/{id}/research

POST /api/v1/outreach/generate
GET /api/v1/outreach
PATCH /api/v1/outreach/{id}

POST /api/v1/followups
GET /api/v1/followups
PATCH /api/v1/followups/{id}

GET /api/v1/analytics

GET /api/v1/health

ERROR HANDLING

Implement:
- Global API error handling
- Validation errors
- AI timeout handling
- AI provider failure
- Invalid AI response handling
- Database errors
- Network errors
- Empty states
- Loading states
- Retry states
- Toast notifications

SECURITY

Implement:
- Input validation
- Password hashing
- JWT authentication
- Server-side API keys
- CORS configuration
- ORM-based database access
- Basic AI endpoint rate limiting
- Maximum input lengths
- Safe rendering of generated content
- Never expose secrets

ACCESSIBILITY

Implement:
- Semantic HTML
- Keyboard navigation
- Focus states
- Accessible forms
- Accessible dialogs
- ARIA where appropriate
- Good color contrast
- Screen-reader-friendly labels
- Escape-to-close dialogs

RESPONSIVE DESIGN

The application must work correctly at:
- 1440px
- 1280px
- 1024px
- 768px
- 390px

No horizontal overflow.

On mobile, convert tables into responsive cards where necessary.

DESIGN

Use a modern premium B2B SaaS visual style.

Use:
- Clean layout
- Neutral background
- Indigo/violet primary accent
- Professional typography
- Inter font
- Moderate border radius
- Subtle shadows
- Strong visual hierarchy
- Consistent spacing
- Professional dashboard
- No excessive gradients
- No unnecessary animations

ARCHITECTURE

Create a clean separation between:
- UI
- API client
- Domain types
- Validation
- Services
- Database
- AI providers

AI provider abstraction:

AIService
├── OpenAIProvider
├── AnthropicProvider
└── MockAIProvider

DOCUMENTATION

Create:

docs/PRD.md
docs/ARCHITECTURE.md
docs/AI_WORKFLOW.md
docs/DECISIONS.md

README.md must contain:
- Product overview
- Problem
- Solution
- Features
- Architecture
- Tech stack
- Local setup
- Environment variables
- Demo credentials
- Demo mode
- Database setup
- Testing
- Deployment
- Screenshots
- Future roadmap

AI_WORKFLOW.md should explain:

Requirement
→ Specification
→ AI prompt
→ Implementation
→ Human review
→ Testing
→ Bug fixing
→ Git commit

TESTING

Add meaningful tests for:
- Authentication
- Lead creation
- Lead validation
- Lead update
- Outreach generation
- AI failure
- Follow-up creation
- Status transition
- Analytics
- Critical UI flows

GIT

Implement the project incrementally.

Do NOT create one giant commit.

Use meaningful commits such as:

chore: initialize project structure
docs: add product requirements
feat: create dashboard shell
feat: implement lead management
feat: add lead details and activity timeline
feat: add AI outreach generation
feat: add outreach editor
feat: add follow-up management
feat: add analytics dashboard
test: add critical application tests
fix: improve error and loading states
docs: finalize README and architecture

QUALITY RULES

Before considering the project complete:
- Run frontend lint
- Run frontend type checking
- Run frontend tests
- Run production build
- Run backend tests
- Validate API endpoints
- Check database migrations
- Test demo mode
- Check responsive layout
- Check browser console
- Remove placeholder text
- Remove broken links
- Remove unused imports
- Remove unnecessary dependencies
- Verify all buttons work
- Verify all forms work
- Verify loading/error/empty states
- Verify no secrets are committed

Do not claim a feature works unless it has actually been implemented and tested.

Do not generate fake integrations.

If an integration is not implemented, clearly mark it as a future roadmap item.

IMPORTANT DEVELOPMENT PROCESS

First create a complete implementation plan and file structure.

Do not immediately generate the entire application in one step.

Work feature-by-feature.

After each major feature:
1. Implement
2. Run tests/type checks
3. Fix issues
4. Review the implementation
5. Commit the changes

At the end, perform a complete application audit against the requirements above and fix every missing or broken item.

The final result must be a small, polished, professional, fully runnable PR technology product suitable for a technical hiring assessment.
```

---

## 43. Antigravity-ல் எப்படி proceed பண்ணுவது

இந்த **master prompt-ஐ ஒரே தடவை கொடுத்து முழு app generate செய்ய சொல்லாதீங்க**.

முதலில்:

```text
Analyze this specification and create the implementation plan only.
Do not write application code yet.
Identify architecture, dependencies, database schema, API contracts,
frontend routes, components, testing strategy, and implementation phases.
Also identify any ambiguity or risk.
```

அது plan கொடுத்த பிறகு:

```text
Review the plan against the complete PRFlow AI specification.
Identify missing requirements, architectural risks, unnecessary scope,
and anything that could fail during the technical assessment.
Do not implement yet.
```

அதற்குப் பிறகு phase-by-phase build செய்யுங்கள்.

**இந்த approach தான் இந்த particular job-க்கு strongest**, ஏனெனில் அவர்கள் AI-யிடம் code type செய்ய வைப்பதை விட, நீங்கள் **AI-ஐ எப்படி direct, decompose, review, test, verify, ship செய்கிறீர்கள்** என்பதையே மதிப்பீடு செய்கிறார்கள்.

மேலும், Google Developer documentation தற்போது Antigravity-ல் developer knowledge MCP-ஐ connect செய்வதற்கான workflow-ஐயும் குறிப்பிடுகிறது; தேவைப்பட்டால் official docs context-ஐ agent-க்கு வழங்கலாம். ([Google for Developers][4])

[1]: https://developers.google.com/?utm_source=chatgpt.com "Google for Developers | Build with Gemini"
[2]: https://nextjs.org/docs?utm_source=chatgpt.com "Next.js Docs | Next.js"
[3]: https://fastapi.tiangolo.com/project-generation/?utm_source=chatgpt.com "Full Stack FastAPI Template - FastAPI"
[4]: https://developers.google.com/knowledge/mcp?utm_source=chatgpt.com "Connect to the Developer Knowledge MCP server  |  Google for Developers"

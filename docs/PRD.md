# Product Requirements Document (PRD)

## Project Name
PRFlow AI

## Tagline
AI-powered outreach workspace for modern PR teams.

## 1. Problem
PR consultants manually research companies, find contacts, understand their business, and write personalized pitches. This process is time-consuming, prone to generic copy-pasting, and hard to track consistently.

## 2. Target User
- PR Consultants
- PR Managers
- Communications Specialists

## 3. Solution
An AI-powered PR Lead Outreach workspace where a user can manage prospects, auto-generate company research, instantly draft personalized outreach pitches, review/edit AI drafts, send emails via Resend, track status, schedule follow-ups, and review analytics — all calculated from real database data.

## 4. Goals
- Streamline the manual process of PR outreach.
- Provide a small, polished, production-ready MVP.
- Demonstrate high-quality AI-assisted development workflow.
- Ensure every user's data is completely isolated from other users.

## 5. Non-goals (Out of Scope for MVP)
- Multi-tenant billing / Subscription engine.
- Complex RBAC (Role Based Access Control) beyond per-user data isolation.
- Mobile native application.
- Advanced campaign automation / drip sequences.
- CRM integration (Salesforce, HubSpot).
- Team collaboration / multi-user workspaces.

## 6. Features

### Implemented and Working
- **Dashboard**: Real-time KPI cards calculated from database, outreach funnel, recent leads, follow-ups due.
- **Authentication**: JWT-based registration, login, logout. Passwords hashed with bcrypt. Protected routes.
- **Data Isolation**: Every user sees only their own leads, outreach, follow-ups, and analytics. Enforced at API level.
- **Lead Management**: Full CRUD operations for PR leads with search, filters (status, industry).
- **Lead Details**: Company info, contact details, persisted AI research summary, activity timeline.
- **AI Lead-Research**: Generates structured company research with PR angles. Results persisted to database.
- **AI Outreach Generator**: Generates personalized outreach (subject, message) based on goal, tone, and channel.
- **Outreach Editor**: Human review and editing of AI-generated content. Tracks `ai_generated` and `human_edited` flags.
- **Email Sending**: Real email delivery via Resend API with success/failure tracking and status updates.
- **Follow-ups**: Create, complete, snooze, and delete follow-ups. Overdue detection. Owner-scoped.
- **Analytics**: All KPIs and charts calculated from live PostgreSQL data. No hardcoded values.
- **Settings**: Profile update, password change, AI preferences (tone, channel), notification toggles.
- **Demo Mode**: Runs without API keys using MockAIProvider with dynamic responses.
- **Responsive UI**: Works on desktop and mobile viewports.

## 7. Acceptance Criteria

- [x] Login screen works with demo credentials (demo@prflow.ai / password123).
- [x] Registration creates real user accounts with hashed passwords.
- [x] JWT authentication protects all dashboard routes and API endpoints.
- [x] Leads can be created, updated, deleted, searched, and filtered.
- [x] AI lead research generates structured data and persists it to the database.
- [x] AI outreach correctly formats and personalizes messages based on input.
- [x] AI provider gracefully handles missing API keys by falling back to Demo Mode.
- [x] Pydantic schema validation correctly parses AI output and tracks failures in `ai_runs`.
- [x] Email sending works via Resend API (or shows clear error when API key is missing).
- [x] Follow-ups can be created, completed, snoozed, and deleted.
- [x] Analytics are calculated from real database data (not hardcoded).
- [x] User A cannot see User B's data (IDOR protection verified).
- [x] UI is fully responsive and accessible.
- [x] No API keys or secrets are exposed to the frontend.
- [x] Production build succeeds without errors.

## 8. Database Schema

| Table | Purpose | User-Owned |
|-------|---------|------------|
| `users` | Accounts, profile, AI preferences, notification settings | — |
| `leads` | PR prospects with AI research data (JSON) | Yes (`owner_id`) |
| `outreach_messages` | AI-generated outreach drafts and sent emails | Via lead |
| `followups` | Scheduled follow-up tasks | Yes (`owner_id`) |
| `activities` | Audit log for lead actions | Via lead |
| `ai_runs` | AI provider execution log with latency tracking | Yes (`owner_id`) |

## 9. Deployment

- **Frontend**: Next.js 15 deployed to Vercel.
- **Backend**: FastAPI deployed as Vercel serverless function.
- **Database**: PostgreSQL on Neon with connection pooling.
- **Migrations**: Alembic (2 migrations: initial schema + research/ownership columns).

## 10. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Production | PostgreSQL connection string (Neon) |
| `JWT_SECRET` | Production | Random secret for JWT signing |
| `ENVIRONMENT` | Yes | `development`, `staging`, or `production` |
| `DEMO_MODE` | No | `true` = Mock AI, `false` = real AI |
| `OPENAI_API_KEY` | If not demo | OpenAI API key |
| `ANTHROPIC_API_KEY` | If not demo | Anthropic API key |
| `RESEND_API_KEY` | For email | Resend API key |
| `CORS_ORIGINS` | No | JSON array of allowed origins |
| `NEXT_PUBLIC_API_URL` | No | Frontend API base URL |

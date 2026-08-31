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
An AI-powered PR Lead Outreach workspace where a user can manage prospects, auto-generate company research, instantly draft personalized outreach pitches, review/edit AI drafts, track status, schedule follow-ups, and review analytics.

## 4. Goals
- Streamline the manual process of PR outreach.
- Provide a small, polished, production-ready MVP.
- Demonstrate high-quality AI-assisted development workflow.

## 5. Non-goals (Out of Scope for MVP)
- Real email sending / WhatsApp / Twilio integration.
- Multi-tenant billing / Subscription engine.
- Complex RBAC (Role Based Access Control).
- Mobile application.
- Advanced campaign automation.

## 6. Features
- **Dashboard**: KPI cards, outreach funnel, recent leads, follow-ups due.
- **Leads Management**: CRUD operations for PR leads, search, filters (status, industry).
- **Lead Details**: Company info, contact details, AI research summary, activity timeline.
- **AI Lead-Research**: Generate company research, relevant PR angles, and personalization opportunities.
- **AI Outreach Generator**: Generate AI outreach (subject, message) based on goal, tone, and channel.
- **Outreach Editor**: Human review and editing of AI-generated content before marking as sent.
- **Follow-ups**: Schedule and track follow-ups.
- **Analytics**: Basic charts for outreach activity and status distribution.
- **Demo Mode**: Run without API keys using deterministic MockAIProvider.

## 7. Acceptance Criteria
- [ ] Login screen works with demo credentials.
- [ ] Leads can be created, updated, and deleted.
- [ ] AI outreach correctly formats and personalizes messages based on input.
- [ ] AI provider gracefully handles missing API keys by falling back to Demo Mode.
- [ ] Pydantic schema validation correctly parses AI output and tracks failures in `ai_runs`.
- [ ] UI is fully responsive and accessible.
- [ ] No API keys or secrets are exposed.

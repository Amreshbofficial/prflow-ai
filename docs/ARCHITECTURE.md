# Architecture Document

## Overview
PRFlow AI is a modern web application with a clean, decoupled client-server architecture. It uses Next.js for the frontend, FastAPI for the backend, PostgreSQL (Neon) for the database, and an abstraction layer for integrating LLMs for AI features. The entire stack is deployed on Vercel as a monorepo.

## High-Level Architecture

```
Browser
  ↓
Next.js 15 (App Router + TypeScript + Tailwind CSS + shadcn/ui)
  ↓  (JWT Bearer token in Authorization header)
FastAPI (Python 3.12 + Pydantic v2 + SQLAlchemy 2.x)
  ↓
┌──────────────────────────────────────────────────┐
│  AIService (provider-agnostic abstraction)       │
│  ├── MockAIProvider     (demo mode)              │
│  ├── OpenAIProvider     (requires API key)       │
│  └── AnthropicProvider  (requires API key)       │
└──────────────────────────────────────────────────┘
  ↓
PostgreSQL (Neon) + Alembic migrations
  ↓
Resend API (email sending, optional)
```

## Components

### 1. Frontend (Next.js 15 App Router)
- **Framework**: Next.js 15.5.25 (App Router).
- **Language**: TypeScript 5.x.
- **UI Library**: React 18.3.1.
- **State Management & Fetching**: TanStack Query (React Query 5.x) handles caching, async state, and automatic cache invalidation.
- **Styling**: Tailwind CSS 4.x + shadcn/ui components.
- **Validation**: Zod + React Hook Form.
- **Charts**: Recharts 3.x.
- **Authentication**: JWT stored in localStorage. Cookie-based token for Next.js middleware route protection.

### 2. Backend (FastAPI)
- **Framework**: FastAPI (Python 3.12).
- **Architecture**: Domain-driven structure with separate API routers, Pydantic schemas, SQLAlchemy models, and business logic services.
- **Security**: JWT authentication (python-jose) and bcrypt password hashing (passlib).
- **Validation**: Pydantic v2 for all request/response schemas. Strict type checking.
- **Error Handling**: Global exception handler prevents stack trace leakage. All errors return consistent JSON format.

### 3. Database (PostgreSQL on Neon)
- **ORM**: SQLAlchemy 2.x.
- **Migrations**: Alembic (2 migrations).
- **Tables**: `users`, `leads`, `outreach_messages`, `followups`, `activities`, `ai_runs`.
- **Connection**: Neon pgbouncer-compatible settings (`prepared_statement_cache_size=0`, `SET statement_timeout`).
- **Development Fallback**: SQLite when `DATABASE_URL` is not set and `ENVIRONMENT=development`.

### 4. AI Layer
An `AIService` abstraction manages interactions with AI providers via a factory pattern.

```
AIService
  ├── MockAIProvider     (DEMO_MODE=true — dynamic responses from lead data)
  ├── OpenAIProvider     (requires OPENAI_API_KEY)
  └── AnthropicProvider  (requires ANTHROPIC_API_KEY)
```

- **Provider Factory** (`get_ai_provider()`): Selects provider based on `DEMO_MODE` and available API keys. Falls back to MockAIProvider if no keys are configured.
- **Pydantic Validation**: Every AI response is validated against strict schemas before persistence.
- **AI Runs Logging**: Every AI call is logged to `ai_runs` with provider, model, task_type, input/output, validation status, latency, and timestamp.
- **Research Persistence**: AI research results are saved to `leads.research_data` (JSON column) for retrieval without re-running analysis.

### 5. Authentication & Authorization
- **Registration**: Email + password → bcrypt hash → stored in `users` table.
- **Login**: Email + password → bcrypt verify → JWT access token returned.
- **JWT Validation**: Every protected endpoint extracts user from JWT token via FastAPI dependency.
- **Route Protection**: Next.js middleware checks for `token` cookie. Redirects to `/login` if missing.
- **Data Isolation**: All database queries are scoped to `owner_id` extracted from the JWT. User A cannot access User B's data by changing IDs (IDOR protection).

### 6. Email Sending
- **Provider**: Resend API (REST, not SMTP).
- **Abstraction**: `send_email(to, subject, body)` in `backend/app/services/email.py`.
- **Demo Mode**: When `RESEND_API_KEY` is not set, raises clear error explaining real key is needed.
- **Status Tracking**: Outreach messages transition through: `Draft` → `Sending` → `Sent` / `Failed`.

### 7. Deployment
- **Frontend**: Vercel (Next.js optimized build).
- **Backend**: Vercel serverless function (Python 3.12 runtime).
- **Database**: Neon PostgreSQL with connection pooling.
- **Routing**: Vercel routes `/api/*` to the FastAPI serverless function, everything else to Next.js.

## Data Flow

### Authentication Flow
```
Login form → POST /api/v1/auth/login → FastAPI validates credentials
  → Returns JWT token → Frontend stores in localStorage + cookie
  → Middleware reads cookie for route protection
  → API client sends Bearer token in Authorization header
  → FastAPI dependency extracts user from JWT
```

### Lead Research Flow
```
User clicks "Research" → POST /api/v1/leads/{id}/research
  → AIService generates structured research via provider
  → Response validated with Pydantic (ResearchSummary schema)
  → Saved to lead.research_data (JSON column)
  → ai_runs record created with latency
  → ResearchSummary returned to frontend
```

### Outreach Generation Flow
```
User selects goal/tone/channel → POST /api/v1/outreach/generate
  → AIService generates subject + message via provider
  → Response validated with Pydantic
  → Saved to outreach_messages (status=Draft, ai_generated=True)
  → ai_runs record created
  → OutreachResponse returned to frontend
  → User edits in rich editor → PATCH /api/v1/outreach/{id} (human_edited=True)
  → User clicks Send → POST /api/v1/outreach/{id}/send
    → Resend API called → Status updated to Sent/Failed
```

### Analytics Flow
```
Dashboard loads → GET /api/v1/analytics/dashboard
  → SQL aggregations on leads, outreach_messages, followups
  → Returns: total_leads, new_this_week, outreach_sent, drafts,
     response_rate, followups_due, pipeline_distribution,
     outreach_by_day, lead_status_distribution
  → Frontend renders charts with real data
```

## Project Structure

```
prflow-ai/
├── frontend/                  # Next.js 15 application
│   ├── app/                   # App Router pages
│   │   ├── login/             # Login / Register (dual-mode form)
│   │   └── dashboard/         # Protected dashboard
│   │       ├── layout.tsx     # Sidebar + top header
│   │       ├── leads/         # Lead list, detail, new, edit
│   │       ├── outreach/      # Outreach list, generate, edit, send
│   │       ├── followups/     # Follow-up task management
│   │       ├── analytics/     # Real-time dashboard charts
│   │       ├── settings/      # Profile, password, AI prefs, notifications
│   │       └── help/          # Help & support
│   ├── components/            # Shared UI components
│   │   ├── layout/            # Sidebar, top-header
│   │   └── providers/         # React Query provider (exports queryClient)
│   └── lib/
│       ├── api.ts             # fetchAPI client with JWT + error handling
│       └── auth.ts            # Token management + React Query cache clearing
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, routers, global exception handler
│   │   ├── core/
│   │   │   ├── config.py      # Settings (env-based, Pydantic BaseSettings)
│   │   │   └── security.py    # JWT creation, bcrypt hashing, password verification
│   │   ├── db/
│   │   │   └── session.py     # SQLAlchemy engine + session factory
│   │   ├── models/
│   │   │   └── domain.py      # 6 SQLAlchemy models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── api/v1/            # API routers
│   │   │   ├── auth.py        # Register, login
│   │   │   ├── users.py       # Profile, password change
│   │   │   ├── leads.py       # CRUD + research
│   │   │   ├── outreach.py    # CRUD + generate + send
│   │   │   ├── followups.py   # CRUD + complete + snooze
│   │   │   └── analytics.py   # Dashboard stats
│   │   └── services/
│   │       ├── email.py       # Resend email sender
│   │       └── ai/
│   │           ├── base.py    # AIProvider ABC
│   │           ├── factory.py # get_ai_provider()
│   │           ├── service.py # AIServiceRunner
│   │           ├── mock_provider.py
│   │           ├── openai_provider.py
│   │           └── anthropic_provider.py
│   ├── alembic/               # Database migrations
│   │   └── versions/
│   │       ├── 001_initial_schema.py
│   │       └── 002_add_research_and_ownership.py
│   ├── scripts/seed_db.py     # Demo data seeder
│   └── tests/test_main.py     # 10 pytest tests
├── api/index.py               # Vercel serverless entry point
├── vercel.json                # Vercel monorepo deployment config
├── requirements.txt           # Python dependencies (Vercel build)
├── docker-compose.yml         # Local PostgreSQL setup
├── .env.example               # Environment variable template
└── .gitignore                 # Excludes .env, *.db, __pycache__, node_modules
```

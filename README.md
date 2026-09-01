# PRFlow AI

> **AI-powered PR outreach workspace** — manage leads, generate AI-crafted pitches, and track communications in one streamlined tool.

Built as a full-stack MVP using **Next.js**, **FastAPI**, **PostgreSQL**, and **AI-assisted development** for the Pathos Communications Junior Software Engineer application.

---

## Live Demo

| Role | URL |
|------|-----|
| Frontend | `https://prflow-ai.vercel.app` |
| Backend API | `https://prflow-ai.vercel.app/api/v1/health` |
| API Docs | `https://prflow-ai.vercel.app/api/docs` (dev only) |

**Demo credentials:**
- **Email:** `demo@prflow.ai`
- **Password:** `password123`

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| JWT Authentication | Real | Register, login, logout, token-based route protection |
| Data Isolation | Real | Every user sees only their own leads, outreach, and follow-ups |
| Lead Management | Real | Full CRUD with search, filter, and detailed company profiles |
| AI Lead Research | Real | Mock/OpenAI/Anthropic — generates structured company research |
| AI Outreach Generation | Real | Creates personalized outreach with tone/channel/goal customization |
| Outreach Editor | Real | Human-in-the-loop review before saving or sending |
| Email Sending | Real (Resend) | Send outreach via Resend API with success/failure tracking |
| Follow-ups | Real | Create, complete, snooze, delete — with overdue detection |
| Analytics | Real | All KPIs calculated from live PostgreSQL data (no hardcoded values) |
| Settings | Real | Profile, password change, AI preferences, notification toggles |
| Responsive UI | Real | Works on desktop and mobile |

---

## Architecture

```
browser
  ↓
Next.js 15 (App Router + TypeScript + Tailwind CSS + shadcn/ui)
  ↓
API Client (fetchAPI with JWT Bearer token)
  ↓
FastAPI (Python 3.12 + Pydantic v2 + SQLAlchemy)
  ↓
┌──────────────────────────────────────────────┐
│  AIService (provider-agnostic abstraction)   │
│  ├─ MockAIProvider    (demo mode)            │
│  ├─ OpenAIProvider    (optional)             │
│  └─ AnthropicProvider (optional)             │
└──────────────────────────────────────────────┘
  ↓
PostgreSQL (Neon) + Alembic migrations
```

**Key design decisions:**
- All database queries are scoped to the authenticated user (`owner_id` on every user-owned table)
- AI provider is abstract behind `AIService` — swap between Mock/OpenAI/Anthropic via environment variable
- AI responses validated with Pydantic before persisting; every AI call logged to `ai_runs`
- `create_all()` only runs in development — production uses Alembic exclusively

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js | 15.5.25 |
| Frontend Language | TypeScript | 5.x |
| UI Library | React | 18.3.1 |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui | Latest |
| Forms | react-hook-form | 7.x |
| Data Fetching | React Query (TanStack) | 5.x |
| Charts | Recharts | 3.x |
| Backend | FastAPI | 0.115+ |
| ORM | SQLAlchemy | 2.x |
| Validation | Pydantic | 2.x |
| Auth | JWT (python-jose) + bcrypt | — |
| Database | PostgreSQL | Neon |
| Migrations | Alembic | 1.11+ |
| Email | Resend (optional) | — |
| Deployment | Vercel (frontend + serverless backend) | — |

---

## Project Structure

```
prflow-ai/
├── frontend/                  # Next.js application
│   ├── app/                   # App Router pages
│   │   ├── login/             # Login / Register
│   │   └── dashboard/         # Protected dashboard
│   │       ├── leads/         # Lead list + detail + research
│   │       ├── outreach/      # Outreach list + generate + edit + send
│   │       ├── followups/     # Follow-up tasks
│   │       ├── analytics/     # Real-time dashboard charts
│   │       ├── settings/      # Profile, password, preferences
│   │       └── help/          # Help & support
│   ├── components/            # Shared UI components
│   │   ├── layout/            # Sidebar, top-header
│   │   └── providers/         # React Query provider
│   └── lib/                   # API client, auth helpers
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, routers
│   │   ├── core/              # Config, security (JWT, bcrypt)
│   │   ├── db/                # SQLAlchemy engine, session
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── api/v1/            # API routers (auth, leads, outreach, ...)
│   │   └── services/          # Business logic
│   │       └── ai/            # AIService + providers
│   ├── alembic/               # Database migrations
│   ├── scripts/seed_db.py     # Demo data seeder
│   └── tests/                 # Backend test suite
├── api/index.py               # Vercel serverless entry point
├── vercel.json                # Vercel deployment config
├── requirements.txt           # Python dependencies (Vercel build)
└── .env.example               # Environment variable template
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **PostgreSQL** (or use SQLite for local development)
- **Git**

### 1. Clone and install

```bash
git clone https://github.com/Amreshbofficial/prflow-ai.git
cd prflow-ai

# Frontend
cd frontend
npm install
cd ..

# Backend
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. Set up environment variables

```bash
cp .env.example backend/.env
```

Edit `backend/.env` with your values:

```env
ENVIRONMENT=development
DATABASE_URL=                          # omit for local SQLite
JWT_SECRET=your_secret_here
DEMO_MODE=true
```

For local development, **omit** `DATABASE_URL` to use SQLite automatically.

### 3. Initialize database

```bash
cd backend
alembic upgrade head
python scripts/seed_db.py          # optional — adds 6 demo leads
```

### 4. Start development servers

**Terminal 1 — Backend:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:3000** — login with `demo@prflow.ai / password123`.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENVIRONMENT` | Yes | `development` | `development`, `staging`, or `production` |
| `DATABASE_URL` | Production | SQLite fallback | PostgreSQL connection string (Neon format) |
| `JWT_SECRET` | Production | dev fallback | Random secret — generate with `openssl rand -hex 32` |
| `JWT_ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `1440` | Token lifetime (24h) |
| `DEMO_MODE` | No | `true` | `true` = Mock AI provider, `false` = real AI |
| `OPENAI_API_KEY` | If `DEMO_MODE=false` | — | OpenAI API key |
| `ANTHROPIC_API_KEY` | If `DEMO_MODE=false` | — | Anthropic API key |
| `RESEND_API_KEY` | For email | — | Resend API key for sending outreach |
| `SENDER_EMAIL` | No | `onboarding@resend.dev` | Verified sender email |
| `CORS_ORIGINS` | No | `["http://localhost:3000"]` | JSON array of allowed origins |
| `NEXT_PUBLIC_API_URL` | No | `/api/v1` | Frontend API base URL |

---

## Database

**6 tables** managed by Alembic:

| Table | Purpose | User-owned |
|-------|---------|------------|
| `users` | Accounts, profile, preferences | — |
| `leads` | PR prospects with research data | Yes (`owner_id`) |
| `outreach_messages` | AI-generated outreach drafts | Via lead ownership |
| `followups` | Scheduled follow-up tasks | Yes (`owner_id`) |
| `activities` | Audit log for lead actions | Via lead ownership |
| `ai_runs` | AI provider execution log | Yes (`owner_id`) |

**Migrations:**
- `001_initial_schema` — all 6 tables with foreign keys
- `002_add_research_and_ownership` — `leads.research_data`, `followups.owner_id`, `ai_runs.owner_id`

```bash
cd backend
alembic upgrade head               # apply all migrations
alembic revision --autogenerate -m "description"  # create new migration
```

---

## AI Provider System

```
AIService
├── MockAIProvider     (demo mode — dynamic responses from lead data)
├── OpenAIProvider     (requires OPENAI_API_KEY)
└── AnthropicProvider  (requires ANTHROPIC_API_KEY)
```

- **Demo mode** (`DEMO_MODE=true`): Uses `MockAIProvider` — works without any API keys
- **Production** (`DEMO_MODE=false`): Routes to OpenAI or Anthropic based on available keys
- Every AI call is validated with Pydantic and logged to `ai_runs` with latency tracking

---

## Testing

**Backend (pytest):**
```bash
cd backend
python -m pytest tests/test_main.py -v
```

10 tests covering: health, registration, login, duplicate email, wrong password, leads CRUD, data isolation (IDOR), follow-ups CRUD, analytics, profile update, password change, outreach generation.

**Frontend (TypeScript check):**
```bash
cd frontend
npx tsc --noEmit
```

---

## Deployment

### Vercel (current)

The project is configured for Vercel monorepo deployment:
- `frontend/` → Next.js
- `backend/` → Python serverless function via `api/index.py`

**Required Vercel environment variables:**
```
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
JWT_SECRET=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
ENVIRONMENT=production
DEMO_MODE=true
CORS_ORIGINS=["https://prflow-ai.vercel.app"]
NEXT_PUBLIC_API_URL=/api/v1
```

### Alternative: Separate hosting

- **Frontend:** Vercel / Netlify / any static host
- **Backend:** Railway / Render / Fly.io (with Docker)
- **Database:** Neon / Supabase / any PostgreSQL provider

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/health` | No | Health check |
| `POST` | `/api/v1/auth/register` | No | Create account |
| `POST` | `/api/v1/auth/login` | No | Login, returns JWT |
| `GET` | `/api/v1/users/me` | Yes | Current user profile |
| `PATCH` | `/api/v1/users/me` | Yes | Update profile |
| `POST` | `/api/v1/users/me/change-password` | Yes | Change password |
| `GET` | `/api/v1/leads` | Yes | List leads (scoped) |
| `POST` | `/api/v1/leads` | Yes | Create lead |
| `GET` | `/api/v1/leads/{id}` | Yes | Lead detail |
| `PATCH` | `/api/v1/leads/{id}` | Yes | Update lead |
| `DELETE` | `/api/v1/leads/{id}` | Yes | Delete lead |
| `POST` | `/api/v1/leads/{id}/research` | Yes | Run AI research |
| `GET` | `/api/v1/outreach` | Yes | List outreach |
| `POST` | `/api/v1/outreach/generate` | Yes | Generate AI outreach |
| `GET` | `/api/v1/outreach/{id}` | Yes | Outreach detail |
| `PATCH` | `/api/v1/outreach/{id}` | Yes | Edit outreach |
| `POST` | `/api/v1/outreach/{id}/send` | Yes | Send outreach (Resend) |
| `GET` | `/api/v1/followups` | Yes | List follow-ups |
| `POST` | `/api/v1/followups` | Yes | Create follow-up |
| `PATCH` | `/api/v1/followups/{id}/complete` | Yes | Mark complete |
| `PATCH` | `/api/v1/followups/{id}/snooze` | Yes | Snooze follow-up |
| `DELETE` | `/api/v1/followups/{id}` | Yes | Delete follow-up |
| `GET` | `/api/v1/analytics/dashboard` | Yes | Real-time analytics |

---

## Known MVP Limitations

| Item | Status | Notes |
|------|--------|-------|
| Email sending | Requires Resend API key | Works once `RESEND_API_KEY` is set |
| Real AI | Requires OpenAI/Anthropic key | Mock provider works without keys |
| Rate limiting | Not implemented | Single-user demo is fine |
| HttpOnly cookies | Not implemented | JWT stored in localStorage |
| E2E tests | Not implemented | Backend pytest suite covers core flows |
| File upload | Not implemented | CSV import stub exists |

---

## How AI Was Used

This project was built using AI-assisted development with **Codebuff**:

- **Architecture planning:** AI helped design the `AIService` abstraction, provider factory pattern, and database schema
- **Implementation:** AI wrote initial code for authentication, CRUD endpoints, React Query hooks, and UI components
- **Review and verification:** AI-generated code was manually reviewed, tested, and fixed (e.g., stale cache bugs, operator precedence issues, Vercel compatibility)
- **Debugging:** AI helped identify and fix issues like React Query cache leaking between users, deprecated `datetime.utcnow()`, and Alembic migration conflicts
- **Testing:** AI wrote the backend pytest suite and verified 32/32 smoke tests pass

---

## License

Private — built for the Pathos Communications application.

---

*Built by Amresh Baskar · AI-assisted development with Codebuff*

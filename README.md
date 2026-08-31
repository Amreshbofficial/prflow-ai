# PRFlow AI

> **AI-powered outreach workspace for modern PR teams.**

PRFlow AI is a production-quality MVP for managing PR leads, generating customized AI-powered outreach pitches, and tracking communications. It is designed to be a streamlined workflow tool for PR consultants.

## Features

- **Dashboard:** KPI cards, outreach funnels, and follow-up tracking.
- **Lead Management:** Create and manage PR prospects and company information.
- **AI Lead-Research:** Generate company research and identify PR angles automatically.
- **AI Outreach Generator:** Craft personalized outreach messages using a deterministic Mock Provider (Demo Mode) or external AI services (OpenAI/Anthropic).
- **Outreach Editor:** Human-in-the-loop review to edit and approve AI-generated drafts.
- **Follow-ups:** Schedule, track, and manage follow-ups for prospects.

## Architecture

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Backend:** FastAPI, Python, Pydantic, SQLAlchemy.
- **Database:** PostgreSQL.
- **AI Integration:** Abstracted `AIService` supporting multiple providers with strict JSON schema validation and `ai_runs` tracking.

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (3.10+)
- Docker & Docker Compose (for local PostgreSQL)

### Setup & Local Development

**1. Clone the repository & setup environment variables:**
```bash
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

**2. Start the Database:**
```bash
docker-compose up -d db
```

**3. Setup Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python scripts/seed_db.py  # (Optional) generate test data
uvicorn app.main:app --reload
```

**4. Setup Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Demo Mode & Credentials

To run the application without external API keys (OpenAI/Anthropic), ensure `.env` contains:
```env
DEMO_MODE=true
```

**Demo Login:**
- **Email:** demo@prflow.ai
- **Password:** password123

## Testing

**Frontend:**
```bash
cd frontend
npm run test
```

**Backend:**
```bash
cd backend
pytest tests/
```

## Documentation

Detailed architectural and product decisions are documented in the `docs/` folder:
- [Product Requirements](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [AI Workflow](docs/AI_WORKFLOW.md)
- [Decisions](docs/DECISIONS.md)

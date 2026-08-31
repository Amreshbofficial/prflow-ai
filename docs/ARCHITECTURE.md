# Architecture Document

## Overview
PRFlow AI is a modern web application adopting a clean, decoupled client-server architecture. It utilizes Next.js for the frontend, FastAPI for the backend, PostgreSQL for the database, and an abstraction layer for integrating LLMs for AI features.

## Components

### 1. Frontend (Next.js App Router)
- **Framework**: Next.js 14+ (App Router).
- **Language**: TypeScript.
- **State Management & Fetching**: TanStack Query (React Query) handles caching and async state for API requests.
- **Styling**: Tailwind CSS + shadcn/ui.
- **Validation**: Zod + React Hook Form.

### 2. Backend (FastAPI)
- **Framework**: FastAPI (Python 3.10+).
- **Architecture**: Domain-driven structure with separate API routers, Pydantic schemas, SQLAlchemy models, and business logic services.
- **Security**: JWT authentication and Bcrypt password hashing.

### 3. Database (PostgreSQL)
- **ORM**: SQLAlchemy.
- **Migrations**: Alembic.
- **Tables**: `users`, `leads`, `outreach_messages`, `followups`, `activities`, `ai_runs`.

### 4. AI Layer
An `AIService` abstraction manages interactions with AI providers.
- `OpenAIProvider`: Handles actual OpenAI API calls.
- `AnthropicProvider`: Handles Anthropic API calls.
- `MockAIProvider`: Used when `DEMO_MODE=true` is set. Provides deterministic but dynamic responses tailored to the input data without requiring external API keys.

### 5. Deployment & Containerization
- **Docker Compose**: Used to orchestrate the PostgreSQL database (and optionally backend/frontend) for local development and simplified deployment.

## Data Flow
1. User interacts with UI (React components).
2. Action dispatches via TanStack Query API client.
3. FastAPI endpoint validates the request payload using Pydantic.
4. Business logic interacts with SQLAlchemy models and/or `AIService`.
5. For AI tasks, the response is parsed back into Pydantic models. Validation successes or failures are logged to `ai_runs`.
6. Formatted JSON response is returned to the frontend and rendered.

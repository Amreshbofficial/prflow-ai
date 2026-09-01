# Architectural Decisions

## Why Next.js 15?
Next.js provides a robust React framework with App Router, built-in middleware for route protection, strong TypeScript support, and production-ready defaults (SEO, performance, image optimization). The App Router's nested layouts perfectly match our dashboard-with-sidebar architecture. It's the standard modern stack expected for full-stack developers.

## Why FastAPI?
FastAPI is highly performant, natively supports async operations (crucial for calling external AI APIs and email services), and uses Pydantic for data validation. This makes parsing and validating AI-generated JSON extremely safe and reliable. The automatic OpenAPI documentation is valuable during development.

## Why PostgreSQL (Neon)?
PostgreSQL is the industry standard for relational data. We chose Neon specifically for:
- **Serverless scaling**: Pay only for what you use
- **Connection pooling**: Built-in pgbouncer support
- **Free tier**: Sufficient for MVP and demo
- **Branching**: Database branches for development vs. production
- SQLAlchemy + Alembic provide a mature ORM and migration path for relational data like users, leads, and analytics.

## Why SQLite for Local Development?
During local development, requiring a PostgreSQL server adds friction. The config automatically falls back to SQLite when `DATABASE_URL` is not set and `ENVIRONMENT=development`. This means contributors can clone and run the app immediately without database setup.

## Why SQLAlchemy + Alembic?
SQLAlchemy provides a mature, battle-tested ORM with excellent relationship support. Alembic provides automatic migration generation from model changes, version-controlled schema evolution, and safe production deployment without `create_all()`. This combination is the standard for production Python applications.

## Why JWT Authentication?
JWT tokens are stateless — the server doesn't need to store session data. This works perfectly with Vercel's serverless architecture where each request may hit a different instance. Tokens are stored in localStorage for API calls and in cookies for Next.js middleware route protection.

## Why bcrypt for Passwords?
bcrypt is the industry standard for password hashing. It includes automatic salting, configurable work factors, and is resistant to rainbow table and brute-force attacks. We use passlib's bcrypt implementation which handles all the cryptographic details correctly.

## Why Abstract AI Providers?
By creating an `AIService` abstraction with a factory pattern, we prevent the application from being tightly coupled to any single AI provider. This allows:
- `MockAIProvider` for demo mode (no API keys needed)
- `OpenAIProvider` for production use
- `AnthropicProvider` as an alternative
- Easy fallback: if one provider is down, switch to another
- Provider selection controlled entirely by environment variables

## Why Demo Mode?
`DEMO_MODE=true` allows the application to function entirely locally without external API keys. This is critical for:
- Reviewers and hiring managers to evaluate the app quickly
- CI/CD pipelines to run without secrets
- Development without incurring API costs
- The MockAIProvider generates dynamic responses based on actual input data, not static templates

## Why Resend for Email?
We evaluated several options:
- **SMTP**: Requires server configuration, handling bounces, rate limits — too complex for MVP
- **SendGrid**: Complex API, free tier limitations
- **Resend**: Modern REST API, simple integration, generous free tier (100 emails/day), excellent documentation

Resend requires only an API key and a verified sender domain. The email service is abstracted behind `send_email()` so it can be swapped later.

## Why Vercel for Deployment?
Vercel provides:
- **Monorepo support**: Deploy both frontend (Next.js) and backend (Python serverless) from one repository
- **Automatic deployments**: Push to main → deploy
- **Environment variables**: Secure secret management
- **Free tier**: Sufficient for MVP
- **Global CDN**: Fast frontend loading
- The backend runs as a Vercel serverless function, which scales to zero when not in use.

## Why React Query (TanStack Query)?
React Query solves several problems:
- **Caching**: API responses are cached for 5 minutes, reducing unnecessary requests
- **Automatic refetching**: Data stays fresh when the user navigates
- **Loading/error states**: Built-in `isLoading`, `isError`, `error` states for every query
- **Cache invalidation**: `queryClient.clear()` on logout prevents data leaks between users
- **Optimistic updates**: Mutations can update the UI immediately

## Why Data Isolation (owner_id)?
Every user-owned resource (`leads`, `followups`, `ai_runs`) has an `owner_id` foreign key. Every database query filters by this ID, extracted from the JWT token. This means:
- User A cannot see User B's leads, even by guessing IDs
- IDOR (Insecure Direct Object Reference) attacks are prevented
- Analytics are calculated only from the current user's data
- This is enforced at the API level, not just the UI level

## Why Pydantic for AI Validation?
AI models can return unpredictable output. Pydantic validates every AI response against a strict schema:
- Missing fields → validation error, logged to `ai_runs`
- Wrong types → validation error, logged to `ai_runs`
- Extra fields → ignored (pydantic default)
- Invalid JSON → caught before database write

This prevents corrupted data from entering the database and provides clear debugging information.

## Why Not Real Email in MVP?
Real email requires:
- Verified sender domain (DNS configuration)
- Handling bounces, complaints, unsubscribes
- Rate limiting and deliverability management
- Compliance with CAN-SPAM, GDPR

For an MVP demo, these add significant complexity without demonstrating core product value. The Resend integration is complete and ready — just add an API key.

## Why Not PostgreSQL Migrations on Startup?
`Base.metadata.create_all()` is dangerous in production because:
- It can overwrite existing data
- It doesn't handle schema evolution
- It doesn't track migration state

Instead, Alembic migrations are run explicitly before deployment. The app only uses `create_all()` in development mode.

## Why Environment-Based Configuration?
All secrets and configuration are loaded from environment variables:
- No secrets in code (`.env` is gitignored)
- Same codebase works locally and in production
- Vercel/Neon dashboard manages production secrets
- `.env.example` documents all required variables without exposing values
